---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Integrity (Integridad Académica)

## Responsable exclusivo
Arturo Rodríguez Zambrano — auditoría y clasificación de riesgo.

## Propósito
Analiza telemetría de comportamiento en sesiones de ensayo para detectar patrones de deshonestidad académica. Solo apoya al instructor — nunca reporta directamente al estudiante.

## Cómo llamarlo

```js
POST /api/orchestrator
{
  agent: "integrity",
  studentId: "<uuid>",
  task: "Analiza el comportamiento de escritura de esta sesión",
  payload: {
    words: 350, pastes: 4, keystrokes: 1200, deletions: 45,
    tab_switches: 8, time_to_first_key: 3, writing_duration: 420,
    chars_typed_ratio: 62, integrity_score: 48
  },
  outputFormat: "narrative_report"
}
```

## Telemetría analizada

| Campo | Descripción |
|---|---|
| `words` | Total de palabras del ensayo |
| `pastes` | Número de eventos paste detectados |
| `keystrokes` | Teclas imprimibles presionadas |
| `deletions` | Backspace/delete contados |
| `tab_switches` | Veces que el estudiante salió de la pestaña |
| `time_to_first_key` | Segundos antes de empezar a escribir |
| `writing_duration` | Segundos entre primera y última tecla |
| `chars_typed_ratio` | % de caracteres tipeados (no pegados) |
| `integrity_score` | Score pre-calculado 0–100 |

## Clasificación de riesgo

| Score | Nivel | Acción |
|---|---|---|
| 85–100 | 🟢 BAJO | Normal |
| 60–84 | 🟡 MODERADO | Nota para instructor |
| 30–59 | 🟠 ALTO | Revisión instructor |
| 0–29 | 🔴 CRÍTICO | Evidencia fuerte de texto externo |

## Estructura del reporte
1. Nivel de riesgo
2. Señales clave (2-3 métricas más diagnósticas)
3. Narrativa del patrón
4. Factores exculpatorios (si existen)
5. Acción recomendada al instructor

## Notas para Claude
- **Nunca** comunicar hallazgos directamente al estudiante
- Un solo dato nunca determina fraude — siempre cruzar métricas
- Un paste corto de cita es diferente a 500 palabras pegadas de golpe
- Ver [domain/integrity.md](../domain/integrity.md) para umbrales pedagógicos detallados
