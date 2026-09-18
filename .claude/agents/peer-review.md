---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-09-17
status: active
---

# Agente: Peer Review

## ⚠️ No confundir con la sesión en vivo (2026-09-17)
Este documento describe el **chatbot de guía socrática** (`lib/agents/peer-review.js`) usado por la lección estática `modules/03-peer-review/peer-review-form.html`. Es un módulo completamente distinto de la **sesión de peer review en vivo** (`api/peer-review-session.js` + `modules/03-peer-review/live-session.html`) — esa NO llama a este agente ni pasa por el orquestador; tiene su propio flujo de estado, asignación anónima, y calificación directa con Groq. Ver [.claude/api/peer-review-session.md](../api/peer-review-session.md).

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
