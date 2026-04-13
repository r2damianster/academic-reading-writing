# Deuda Técnica — Academic Reading & Writing Workspace
> Mantenido por: **Agente GitHub** (detección automática en PRs y commits)  
> Actualización manual: Dr. Arturo Rodríguez Zambrano  
> Última revisión: 2026-04-12

---

## Cómo usar este archivo

- **Agregar un bug:** copia el bloque de plantilla de la sección correspondiente y llénalo
- **Cerrar un ítem:** cambia el estado a `✅ RESUELTO` y agrega la fecha y el commit
- **El Agente GitHub** revisa este archivo en cada PR que toque archivos críticos y agrega ítems nuevos si detecta problemas

---

## LEYENDA DE ESTADOS

| Símbolo | Significado |
|---------|------------|
| 🔴 CRÍTICO | Bloquea funcionalidad en producción |
| 🟠 ALTO | Afecta datos o experiencia del estudiante |
| 🟡 MEDIO | Funciona pero con comportamiento incorrecto |
| 🔵 BAJO | Mejora o inconsistencia menor |
| ✅ RESUELTO | Cerrado — incluye commit de referencia |
| 🚧 EN PROGRESO | Alguien está trabajando en esto |

---

## SECCIÓN 1 — BUGS CONFIRMADOS

### BUG-001 ✅ RESUELTO Race condition en credenciales Supabase
- **Archivo:** `js/slide-engine.js`
- **Descripción:** `fetch('/api/config')` era asíncrono y sin await. Si `_sendEssayToSheet` se ejecutaba antes de que la promesa resolviera, `SUPABASE_URL` y `SUPABASE_ANON_KEY` estaban vacíos.
- **Fix aplicado:** `fetch('/api/config')` asignado a `const _configReady`. `_resolveStudentId`, `_sendLessonToSheet`, `_sendEssayToSheet` y `_saveComplianceResult` hacen `await _configReady` al inicio.
- **Resuelto:** 2026-04-12 — commit pendiente

---

### BUG-002 ✅ VERIFICADO `is_update` SÍ existe en `essay_submissions`
- **Archivo:** `js/slide-engine.js`
- **Descripción:** Diagnóstico original incorrecto. La columna `is_update BOOLEAN DEFAULT false` SÍ existe en el schema. El campo fue restaurado al `record`.
- **Verificado contra DB real:** 2026-04-12 — 21 filas en essay_submissions todas con is_update=false

---

### BUG-003 ✅ VERIFICADO `activity_key` es el campo correcto
- **Archivo:** `js/slide-engine.js`
- **Descripción:** El análisis original era incorrecto. La tabla usa `activity_key` como PK (formato con guiones: "formal-language"). El código original era correcto. Un fix erróneo cambió a `lesson_id` — revertido.
- **Estado final:** Query usa `activity_key=eq.${lessonName.replace(/ /g,'-')}`. Compliance verificado: 20 filas reales en essay_compliance_results.
- **Verificado contra DB real:** 2026-04-12

---

### BUG-004 ✅ RESUELTO `reading_progress` no se sincroniza a Supabase
- **Archivo:** `js/reading-engine.js`, `api/sync-reading.js`
- **Descripción:** `_persistLessonResult()` ya insertaba en `reading_progress` via Supabase REST al finalizar la lección. El endpoint `sync-reading.js` existía pero usaba ES module syntax (incompatible con el resto del proyecto).
- **Fix aplicado:** `sync-reading.js` reescrito en CommonJS (`module.exports`). Ruta `/api/sync-reading` agregada a `server.js`. BUG-001 también corregido en reading-engine.js (mismo patrón `_configReady`).
- **Resuelto:** 2026-04-12 — commit pendiente

---

### BUG-005 🔵 README desactualizado
- **Archivo:** `README.md`
- **Descripción:** El README menciona Google Sheets y Google Apps Script como backend. El proyecto ya migró completamente a Supabase. También hay referencias a Bootstrap que no se usa.
- **Impacto:** Confusión para cualquier colaborador nuevo.
- **Fix propuesto:** Reescribir el README con el stack actual: Node.js + Supabase + Vercel.
- **Detectado:** Análisis de código — 2026-04-12
- **Asignado a:** pendiente

---

## SECCIÓN 2 — DEUDA TÉCNICA

### DT-001 ✅ RESUELTO No hay manejo de promesa para carga de credenciales (patrón)
- **Descripción:** Tanto `slide-engine.js` como `report.js` hacían `fetch('/api/config')` de forma independiente al cargar. No había un módulo centralizado de configuración.
- **Fix aplicado:** Creado `js/config-loader.js` — singleton `window.configReady = fetch('/api/config').then(...)`. Cualquier archivo nuevo solo necesita `await window.configReady` antes de usar Supabase. Incluir el script antes que slide-engine.js/reading-engine.js en cada HTML.
- **Resuelto:** 2026-04-12

---

### DT-002 🟡 `slide-engine.js` mezcla responsabilidades
- **Descripción:** El motor de slides (navegación, tipos de slide, UI) contiene también toda la lógica de sincronización con Supabase (`_sendLessonToSheet`, `_sendEssayToSheet`, `_saveComplianceResult`, `_insertToSupabase`, `_queueFailedRecord`). Un solo archivo de 2482 líneas.
- **Impacto:** Difícil de mantener. Cambios en la lógica de sync afectan accidentalmente la lógica de slides.
- **Mejora propuesta:** Extraer la lógica de Supabase a `js/supabase-sync.js` cuando se haga la refactorización para integrar los agentes.

---

### DT-003 🟡 Duplicación de `_calcIntegrityFallback` en `report.js`
- **Descripción:** La función de cálculo de integridad está implementada en `essay-handler.js` (`_calcIntegrityScore`) y duplicada en `report.js` (`_calcIntegrityFallback`). Cualquier cambio al algoritmo debe hacerse en dos lugares.
- **Mejora propuesta:** Mover la función a un módulo compartido `js/integrity-calc.js` e importarla desde ambos archivos.

---

### DT-004 ✅ RESUELTO `essay_requirements` no tiene ninguna fila cargada
- **Descripción:** La tabla estaba vacía — compliance nunca se calculaba.
- **Fix:** `supabase-agents-schema.sql` actualizado con 10 filas iniciales: módulo 00 (formal language, thesis, topic sentences, PEER model, essay structure, semantic waves, hedging) + módulo 01 (argumentative essay, chain essay, rebuttal). `ON CONFLICT DO UPDATE` para re-runs seguros.
- **Resuelto:** 2026-04-12 — ejecutar el SQL en Supabase Dashboard para activar

---

### DT-005 🟡 No hay validación de rol instructor en el frontend
- **Descripción:** Acceso a admin.html protegido solo por password gate en el HTML. Cualquier estudiante con la URL podría intentar acceder.
- **Avance 2026-04-12:** `validate-student.js` ahora devuelve `role: 'admin'` para `arturo.rodriguez@uleam.edu.ec` (requiere contraseña). `auth.js` guarda `localStorage.setItem('isAdmin', 'true')`. Falta: que `admin.html` verifique `isAdmin` desde localStorage además de su propio password gate.
- **Pendiente:** Agregar check `if (localStorage.getItem('isAdmin') !== 'true') { window.location.href = '/'; }` al inicio de admin.html.

---

## SECCIÓN 3 — INFRAESTRUCTURA DE AGENTES FALTANTE

### AG-001 ✅ RESUELTO Orquestador de agentes
- **Descripción:** `/api/orchestrator.js` — punto de entrada único para todos los agentes.
- **Resuelto:** 2026-04-12 — incluye Token Optimizer, routing, prefix caching, logging

---

### AG-002 ✅ RESUELTO Agente de Memoria
- **Descripción:** `/api/agents/memory.js` + tabla `student_profiles` en Supabase.
- **Resuelto:** 2026-04-12 — getProfile, buildContextString, saveSessionCache, compressHistory

---

### AG-003 ✅ RESUELTO Agente de Escritura Académica
- **Descripción:** `/api/agents/writing.js` + panel de feedback inyectado en ESSAY slides.
- **Resuelto:** 2026-04-12 — panel visible al estudiante tras submit, llamada async al orquestador

---

### AG-004 ✅ RESUELTO Agente de Integridad Académica
- **Descripción:** `/api/agents/integrity.js` + hook en `finishLessonWithEssay`.
- **Resuelto:** 2026-04-12 — fire & forget tras submit, resultado en agent_interactions (instructor)

---

### AG-005 ✅ RESUELTO Agente de Lectura Académica
- **Descripción:** `api/agents/reading.js` + panel flotante "🤖 Reading Coach" inyectado en `reading-engine.js` vía `_mountReadingAIPanel()`.
- **Resuelto:** 2026-04-12 — panel persistente entre slides, Socratic coaching, 3 modos (texto seleccionado, pregunta libre, múltiples errores)

---

### AG-006 ✅ RESUELTO Agente Admin Supabase
- **Descripción:** `admin.html` — panel completo con access gate, overview cards, consola AI (DB Admin Agent vía orquestador), tabla de flags de integridad, log de interacciones.
- **Resuelto:** 2026-04-12 — password gate + /api/orchestrator{agent:'dbAdmin'} + Supabase REST

---

### AG-007 ✅ RESUELTO Agente de Progreso
- **Descripción:** `/api/agents/progress.js` (prompt en _prompts.js) + tab "🤖 AI Insights" en `my-progress.html`.
- **Resuelto:** 2026-04-12 — lazy load en tab click, payload _progressSummary, needsHistoryDepth:5

---

### AG-008 ✅ RESUELTO Agente de Peer Review
- **Descripción:** `api/agents/peer-review.js` — 2 modos: reviewer_guide (Mode A, socrático) y feedback_receiver (Mode B, priorización). Botones "🤖 Get AI guidance" en las 3 secciones de texto del `peer-review-form.html`.
- **Resuelto:** 2026-04-12 — wire completo al formulario existente

---

### AG-009 ✅ RESUELTO Agente Generador de Contenido
- **Descripción:** `api/agents/content-gen.js` (transformPayload + buildTask) + sección "Generate Lesson Slides" en `admin.html` con selector de tipos de slide, vocabulario clave, objetivo pedagógico y output HTML copiable.
- **Resuelto:** 2026-04-12 — outputFormat:'generate_content' → Opus vía Token Optimizer

---

### AG-010 ✅ RESUELTO Agente GitHub
- **Descripción:** `api/agents/github.js` (3 acciones: review, security_check, debt_update) + hook PostToolUse en `.claude/settings.local.json` → ejecuta `scripts/github-check.js` tras ediciones de archivos críticos.
- **Resuelto:** 2026-04-12 — hook escanea credenciales hardcodeadas, service_role key, console.log con PII y CDN externas

---

### AG-011 ✅ RESUELTO Agente Frontend/UI
- **Descripción:** `api/agents/frontend.js` (transformPayload + buildTask para diagnóstico de componentes, snippets HTML/CSS, verificación de consistencia entre los 72 módulos).
- **Resuelto:** 2026-04-12 — uso on-demand vía AgentClient.call('frontend', ...)

---

### AG-012 ✅ RESUELTO `agent-client.js` (wrapper frontend)
- **Descripción:** `js/agent-client.js` — módulo frontend para hablar con el orquestador.
- **Resuelto:** 2026-04-12 — incluye helpers: requestWritingFeedback, requestIntegrityAnalysis, requestProgressSummary, askReadingQuestion

---

## SECCIÓN 4 — TABLAS SUPABASE FALTANTES

| Tabla | Propósito | Necesaria para | Estado |
|-------|-----------|---------------|--------|
| `student_profiles` | Perfil comprimido del estudiante | Memory Agent | ✅ Creada — 7 columnas, RLS activo |
| `agent_interactions` | Audit trail de llamadas a Claude API | Token monitoring | ✅ Creada — 9 columnas, 3 índices, RLS activo |
| `session_cache` | Segmento B cacheado (TTL 4h) | Token Optimizer | ✅ Creada — 4 columnas, RLS activo |
| `essay_requirements` (filas) | Criterios de compliance por lección | Compliance checker | ✅ 34 filas existentes — compliance activo (20 resultados reales) |

---

## SECCIÓN 5 — LECCIONES PENDIENTES

| ID | Lección | Módulo | Estado |
|----|---------|--------|--------|
| L-001 | Argumentative Essay | 01/unit1-essays | 🔴 COMING SOON (HTML vacío) |
| L-002 | Chain Essay | 01/unit1-essays | 🔴 COMING SOON (HTML vacío) |
| L-003 | Test 2: Essays | 04/tests | 🟠 Placeholder sin scoring |
| L-004 | Test 3: Research | 04/tests | 🟠 Placeholder sin scoring |
| L-005 | Test 4: Toolbox | 04/tests | 🟠 Placeholder sin scoring |
| L-006 | Peer Review Form (funcional) | 03/peer-review | 🟡 UI lista, lógica ausente |
| L-007 | Self-Assessment Rubric (funcional) | 03/peer-review | 🟡 UI lista, lógica ausente |

---

## SECCIÓN 6 — VARIABLES DE ENTORNO

| Variable | Propósito | Dónde agregar | Estado |
|----------|-----------|--------------|--------|
| `GROQ_TOKEN` | Llamadas a la API de Groq (todos los agentes) | `.env` + Vercel Settings | ✅ Configurado |
| `SUPABASE_URL` | URL del proyecto Supabase | `.env` + Vercel Settings | ✅ Configurado |
| `SUPABASE_KEY` | Anon key (frontend + validate-student) | `.env` + Vercel Settings | ✅ Configurado |
| `SUPABASE_SERVICE_KEY` | Service role key (agentes, cron — solo server) | `.env` + Vercel Settings | ✅ Configurado |
| `CRON_SECRET` | Protege `/api/cron/compress-profiles` | `.env` + Vercel Settings | ✅ Generado |
| `ADMIN_PASSWORD` | Contraseña cuenta administrador arturo.rodriguez@ | `.env` + Vercel Settings | ✅ Configurado |

---

## SECCIÓN 7 — INFRAESTRUCTURA / DEPLOY

### INFRA-001 ✅ RESUELTO Límite de 12 serverless functions en Vercel Hobby
- **Descripción:** Vercel cuenta todos los archivos en `api/` como serverless functions. Con 15 archivos (agents + groq-client) se superaba el límite de 12 del plan Hobby.
- **Fix:** Movidos los módulos de soporte a `lib/` (no escaneado por Vercel). Solo quedan 5 endpoints reales en `api/`.
- **Estructura final:**
  - `api/` (5 endpoints): config.js, orchestrator.js, sync-reading.js, validate-student.js, cron/compress-profiles.js
  - `lib/` (no contado): groq-client.js, agents/*.js
- **Resuelto:** 2026-04-12

---

### AUTH-001 ✅ RESUELTO Autenticación de administrador
- **Descripción:** La cuenta `arturo.rodriguez@uleam.edu.ec` requiere contraseña para acceder. Los estudiantes solo necesitan email.
- **Implementación:**
  - `validate-student.js`: si el email es admin, exige `password` en el body y lo valida contra `ADMIN_PASSWORD` env var. Devuelve `role: 'admin'`.
  - `index.html`: campo de contraseña aparece automáticamente al escribir el email admin.
  - `auth.js`: guarda `isAdmin: 'true'` y `studentRole: 'admin'` en localStorage. Salta re-validación del servidor en recargas.
- **Resuelto:** 2026-04-12

---

### SESSION-001 ✅ RESUELTO Sesión muy corta — estudiantes debían re-llenar todo el formulario
- **Descripción:** Sesión de 4 horas llamaba `resetApp()` (borraba todo localStorage) al expirar. El estudiante tenía que re-escribir email, practice type y consents.
- **Fix:**
  - Sesión extendida a 24 horas.
  - Al expirar: solo borra el timestamp, conserva email y consents.
  - `_prefillReturningUser()`: pre-llena email en modal, salta al Step 2 directamente si ya hay consents guardados.
  - `saveAndStart()`: lee consents de localStorage como fallback si Step 2 no está visible.
- **Resuelto:** 2026-04-12

---

## PLANTILLA PARA NUEVOS ÍTEMS

```markdown
### BUG-XXX 🔴/🟠/🟡/🔵 Título breve
- **Archivo:** `ruta/archivo.js` línea XX
- **Descripción:** Qué está fallando y por qué.
- **Impacto:** Qué le pasa al usuario o al sistema.
- **Reproducción:** Pasos para reproducirlo (si aplica).
- **Fix propuesto:** Qué habría que cambiar.
- **Detectado:** Quién lo encontró — YYYY-MM-DD
- **Asignado a:** nombre o agente
```

---

## HISTORIAL DE CAMBIOS

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-04-12 | v1.0 | Creación inicial — 5 bugs, 5 deudas técnicas, 12 agentes faltantes |
| 2026-04-12 | v1.1 | AG-001, AG-002, AG-012 resueltos — infraestructura base implementada |
| 2026-04-12 | v1.2 | AG-003, AG-004 resueltos — Writing Agent + Integrity Agent integrados en ESSAY slides |
| 2026-04-12 | v1.3 | AG-006, AG-007 resueltos — Admin Panel (admin.html) + AI Insights tab en my-progress.html |
| 2026-04-12 | v1.4 | BUG-001, BUG-002, BUG-003 resueltos — race condition credenciales, is_update eliminado, lesson_id unificado |
| 2026-04-12 | v1.5 | AG-005 resuelto — Reading Agent + panel AI en reading-engine.js; BUG-004 resuelto — sync-reading.js reescrito a CommonJS |
| 2026-04-12 | v1.6 | AG-009, AG-010, AG-011 resueltos — Content Gen + GitHub Agent + Frontend Agent. Hook PostToolUse activado. |
| 2026-04-12 | v1.7 | AG-008 resuelto — Peer Review Agent + wire en formulario. Cron Memory Agent (vercel.json + api/cron/compress-profiles.js). DT-004 resuelto — 10 filas essay_requirements. |
| 2026-04-12 | v1.8 | Verificación contra DB real: tablas creadas en Supabase, BUG-002/003 corregidos (diagnósticos erróneos revertidos), compliance verificado (20 resultados reales). |
| 2026-04-12 | v1.9 | Migración Anthropic → Groq completada: orchestrator.js, memory.js, compress-profiles.js usan groqChat(). Sección 6 actualizada. |
| 2026-04-12 | v2.0 | DT-001 resuelto — creado js/config-loader.js (singleton window.configReady). |
| 2026-04-12 | v2.1 | AUTH-001 resuelto — admin auth con contraseña para arturo.rodriguez@uleam.edu.ec. SESSION-001 resuelto — sesión 24h, re-login sin repetir consents. |
| 2026-04-12 | v2.2 | INFRA-001 resuelto — módulos movidos a lib/ (5 endpoints en api/, bajo límite Vercel Hobby). DT-005 actualizado con avance parcial. Secciones 6 y 7 completas. |

---

## RESPONSABLE: AGENTE GITHUB

El **Agente GitHub** es el encargado de mantener este archivo actualizado. Sus responsabilidades son:

1. **En cada PR que toque archivos críticos** (`slide-engine.js`, `reading-engine.js`, `essay-handler.js`, `api/*.js`): revisar si el cambio introduce nuevos bugs o resuelve ítems existentes.

2. **Al detectar un nuevo bug** durante revisión de código: agregar un ítem en la sección correspondiente con estado 🔴/🟠/🟡/🔵.

3. **Al verificar que un ítem está resuelto**: cambiar su estado a `✅ RESUELTO`, agregar la fecha y el hash del commit que lo cerró.

4. **Al hacer revisión semanal** (cron nocturno): verificar que los ítems `🚧 EN PROGRESO` siguen teniendo actividad. Si llevan más de 7 días sin commits, escalar al instructor.

5. **Nunca eliminar ítems resueltos** — solo cambiar su estado. El historial de bugs es parte de la documentación del proyecto.
