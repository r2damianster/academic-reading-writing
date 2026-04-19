---
owner: Arturo Rodríguez Zambrano
domain: mcp
last_updated: 2026-04-19
status: active
---

# MCP: Vercel

## Responsable exclusivo
Arturo Rodríguez Zambrano — deployments y monitoreo.

## ID interno
`0ce0591e-5cce-4ee9-afd9-80965f1ac690`

## Herramientas disponibles

| Herramienta | Cuándo usar |
|---|---|
| `deploy_to_vercel` | Deploy manual después de cambios |
| `list_deployments` | Ver historial de deploys |
| `get_deployment` | Estado de un deploy específico |
| `get_deployment_build_logs` | Debug de errores de build |
| `get_runtime_logs` | Logs de funciones serverless en producción |
| `get_project` | Configuración del proyecto |
| `list_projects` | Ver todos los proyectos Vercel |

## Límite crítico: 12 funciones serverless

Plan Hobby de Vercel permite **máximo 12 funciones**. Actualmente hay 5 activas:

```
api/config.js
api/orchestrator.js
api/validate-student.js
api/sync-reading.js
api/agents/          ← subcarpeta
api/cron/            ← subcarpeta con cron jobs
```

**Regla**: Los helpers y módulos de agentes van en `lib/` — nunca mover a `api/`.

## Flujo de deploy

1. Verificar `ls api/ api/cron/` — confirmar ≤ 12 archivos .js
2. Verificar que no hay `import`/`export` (Vercel usa CommonJS en este proyecto)
3. Deploy automático en push a `main` — o manual con `deploy_to_vercel`

## Debugging de producción

```
get_runtime_logs → filtrar por función (orchestrator, validate-student)
get_deployment_build_logs → si el deploy falló
```

## Variables de entorno en Vercel
Configuradas en Vercel Dashboard → Settings → Environment Variables.
Las mismas que en `.env` local — Vercel las inyecta en las funciones serverless.
