# CHANGELOG — Academic Reading & Writing Workspace

Historial de versiones del sistema. Sigue el formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

---

## [Unreleased]

### Pendiente
- Argumentative Essay — módulo `01/unit1-essays/` (L-001)
- Chain Essay — módulo `01/unit1-essays/` (L-002)
- Tests con scoring real (L-003, L-004, L-005)
- Peer Review Form funcional (L-006, L-007)
- Refactorizar `slide-engine.js` → extraer sync Supabase a `js/supabase-sync.js` (DT-002)
- Módulo compartido `js/integrity-calc.js` (DT-003)
- Verificación de `isAdmin` en `admin.html` al cargar (DT-005)

---

## [2.2.0] — 2026-04-12

### Agregado
- **Límite Vercel resuelto (INFRA-001):** módulos de agentes movidos a `lib/` para quedar bajo el límite de 12 funciones del plan Hobby. Solo 5 endpoints permanecen en `api/`.
- **Documentación completa:** `README.md`, `CLAUDE.md`, `QWEN.md`, `CHANGELOG.md` — todos actualizados con el stack actual y guías de integración de proveedores alternativos de IA.

### Cambiado
- Estructura final: `api/` (5 endpoints) + `lib/` (groq-client + 8 agentes)
- `DEUDA_TECNICA.md` v2.2 con secciones 6 y 7 completas

---

## [2.1.0] — 2026-04-12

### Agregado
- **AUTH-001:** Autenticación de administrador con contraseña para `arturo.rodriguez@uleam.edu.ec`
  - `validate-student.js` exige contraseña y devuelve `role: 'admin'`
  - `index.html` muestra campo de contraseña automáticamente para el email admin
  - `auth.js` guarda `isAdmin: 'true'` en localStorage
- **SESSION-001:** Sesión extendida a 24 horas
  - Al expirar: solo borra timestamp, conserva email y consents
  - `_prefillReturningUser()`: pre-llena email y salta al Step 2 si ya hay consents

---

## [2.0.0] — 2026-04-12

### Agregado
- **DT-001 resuelto:** `js/config-loader.js` — singleton `window.configReady`
  - Centraliza el `fetch('/api/config')` que antes se hacía de forma independiente en cada archivo
  - Cualquier módulo que necesite Supabase solo hace `await window.configReady`
  - Elimina la race condition de BUG-001

---

## [1.9.0] — 2026-04-12

### Cambiado
- **Migración Anthropic → Groq completada**
  - `api/orchestrator.js`: reemplazado el cliente Anthropic por `groqChat()` de `lib/groq-client.js`
  - `lib/agents/memory.js`: migrado a `groqChat()`
  - `api/cron/compress-profiles.js`: migrado a `groqChat()`
  - `lib/groq-client.js`: cliente fetch nativo (sin dependencias adicionales)
  - Modelos: `llama-3.1-8b-instant` (Haiku) + `llama-3.3-70b-versatile` (Sonnet/Opus)
  - Costo: $0 (plan gratuito de Groq)

### Motivo
El proyecto migró de Anthropic Claude API a Groq para eliminar el costo de tokens. `@anthropic-ai/sdk` permanece instalado para uso futuro o reactivación.

---

## [1.8.0] — 2026-04-12

### Verificado
- **BUG-002 VERIFICADO:** `is_update` sí existe en `essay_submissions` — diagnóstico original era incorrecto. Columna restaurada al record.
- **BUG-003 VERIFICADO:** `activity_key` es el campo correcto (no `lesson_id`). Fix erróneo revertido.
- Compliance verificado en DB real: 20 filas reales en `essay_compliance_results`
- Tablas Supabase confirmadas como creadas (student_profiles, agent_interactions, session_cache, essay_requirements)

---

## [1.7.0] — 2026-04-12

### Agregado
- **AG-008 RESUELTO:** Peer Review Agent (`lib/agents/peer-review.js`)
  - Modo A (reviewer_guide): guía socrática para quien revisa
  - Modo B (feedback_receiver): priorización para quien recibe feedback
  - Wire completo al formulario `peer-review-form.html`
- **Cron Memory Agent:** `vercel.json` + `api/cron/compress-profiles.js`
  - Ejecuta nocturnamente a las 03:00 UTC (22:00 hora Ecuador)
  - Comprime perfiles estudiantiles en `student_profiles`
- **DT-004 RESUELTO:** 10 filas iniciales en `essay_requirements` (schema SQL actualizado)

---

## [1.6.0] — 2026-04-12

### Agregado
- **AG-009 RESUELTO:** Content Generator Agent (`lib/agents/content-gen.js`)
  - Genera HTML de slides desde prompts del instructor
  - Sección "Generate Lesson Slides" en `admin.html`
  - `outputFormat: 'generate_content'` → Opus vía Token Optimizer
- **AG-010 RESUELTO:** GitHub Agent (`lib/agents/github.js`)
  - 3 acciones: review, security_check, debt_update
  - Hook `PostToolUse` en `.claude/settings.local.json`
  - `scripts/github-check.js`: escanea credenciales, service_role key, PII en logs, CDNs externas
- **AG-011 RESUELTO:** Frontend Diagnostic Agent (`lib/agents/frontend.js`)
  - Diagnóstico de componentes, snippets HTML/CSS
  - Verificación de consistencia entre los 72 módulos

---

## [1.5.0] — 2026-04-12

### Agregado
- **AG-005 RESUELTO:** Reading Agent (`lib/agents/reading.js`)
  - Panel flotante "🤖 Reading Coach" inyectado en `reading-engine.js`
  - 3 modos: texto seleccionado, pregunta libre, múltiples errores
  - Coaching socrático (no da respuestas directas)
- **BUG-004 RESUELTO:** `reading_progress` ahora se sincroniza a Supabase
  - `api/sync-reading.js` reescrito en CommonJS (era ES module, incompatible)
  - Ruta `/api/sync-reading` agregada a `server.js`
  - BUG-001 corregido también en `reading-engine.js`

---

## [1.4.0] — 2026-04-12

### Resuelto
- **BUG-001:** Race condition en credenciales Supabase
  - `fetch('/api/config')` asignado a `const _configReady` con `await` en todas las funciones que usan SUPABASE_URL/KEY
- **BUG-002:** Diagnóstico inicial incorrecto de `is_update` — verificado que sí existe
- **BUG-003:** Diagnóstico inicial incorrecto de `activity_key` — código original correcto, fix erróneo revertido

---

## [1.3.0] — 2026-04-12

### Agregado
- **AG-006 RESUELTO:** Panel de administración completo en `admin.html`
  - Password gate
  - Overview cards de métricas estudiantiles
  - Consola DB Admin con IA (dbAdmin Agent via orquestador)
  - Tabla de flags de integridad
  - Log de interacciones de agentes
- **AG-007 RESUELTO:** Progress Agent
  - Tab "🤖 AI Insights" en `my-progress.html`
  - Lazy load en click del tab
  - Payload `_progressSummary`, `needsHistoryDepth: 5`

---

## [1.2.0] — 2026-04-12

### Agregado
- **AG-003 RESUELTO:** Writing Agent (`lib/agents/writing.js`)
  - Feedback con modelo PEER (Point, Evidence, Explanation, Restatement)
  - Panel inyectado en slides de tipo ESSAY
  - Feedback visible al estudiante tras submit (llamada asíncrona al orquestador)
- **AG-004 RESUELTO:** Integrity Agent (`lib/agents/integrity.js`)
  - Fire & forget al enviar ensayo
  - Análisis de telemetría de comportamiento (keystrokes, pastes, tab switches)
  - Resultados en `agent_interactions` — solo visible al instructor

---

## [1.1.0] — 2026-04-12

### Agregado
- **AG-001 RESUELTO:** Orquestador de agentes (`api/orchestrator.js`)
  - Token Optimizer: score de complejidad 0-100
  - Selección automática de modelo (8b-instant vs 70b-versatile)
  - Router de agentes via `AGENT_MAP`
  - Logging de interacciones en `agent_interactions` (Supabase)
  - Segmento A (system prompt) + B (perfil) + C (payload dinámico)
- **AG-002 RESUELTO:** Memory Agent (`lib/agents/memory.js`)
  - `getProfile()`: lee `student_profiles` o construye perfil base
  - `buildContextString()`: genera Segmento B para el orquestador
  - `saveSessionCache()`: persiste contexto con TTL 4h
  - `compressHistory()`: compresión de historial para la tabla `student_profiles`
- **AG-012 RESUELTO:** `js/agent-client.js` — wrapper frontend
  - `AgentClient.call(agent, task, payload, options)` — API unificada
  - Helpers: `requestWritingFeedback()`, `requestIntegrityAnalysis()`, `requestProgressSummary()`, `askReadingQuestion()`
- **Tablas Supabase creadas:** `student_profiles`, `agent_interactions`, `session_cache`, `essay_requirements`
- **`lib/agents/_prompts.js`:** 8 system prompts cacheados (writing, reading, integrity, progress, peerReview, contentGen, github, dbAdmin)

---

## [1.0.0] — 2026-04-12

### Base inicial del sistema de agentes
- Diagnóstico completo del proyecto
- Identificados 5 bugs, 5 deudas técnicas, 12 agentes faltantes
- Creado `DEUDA_TECNICA.md` como tracker centralizado
- Stack base: Node.js + Supabase + Vercel (Hobby plan)

---

## [0.9.0] — 2025 (pre-agentes)

### Sistema base de monitoreo académico
- Motor de slides (`js/slide-engine.js`) con 12 tipos de slides
- 72 módulos de lección en 5 tracks (`modules/`)
- Auditoría de integridad: keystrokes, pastes, tab switches, tiempo
- Generación de PDF de progreso (`js/report.js`)
- Sincronización con Supabase (essays, reading progress, activity logs)
- Login con email universitario + consentimientos LOPD
- Migración de Google Sheets → Supabase completada

---

## Formato de versiones

`MAJOR.MINOR.PATCH`

- **MAJOR** — cambios de arquitectura (migración de proveedor, refactorización mayor)
- **MINOR** — nuevas funcionalidades (agentes, endpoints, módulos de lección)
- **PATCH** — bug fixes, correcciones de documentación
