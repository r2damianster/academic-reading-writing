---
owner: Arturo Rodríguez Zambrano
domain: api
last_updated: 2026-04-19
status: active
---

# Endpoint: /api/validate-student

## Responsable exclusivo
Arturo Rodríguez Zambrano — autenticación del sistema.

## Propósito
Autenticación de estudiantes y del admin. No usa Supabase Auth — hace lookup directo en la tabla `students`.

## Contrato
```
POST /api/validate-student
Body: { email: string, password?: string }

Response 200 (estudiante): { id, email, name, course, major, institution, role: "student" }
Response 200 (admin):      { email, name, role: "admin" }
Response 401: credenciales inválidas
Response 404: estudiante no encontrado
```

## Lógica de autenticación

```
1. Normalizar email: toLowerCase().trim()
2. Si email === "arturo.rodriguez@uleam.edu.ec":
   - Requiere password (env ADMIN_PASSWORD)
   - Retorna role: "admin"
3. Si es estudiante:
   - Buscar en tabla students con .ilike('email', cleanEmail)
   - Retorna datos del estudiante + role: "student"
```

## Variables de entorno
- `ADMIN_PASSWORD` — contraseña del admin (nunca hardcodeada)
- `SUPABASE_URL` + `SUPABASE_KEY` — usa la anon key aquí (lectura pública de tabla students)

## Seguridad
- El email del admin está hardcodeado en el archivo — si cambia, hay que actualizar el código
- `ADMIN_PASSWORD` proviene de `process.env` — nunca del body sin validar
- No loguear contraseñas en ningún `console.log`

## Notas para Claude
- El `console.log` en línea 26 (`Buscando: [${cleanEmail}]`) es intencional para debug — no expone datos sensibles
- La sesión de 4h se gestiona en el frontend (localStorage + `session_cache` en Supabase)
