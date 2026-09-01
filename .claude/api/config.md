---
owner: Arturo Rodríguez Zambrano
domain: api
last_updated: 2026-04-19
status: active
---

# Endpoint: /api/config

## Responsable exclusivo
Arturo Rodríguez Zambrano — puente seguro de credenciales al browser.

## Propósito
Expone la anon key de Supabase y la URL al browser. **Solo la anon key** — nunca la service role key.

## Contrato
```
GET /api/config
Response: { supabaseUrl: string, supabaseKey: string }
Cache-Control: public, max-age=3600
```

## Variables expuestas

| Variable env | Expuesta como | Seguridad |
|---|---|---|
| `SUPABASE_URL` | `supabaseUrl` | Pública — no sensible |
| `SUPABASE_KEY` | `supabaseKey` | Anon key — sujeta a RLS |

## Cómo consume el frontend
```js
const { supabaseUrl, supabaseKey } = await window.configReady;
```
**Nota (2026-09-01):** `window.configReady` NO existe como singleton global — cada motor (`reading-engine.js`, `slide-engine.js`, `dojo-client.js`) define su propia constante local `_configReady` con el mismo `fetch('/api/config')` duplicado 3x. Existía un `js/config-loader.js` pensado como singleton pero nunca se incluía con `<script>`; se eliminó por código muerto. Ver DT-007 en `DEUDA_TECNICA.md`.

## Seguridad crítica
`SUPABASE_SERVICE_KEY` **nunca** debe aparecer en este endpoint. Si Claude detecta que se está exponiendo la service key aquí, debe bloquearlo y reportar en `DEUDA_TECNICA.md`.
