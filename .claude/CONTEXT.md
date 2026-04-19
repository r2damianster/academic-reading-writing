---
type: master-index
last_updated: 2026-04-19
owner: Arturo Rodríguez Zambrano
---

# CONTEXT — Academic Reading & Writing Platform

Plataforma de aprendizaje de escritura académica en inglés para ~200 estudiantes de ULEAM (Manta, Ecuador).
72 lecciones, 5 tracks, 10 agentes de IA, auditoría de integridad en tiempo real.

---

## Estado del sistema

| Componente | Estado | Notas |
|---|---|---|
| Producción | ✅ Live en Vercel | ~200 estudiantes activos |
| Funciones Vercel | 5 / 12 máximo | `api/` — no superar límite |
| Proveedor IA | Groq (gratuito) | llama-3.1-8b + llama-3.3-70b |
| Base de datos | Supabase PostgreSQL | RLS activo |
| Auth | Email lookup + admin password | No usa Supabase Auth |

---

## Restricciones críticas — leer antes de tocar código

1. **CommonJS obligatorio** — cero `import`/`export` en `api/` y `lib/`
2. **Límite 12 funciones Vercel** — solo archivos en `api/` cuentan; helpers van en `lib/`
3. **`SUPABASE_SERVICE_KEY` nunca al browser** — solo endpoints de servidor
4. **No commitear sin instrucción explícita** de Arturo
5. **`slide-engine.js` tiene 2482 líneas** — leer solo la sección relevante
6. **Los módulos HTML son generados** — no editar manualmente; usar Content Gen Agent

---

## Mapa de responsables

| Dominio | Documento | Responsable |
|---|---|---|
| Agentes IA | [agents/INDEX.md](agents/INDEX.md) | Arturo (diseño) + GitHub Agent (auditoría) |
| Endpoints API | [api/INDEX.md](api/INDEX.md) | Arturo |
| MCPs | [mcp/INDEX.md](mcp/INDEX.md) | Arturo |
| Frontend JS | [frontend/INDEX.md](frontend/INDEX.md) | Arturo |
| Base de datos | [database/INDEX.md](database/INDEX.md) | Arturo + Supabase MCP |
| Dominio académico | [domain/INDEX.md](domain/INDEX.md) | Arturo |
| Decisiones técnicas | [decisions/](decisions/) | Arturo |

---

## Flujo de una petición de agente

```
Browser → POST /api/orchestrator
  → scoreComplexity() → selectModel()
  → Memory.getProfile(studentId)       ← session_cache (4h) → student_profiles
  → agentModule.transformPayload()
  → groqChat(system, segB+segC)        ← Groq API
  → _logInteraction()                  → agent_interactions (Supabase)
  → Memory.saveSessionCache()
  → Response { agent, model, response, complexityScore, usage }
```

---

## Variables de entorno

| Variable | Dónde | Exposición |
|---|---|---|
| `GROQ_TOKEN` | `lib/groq-client.js` | Solo servidor |
| `SUPABASE_URL` | Todos | Público vía `/api/config` |
| `SUPABASE_KEY` | Frontend vía `/api/config` | Anon key — público |
| `SUPABASE_SERVICE_KEY` | Endpoints servidor | **NUNCA al browser** |
| `ADMIN_PASSWORD` | `api/validate-student.js` | Solo servidor |
| `CRON_SECRET` | `api/cron/compress-profiles.js` | Solo servidor |

---

## Comandos de arranque

```bash
npm start                    # http://localhost:3000
ls api/ api/cron/            # verificar ≤ 12 archivos .js
```

---

## Índices de documentación

- [Agentes IA](agents/INDEX.md)
- [API Endpoints](api/INDEX.md)
- [MCP Servers](mcp/INDEX.md)
- [Frontend](frontend/INDEX.md)
- [Base de datos](database/INDEX.md)
- [Dominio académico](domain/INDEX.md)
- [Decisiones técnicas](decisions/)
