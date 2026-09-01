---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-09-01
status: active
---

# Agente: Report Analyst (Análisis de Reportes)

## Responsable exclusivo
Arturo Rodríguez Zambrano.

## Propósito
Analiza el historial multi-intento de un estudiante (todos los ensayos + auditoría de integridad) y genera recomendaciones pedagógicas para el instructor. Se activa desde el tab "🤖 AI Insights" en `my-progress.html` / vistas de reporte del instructor.

## Archivo
`lib/agents/report-analyst.js`

## Transformación del payload
`transformPayload()` espera `{ summaryList, essaysProcessed }` y produce:
- `summary_of_activities` — actividad, resultado, fecha (por intento)
- `detailed_essay_attempts` — actividad, fecha, score de integridad, compliance (`passed/total`, `pct`), preview del texto (500 chars)

## Tarea por defecto
Si no se provee `task`, `buildTask()` genera: "Analiza el historial de ensayos del estudiante. Busca patrones de mejora académica o riesgos de integridad entre los diferentes intentos. Genera recomendaciones pedagógicas para el instructor."

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "reportAnalyst",
  studentId: "<uuid>",
  payload: { summaryList: [...], essaysProcessed: [...] }
}
```

## Notas para Claude
- Solo visible al instructor, no al estudiante.
- Registrado en `AGENT_MAP` de `api/orchestrator.js` — no tiene endpoint propio.
