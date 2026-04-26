# Roadmap — Academic Reading & Writing Platform

## Features Futuras

---

### [FEATURE] Teacher Helper Mode
**Estado:** En Progreso (80% completado)  
**Prioridad:** Media  
**Descripción:** Panel de guía docente visible únicamente en modo teacher, integrado directamente en cada slide de las lecciones HTML.

**Arquitectura decidida:**
- El contenido del helper va en el **mismo HTML de cada lección**, dentro de cada slide relevante, como un bloque `<div data-teacher-note>`.
- Se activa con URL param `?teacher=1` + contraseña admin (usar `ADMIN_PASSWORD` del `.env`).
- El `reading-engine.js` detecta el modo teacher y hace visible los bloques `[data-teacher-note]`.
- Los bloques son invisibles (`display:none`) por defecto — los estudiantes no los ven en la UI (aunque el HTML fuente es legible; aceptable para este contexto académico).

**Contenido de cada `data-teacher-note`:**
1. Respuesta correcta con justificación
2. Cita exacta del artículo (página + párrafo) que respalda la respuesta
3. Tip pedagógico o conexión con otro slide/lección

**Ejemplo de markup:**
```html
<div data-teacher-note>
    <strong>Respuesta:</strong> A — Block Method / Version 1<br>
    <strong>Referencia:</strong> Podolkova & Medvid (2019), p. 218, párr. 2:
    "The first version supposes full analysis of Subject A before moving to Subject B."<br>
    <strong>Tip:</strong> Conectar con la diapositiva del Block Method — misma estructura, terminología diferente.
</div>
```

**Trabajo requerido:**
- [x] Lógica de activación en `reading-engine.js` (detectar `?teacher=1`, verificar contraseña, setear flag en sessionStorage)
- [x] CSS para el panel teacher (estilo diferenciado — fondo amarillo/ámbar, ícono de llave)
- [x] Poblar los `data-teacher-note` en el módulo **00. Fundamentals** (13 lecciones)
- [x] Poblar los `data-teacher-note` en el módulo **02. Toolbox** (21 lecciones)
- [ ] Poblar los `data-teacher-note` en el módulo **01. Core Syllabus** (Pendiente)
- [ ] Extender a los demás módulos y tests

**Lecciones priorizadas para el piloto:**
1. `essay-patterns.html` (12 slides, ya tiene todas las respuestas definidas)
2. `semantic-waves.html`
3. `essay-structure.html`

---

### [FEATURE] Dashboard Docente
**Estado:** Pendiente  
**Prioridad:** Baja  
**Descripción:** Vista consolidada del progreso de todos los estudiantes (actualmente solo accesible vía Supabase directamente).

---
