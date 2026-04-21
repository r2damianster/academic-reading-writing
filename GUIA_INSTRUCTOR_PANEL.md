# Guía de Uso — Instructor Panel

## Cómo acceder

1. Inicia sesión en la app con `arturo.rodriguez@uleam.edu.ec` + contraseña de admin
2. En la sidebar, pulsa el ícono de escudo azul (**Admin Options**)
3. Selecciona **Instructor Panel** → escribe la clave `instructor2025`
4. También puedes ir directo a: `tu-dominio.vercel.app/admin.html`

---

## Secciones del panel

### 1. Student Progress Dashboard →
Botón azul al tope. Lleva a `admin-students.html` — la vista detallada de progreso por alumno (ver sección aparte abajo).

---

### 2. Class Overview (tarjetas de resumen)

| Tarjeta | Qué significa |
|---|---|
| Students enrolled | Total de estudiantes registrados en la base de datos |
| Essays submitted | Total de ensayos entregados en toda la clase |
| Avg integrity score | Promedio de integridad académica de todos los ensayos (0–100%) |
| Integrity flags (≤60%) | Cuántos ensayos tienen integridad por debajo del 60% — alerta de plagio potencial |
| Agent calls (7d) | Cuántas veces usaron los estudiantes los agentes de IA en los últimos 7 días |

> Un puntaje de integridad bajo (≤60%) puede indicar texto pegado, escritura fuera de la plataforma, o muchos cambios de pestaña. No significa necesariamente plagio — es una señal para revisar.

---

### 3. DB Admin Agent — AI Console

Permite hacerle preguntas a un agente de IA **en lenguaje natural** sobre los datos de la clase. El agente consulta la base de datos y responde en texto.

**Ejemplos de preguntas** (también aparecen como chips rápidos):
- *"Students with integrity below 60%"* — lista los alumnos con alertas
- *"Show token usage by agent this week"* — uso de IA por agente
- *"Which students haven't logged in for 7 days?"* — alumnos inactivos
- *"Average essay word count per lesson"* — longitud promedio por lección
- *"Students with more than 3 paste events"* — posibles copiadores

**Cómo usarlo:**
1. Haz clic en un chip de sugerencia o escribe tu pregunta
2. Pulsa **Ask →** o Enter
3. Espera ~5 segundos — el agente analiza los datos y responde en texto

> Este agente usa el modelo Llama 3.3-70b de Groq. Las respuestas son interpretaciones, no exportaciones directas de datos. Para datos exactos, usar Student Progress Dashboard.

---

### 4. Integrity Flags — High & Critical Risk

Tabla automática que muestra los ensayos con **integridad ≤ 60%** ordenados por riesgo.

Columnas: estudiante, lección, puntaje de integridad, número de pegadas (pastes), duración de escritura, fecha.

**Colores:**
- 🟡 Moderate (60–74%) — revisar
- 🔴 High (40–59%) — probable asistencia externa
- ⚫ Critical (<40%) — revisión inmediata recomendada

---

### 5. Recent Agent Activity (last 50)

Log de las últimas 50 interacciones con los agentes de IA. Muestra: estudiante, agente usado, modelo, tokens consumidos, complejidad, fecha.

Útil para ver qué agentes se usan más y detectar uso excesivo o inusual.

---

### 6. Content Generator Agent — New Lesson

Genera el HTML de una lección nueva a partir de parámetros. **No guarda nada automáticamente** — genera el código y tú lo copias.

**Pasos:**
1. Escribe el título de la lección (ej: *"Argumentative Essay Structure"*)
2. Selecciona el módulo/carpeta donde irá
3. Elige el nivel CEFR (B1 para la mayoría, B2 para avanzado)
4. Define cuántos slides (4–14)
5. Escribe el objetivo de aprendizaje (*"Students will be able to…"*)
6. Añade vocabulario clave separado por comas
7. Selecciona qué tipos de slide incluir (CONTENT, QUIZ, ESSAY, etc.)
8. Pulsa **Generate Lesson →** — tarda 20-30 segundos
9. Copia el HTML generado con **📋 Copy HTML**
10. Pégalo en un archivo `.html` nuevo dentro de la carpeta `modules/`

> El HTML generado sigue el contrato de `slide-engine.js` y es funcional directamente.

---

### 7. Lesson Availability & Deadlines

Controla **cuándo y quién puede acceder a cada lección**. Puedes bloquear lecciones por fecha o habilitarlas solo para ciertos cursos.

**Cómo crear una regla:**
1. Selecciona la lección en el desplegable
2. Elige el **Scope**:
   - *Entire Course* — aplica a todos los estudiantes de un curso
   - *Specific Student* — aplica solo a un alumno (útil para extensiones de plazo)
3. Define **Available From** y **Available Until** (fechas y horas)
4. Activa/desactiva el checkbox *Is Active?*
5. Opcionalmente escribe un mensaje personalizado (*"This lesson is locked until April 30"*)
6. Pulsa **Save Rule →**

Las reglas existentes aparecen en la tabla de abajo. Puedes ver qué está activo, vencido o programado.

---

## Student Progress Dashboard (`admin-students.html`)

Accesible desde el botón azul al tope del Instructor Panel, o directamente desde el menú admin del sidebar.

### Vista principal (tabla de estudiantes)

Muestra todos los estudiantes con:
- Nombre y email
- Curso
- Número de ensayos entregados
- **Avg Integrity** (badge verde/amarillo/rojo)
- **Alerts** (punto rojo — ensayos con integridad < 60%)
- Última actividad registrada

Puedes **buscar** por nombre, email o curso en tiempo real.

Botón **↓ Export CSV** — descarga la tabla completa como archivo `.csv` para Excel.

### Modal de detalle (clic en cualquier fila)

Al hacer clic en un estudiante se abre un panel con 3 pestañas:

**Activity Log** — historial cronológico de todas las actividades (lecciones visitadas, completadas, puntajes).

**Essays** — todos los ensayos del estudiante con:
- Lección, palabras, integridad, compliance (criterios cumplidos/total), duración
- Botón **Read** para ver el texto completo del ensayo

**Reading** — progreso en lecciones de lectura (completado/en progreso, puntaje, fecha).

Botón **↓ Export Student CSV** — descarga el historial completo de ese alumno.

---

## Flujo de trabajo recomendado (semanal)

1. Abrir **Instructor Panel** → revisar las 5 tarjetas de Class Overview
2. Si hay **Integrity Flags**, revisar los casos de riesgo alto/crítico
3. Ir a **Student Progress Dashboard** → buscar alumnos sin actividad reciente
4. Usar el **DB Admin Agent** para preguntas específicas (*"¿Quién no entregó la tarea de esta semana?"*)
5. Si hay lección nueva → usar el **Content Generator**
6. Si hay examen → usar **Lesson Availability** para configurar fechas de acceso
