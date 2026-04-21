# Guía del Teacher Helper para Creadores de Contenido

El **Teacher Helper** es una herramienta diseñada para dar soporte al docente durante la sesión. Este documento explica cómo añadir pistas, explicaciones y respuestas a las lecciones HTML.

## 1. Funcionamiento Automático
El motor (`slide-engine.js`) extrae automáticamente la siguiente información sin configuración extra:
- **Quizzes**: La opción marcada con `data-se-correct`.
- **Drag & Drop**: Las parejas correctas definidas por `data-se-drag-type` y `data-se-drop-accepts`.
- **Fill in the Blanks**: El valor de `data-se-answer`.
- **Match**: Las definiciones vinculadas por `data-se-id`.

## 2. Añadir "Pistas" (Hints) y Explicaciones
Para que el docente pueda orientar mejor al alumno, puedes añadir el atributo `data-se-hint` o `data-se-explanation` a cualquier elemento interactivo.

### Ejemplo en un QUIZ:
```html
<div class="slide" data-type="QUIZ">
    <h2>Academic Register</h2>
    <p data-se-question>Why is "a lot of" considered informal?</p>
    
    <div data-se-option>A. Because it is too long.</div>
    <div data-se-option data-se-correct 
         data-se-hint="Explanation: Academic writing requires precision. 'A substantial number' or 'multiple' are better alternatives.">
        B. Because it is imprecise and common in spoken language.
    </div>
</div>
```

### Ejemplo en un CONTRAST:
```html
<div class="slide" data-type="CONTRAST">
    <h2>Finding the Tone</h2>
    <div data-se-correct data-se-label="Formal"
         data-se-hint="Instruction: Remind students that formal tone relies on evidence, not personal feelings.">
        The data indicates a trend towards urbanization.
    </div>
    <div data-se-incorrect data-se-label="Informal">
        I think towns are getting bigger.
    </div>
</div>
```

## 3. ¿Por qué no aparece mi información?
Si la información no sale en el panel del Teacher Helper, verifica:
1. Que el atributo comience con `data-se-` (no `data-re-` o solo `data-`).
2. Que estés en **Modo Instructor** (barra lateral -> Modo Instructor -> Aceptar).
3. Que el archivo `slide-engine.js` sea la versión más reciente (Ctrl + F5 para limpiar caché).

---

> [!TIP]
> Usa `data-se-hint` para dar consejos pedagógicos al profesor: *"Pide a los alumnos que cierren los ojos y piensen en un ejemplo antes de mostrar esta slide"*.
