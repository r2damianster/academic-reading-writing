# QWEN.md — Guía de integración con modelos Qwen

Qwen (desarrollado por Alibaba Cloud) es una familia de modelos de lenguaje de alto rendimiento que puede usarse como alternativa o complemento a Llama 3 en este proyecto. Esta guía cubre tres opciones de integración según el caso de uso.

---

## ¿Por qué Qwen?

| Característica | Llama 3.3-70b (Groq) | Qwen 2.5-72b (DashScope) | Qwen-QwQ-32b (Groq) |
|---------------|----------------------|--------------------------|---------------------|
| Costo | Gratis | ~$0.001/1K tokens | Gratis |
| Contexto | 128K tokens | **1M tokens** | 128K tokens |
| Razonamiento | Bueno | Muy bueno | **Excelente** |
| Idiomas | Inglés + ES | Inglés, ES, ZH + más | Inglés + ES |
| Latencia | Muy baja | Media | Baja |
| Configuración | Ya configurado | Nueva variable de entorno | Ya disponible en Groq |

**Caso de uso principal para este proyecto:** Essays largos (> 2000 palabras), análisis de integridad con contexto histórico extenso, o cuando se necesita razonamiento paso a paso del feedback.

---

## Opción 1: Qwen via Groq (más fácil — ya disponible)

Groq ya tiene modelos Qwen disponibles. Solo necesitas cambiar el nombre del modelo.

### Modelos Qwen en Groq

| Modelo | ID en Groq | Uso recomendado |
|--------|-----------|----------------|
| Qwen QwQ 32B | `qwen-qwq-32b` | Razonamiento, feedback detallado |
| Qwen 2.5 Coder 32B | `qwen-2.5-coder-32b-preview` | Solo generación de código |

### Configuración (sin cambios en el .env)

Solo modifica `lib/groq-client.js` para agregar los modelos Qwen:

```js
const GROQ_MODELS = {
    // Llama 3 (actuales)
    'llama-3.1-8b-instant':    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile': 'llama-3.3-70b-versatile',

    // Qwen via Groq (nuevos)
    'qwen-qwq-32b':            'qwen-qwq-32b',           // Razonamiento
    'qwen-coder-32b':          'qwen-2.5-coder-32b-preview', // Código

    // Alias Claude (compatibilidad)
    'claude-haiku-4-5-20251001': 'llama-3.1-8b-instant',
    'claude-sonnet-4-6':         'llama-3.3-70b-versatile',
    'claude-opus-4-6':           'qwen-qwq-32b'           // Usar Qwen para tareas Opus
};
```

Para activar Qwen en tareas de alta complejidad, modifica `selectModel()` en `api/orchestrator.js`:

```js
function selectModel(score) {
    if (score <= 30) return { model: 'llama-3.1-8b-instant',    maxTokens: 300  };
    if (score <= 65) return { model: 'llama-3.3-70b-versatile', maxTokens: 800  };
    return             { model: 'qwen-qwq-32b',             maxTokens: 2000 }; // Qwen para complejidad alta
}
```

---

## Opción 2: Qwen via DashScope (máximo contexto y capacidad)

DashScope es la API oficial de Alibaba Cloud para Qwen. Compatible con el formato OpenAI.

### Variables de entorno necesarias

```bash
# Agregar a .env y a Vercel Settings
QWEN_API_KEY=sk-...          # Obtener en https://dashscope.aliyuncs.com
QWEN_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
```

### Crear lib/qwen-client.js

```js
/* lib/qwen-client.js
 * Cliente para Qwen via DashScope (API compatible con OpenAI).
 * Usar cuando se necesite contexto largo (> 128K tokens) o máximo razonamiento.
 *
 * Modelos recomendados:
 *   qwen-plus           → equilibrio rendimiento/costo (~$0.0004/1K tokens input)
 *   qwen-turbo          → rápido y económico (~$0.00005/1K tokens input)
 *   qwen-max            → máxima capacidad (~$0.0024/1K tokens input)
 *   qwen2.5-72b-instruct → equivalente a Claude Sonnet
 */

const QWEN_API_URL = process.env.QWEN_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';

const QWEN_MODELS = {
    'qwen-fast':   'qwen-turbo',             // Haiku equivalent
    'qwen-smart':  'qwen-plus',              // Sonnet equivalent
    'qwen-best':   'qwen-max',               // Opus equivalent
    'qwen-72b':    'qwen2.5-72b-instruct',   // Open source, máximo rendimiento
    // Aliases para el Token Optimizer
    'llama-3.1-8b-instant':    'qwen-turbo',
    'llama-3.3-70b-versatile': 'qwen-plus',
};

async function qwenChat({ apiKey, model, system, userContent, maxTokens = 800 }) {
    const resolvedModel = QWEN_MODELS[model] || 'qwen-plus';

    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    messages.push({ role: 'user', content: userContent });

    const res = await fetch(`${QWEN_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model:      resolvedModel,
            messages,
            max_tokens: maxTokens,
            temperature: 0.7
        })
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Qwen API error ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const text  = data.choices?.[0]?.message?.content || '';
    const usage = data.usage || {};

    return {
        text,
        model:    resolvedModel,
        usage: {
            input_tokens:  usage.prompt_tokens     || 0,
            output_tokens: usage.completion_tokens || 0,
            cached_tokens: usage.prompt_cache_hit_tokens || 0  // DashScope sí tiene caching
        }
    };
}

module.exports = { qwenChat, QWEN_MODELS };
```

### Activar Qwen en el orquestador

Modifica `api/orchestrator.js` para seleccionar el proveedor según variable de entorno:

```js
// Al inicio del archivo, después de los requires actuales:
const { groqChat } = require('../lib/groq-client');

// Cargar Qwen solo si está configurado
let qwenChat = null;
if (process.env.QWEN_API_KEY) {
    try { ({ qwenChat } = require('../lib/qwen-client')); } catch (e) {}
}

// Función unificada que selecciona el proveedor:
async function callAI({ provider, apiKey, model, system, userContent, maxTokens }) {
    if (provider === 'qwen' && qwenChat) {
        return qwenChat({ apiKey, model, system, userContent, maxTokens });
    }
    return groqChat({ apiKey: process.env.GROQ_TOKEN, model, system, userContent, maxTokens });
}
```

Y en `_handle()`, reemplazar la llamada a `groqChat` por:

```js
const provider = process.env.AI_PROVIDER || 'groq'; // 'groq' | 'qwen'
const apiKey   = provider === 'qwen' ? env.qwenKey : env.groqKey;

groqResult = await callAI({ provider, apiKey, model, system: systemPrompt, userContent, maxTokens });
```

Agregar `qwenKey` y `aiProvider` al objeto `env` en el handler:

```js
const env = {
    groqKey:     process.env.GROQ_TOKEN          || '',
    qwenKey:     process.env.QWEN_API_KEY        || '',
    aiProvider:  process.env.AI_PROVIDER         || 'groq',
    supabaseUrl: process.env.SUPABASE_URL        || '',
    supabaseKey: process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || ''
};
```

### Variable de entorno para seleccionar proveedor

```bash
# .env o Vercel Settings
AI_PROVIDER=groq   # opciones: groq | qwen
```

---

## Opción 3: Qwen via Ollama (desarrollo local sin conexión)

Útil para desarrollar sin usar tokens de API ni conexión a internet.

### Instalar Ollama y descargar Qwen

```bash
# Instalar Ollama (Windows)
winget install Ollama.Ollama

# Descargar modelos Qwen
ollama pull qwen2.5:7b        # 4.7 GB — rápido
ollama pull qwen2.5:72b       # 41 GB — máximo rendimiento (requiere GPU potente)
ollama pull qwen2.5-coder:7b  # Para generación de código
```

### Usar Ollama con el cliente Groq (Ollama es compatible con la API de OpenAI)

No necesitas crear un cliente nuevo. Ollama expone una API compatible:

```bash
# Agregar a .env para desarrollo local
GROQ_TOKEN=ollama             # cualquier string no vacío
```

Modifica `lib/groq-client.js` para detectar Ollama:

```js
// Al inicio de groqChat():
const isOllama = apiKey === 'ollama' || apiKey.startsWith('ollama-');
const GROQ_API_URL = isOllama
    ? 'http://localhost:11434/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODELS_OLLAMA = {
    'llama-3.1-8b-instant':    'qwen2.5:7b',
    'llama-3.3-70b-versatile': 'qwen2.5:72b',
    'qwen-qwq-32b':            'qwen2.5:72b'
};

const resolvedModel = isOllama
    ? (GROQ_MODELS_OLLAMA[model] || 'qwen2.5:7b')
    : (GROQ_MODELS[model] || 'llama-3.3-70b-versatile');
```

---

## Tabla de decisión: ¿qué opción usar?

| Situación | Opción recomendada |
|-----------|-------------------|
| Producción, bajo costo, ya funciona | **Groq + Llama 3** (sin cambios) |
| Necesito mejor razonamiento en feedback | **Opción 1:** Qwen QwQ via Groq |
| Essays muy largos (> 5000 palabras) | **Opción 2:** DashScope + qwen-max |
| Múltiples sesiones con contexto histórico | **Opción 2:** DashScope (1M tokens) |
| Desarrollo sin internet / sin credenciales | **Opción 3:** Ollama local |
| Presupuesto cero, máxima calidad posible | **Opción 1:** Qwen QwQ via Groq (gratis) |

---

## Modelos Qwen disponibles — referencia rápida

### En Groq (gratis)

| Modelo | Tokens contexto | Mejor para |
|--------|----------------|-----------|
| `qwen-qwq-32b` | 128K | Razonamiento, análisis, peer review |
| `qwen-2.5-coder-32b-preview` | 128K | Generación de código (Content Gen Agent) |

### En DashScope (pago)

| Modelo | Tokens contexto | Mejor para |
|--------|----------------|-----------|
| `qwen-turbo` | 1M | Tareas simples, alto volumen |
| `qwen-plus` | 1M | Balance costo/calidad (recomendado) |
| `qwen-max` | 1M | Máxima calidad, análisis complejos |
| `qwen2.5-72b-instruct` | 128K | Open source, mismo nivel que Claude Sonnet |
| `qwen2.5-7b-instruct` | 128K | Económico, equivalente a Haiku |

### En Ollama (local, gratis)

| Modelo | Tamaño | Mejor para |
|--------|--------|-----------|
| `qwen2.5:7b` | 4.7 GB | Desarrollo local, pruebas |
| `qwen2.5:14b` | 9 GB | Desarrollo con mejor calidad |
| `qwen2.5:72b` | 41 GB | Producción local (GPU requerida) |
| `qwen2.5-coder:7b` | 4.7 GB | Generación de código |

---

## Consideraciones de seguridad y privacidad

- **DashScope** procesa datos en servidores de Alibaba Cloud (China + internacional). Revisar las políticas de privacidad si los ensayos contienen datos sensibles de estudiantes.
- **Ollama local** mantiene todo en el servidor local — opción más privada para datos educativos sensibles.
- **Groq** procesa en servidores en EE.UU. con política de no retención de datos en el tier gratuito.
- Los ensayos de los estudiantes son datos académicos protegidos. Para cumplimiento FERPA/LOPD ecuatoriana, considerar Ollama local o una instancia privada de Qwen.

---

## Estado de integración

| Opción | Estado | Próximos pasos |
|--------|--------|---------------|
| Groq + Llama 3 | ✅ Activo | Ninguno |
| Groq + Qwen QwQ | 🟡 Disponible | Actualizar GROQ_MODELS en groq-client.js |
| DashScope + Qwen | 🟠 Documentado | Crear lib/qwen-client.js + QWEN_API_KEY |
| Ollama local | 🟠 Documentado | Instalar Ollama + modificar groq-client.js |
