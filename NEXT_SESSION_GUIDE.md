# Plan de Trabajo y Verificación

## ✅ Hitos Completados

1. **Modo Instructor Manual** — activación/desactivación instantánea verificada.
2. **Teacher Helper Core** — apertura de ventana y comunicación vía postMessage.
3. **Race Condition Supabase** — singleton promise `_configReady` garantiza estabilidad.
4. **Admin dropdown en sidebar** — botón escudo azul funciona en producción. Despliega: Instructor Mode / Student Progress / Instructor Panel.
5. **Student Progress Dashboard** (`admin-students.html`) — tabla de estudiantes, badges de integridad, modal de detalle (Activity / Essays / Reading), export CSV. ✅ UI funcionando.
6. **Back to App** — botón de regreso en `admin.html` y `admin-students.html`.
7. **Guía de uso** — `GUIA_INSTRUCTOR_PANEL.md` documenta cada sección del panel para el docente.

---

## 🔴 Bug Crítico Pendiente: Error 500 en `/api/admin-students`

### Síntoma
Al entrar a `admin-students.html` con la clave `instructor2025`, la tabla de estudiantes muestra:
> `Error loading students: HTTP 500`

### Estado del diagnóstico (2026-04-21)

**Lo que ya se hizo y NO resolvió el bug:**
1. ✅ Endpoint reescrito con `@supabase/supabase-js` (commit `c41bb40`)
2. ✅ Vercel runtime logs confirmaron `injected env (0)` → se configuraron las 6 variables de entorno en Vercel
3. ✅ `SUPABASE_SERVICE_KEY` tenía valor incorrecto (`sb_secret_...`); se reemplazó con el JWT correcto (`eyJhbGci...` con `role: service_role`)
4. ✅ Redeploy hecho — pero sigue retornando 500

### Siguiente paso prioritario — leer el cuerpo del error 500

El endpoint devuelve el mensaje real de Supabase. Para verlo:
1. Abrir `admin-students.html` en producción
2. **F12 → Network → buscar la llamada a `/api/admin-students`**
3. Click en la llamada → pestaña **Response**
4. Copiar el JSON completo del error y analizarlo

**Posibles causas según el mensaje:**
- `"students: relation \"students\" does not exist"` → la tabla se llama diferente en Supabase (verificar en Table Editor)
- `"permission denied for table students"` → RLS activo y la service_role no tiene acceso (revisar políticas RLS)
- `"invalid JWT"` → la service_role key en Vercel sigue siendo incorrecta
- `"Supabase credentials not configured"` → las env vars no se inyectaron en el redeploy (ir a Deployments y verificar)

### Verificar nombres de tablas en Supabase
En Supabase Dashboard → **Table Editor**, confirmar que existen estas tablas:
- `students`
- `essay_submissions`
- `activity_logs`
- `reading_progress`
- `essay_compliance_results`

Si alguna tiene nombre diferente, actualizar las queries en `api/admin-students.js` y `api/admin-student-detail.js`.

---

## 🟡 Pendiente: Revisar y probar el Instructor Panel completo

Una vez resuelto el 500, hacer un recorrido completo del panel siguiendo `GUIA_INSTRUCTOR_PANEL.md`:

### Checklist de verificación

**Class Overview (tarjetas)**
- [ ] Las 5 tarjetas cargan con datos reales (no `—`)
- [ ] El número de "Students enrolled" coincide con la base de datos

**DB Admin Agent**
- [ ] Escribir una pregunta de prueba: *"Students with integrity below 60%"*
- [ ] Verificar que responde en ~5 segundos con texto coherente
- [ ] Probar un chip de sugerencia

**Integrity Flags**
- [ ] La tabla carga (aunque esté vacía si no hay flags aún)
- [ ] Los colores de riesgo son correctos (moderate / high / critical)

**Recent Agent Activity**
- [ ] El log muestra las últimas interacciones de los estudiantes
- [ ] Las columnas (agente, modelo, tokens, fecha) tienen datos

**Content Generator**
- [ ] Rellenar título + objetivo + 6 slides → pulsar Generate
- [ ] El resultado es HTML válido copiable
- [ ] El botón "Copy HTML" funciona

**Lesson Availability**
- [ ] El selector de lecciones carga todas las lecciones
- [ ] Se puede crear una regla de prueba (fecha futura)
- [ ] La regla aparece en la tabla "Existing Rules"
- [ ] Borrar la regla de prueba al terminar

**Student Progress Dashboard**
- [ ] La tabla de estudiantes carga (depende del fix del 500)
- [ ] La búsqueda filtra en tiempo real
- [ ] Clic en un estudiante abre el modal con sus 3 tabs
- [ ] El botón "Read" expande el texto del ensayo
- [ ] Export CSV genera un archivo descargable

---

## 🚀 Siguientes Features (después de resolver bug 500)

### Mejoras al dashboard de estudiantes
- Paginación para clases grandes (>50 estudiantes)
- Filtros por curso y por nivel de riesgo de integridad
- Ordenamiento por columnas en la tabla

### Otras features del roadmap
- Argumentative Essay lesson (L-001 — HTML vacío, pendiente)
- Chain Essay lesson (L-002 — HTML vacío, pendiente)

---

> [!NOTE]
> Ver `GUIA_INSTRUCTOR_PANEL.md` para documentación completa de cada sección del panel de instructor.
