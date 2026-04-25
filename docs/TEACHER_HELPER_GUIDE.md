# Guía del Teacher Helper Mode

Esta guía explica cómo utilizar y extender el **Modo Instructor** en la plataforma. Este modo permite a los docentes visualizar respuestas correctas, justificaciones pedagógicas y citas de artículos directamente en las diapositivas de las lecciones.

## 1. Cómo Activar el Modo Instructor

Para activar las notas docentes en cualquier lección:

1.  Añade el parámetro `?teacher=1` a la URL de la lección.
    *   Ejemplo: `modules/01-core-syllabus/unit1-essays/essay-patterns.html?teacher=1`
2.  Aparecerá un modal solicitando una contraseña.
3.  Ingresa la contraseña de administrador (definida en el sistema).
4.  Una vez desbloqueado, verás un banner superior indicando que el modo está activo. Las notas aparecerán resaltadas en bloques de color ámbar.

> [!NOTE]
> El estado de desbloqueo se guarda en el `sessionStorage`, por lo que permanecerá activo mientras la pestaña del navegador esté abierta.

---

## 2. Cómo Añadir Notas a una Lección

Las notas se integran directamente en el HTML de la lección usando el atributo `data-teacher-note`.

### Estructura Básica
Debes colocar un `div` con el atributo `data-teacher-note` dentro de la diapositiva (`reading-slide`) correspondiente, preferiblemente después del ejercicio.

```html
<div class="reading-slide" data-type="READING_QUIZ" ...>
    <!-- Contenido del ejercicio -->
    <p data-re-question>¿Cuál es la tesis del autor?</p>
    ...

    <!-- NOTA DOCENTE -->
    <div data-teacher-note>
        <strong>Respuesta:</strong> B — Ejemplo de respuesta.<br>
        <strong>Referencia:</strong> Autor (Año), p. XX, párr. Y.<br>
        <strong>Tip:</strong> Sugerencia pedagógica para discutir en clase.
    </div>
</div>
```

### Reglas de Estilo
El `reading-engine.js` se encarga de ocultar estos bloques por defecto para los estudiantes. El CSS en `modules.css` aplica los siguientes estilos automáticamente:
- Fondo: `#fffce5` (amarillo pálido).
- Borde izquierdo: `4px solid #f1c40f` (dorado).
- Icono: Añade automáticamente un ícono de llave (🔑) antes del contenido.

---

## 3. Mejores Prácticas para el Contenido

1.  **Justificación:** No te limites a dar la respuesta (A, B, C). Explica *por qué* es la correcta basándote en la teoría.
2.  **Citas Exactas:** Incluye el número de página y, si es posible, el párrafo del artículo PDF para que el docente pueda guiar al estudiante rápidamente al texto fuente.
3.  **Tips Pedagógicos:** Añade preguntas provocadoras o conexiones con temas vistos anteriormente para fomentar la participación.

---

## 4. Soporte Técnico
La lógica principal reside en:
- `js/reading-engine.js`: Función `_activateTeacherMode()` y `_showTeacherNotes()`.
- `css/modules.css`: Selectores `[data-teacher-note]`.
