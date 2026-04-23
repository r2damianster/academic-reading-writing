# DEUDA TÉCNICA

Estado al 2026-04-23.

---

## Items activos

| ID | Prioridad | Descripción |
|----|-----------|------------|
| DT-002 | 🟡 MEDIO | `slide-engine.js` (2482 líneas) mezcla UI + sync Supabase |
| DT-003 | 🟡 MEDIO | `_calcIntegrityFallback` duplicada en `report.js` y `essay-handler.js` |
| DT-004 | 🟠 ALTO | Eliminar `READING_COMMENT` de lecciones tipo `reading-engine` |
| L-001 | 🔴 CRÍTICO | Argumentative Essay (HTML vacío, coming soon) |
| L-002 | 🔴 CRÍTICO | Chain Essay (HTML vacío, coming soon) |

---

## Items completados

| ID | Descripción |
|----|------------|
| DT-005 | `index.html` implementa `isAdmin` check y manual toggle |
| L-003 | Instructor Mode: Manual Toggle implementado (real-time sync) |

---

## DT-004 — Eliminar actividades de producción en reading-engine

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

#### Paso 1 — Auditar módulos HTML existentes

Buscar todos los slides `data-type="READING_COMMENT"` en los archivos de módulos:

```bash
grep -rl 'data-type="READING_COMMENT"' modules/
```

Anotar qué lecciones los usan y cuántos hay por lección.

#### Paso 2 — Reemplazar cada READING_COMMENT

Para cada slide encontrado, convertirlo a la alternativa más apropiada:

- Si la pregunta tiene respuesta objetiva → `READING_QUIZ` o `READING_FILL`
- Si es comparar ideas → `READING_TFNG`
- Si es conectar conceptos → `READING_MATCH`
- Si solo requiere reflexión breve → `READING_QUIZ` con opciones descriptivas

La lógica concreta del reemplazo la decide el instructor al revisar cada slide.

#### Paso 3 — Deshabilitar el tipo en el motor

En `js/reading-engine.js`, línea ~150, cambiar el case de `READING_COMMENT` para mostrar un error de consola en lugar de montar el componente:

```js
// ANTES
case 'READING_COMMENT':   ReadingTypes.READING_COMMENT.mount(slide, i);  break;

// DESPUÉS
case 'READING_COMMENT':
    console.warn('⚠️ ReadingEngine: READING_COMMENT está deshabilitado en lecciones de lectura. Usa slide-engine para actividades de producción.');
    break;
```

Esto hace que slides `READING_COMMENT` que queden por error queden silenciosamente vacíos (no bloquean la lección) y dejen traza en consola para detectarlos.

#### Paso 4 — Actualizar GUIA_CREACION_LECCIONES.md

Agregar una nota explícita en la sección de `reading-engine` indicando que `READING_COMMENT` no debe usarse, y referenciar este item.

#### Paso 5 — Verificación

- Recorrer manualmente cada lección `reading-engine` afectada y confirmar que avanza sin bloqueos.
- Confirmar que las lecciones `slide-engine` no se ven afectadas (el cambio es solo en `reading-engine.js`).

---

**Notas adicionales:**
- El componente `ReadingTypes.READING_COMMENT` puede mantenerse en el código como código muerto temporal por si se decide reactivarlo con un flag; o eliminarse completamente en una segunda pasada.
- No hay impacto en `api/` ni en Supabase: `READING_COMMENT` guardaba progreso vía `_saveProgress('comment', ...)` que simplemente dejará de llamarse.
