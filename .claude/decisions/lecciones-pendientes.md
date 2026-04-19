---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-04-19
status: active
---

# Lecciones Pendientes de Implementación

Módulos con HTML vacío o lógica ausente. Origen: DEUDA_TECNICA.md v2.3 (migrado 2026-04-19).

## Lecciones críticas — sin contenido

| ID | Lección | Ruta | Prioridad |
|---|---|---|---|
| L-001 | Argumentative Essay | `modules/01-core-syllabus/unit1-essays/` | 🔴 CRÍTICO |
| L-002 | Chain Essay | `modules/01-core-syllabus/unit1-essays/` | 🔴 CRÍTICO |

**L-001 y L-002** son el corazón del Track 01. Sin ellas el curso queda incompleto para el objetivo principal del programa.  
Generarlas con el **Content Gen Agent** (`agent: "contentGen"`, `outputFormat: "generate_content"`).

## Tests sin scoring

| ID | Lección | Ruta | Estado |
|---|---|---|---|
| L-003 | Test 2: Essays | `modules/04-tests/` | 🟠 Placeholder sin scoring |
| L-004 | Test 3: Research | `modules/04-tests/` | 🟠 Placeholder sin scoring |
| L-005 | Test 4: Toolbox | `modules/04-tests/` | 🟠 Placeholder sin scoring |

El scoring de tests requiere definir criterios en `essay_requirements` y conectar con `essay_compliance_results`.

## Track 03 — UI lista, lógica ausente

| ID | Lección | Ruta | Estado |
|---|---|---|---|
| L-006 | Peer Review Form | `modules/03-peer-review/` | 🟡 UI lista, lógica ausente |
| L-007 | Self-Assessment Rubric | `modules/03-peer-review/` | 🟡 UI lista, lógica ausente |

L-006 y L-007 necesitan conectar con el **Peer Review Agent** (`agent: "peer-review"`).

## Orden de implementación sugerido

1. L-001 y L-002 — desbloquean el track principal
2. L-006 y L-007 — peer review es prerequisito antes de los tests finales
3. L-003, L-004, L-005 — requieren definir rúbricas de scoring primero
