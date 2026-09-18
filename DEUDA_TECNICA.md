# DEUDA TÉCNICA

Estado al 2026-09-17.

---

## Items activos

| ID | Prioridad | Descripción |
|----|-----------|------------|
| DT-002 | 🟡 MEDIO | `slide-engine.js` (~3373 líneas) mezcla UI + sync Supabase |
| DT-003 | 🟡 MEDIO | Cálculo de integridad duplicado: `_calcIntegrityScore` (`js/essay-handler.js:107`) vs `_calcIntegrity` (`js/slide-engine.js:1973`) |
| DT-006 | 🟢 NUEVO | Teacher Helper Mode: inline annotations vía `data-teacher-note` y `?teacher=1` |
| DT-007 | ⚪ WONTFIX | `_configReady` duplicado en `reading-engine.js` y `slide-engine.js` (~10 líneas c/u). **Investigado 2026-09-01: no es bug funcional** — ningún HTML carga ambos motores a la vez, cero doble-fetch en producción. `dojo-client.js` no hace fetch propio (solo espera `window.configReady` si existe, sin usarlo). Arreglo real requeriría agregar `<script>` compartido en 70+ lecciones HTML (`activity-tracker.js`, el único script casi-universal, falta en 27/72 páginas). Decisión explícita de Arturo: no tocar, riesgo no justifica el beneficio cosmético |
| DT-008 | 🟡 MEDIO | Rúbrica de Peer Review (`peel_rigor`/`hedging`/`nominalization`) hardcodeada en `ESSAY_CRITERIA` de `api/peer-review-session.js` y en `RUBRIC_LABELS` de `live-session.html` — a diferencia de `test_rubrics`, no es editable desde una tabla. Cambiar de skill (ej. otro track con criterios distintos) requiere editar código en 2 archivos, no solo datos |
| DT-009 | 🟢 NUEVO | `admin.html` (Instructor Panel original) no muestra `ai_essay_scores`/`peer_avg_scores` — solo `admin-students.html` (dashboard nuevo) los tiene conectados. No se tocó `admin.html` por ser un archivo grande sin auditar a fondo el mismo día |

---

## Items completados

| ID | Descripción |
|----|------------|
| DT-004 | `READING_COMMENT` deshabilitado en `reading-engine.js` (Paso 3); auditoría (Paso 1) no encontró usos reales en `modules/` — solo un comentario HTML obsoleto en `chain-essay.html` corregido |
| DT-005 | `index.html` implementa `isAdmin` check y manual toggle |
| L-001 | Argumentative Essay — `modules/01-core-syllabus/unit1-essays/argumentative-essay.html` (275 líneas, 11 slides) |
| L-002 | Chain Essay — `modules/01-core-syllabus/unit1-essays/chain-essay.html` (284 líneas, 9 slides) |
| L-003 | Instructor Mode: Manual Toggle implementado (real-time sync) |
| — | Sistema de Peer Review en vivo completo (ver sección dedicada abajo) |

---

## Incidente 2026-09-17 — Sesión real de peer review sin revisiones completadas

**Qué pasó:** en la primera sesión en vivo con estudiantes reales (9 conectados, 8 con ensayo entregado), un doble-click del docente en "Cerrar escritura y asignar revisiones" / "Cerrar revisión" dejó las 16 asignaciones en `expired` sin que ningún estudiante llegara a enviar su revisión (0 filas en `peer_review_feedback`). Encima, el status de la sesión pasaba a `'feedback_released'` antes de que Groq terminara de calificar el lote de ensayos — 3 estudiantes (cuyo poll cayó en esa ventana) vieron resultados vacíos permanentemente porque el frontend solo pedía `get_results` una vez.

**Causa raíz:** ninguna acción de `api/peer-review-session.js` validaba el `status` actual de la sesión antes de ejecutar una transición — un click repetido (o llegado tarde) volvía a correr la misma acción sin aviso.

**Fix aplicado (mismo día):**
- `force_close_writing`/`assign_reviews`/`force_close_reviewing` ahora exigen el `status` correcto y devuelven 409 si no — ver [.claude/api/peer-review-session.md](.claude/api/peer-review-session.md).
- Botones del panel docente se deshabilitan mientras la llamada está en vuelo.
- `status → 'feedback_released'` solo ocurre cuando `release_feedback` terminó TODO el lote, no al inicio.
- `gradeWithGroq` reintenta 2x y no escribe un fallback `null` que "envenene" la fila para siempre.
- Nueva acción `reopen_reviewing` para recuperar una sesión cerrada antes de tiempo (revive asignaciones `expired`).

**Decisión sobre los datos de esa sesión real:** se reabrió brevemente para probar la recuperación, pero el docente decidió no pedirles a los estudiantes que completen la revisión retroactivamente — se revirtió al estado `feedback_released` original. Los 8 ensayos y su calificación IA quedaron intactos; el promedio de pares queda en `null` para esa sesión específica (nunca llegó a generarse, no es un dato perdido).

---

## DT-004 — Eliminar actividades de producción en reading-engine (✅ RESUELTO 2026-09-01)

**Problema:** Las lecciones basadas en `reading-engine.js` se vuelven demasiado largas cuando incluyen slides de tipo `READING_COMMENT` (textarea libre, mínimo de palabras). Este tipo de actividad pertenece conceptualmente a lecciones de escritura (`slide-engine`), no de lectura.

**Decisión:** `READING_COMMENT` queda **prohibido** en lecciones `reading-engine`. Las actividades de producción (ensayos, respuestas largas) solo se usan en lecciones `slide-engine`.

**Tipos afectados en reading-engine:**

| Tipo | ¿Se mantiene? | Motivo |
|------|--------------|--------|
| `READING_FOCUS` | ✅ Sí | Solo lectura |
| `READING_HIGHLIGHT` | ✅ Sí | Subrayado, sin escritura larga |
| `READING_COMMENT` | ❌ **Eliminar** | Escritura libre → alarga la lección |
| `READING_QUIZ` | ✅ Sí | Selección múltiple |
| `READING_DRAGDROP` | ✅ Sí | Interacción corta |
| `READING_FILL` | ✅ Sí | Fill-in-the-blank |
| `READING_TFNG` | ✅ Sí | True/False/Not Given |
| `READING_MATCH` | ✅ Sí | Matching |

---

### Plan de implementación

#### Paso 1 — Auditar módulos HTML existentes ✅

`grep -rl 'data-type="READING_COMMENT"' modules/` → **cero resultados.** Ninguna lección usa `READING_COMMENT` como `data-type` real hoy. Único rastro: un comentario HTML obsoleto en `chain-essay.html` (el slide ya estaba migrado a `READING_QUIZ`) — corregido.

#### Paso 2 — Reemplazar cada READING_COMMENT ✅

No había ninguno pendiente de reemplazar (ver Paso 1).

#### Paso 3 — Deshabilitar el tipo en el motor ✅

`js/reading-engine.js` línea ~154, case de `READING_COMMENT` ahora hace `console.warn` en vez de montar el componente:

```js
case 'READING_COMMENT':
    console.warn('⚠️ ReadingEngine: READING_COMMENT está deshabilitado en lecciones de lectura. Usa slide-engine para actividades de producción.');
    break;
```

#### Paso 4 — Actualizar GUIA_CREACION_LECCIONES.md ✅

Nota agregada antes del checklist de publicación.

#### Paso 5 — Verificación

- Cambio de bajo riesgo: no había slides reales usando `READING_COMMENT` (Paso 1), así que no hay lecciones que revisar manualmente por bloqueos.
- `slide-engine.js` no se tocó — el cambio es solo en `reading-engine.js`.
- Pendiente: confirmar en el navegador que no aparece el `console.warn` en ninguna lección en producción (confirmaría que el audit del Paso 1 fue completo).

---

**Notas adicionales:**
- El componente `ReadingTypes.READING_COMMENT` puede mantenerse en el código como código muerto temporal por si se decide reactivarlo con un flag; o eliminarse completamente en una segunda pasada.
- No hay impacto en `api/` ni en Supabase: `READING_COMMENT` guardaba progreso vía `_saveProgress('comment', ...)` que simplemente dejará de llamarse.
