---
type: index
domain: frontend
last_updated: 2026-04-19
owner: Arturo Rodríguez Zambrano
---

# Índice de Frontend

Stack: Vanilla JS + Bootstrap 5 en el lado del diseño visual. Sin frameworks JS. Sin bundler.

## Archivos JS principales

| Archivo | Líneas | Responsabilidad | Riesgo |
|---|---|---|---|
| `js/slide-engine.js` | ~2482 | Motor de slides — core de las 72 lecciones | 🔴 CRÍTICO |
| `js/reading-engine.js` | — | Motor de lectura PDF | 🔴 CRÍTICO |
| `js/essay-handler.js` | — | Captura telemetría de escritura | 🔴 CRÍTICO |
| `js/auth.js` | — | Login y gestión de sesión (4h) | 🟡 |
| `js/agent-client.js` | — | Clientes frontend para cada agente | 🟡 |
| `js/activity-tracker.js` | — | Registro de actividades en Supabase | 🟡 |
| `js/config-loader.js` | — | Carga config desde `/api/config`, expone `window.configReady` | 🟡 |
| `js/nav.js` / `js/navigation.js` | — | Navegación entre módulos | 🟢 |
| `js/report.js` | — | Reporte de integridad académica | 🟡 |
| `js/pdf-annotator.js` | — | Anotaciones en PDF | 🟢 |
| `js/pdf-proxy.js` | — | Proxy para carga de PDFs | 🟢 |

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
1. `slide-engine.js` — leer solo la sección necesaria (2482 líneas)
2. `essay-handler.js` — no perder ningún punto de captura de telemetría
3. No agregar frameworks ni dependencias externas
4. No modificar motores críticos para cambios solo visuales

## Deuda técnica activa (frontend)

| ID | Prioridad | Descripción |
|---|---|---|
| DT-002 | 🟡 MEDIO | `slide-engine.js` mezcla UI + sync Supabase (Consolidadas funciones duplicadas 2026-04-21) |
| DT-003 | 🟡 MEDIO | `_calcIntegrityFallback` duplicada en `report.js` y `essay-handler.js` |
| DT-005 | 🟡 MEDIO | `admin.html` no verifica `isAdmin` desde localStorage |
