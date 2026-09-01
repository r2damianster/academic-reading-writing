---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-09-01
status: active
---

# Agente: Test Grader (Evaluación de Tests)

## Responsable exclusivo
Arturo Rodríguez Zambrano.

## Propósito
Evalúa envíos de tests (`modules/04-tests/`) contra una rúbrica de 8 indicadores. Recibe Phase 1 (topic sentences) + Phase 2 (body paragraphs) concatenadas junto con la rúbrica activa de la tabla `test_rubrics`.

## Archivo
`lib/agents/test-grader.js`

## Transformación del payload
`transformPayload()` espera `{ essay, rubric, lesson }` y trunca el ensayo a 6000 caracteres.

## Formato de salida (JSON estricto)
```json
{
  "indicator_scores": [
    { "key": "...", "points": 0.00, "level": "...", "comment": "..." }
  ],
  "total_score": 0.00,
  "overall_feedback": "..."
}
```
- Puntos asignados estrictamente según los niveles definidos en la rúbrica por indicador.
- Comentarios en español, específicos y pedagógicamente constructivos (1-2 frases por indicador).
- Sin markdown ni texto fuera del JSON — el frontend parsea la respuesta directamente.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "testGrader",
  studentId: "<uuid>",
  payload: { essay: "...", rubric: {...}, lesson: "test1 fundamentals" }
}
```

## Notas para Claude
- Registrado en `AGENT_MAP` de `api/orchestrator.js` — no tiene endpoint propio.
- Si el JSON de salida no parsea, revisar que el prompt siga pidiendo "ONLY valid JSON" — el frontend no tiene fallback de parseo tolerante.
