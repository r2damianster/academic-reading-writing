---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-09-17
status: active
---

# ADR: Límite de 12 Funciones Vercel

## Decisión
Plan Hobby de Vercel permite máximo 12 serverless functions. Los archivos en `api/` son funciones — los de `lib/` no.

## Estado actual
**12 funciones activas de 12 disponibles — AL LÍMITE EXACTO, cero slots libres:** `admin-archive-course.js`, `admin-reenroll-student.js`, `admin-student-detail.js`, `admin-students.js`, `config.js`, `gamification.js`, `lesson-availability.js`, `orchestrator.js`, `peer-review-session.js`, `sync-reading.js`, `validate-student.js`, `cron/compress-profiles.js`.

`peer-review-session.js` (agregado 2026-09-17) ocupó el último slot libre. Cualquier funcionalidad nueva a partir de ahora **debe** entrar como una `action` más de un endpoint existente que se le parezca (patrón multiplexado, ver `peer-review-session.js` o `gamification.js`) — no hay margen para un archivo nuevo en `api/` sin antes fusionar o eliminar uno existente.

## Regla de arquitectura
```
api/    → endpoints HTTP únicamente (cuentan como funciones)
lib/    → helpers, clientes, agentes (NO cuentan)
```

## Por qué importa
- Superar 12 funciones → deploy falla silenciosamente o se cobra
- Mover módulos de `lib/` a `api/` es el error más común al agregar features

## Cómo verificar antes de un deploy
```bash
ls api/ api/cron/   # contar archivos .js — debe ser ≤ 12
```

## Historia
La carpeta `api/agents/` fue creada en algún momento pensando en sub-endpoints. Esa carpeta **no debe crecer** — los agentes son módulos de `lib/`, no funciones independientes.
