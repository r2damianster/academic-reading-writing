---
owner: Arturo Rodríguez Zambrano
domain: frontend
last_updated: 2026-04-19
status: active
---

# Frontend: essay-handler.js

## Responsable exclusivo
Arturo Rodríguez Zambrano — captura de telemetría de integridad académica.

## Propósito
Captura telemetría de comportamiento durante sesiones de escritura de ensayos. Es el origen de todos los datos que el agente `integrity` analiza.

## Advertencia crítica
**No romper ningún punto de captura de datos.** Si se pierde telemetría, el sistema de auditoría de integridad queda ciego. Cualquier modificación debe preservar todos los contadores.

## Datos capturados

| Campo | Cómo se captura |
|---|---|
| `words` | Conteo de palabras en `essayInput` al submit |
| `pastes` | Event listener `paste` en `essayInput` |
| `keystrokes` | Event listener `keydown` — solo teclas imprimibles |
| `deletions` | Event listener `keydown` — Backspace + Delete |
| `tab_switches` | `document.visibilitychange` event |
| `time_to_first_key` | Timestamp primer `keydown` - timestamp inicio de sesión |
| `writing_duration` | Timestamp último `keydown` - timestamp primer `keydown` |
| `chars_typed_ratio` | `(keystrokes / total_chars) * 100` |
| `integrity_score` | Calculado localmente con `_calcIntegrityFallback()` |

## Deuda técnica
`DT-003`: `_calcIntegrityFallback()` está duplicada en `report.js`. La función canónica debe vivir aquí — `report.js` debe importarla o eliminar su copia.

## Integración con el agente integrity
Los datos capturados se envían vía `POST /api/orchestrator` con `agent: "integrity"` para análisis profundo.

## Reglas de modificación
- Preservar todos los event listeners
- No cambiar los nombres de campos — el agente de integridad los espera exactos
- No loguear `essay_text` en consola en producción
