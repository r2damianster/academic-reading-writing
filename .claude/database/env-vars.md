---
owner: Arturo Rodríguez Zambrano
domain: database
last_updated: 2026-04-19
status: active
---

# Variables de Entorno

## Mapa completo

| Variable | Valor | Exposición | Usado en |
|---|---|---|---|
| `GROQ_TOKEN` | `gsk_...` | Solo servidor | `lib/groq-client.js` |
| `SUPABASE_URL` | URL del proyecto | Público vía `/api/config` | Todos los endpoints + browser |
| `SUPABASE_KEY` | Anon key | Público vía `/api/config` | Browser (sujeto a RLS) |
| `SUPABASE_SERVICE_KEY` | Service role key | **NUNCA al browser** | Solo `api/` endpoints |
| `ADMIN_PASSWORD` | Contraseña del admin | Solo servidor | `api/validate-student.js` |
| `CRON_SECRET` | Token del cron | Solo servidor | `api/cron/compress-profiles.js` |

## Regla de oro
```
SUPABASE_SERVICE_KEY ∉ browser code
```
Si Claude detecta `SUPABASE_SERVICE_KEY` en cualquier archivo de `js/` o en la respuesta de `/api/config`, debe bloquearlo inmediatamente.

## Archivos locales vs producción

| Entorno | Fuente |
|---|---|
| Local | `.env` (cargado por `dotenv` en `server.js`) |
| Vercel | Dashboard → Settings → Environment Variables |

## .env ejemplo (nunca commitear)
```
GROQ_TOKEN=gsk_...
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=eyJ...anon...
SUPABASE_SERVICE_KEY=eyJ...service...
ADMIN_PASSWORD=...
CRON_SECRET=...
```
