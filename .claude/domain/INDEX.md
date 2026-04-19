---
type: index
domain: domain-knowledge
last_updated: 2026-04-19
owner: Arturo Rodríguez Zambrano
---

# Índice de Conocimiento de Dominio

Contexto académico que Claude necesita para tomar decisiones correctas en este proyecto. No es teoría general — es lo que afecta al código y al contenido.

## Documentos

| Documento | Qué responde |
|---|---|
| [academic-writing.md](academic-writing.md) | Tipos de ensayo, estructura APA, qué enseña cada track |
| [pedagogy.md](pedagogy.md) | Nivel de estudiantes, objetivos por unidad, progresión curricular |
| [integrity.md](integrity.md) | Qué es una violación, umbrales del score, lógica de auditoría |

## Por qué existe este directorio

- Saber que Track 00 son fundamentos → no romper la progresión al editar módulos
- Entender que `integrity_score: 48` es HIGH RISK → no trivializar alertas
- Conocer que los estudiantes son nivel B1-B2 → calibrar complejidad del feedback generado
- Entender la diferencia entre APA 7th in-text citation vs reference list → mejores sugerencias en writing agent
