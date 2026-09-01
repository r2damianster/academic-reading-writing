---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-09-01
status: active
---

# ADR: Límite de 12 Funciones Vercel

## Decisión
Plan Hobby de Vercel permite máximo 12 serverless functions. Los archivos en `api/` son funciones — los de `lib/` no.

## Estado actual
11 funciones activas de 12 disponibles (`admin-archive-course.js`, `admin-reenroll-student.js`, `admin-student-detail.js`, `admin-students.js`, `config.js`, `gamification.js`, `lesson-availability.js`, `orchestrator.js`, `sync-reading.js`, `validate-student.js`, `cron/compress-profiles.js`). Solo 1 función libre — pensar dos veces antes de agregar un endpoint nuevo.

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
