---
owner: Arturo Rodríguez Zambrano
domain: agents
last_updated: 2026-04-19
status: active
---

# Agente: Memory (Gestión de Perfiles)

## Responsable exclusivo
Arturo Rodríguez Zambrano — arquitectura de memoria del sistema.

## Propósito
Gestión interna de perfiles de estudiantes. **No es un endpoint HTTP** — el orquestador lo llama internamente en cada petición para construir el Segmento B del contexto.

## Archivo
`lib/agents/memory.js`

## Funciones exportadas

| Función | Descripción |
|---|---|
| `getProfile(studentId, sbUrl, sbKey)` | Lee session_cache → student_profiles → perfil vacío |
| `buildContextString(profile)` | Convierte perfil JSON al Segmento B (texto para el LLM) |
| `saveSessionCache(studentId, profile, ...)` | Actualiza cache de 4 horas en Supabase |
| `compressHistory(studentId, ...)` | Comprime historial con llama-3.1-8b (cron nocturno) |

## Flujo de lectura de perfil

```
getProfile(studentId)
  1. session_cache (TTL 4h) → si válido, devuelve directo
  2. student_profiles (persistente) → si existe, cachea y devuelve
  3. _defaultProfile() → estudiante nuevo, sin guardar aún
```

## Estructura del perfil JSON

```json
{
  "strengths": ["max 5, específicos"],
  "weaknesses": ["max 5, accionables"],
  "writing_patterns": {
    "avg_words_per_essay": 0,
    "avg_integrity_score": null,
    "paste_tendency": "low|moderate|high",
    "vocabulary_level": "basic|intermediate|academic",
    "common_errors": ["max 3"]
  },
  "engagement": {
    "sessions_completed": 0,
    "days_since_last_session": null,
    "completion_rate_pct": 0,
    "risk_level": "active|at_risk|disengaged"
  },
  "session_summary": "últimas 3 sesiones, máx 200 palabras"
}
```

## Tablas Supabase involucradas
- `session_cache` — cache de 4h (`context_blob` JSON, `expires_at`)
- `student_profiles` — perfil persistente comprimido
- `activity_logs` — fuente para compressHistory
- `essay_submissions` — fuente para compressHistory

## Cron
`api/cron/compress-profiles.js` llama a `compressHistory()` nocturnamente usando `llama-3.1-8b-instant`.

## Notas para Claude
- El Segmento B es el output de `buildContextString()` — texto plano, no JSON
- `is_default: true` indica estudiante nuevo sin datos reales
- El session_cache expira en 4h (igual que la sesión de auth)
- **Nunca** loguear `studentId` o contenido de `context_blob` en consola
