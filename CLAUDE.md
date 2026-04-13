# CLAUDE.md — Academic Reading & Writing Workspace

Instrucciones para **Claude Code** cuando trabaja en este proyecto.

---

## Descripción del proyecto

Sistema de aprendizaje de escritura académica en inglés para ~200 estudiantes de ULEAM (Manta, Ecuador). Incluye 72 lecciones en 5 tracks, 8 agentes de IA en Groq (Llama 3) y auditoría de integridad académica en tiempo real.

**Stack:**
- Node.js 24.x + Vercel serverless (5 endpoints en `api/`)
- Supabase (PostgreSQL con RLS)
- Groq API — Llama 3.1-8b-instant + Llama 3.3-70b-versatile (gratis)
- Vanilla JS + Bootstrap 5 (sin frameworks frontend)

---

## Reglas de codificación

### CommonJS obligatorio

Este proyecto NO usa ES modules. Todo el backend debe ser CommonJS:

```js
// CORRECTO
const { groqChat } = require('../lib/groq-client');
module.exports = { myFunction };

// INCORRECTO — rompe Vercel y Node.js nativo
import { groqChat } from '../lib/groq-client';
export default myFunction;
```

### Límite de funciones Vercel

El plan Hobby de Vercel permite máximo 12 serverless functions. Actualmente hay 5 en `api/`.

- **`api/`** → solo endpoints (cuentan como funciones Vercel)
- **`lib/`** → módulos de soporte, helpers, agentes (no cuentan)

**No mover nada de `lib/` a `api/` sin verificar el conteo.**

### Variables de entorno

| Variable | Dónde se usa | Acceso |
|----------|-------------|--------|
| `GROQ_TOKEN` | `lib/groq-client.js` | Solo servidor |
| `QWEN_API_KEY` | `lib/qwen-client.js` (si existe) | Solo servidor |
| `SUPABASE_URL` | Todos los endpoints | Público (via /api/config) |
| `SUPABASE_KEY` | Frontend vía /api/config | Público (anon key) |
| `SUPABASE_SERVICE_KEY` | Endpoints del servidor | **Nunca al browser** |
| `ADMIN_PASSWORD` | `api/validate-student.js` | Solo servidor |
| `CRON_SECRET` | `api/cron/compress-profiles.js` | Solo servidor |

**Regla crítica:** `SUPABASE_SERVICE_KEY` NUNCA debe llegar al cliente. Si el GitHub Agent lo detecta en código client-side, bloquea el commit.

---

## Arquitectura de agentes

### Cómo funciona el orquestador

```
POST /api/orchestrator
  body: { agent, studentId, task, payload, outputFormat, needsHistoryDepth, requiresTools }

  1. AGENT_MAP[agent] → busca la clave del prompt en _prompts.js
  2. Memory.getProfile(studentId) → Segmento B (contexto del estudiante)
  3. scoreComplexity() → score 0-100
  4. selectModel(score) → llama-3.1-8b o llama-3.3-70b
  5. agentModule.transformPayload() → normaliza el payload
  6. groqChat(system, userContent, maxTokens) → respuesta
  7. _logInteraction() → audit trail en Supabase
```

### Cómo agregar un nuevo agente

1. Crear `lib/agents/mi-agente.js` con:
   ```js
   function transformPayload(payload) { /* normaliza y trunca */ }
   function buildTask(payload) { /* genera el string de tarea */ }
   module.exports = { transformPayload, buildTask };
   ```
2. Agregar el system prompt a `lib/agents/_prompts.js`
3. Registrar en `AGENT_MAP` de `api/orchestrator.js`
4. Agregar en el array de nombres en orchestrator.js (línea `['writing', 'integrity', ...]`)
5. Crear el cliente frontend en `js/agent-client.js` si es necesario

### Cambiar el proveedor de IA

El orquestador llama a `groqChat()`. Para cambiar de proveedor, solo hay que:

1. Crear un nuevo cliente en `lib/` (ver `lib/groq-client.js` como referencia)
2. Cambiar el `require` en `api/orchestrator.js`
3. Ajustar los nombres de modelos en `selectModel()`

Ver [QWEN.md](QWEN.md) para instrucciones específicas de Qwen.

---

## Proveedores de IA disponibles

### Groq (activo por defecto)

```bash
GROQ_TOKEN=gsk_...
```

Modelos en uso:
- `llama-3.1-8b-instant` → tareas simples (score ≤ 30)
- `llama-3.3-70b-versatile` → análisis complejos (score > 30)

También disponibles en Groq (no configurados por defecto):
- `qwen-qwq-32b` → razonamiento, útil para feedback detallado
- `meta-llama/llama-4-scout-17b-16e-instruct` → multimodal
- `gemma2-9b-it` → alternativa liviana de Google

### Qwen via DashScope (alternativa)

```bash
QWEN_API_KEY=sk-...
```

Ver [QWEN.md](QWEN.md) para configuración completa. Ofrece contexto de hasta 1M tokens.

### Anthropic Claude (desarrollo y mantenimiento)

`@anthropic-ai/sdk` está instalado (`npm list @anthropic-ai/sdk`). Actualmente no se usa en producción pero puede activarse para:
- Análisis de ensayos de alta complejidad
- Tareas que requieren prompt caching real (reduce costos)

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

Si se activa, agregar alias en `GROQ_MODELS` de `groq-client.js` o crear `lib/claude-client.js`.

---

## Convenciones de desarrollo

### Manejo de errores en agentes

```js
// Patrón estándar — no lanzar excepciones que rompan el orquestador
try {
    const result = await someOperation();
    return result;
} catch (e) {
    console.warn('⚠️ NombreAgente: descripción del error:', e.message);
    return { fallback: true, text: 'Mensaje por defecto al estudiante' };
}
```

### Logging

- `console.log` → información de flujo normal
- `console.warn` → errores no críticos (agente falla pero el sistema sigue)
- `console.error` → errores críticos (endpoint falla)
- **Nunca** loguear `studentId`, emails, contenido de ensayos, o contraseñas

### Supabase desde el servidor

Siempre usar `SUPABASE_SERVICE_KEY` (no la anon key) en los endpoints:

```js
const headers = {
    'Content-Type': 'application/json',
    'apikey': process.env.SUPABASE_SERVICE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'Prefer': 'return=minimal'
};
```

### Supabase desde el cliente

El browser solo conoce la anon key (obtenida vía `GET /api/config`). Usar siempre `await window.configReady` antes de cualquier llamada:

```js
const { supabaseUrl, supabaseKey } = await window.configReady;
```

---

## Guía del GitHub Agent

El **GitHub Agent** (`lib/agents/github.js`) se ejecuta automáticamente via hook `PostToolUse` en Claude Code cuando se editan archivos críticos. Busca:

1. **Credenciales hardcodeadas** — `SUPABASE_SERVICE_KEY`, `GROQ_TOKEN`, `ADMIN_PASSWORD` en archivos JS
2. **PII en logs** — `console.log` con `studentId`, email, o contraseñas
3. **CDNs externas no autorizadas** — scripts de terceros sin `integrity` hash
4. **Funciones ES module** — `import`/`export` en archivos `.js` de `api/` o `lib/`

Si el hook detecta problemas, los reporta en `DEUDA_TECNICA.md` antes de completar el commit.

---

## Deuda técnica activa

Ver `DEUDA_TECNICA.md` para el estado completo. Items pendientes de mayor impacto:

| ID | Prioridad | Descripción |
|----|-----------|------------|
| DT-002 | 🟡 MEDIO | `slide-engine.js` (2482 líneas) mezcla UI + sync Supabase |
| DT-003 | 🟡 MEDIO | `_calcIntegrityFallback` duplicada en `report.js` y `essay-handler.js` |
| DT-005 | 🟡 MEDIO | `admin.html` no verifica `isAdmin` desde localStorage |
| L-001 | 🔴 CRÍTICO | Argumentative Essay (HTML vacío, coming soon) |
| L-002 | 🔴 CRÍTICO | Chain Essay (HTML vacío, coming soon) |

---

## Comandos útiles

```bash
# Desarrollo local
npm start                    # http://localhost:3000

# Verificar límite de funciones Vercel
ls api/ api/cron/            # deben ser ≤ 12 archivos .js en total

# Ejecutar schema de agentes en Supabase
# → Copiar contenido de supabase-agents-schema.sql al SQL Editor del Dashboard

# Ver logs del servidor en local
npm start 2>&1 | ollama run llama3.2 "Summarize errors only. Be concise."
```

---

## Notas para Claude Code

- Este proyecto tiene ~200 estudiantes activos en producción. Los cambios en `api/` afectan directamente la experiencia del estudiante.
- Antes de modificar `api/orchestrator.js`, revisar que todos los agentes siguen funcionando.
- Los archivos de módulos (`modules/`) son HTML estáticos generados — no modificar manualmente, usar el Content Gen Agent.
- El `slide-engine.js` tiene 2482 líneas — leer solo las secciones relevantes, no el archivo completo.
- Cuando el output de un comando sea grande, usar: `| ollama run llama3.2 "Summarize. Focus on errors. Be concise."`
