---
type: index
domain: frontend
last_updated: 2026-09-17
owner: Arturo Rodríguez Zambrano
---

# Índice de Frontend

Stack: Vanilla JS + Bootstrap 5 en el lado del diseño visual. Sin frameworks JS. Sin bundler.

## Archivos JS principales

| Archivo | Líneas | Responsabilidad | Riesgo |
|---|---|---|---|
| `js/slide-engine.js` | ~3373 | Motor de slides — core de las 72 lecciones | 🔴 CRÍTICO |
| `js/reading-engine.js` | — | Motor de lectura PDF | 🔴 CRÍTICO |
| `js/essay-handler.js` | — | Captura telemetría de escritura | 🔴 CRÍTICO |
| `js/auth.js` | — | Login y gestión de sesión (4h) | 🟡 |
| `js/agent-client.js` | — | Clientes frontend para cada agente | 🟡 |
| `js/activity-tracker.js` | — | Registro de actividades en Supabase | 🟡 |
| `js/dojo-client.js` | — | Cliente Dojo (gamificación) — API calls + offline-first localStorage sync | 🟡 |
| `js/lesson-access.js` | — | Control de disponibilidad de lecciones | 🟢 |
| `js/nav.js` / `js/navigation.js` | — | Navegación entre módulos | 🟢 |
| `js/report.js` | — | Reporte de integridad académica — incluye bloque Peer Review (IA + pares) en el PDF desde 2026-09-17 | 🟡 |
| `js/peer-review-client.js` | ~180 | Cliente de la sesión de Peer Review en vivo (polling, timer, integridad de escritura) — autocontenido, no depende de `slide-engine.js` | 🟢 |

## Archivos CSS

| Archivo | Líneas | Responsabilidad |
|---|---|---|
| `css/main.css` | 808 | Layout, sidebar, flyout navigation |
| `css/modules.css` | 202 | Slides y componentes de lección |
| `css/readingsidebar.css` | 655 | PDF reader + paneles de tarea |
| `css/welcome.css` | 152 | Welcome screen |

## Documentación detallada e Instrucciones

- [slide-engine.md](slide-engine.md) — contrato HTML y tipos de slide
- [essay-handler.md](essay-handler.md) — telemetría y captura de datos
- [auth.md](auth.md) — flujo de autenticación y sesión
- [INSTRUCCIONES_TEACHER_HELPER.md](../../INSTRUCCIONES_TEACHER_HELPER.md) — (NUEVO) Cómo añadir notas para el docente
- [GUIA_CREACION_LECCIONES.md](../../GUIA_CREACION_LECCIONES.md) — (NUEVO) Cómo crear nuevas lecciones HTML

## Reglas de modificación
1. `slide-engine.js` — leer solo la sección necesaria (~3373 líneas)
2. `essay-handler.js` — no perder ningún punto de captura de telemetría
3. No agregar frameworks ni dependencias externas
4. No modificar motores críticos para cambios solo visuales

## Nuevas páginas admin (2026-04-21)

| Archivo | Descripción |
|---|---|
| `admin-students.html` | Dashboard de progreso de estudiantes — tabla, badges integridad, CSV export. Desde 2026-09-17 incluye columna "Peer Review" (IA + promedio de pares) en la tabla de ensayos |
| `admin.html` | Instructor Panel existente — se agregó enlace a admin-students.html. **No conectado** a los datos de Peer Review (solo `admin-students.html` lo muestra) |

## Peer Review en vivo (2026-09-17)

| Archivo | Descripción |
|---|---|
| `modules/03-peer-review/live-session.html` | Panel docente/estudiante de la sesión en vivo. Vive como primera lección del hub "03. Peer System" (`modules/03-peer-review/peer-review-hub.html`), no en la raíz — moverlo de ahí rompe el link relativo `../../js/peer-review-client.js` |
| `js/peer-review-client.js` | Ver tabla de arriba |
| `my-progress.html` | Sección "Peer review sessions" agregada — `writingActs` (lista fija de lecciones) nunca incluye `activity` dinámico tipo `peer-review:<sessionId>`, por eso necesita su propia sección aparte de las tablas normales |

## Deuda técnica activa (frontend)

Ver tabla canónica en `DEUDA_TECNICA.md` (raíz del proyecto) — no duplicar IDs aquí para evitar que diverjan. Ítems de frontend relevantes hoy: DT-002 (`slide-engine.js` mezcla UI + sync Supabase), DT-003 (cálculo de integridad duplicado entre `essay-handler.js` y `slide-engine.js`), DT-007 (`_configReady` duplicado 3x), DT-008 (rúbrica de Peer Review hardcodeada en `RUBRIC_LABELS` de `live-session.html` — no editable desde tabla).
