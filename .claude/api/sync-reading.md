---
owner: Arturo Rodríguez Zambrano
domain: api
last_updated: 2026-04-19
status: active
---

# Endpoint: /api/sync-reading

## Responsable exclusivo
Arturo Rodríguez Zambrano — sincronización de progreso de lectura.

## Propósito
Registra el progreso de lectura de un estudiante en Supabase (`reading_progress`).

## Contrato
```
POST /api/sync-reading
Body: { studentId: string, lesson: string, completed: boolean, score?: number }

Response 200: { success: true }
Response 400: { error: string }
```

## Tabla destino
`reading_progress(id, student_id, lesson, completed, score, created_at)`

## Variables de entorno
- `SUPABASE_URL` + `SUPABASE_SERVICE_KEY`

## Notas para Claude
- Este endpoint usa upsert — si ya existe el registro para ese estudiante+lección, lo actualiza
- El `score` es opcional (algunos módulos de lectura no tienen puntuación numérica)
