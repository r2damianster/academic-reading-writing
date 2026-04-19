---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Frontend (UI y Consistencia)

## Responsable exclusivo
Arturo Rodríguez Zambrano — diseño y consistencia UI de 72 módulos.

## Propósito
Asistente de desarrollo frontend. Diagnostica y corrige problemas UI, asegura consistencia entre los 72 módulos de lección.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "frontend",
  studentId: null,
  task: "Diagnostica por qué los quiz items no responden al click en Track 02",
  payload: { symptom: "...", affectedModule: "modules/02-toolbox/grammar/..." },
  outputFormat: "short_answer"
}
```

## Arquitectura CSS

| Archivo | Líneas | Responsabilidad |
|---|---|---|
| `css/main.css` | 808 | Layout, sidebar, flyout navigation |
| `css/modules.css` | 202 | Slides y componentes de lección |
| `css/readingsidebar.css` | 655 | PDF reader + paneles de tarea |
| `css/welcome.css` | 152 | Welcome screen |

## Constraints del design system
- Sin frameworks CSS (no Bootstrap, Tailwind, etc.)
- CSS custom properties para colores y spacing
- Vanilla JS únicamente — sin React, Vue, jQuery
- Module Pattern: IIFE + Revealing Module en todos los archivos JS
- Sin bundler — script tags directos

## Reglas de consistencia (72 módulos)
1. Todos los HTML de lección deben usar el mismo contenedor de slide
2. Essay slides: `id="essayInput"` y `id="wordCountDisplay"`
3. Quiz items: `class="option"` con `data-correct`
4. Todos los módulos cargan: `slide-engine.js`, `essay-handler.js`, `activity-tracker.js`

## Accesibilidad (WCAG 2.1 AA)
- Contraste mínimo 4.5:1 para texto
- Todos los elementos interactivos navegables por teclado
- Drag & drop debe tener alternativa de teclado

## Notas para Claude
- No introducir dependencias externas ni frameworks
- No agregar estilos inline al HTML — usar clases CSS
- No modificar `slide-engine.js` o `reading-engine.js` para cambios solo visuales
- Ver [frontend/slide-engine.md](../frontend/slide-engine.md) antes de tocar el motor
