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

### Causa más probable
`SUPABASE_SERVICE_KEY` no está configurada como variable de entorno en Vercel (o está mal escrita). El endpoint la necesita para bypassar RLS y leer todos los estudiantes.

### Diagnóstico ya hecho
El endpoint ahora devuelve el error real (commit `7007b34`). La respuesta 500 incluye:
```json
{ "error": "...", "sb_url_set": true/false, "sb_key_set": true/false }
```

### Próximo paso — verificar en F12
1. Abrir `admin-students.html` en producción
2. F12 → Network → buscar la llamada a `/api/admin-students`
3. Ver el cuerpo de la respuesta 500
4. Si `sb_key_set: false` → ir a Vercel Dashboard → Settings → Environment Variables → agregar `SUPABASE_SERVICE_KEY`
5. Si `sb_key_set: true` → el error estará en `"error": "Supabase 4xx: ..."` y hay que revisar permisos RLS o nombre de tabla

### Cómo agregar la variable en Vercel
1. vercel.com → tu proyecto → **Settings → Environment Variables**
2. Agregar: `SUPABASE_SERVICE_KEY` = (la service_role key de Supabase Dashboard → Settings → API)
3. Asegurarse de que está en el entorno **Production**
4. Redeploy

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
