# CLAUDE.md — Academic Reading & Writing Workspace

Instrucciones para **Claude Code** cuando trabaja en este proyecto.

---

## Descripción del proyecto

Sistema de aprendizaje de escritura académica en inglés para ~200 estudiantes de ULEAM (Manta, Ecuador). Incluye 72 lecciones en 5 tracks, 8 agentes de IA en Groq (Llama 3) y auditoría de integridad académica en tiempo real.

**Stack:**
- Node.js 24.x + Vercel serverless (12 endpoints en `api/` — **al límite exacto de 12**, no hay slot libre)
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

El plan Hobby de Vercel permite máximo 12 serverless functions. **Hay 12 en `api/` — al límite exacto, cero slots libres:** `admin-archive-course.js`, `admin-reenroll-student.js`, `admin-student-detail.js`, `admin-students.js`, `config.js`, `gamification.js`, `lesson-availability.js`, `orchestrator.js`, `peer-review-session.js`, `sync-reading.js`, `validate-student.js`, `cron/compress-profiles.js`.

- **`api/`** → solo endpoints (cuentan como funciones Vercel)
- **`lib/`** → módulos de soporte, helpers, agentes (no cuentan)

**No mover nada de `lib/` a `api/` sin verificar el conteo.** **No agregar un endpoint nuevo sin antes consolidar uno existente** (`peer-review-session.js` ya es multiplexado por `action` en el body — ese es el patrón a seguir: nuevas funcionalidades entran como una acción más del endpoint existente que más se les parezca, no como archivo nuevo).

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

Qwen via DashScope está documentado abajo como alternativa, pero `lib/qwen-client.js` no existe todavía — hay que crearlo antes de poder cambiar el proveedor.

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

Ofrece contexto de hasta 1M tokens. No hay `QWEN.md` ni `lib/qwen-client.js` implementados aún — este proveedor está documentado pero no activo.

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

El **GitHub Agent** (`lib/agents/github.js`) audita seguridad del codebase. **Nota:** el hook `PostToolUse` que lo dispararía automáticamente en Claude Code NO está configurado en `.claude/settings.json` — hoy es invocación manual, no automática. Busca:

1. **Credenciales hardcodeadas** — `SUPABASE_SERVICE_KEY`, `GROQ_TOKEN`, `ADMIN_PASSWORD` en archivos JS
2. **PII en logs** — `console.log` con `studentId`, email, o contraseñas
3. **CDNs externas no autorizadas** — scripts de terceros sin `integrity` hash
4. **Funciones ES module** — `import`/`export` en archivos `.js` de `api/` o `lib/`

Si se detectan problemas, reportarlos en `DEUDA_TECNICA.md`.

---

## Deuda técnica activa

Ver `DEUDA_TECNICA.md` para el estado completo. Items pendientes de mayor impacto:

| ID | Prioridad | Descripción |
|----|-----------|------------|
| DT-002 | 🟡 MEDIO | `slide-engine.js` (~3373 líneas) mezcla UI + sync Supabase |
| DT-003 | 🟡 MEDIO | Cálculo de integridad duplicado: `_calcIntegrityScore` (`essay-handler.js`) vs `_calcIntegrity` (`slide-engine.js`) |
| DT-006 | 🟢 NUEVO | Teacher Helper Mode: Inline annotations via `data-teacher-note` and `?teacher=1` |
| DT-008 | 🟡 MEDIO | Rúbrica de Peer Review (`peel_rigor`/`hedging`/`nominalization`) hardcodeada en `api/peer-review-session.js` — no editable desde una tabla como `test_rubrics` |

Ítems completados: DT-004 (READING_COMMENT deshabilitado en el motor; auditoría no encontró usos reales en `modules/`), L-001 (Argumentative Essay), L-002 (Chain Essay), L-003 (Instructor Mode Manual Toggle), sistema de Peer Review en vivo con plantillas (ver sección dedicada arriba) — ver `DEUDA_TECNICA.md`.

**DT-007 (WONTFIX):** `_configReady` duplicado en `reading-engine.js`/`slide-engine.js` — investigado y descartado, no es bug funcional (ningún HTML carga ambos motores a la vez). Ver detalle en `DEUDA_TECNICA.md`.

---

## Peer Review — Sesión en vivo (nuevo, 2026-09-17)

Módulo separado de la lección estática "Peer Review Form" (`lib/agents/peer-review.js`, chatbot guía socrática). Esta es una sesión sincronizada en tiempo real para toda la clase: el docente abre, los estudiantes escriben con integridad, se asignan revisiones anónimas al azar, se revisan con rúbrica, y se liberan resultados con doble evaluación (IA Groq + promedio de pares).

**Archivos:**
- `api/peer-review-session.js` — el único endpoint nuevo, multiplexado por `action` (18 acciones: `open`, `connect`, `roster`, `roster_detail`, `start_writing`, `autosave_draft`, `finish_early`, `force_close_writing`, `assign_reviews`, `get_my_reviews`, `submit_review`, `force_close_reviewing`, `reopen_reviewing`, `exclude_participant`, `release_feedback`, `get_results`, `list_templates`, `save_template`, `delete_template`).
- `modules/03-peer-review/live-session.html` + `js/peer-review-client.js` — UI docente/estudiante. Vive dentro del hub existente "03. Peer System" (primera lección de la lista), no en la raíz.
- Tablas nuevas en Supabase: `peer_review_sessions`, `peer_review_participants`, `peer_review_assignments`, `peer_review_feedback`, `peer_review_templates` — todas con RLS activo **sin políticas** (deny-all para anon/authenticated; solo el endpoint con `SUPABASE_SERVICE_KEY` puede leerlas/escribirlas). Esto es a propósito: garantiza el anonimato de quién revisó a quién.
- Columnas nuevas en `essay_submissions`: `peer_review_session_id`, `ai_essay_scores`, `ai_essay_rationale`, `peer_avg_scores`, `peer_review_count`. El promedio de pares se persiste aquí (no en `peer_review_feedback`, que está bloqueada) porque `js/report.js` (PDF del estudiante) y `admin-student-detail.js`/`admin-students.html` (panel docente) leen `essay_submissions` directo con anon/service key — sin esta persistencia nunca podrían mostrar el resultado.

**Reglas de estado — no romper:**
- `assign_reviews` exige `session.status === 'assigning'`; `force_close_writing` exige `'writing'`; `force_close_reviewing` exige `'reviewing'`. Un doble-click en el botón correspondiente devuelve 409 en vez de repetir la acción — esto arregló un bug real (sesión del 2026-09-17 donde un doble-click dejó a los 8 estudiantes sin poder revisar). Si se agrega una acción nueva que cambia el status de la sesión, agregar la misma guarda.
- `release_feedback` es idempotente y por lotes (`batchSize`, tope 30) — el frontend lo llama en loop hasta `remaining === 0`. El status de la sesión solo pasa a `'feedback_released'` cuando TODO el lote terminó — nunca al inicio (causaba que estudiantes con poll mal sincronizado vieran resultados vacíos permanentes).
- `gradeWithGroq` reintenta 2 veces y, si falla del todo, no escribe nada (deja la fila sin calificar para que el próximo `release_feedback` la reintente) — nunca escribir un fallback `null` que marque una fila como "ya procesada".
- La rúbrica (`ESSAY_CRITERIA` = `peel_rigor`/`hedging`/`nominalization`) está **hardcodeada** en `api/peer-review-session.js` y en `RUBRIC_LABELS` de `live-session.html` — no vive en una tabla editable todavía (a diferencia de `test_rubrics`). Ver DT-008 en `DEUDA_TECNICA.md`.

---

## Instructor Mode (Manual Toggle)

El sistema permite a los profesores alternar entre la vista de estudiante y la vista de instructor en tiempo real.

- **Instructor Mode**: Al entrar como `arturo.rodriguez@uleam.edu.ec`, habilita el botón en la sidebar. Envía `postMessage` a iframes para alternar vista.
- **Teacher Helper Mode**: Acceso vía URL `?teacher=1` + password (SHA-256: `bbe6d5...`). Revela bloques `[data-teacher-note]` inyectando estilos y un banner ámbar.
- **Motores**: Ambos motores soportan tanto el toggle manual como el helper vía URL.

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
- El `slide-engine.js` tiene ~3373 líneas — leer solo las secciones relevantes.
- **Teacher Helper**: Al agregar notas, usar el atributo `data-teacher-note="Texto de la nota"`. Las notas deben explicar el *porqué* pedagógico y proveer citas exactas en español.
- **READING_COMMENT**: No usar en `reading-engine`. Si se encuentra uno, reportarlo para conversión a QUIZ o FILL.
