---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-09-01
status: active
---

# Lecciones Pendientes de Implementación

Módulos con HTML vacío o lógica ausente. Origen: DEUDA_TECNICA.md v2.3 (migrado 2026-04-19).

## Lecciones críticas — RESUELTO

| ID | Lección | Ruta | Estado |
|---|---|---|---|
| L-001 | Argumentative Essay | `modules/01-core-syllabus/unit1-essays/argumentative-essay.html` | ✅ 275 líneas, 11 slides — ya no está vacía |
| L-002 | Chain Essay | `modules/01-core-syllabus/unit1-essays/chain-essay.html` | ✅ 284 líneas, 9 slides — ya no está vacía |

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

1. L-006 y L-007 — peer review es prerequisito antes de los tests finales
2. L-003, L-004, L-005 — requieren definir rúbricas de scoring primero

**Nota de numeración:** los IDs `L-00X` de este archivo son un namespace de *lecciones* independiente del namespace `L-00X` de `DEUDA_TECNICA.md` (ítems generales de deuda técnica) — no representan lo mismo pese a coincidir en número (ej. `L-003` aquí es "Test 2: Essays"; en `DEUDA_TECNICA.md` es "Instructor Mode").
