---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Peer Review

## Responsable exclusivo
Arturo Rodríguez Zambrano — diseño del módulo Track 03.

## Propósito
Facilita el proceso de revisión entre pares. Opera en dos modos según si el estudiante está revisando el ensayo de un compañero (Modo A) o recibiendo revisiones sobre el suyo (Modo B).

## Alias en el orquestador
Acepta tanto `peerReview` como `peer-review` como agent key.

## Cómo llamarlo

```js
// Modo A — el estudiante está revisando a un par
POST /api/orchestrator
{
  agent: "peer-review",
  studentId: "<uuid>",
  task: "Ayuda a este estudiante a redactar feedback constructivo",
  payload: { mode: "reviewer", peerEssay: "...", rubric: "...", lessonId: "..." },
  outputFormat: "full_feedback"
}

// Modo B — el estudiante recibe revisiones
POST /api/orchestrator
{
  agent: "peer-review",
  studentId: "<uuid>",
  task: "Ayuda a este estudiante a entender el feedback recibido",
  payload: { mode: "receiver", feedbackReceived: "...", essayText: "..." },
  outputFormat: "full_feedback"
}
```

## Principios de Peer Review aplicados
1. Feedback específico — referenciar el texto, no solo impresiones
2. Feedback accionable — "Agrega topic sentence al párrafo 2"
3. Feedback balanceado — al menos una fortaleza por debilidad
4. Registro académico — sin comentarios personales

## Notas para Claude
- No escribir el feedback por el revisor — guiar el proceso
- No asignar calificaciones
- Modo A: preguntas guía tipo socrático
- Modo B: desactivar reacciones defensivas, reformular feedback como datos
