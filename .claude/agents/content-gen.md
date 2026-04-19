---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Content Gen (Generador de Contenido)

## Responsable exclusivo
Arturo Rodríguez Zambrano — diseño instruccional y generación de módulos.

## Propósito
Diseñador pedagógico de contenido. Genera HTML de lecciones formateado para `slide-engine.js`. Produce slides listos para insertar en `modules/`.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "contentGen",
  studentId: null,
  task: "Genera lección sobre topic sentences para Track 01",
  payload: {
    topic: "Topic sentences",
    track: "01-core-syllabus",
    unit: "unit1-essays",
    level: "B1-B2",
    slideCount: 10
  },
  outputFormat: "generate_content"
}
```

## Tipos de slide generables

| data-type | Descripción |
|---|---|
| `VIDEO` | URL de Google Slides o YouTube |
| `CONTENT` | Texto explicativo, definiciones, teoría |
| `QUIZ` | Opción múltiple con `data-correct` |
| `CONTRAST` | Lado a lado — ejemplo débil vs fuerte |
| `DRAG_DROP` | Items arrastrables a zonas target |
| `FILL_BLANK` | Cloze con marcadores `[BLANK]` |
| `ESSAY` | Tarea de escritura con instrucciones |
| `HIGHLIGHT` | PDF con tarea de anotación |
| `MATCH` | Término → Definición |
| `SORT_PARAGRAPH` | Reordenar párrafos desordenados |
| `WORD_BANK` | Completar desde lista de palabras |
| `CATEGORIZE` | Agrupar ítems en categorías |

## Secuencia pedagógica de cada lección
Theory → Modeled example → Guided practice → Independent practice → Essay task

## Reglas de formato HTML
- Cada slide: `<div class="slide" data-type="...">`
- Sin `<html>`, `<head>`, `<body>` — solo divs de slides
- Instrucciones en `<p class="slide-instruction">`
- 8–14 slides por lección
- Contenido en inglés B1-B2; instrucciones para instructor en español

## Notas para Claude
- Los archivos generados van en `modules/<track>/<unit>/` — no crearlos manualmente
- Después de generarlos, verificar que cargan correctamente con `slide-engine.js`
- Ver [frontend/slide-engine.md](../frontend/slide-engine.md) para el contrato de HTML esperado
