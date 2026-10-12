# Guía: Creación de Nuevas Lecciones HTML

Sigue este estándar para asegurar que tus lecciones tengan telemetría, seguridad de acceso y soporte para el Modo .

## 1. Plantilla Base HTML

Copia este código para iniciar cualquier lección:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nombre de la Lección | Academic Workspace</title>
    
    <link rel="stylesheet" href="../../css/modules.css">
    
    <!-- Scripts Core (ORDEN IMPORTANTE) -->
    <script src="../../js/activity-tracker.js"></script>
    <script src="../../js/essay-handler.js"></script>
    <script src="../../js/report.js"></script>
    <script src="../../js/slide-engine.js" defer></script>
</head>
<body>

<div class="lesson-container">
    <!-- Barra de progreso gestionada por SlideEngine -->
    <div class="progress-bar">
        <div class="progress-fill" id="progressBar"></div>
    </div>

    <!-- SLIDE 1: VIDEO -->
    <div class="slide active" data-type="VIDEO">
        <h2>Introduction</h2>
        <iframe data-se-src="URL_DE_EMBED" data-se-height="320"></iframe>
    </div>

    <!-- SLIDE 2: QUIZ -->
    <div class="slide" data-type="QUIZ">
        <h2>Check your understanding</h2>
        <p data-se-question>This is the question?</p>
        <div data-se-option data-se-correct data-se-hint="Teacher Tip: Focus on X">Correct Answer</div>
        <div data-se-option>Incorrect Answer</div>
    </div>

    <!-- SLIDE 3: ESSAY COMPONENT (Pre-Warning + Workspace) -->
    <div class="slide" id="preEssaySlide" data-type="ESSAY" data-se-role="warning" data-se-lesson="id unique">
        <h2>Writing Task</h2>
        <p data-se-warning>This task requires focus. Do not leave the tab.</p>
    </div>

    <div class="slide" id="essaySlide" data-type="ESSAY" data-se-role="workspace" data-se-lesson="id unique">
        <p data-se-prompt>Write your reflection here...</p>
    </div>
</div>

<script>
    window.onload = () => {
        // Inicializar con un ID único en minúsculas y sin espacios raros
        const lessonID = 'mi-nueva-leccion';
        SlideEngine.init(lessonID);
        ActivityTracker.init(lessonID);
    };
</script>

</body>
</html>
```

## 2. Tipos de Slide Soportados

| Tipo | Atributos Clave | Propósito |
|---|---|---|
| `VIDEO` | `data-se-src`, `data-se-height` | Slides embebidas / YouTube |
| `CONTENT` | Texto directo | Información pura |
| `QUIZ` | `data-se-question`, `data-se-option`, `data-se-correct` | Evaluación rápida |
| `CONTRAST` | `data-se-correct`, `data-se-incorrect`, `data-se-label` | Comparar ideas |
| `DRAG_DROP` | `data-se-drag`, `data-se-drop-accepts` | Emparejamiento |
| `ESSAY` | `data-se-role`, `data-se-lesson` | Escritura con telemetría |
| `BUILD_UP` | `data-se-step`, `data-se-source`, `data-se-key-idea`, `data-se-rubric-item`, `data-se-accumulate` (`append`\|`revise`) | Respuesta larga acumulativa calificada por IA (summarizing/paraphrasing). Requiere cargar `js/build-up.js` **después** de `slide-engine.js`. Sintaxis completa en el encabezado de `js/build-up.js`; ejemplos: `unit1-essays/summarizing.html`, `paraphrasing.html` |

> [!WARNING]
> Esta guía cubre lecciones `slide-engine.js`. Para lecciones `reading-engine.js` (PDF + sidebar), **no uses `READING_COMMENT`** — quedó deshabilitado en el motor (DT-004, `DEUDA_TECNICA.md`). Las actividades de producción (escritura libre) solo van en `slide-engine` con tipo `ESSAY`; en `reading-engine` usa `READING_QUIZ`, `READING_FILL`, `READING_TFNG` o `READING_MATCH`.

## 3. Checklist de Publicación
1. [ ] El `lessonID` en el script `init` coincide con el nombre de la lección.
2. [ ] Todas las imágenes/video tienen rutas relativas correctas (`../../img/`).
3. [ ] Se han incluido los "Hints" para que el docente pueda verlos en el Teacher Helper.
4. [ ] La lección termina con un componente `ESSAY` o una llamada a `SlideEngine.finishLesson()`.

---

> [!CAUTION]
> No elimines los IDs `progressBar`, `preEssaySlide` o `essaySlide`, ya que el motor los busca por ID para la lógica de navegación y guardado.

---

## 4. Categoría `05-writing-patterns` (plantilla "Pattern Lab")

Las 20 lecciones de `modules/05-writing-patterns/` **no se escriben a mano**: se generan desde
`scripts/patterns/lessons/*.js` con `node scripts/patterns/build.js`. Edita el dato, no el HTML.

Cada lección sigue las 7 etapas del libro *Academic Writing Patterns*: The model → Taking it apart →
Why this works → Spot the pattern → Rebuild it → Now you write → Phrase bank.

Tipos de slide propios (`js/pattern-types.js`, se carga **después** de `slide-engine.js`):

| Tipo | Atributos | Propósito |
|---|---|---|
| `MOVE_TAG` | `data-pt-moves="A\|B\|C"`, `data-pt-segment` + `data-pt-answer` + `data-pt-why` | Asignar a cada segmento el move que cumple |
| `WAVE` | `data-pt-mode="place\|show"`, `data-pt-wave-item` + `data-pt-level="3\|2\|1"` | Ubicar oraciones en la onda semántica y dibujarla |
| `PHRASE_BANK` | `data-pt-pattern`, `data-pt-phrase-group` + `data-pt-label`, `data-pt-phrase` | Guardar frases en el cuaderno personal (`localStorage`: `pw_phrase_notebook`) |

Reglas: `lessonName` en minúsculas, sin guiones, prefijo `pattern ` (la PK de `essay_requirements` es `activity_key` = lessonName con guiones; ver
`scripts/sql/pattern_lessons_config.sql`, **generado**; ejecutarlo en Supabase tras añadir lecciones).
El motor monta tipos externos mediante el `default` del `switch` de `SlideEngine.init()`.

Flags de lección en `scripts/patterns/lessons/*.js`: `argumentative: true` agrega el criterio general de hedging; `generalCriteria: false` omite los criterios generales (register, vocabulary, cohesion, grammar, focus) en la autoevaluación con IA.

