---
type: index
domain: mcp
last_updated: 2026-04-19
owner: Arturo Rodríguez Zambrano
---

# Índice de MCP Servers

Servidores MCP activos en Claude Code para este proyecto.

## Tabla de MCPs

| Servidor | ID interno | Herramientas clave | Documento |
|---|---|---|---|
| Supabase | `785ba7f2-3851-4a9f-a790-b06dd37855e9` | `execute_sql`, `apply_migration`, `list_tables` | [supabase.md](supabase.md) |
| Vercel | `0ce0591e-5cce-4ee9-afd9-80965f1ac690` | `deploy_to_vercel`, `get_runtime_logs`, `list_deployments` | [vercel.md](vercel.md) |
| Groq | — | API directa vía `lib/groq-client.js` | [groq.md](groq.md) |

## MCPs globales (definidos en CLAUDE.md global)

| Servidor | Herramientas destacadas |
|---|---|
| Google Calendar | `create_event`, `list_events`, `suggest_time` |
| Canva | `generate_design`, `export_design` |
| Miro | `doc_create`, `diagram_create`, `table_sync_rows` |
| Semantic Search | `semanticSearch` |

## Permisos actuales (settings.local.json)

```json
"mcp__claude_ai_Supabase__list_projects",
"mcp__claude_ai_Supabase__list_tables",
"mcp__claude_ai_Supabase__execute_sql"
```
