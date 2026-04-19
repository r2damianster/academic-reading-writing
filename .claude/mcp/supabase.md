---
owner: Arturo Rodríguez Zambrano
domain: mcp
last_updated: 2026-04-19
status: active
---

# MCP: Supabase

## Responsable exclusivo
Arturo Rodríguez Zambrano — base de datos y migraciones.

## ID interno
`785ba7f2-3851-4a9f-a790-b06dd37855e9`

## Variables de entorno requeridas

| Variable | Uso |
|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_KEY` | Anon key — expuesta al browser vía `/api/config` |
| `SUPABASE_SERVICE_KEY` | Service role key — **solo servidor, NUNCA al browser** |

## Herramientas disponibles

| Herramienta | Cuándo usar |
|---|---|
| `execute_sql` | Queries de lectura, reportes, debug |
| `apply_migration` | Cambios de schema — revisar antes de ejecutar |
| `list_tables` | Inspeccionar schema actual |
| `list_migrations` | Ver historial de migraciones aplicadas |
| `get_advisors` | Performance y seguridad recomendaciones |
| `get_logs` | Logs de la base de datos |

## Tablas del proyecto

Ver [database/schema.md](../database/schema.md) para el schema completo.

## Reglas críticas
- Siempre usar `SUPABASE_SERVICE_KEY` en endpoints de servidor (no la anon key)
- RLS activo — las queries del browser están limitadas por políticas de Row Level Security
- Nunca ejecutar `DROP TABLE` o `DELETE FROM students` sin confirmación de Arturo
- Antes de `apply_migration`, revisar el SQL completo

## Cómo usar desde el servidor (patrón estándar)

```js
const headers = {
  'Content-Type': 'application/json',
  'apikey': process.env.SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  'Prefer': 'return=minimal'
};
```

## Cómo usar desde el browser

```js
const { supabaseUrl, supabaseKey } = await window.configReady;
// supabaseKey es la anon key — sujeta a RLS
```
