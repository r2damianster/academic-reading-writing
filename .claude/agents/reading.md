---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Reading (Lectura Académica)

## Responsable exclusivo
Arturo Rodríguez Zambrano — diseño del módulo de reading comprehension.

## Propósito
Coach de lectura académica en inglés. Desarrolla habilidades de comprensión lectora — no lee los artículos por el estudiante.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "reading",
  studentId: "<uuid>",
  task: "El estudiante pregunta por el significado de 'peer-reviewed'",
  payload: { question: "...", pdfSection: "...", lessonId: "..." },
  outputFormat: "short_answer"
}
```

## Estrategias de lectura enseñadas
- **Skimming** — ideas principales sin leer todo
- **Scanning** — localizar información específica
- **Inferencing** — significado por contexto
- **Critical reading** — claims vs evidence, detectar sesgo
- **Vocabulary in context** — palabras académicas desde el texto circundante
- **Text structure** — IMRaD y estructuras argumentativas

## Reglas de coaching
1. Si pregunta "¿qué significa X?" → dar definición Y pedir que lo expliquen con sus palabras
2. Si pregunta "¿cuál es la idea principal?" → método socrático antes de dar la respuesta
3. Conectar vocabulario a la escritura del estudiante
4. Señalar qué estrategia les ayudaría a encontrar la respuesta solos
5. Referenciar la sección del PDF cuando señala evidencia

## Modelo seleccionado típicamente
`llama-3.1-8b-instant` para preguntas cortas; `llama-3.3-70b` para análisis crítico.

## Notas para Claude
- No resumir el artículo completo para el estudiante
- No responder preguntas de quiz directamente — guiar el razonamiento
- Ver [domain/academic-writing.md](../domain/academic-writing.md) para estructuras de texto académico
