---
owner: Arturo Rodríguez Zambrano
domain: frontend
last_updated: 2026-04-19
status: active
---

# Frontend: auth.js

## Responsable exclusivo
Arturo Rodríguez Zambrano — flujo de autenticación.

## Propósito
Gestión de login, sesión y roles en el browser. No usa Supabase Auth — valida contra `POST /api/validate-student`.

## Flujo de autenticación

```
1. Usuario ingresa email (+ password si es admin)
2. POST /api/validate-student → { email, name, role, ... }
3. Guardar en localStorage: { studentData, timestamp }
4. Sesión válida por 4 horas (igual que session_cache en Supabase)
5. En cada carga de página: verificar timestamp → si expirado, redirect a login
```

## Roles

| Role | Acceso |
|---|---|
| `student` | Lecciones, agentes, progreso personal |
| `admin` | Todo lo anterior + `admin.html` |

## Deuda técnica
`DT-005`: `admin.html` actualmente no verifica `isAdmin` desde localStorage correctamente. Pendiente corrección.

## localStorage keys usados

| Key | Contenido |
|---|---|
| `studentData` | JSON con datos del usuario + role |
| `sessionTimestamp` | ISO timestamp del momento de login |

## Notas para Claude
- Nunca almacenar `ADMIN_PASSWORD` en localStorage
- La verificación de `isAdmin` debe hacerse en el servidor para rutas sensibles — el check en localStorage es solo para UX
- Si se extiende la sesión, actualizar `sessionTimestamp` en Supabase `session_cache` también
