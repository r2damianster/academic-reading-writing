---
owner: Arturo Rodríguez Zambrano
domain: frontend
last_updated: 2026-04-19
status: active
---

# Frontend: slide-engine.js

## Responsable exclusivo
Arturo Rodríguez Zambrano — motor core de todas las lecciones.

## Advertencia
**~3373 líneas.** Nunca leer el archivo completo — solicitar solo la sección relevante con `Read` y `offset`/`limit`.

## Propósito
Motor de presentación de slides para las 72 lecciones. Gestiona navegación, interactividad, evaluación y sincronización con Supabase.

## Deuda técnica activa
`DT-002`: Mezcla lógica de UI + sync Supabase. Está planificada la separación en una refactorización futura.

## Contrato HTML esperado

Cada módulo de lección es un archivo HTML que contiene slides con este formato:

```html
<!-- Slide básico -->
<div class="slide" data-type="CONTENT">
  <h2>Título</h2>
  <p>Contenido...</p>
</div>

<!-- Quiz -->
<div class="slide" data-type="QUIZ">
  <p class="slide-instruction">Elige la respuesta correcta</p>
  <div class="option" data-correct="true">Opción correcta</div>
  <div class="option">Opción incorrecta</div>
</div>

<!-- Essay -->
<div class="slide" data-type="ESSAY">
  <p class="slide-instruction">Escribe tu ensayo</p>
  <textarea id="essayInput"></textarea>
  <span id="wordCountDisplay">0 words</span>
</div>
```

## Scripts que debe cargar cada módulo HTML
```html
<script src="../../js/slide-engine.js"></script>
<script src="../../js/essay-handler.js"></script>
<script src="../../js/activity-tracker.js"></script>
```

## Tipos de slide válidos
`VIDEO`, `CONTENT`, `QUIZ`, `CONTRAST`, `DRAG_DROP`, `FILL_BLANK`, `ESSAY`, `HIGHLIGHT`, `MATCH`, `SORT_PARAGRAPH`, `WORD_BANK`, `CATEGORIZE`

## Reglas de modificación
- No modificar para cambios puramente visuales — usar CSS
- Cualquier cambio afecta las 72 lecciones → probar en al menos 3 módulos de diferentes tracks
- Cambios en el manejo de ESSAY deben coordinarse con `essay-handler.js`
