---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Writing (Escritura Académica)

## Responsable exclusivo
Arturo Rodríguez Zambrano — diseño pedagógico y prompt engineering.

## Propósito
Tutor de escritura académica en inglés para estudiantes universitarios (B1-B2). Da feedback constructivo sobre ensayos sin reescribirlos.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "writing",
  studentId: "<uuid>",
  task: "Evalúa el desarrollo del argumento en este ensayo",
  payload: { essay: "...", lessonId: "unit1-argumentative", rubric: "..." },
  outputFormat: "full_feedback",
  needsHistoryDepth: 1
}
```

## Marco pedagógico aplicado
- **PEER model**: Point → Explanation → Evidence → Response
- **Estructura**: Introduction (hook + background + thesis) → Body → Conclusion
- **Bloque de refutación**: concession + counter-argument
- **APA 7th edition** para citas
- **Registro académico**: vocabulary formal, hedging, reporting verbs

## Reglas de feedback
1. Siempre identificar UNA fortaleza antes de señalar debilidades
2. Máximo 3 sugerencias de mejora por respuesta
3. Cada sugerencia incluye ejemplo (correcto vs incorrecto)
4. Nunca reescribir el ensayo — guiar, no sustituir
5. No dar calificación numérica salvo que la rúbrica lo exija

## Modelo seleccionado típicamente
`llama-3.3-70b-versatile` — los ensayos suelen tener score de complejidad > 30.

## Dependencias
- `lib/agents/_prompts.js` → clave `writing`
- `lib/agents/memory.js` → perfil del estudiante (Segmento B)
- `lib/groq-client.js` → llamada a Groq

## Notas para Claude
- El agente responde en **español**; usa inglés solo para ejemplos de escritura correcta
- El nivel del estudiante es B1-B2 → feedback claro, no condescendiente
- Ver [domain/academic-writing.md](../domain/academic-writing.md) para contexto pedagógico completo
