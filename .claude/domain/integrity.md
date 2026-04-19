---
owner: Arturo Rodríguez Zambrano
domain: domain-knowledge
last_updated: 2026-04-19
status: active
---

# Conocimiento de Dominio: Integridad Académica

## Qué es una violación de integridad en este contexto

En el contexto de este curso (B1-B2 EFL, ensayos en inglés), las violaciones más comunes son:

| Tipo | Descripción | Señal en telemetría |
|---|---|---|
| Copy-paste de texto externo | Pegar texto de internet/ChatGPT | Alto `pastes`, bajo `keystrokes`, alto `words` |
| Texto dictado | Dictar a alguien que escribe | `writing_duration` muy corto para el `words` count |
| Ensayo pre-escrito | Pegar ensayo completo preparado antes | `time_to_first_key` = 0, `writing_duration` muy corto, `chars_typed_ratio` < 20% |
| Citas sin formato APA | No es deshonestidad, es error académico | No aparece en telemetría — es feedback del writing agent |

## Umbrales del integrity_score

| Score | Nivel | Interpretación pedagógica |
|---|---|---|
| 85–100 | 🟢 BAJO | Comportamiento normal de escritura |
| 60–84 | 🟡 MODERADO | Posible uso de borradores o asistencia menor |
| 30–59 | 🟠 ALTO | Patrón consistente con texto externo |
| 0–29 | 🔴 CRÍTICO | Evidencia fuerte de inserción masiva de texto |

## Cómo se calcula el integrity_score

El score pre-calculado en `essay-handler.js` (`_calcIntegrityFallback`) pondera:
- `chars_typed_ratio` (peso mayor)
- `pastes` relativo al total de palabras
- `tab_switches` durante la sesión
- `time_to_first_key` vs longitud del ensayo

El agente `integrity` usa este score **más** la narrativa del comportamiento para dar contexto al instructor.

## Lo que NO es deshonestidad automática

- Un paste corto (< 50 chars) puede ser una cita
- Muchos `tab_switches` pueden ser investigación legítima
- `time_to_first_key` alto puede ser que el estudiante estaba leyendo la instrucción
- Ensayo corto con `writing_duration` corto — simplemente escribió rápido

## Proceso de manejo para el instructor

```
1. integrity agent genera reporte con nivel de riesgo
2. Instructor lo revisa en panel de admin
3. Si HIGH/CRITICAL → conversación privada con el estudiante
4. La plataforma NO notifica al estudiante automáticamente
5. La plataforma NO aplica penalización automática
```

## Lo que Claude nunca debe hacer
- Decirle al estudiante que tiene riesgo de integridad
- Asumir deshonestidad con un solo dato
- Recomendar acción punitiva — solo "conversar con el estudiante" o "revisar en persona"
