---
owner: Arturo Rodríguez Zambrano
domain: decisions
last_updated: 2026-04-19
status: active
---

# ADR: CommonJS Obligatorio

## Decisión
Todo el backend (`api/`, `lib/`) usa CommonJS. Cero `import`/`export`.

## Por qué
- Vercel serverless functions en Node.js usan CommonJS por defecto
- `import`/`export` rompe silenciosamente en producción — el error no siempre es obvio en build
- El proyecto usa `require()` directamente sin bundler

## Impacto
- `require('../lib/groq-client')` ✅
- `import { groqChat } from '../lib/groq-client'` ❌ — rompe Vercel

## Cómo aplicar
- Al crear cualquier archivo en `api/` o `lib/`: usar `module.exports = ...` y `const x = require(...)`
- El GitHub Agent tiene esta verificación activa como check de seguridad
- Si Claude detecta ES modules en estos directorios, debe corregirlos inmediatamente
