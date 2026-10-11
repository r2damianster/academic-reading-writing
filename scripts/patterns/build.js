// scripts/patterns/build.js
// Genera las lecciones HTML de la categoría "05. Writing Patterns" desde los datos
// en scripts/patterns/lessons/*.js. Una sola plantilla ("Pattern Lab", 7 etapas del libro)
// garantiza que las 19 lecciones sean estructuralmente idénticas.
//
//   node scripts/patterns/build.js
//
// Salida:
//   modules/05-writing-patterns/<slug>.html     (una por lección)
//   js/pattern-phrases.js                        (datos del Phrase Bank maestro)
//   scripts/sql/pattern_lessons_config.sql       (essay_requirements por lección)

const fs = require('fs');
const path = require('path');
const SOURCES = require('./sources');

const PROJECT_ROOT   = path.join(__dirname, '..', '..');
const LESSONS_DIR    = path.join(__dirname, 'lessons');
const OUTPUT_DIR     = path.join(PROJECT_ROOT, 'modules', '05-writing-patterns');
const PHRASES_OUTPUT = path.join(PROJECT_ROOT, 'js', 'pattern-phrases.js');
const SQL_OUTPUT     = path.join(PROJECT_ROOT, 'scripts', 'sql', 'pattern_lessons_config.sql');

const STAGE_NAMES = [
    'The model — read a real, published passage',
    'Taking it apart — label each move',
    'Why this works — see the semantic wave',
    'Spot the pattern — recognise it in a second text',
    'Rebuild it — order, complete or repair a text',
    'Now you write — your own paragraph, with a checklist',
    'Phrase bank — keep the phrases you will reuse'
];

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Texto plano con **negrita** y [[respuesta]] → HTML seguro
function inlineHtml(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function teacherNote(noteHtml) {
    return noteHtml ? `\n        <div data-teacher-note>${noteHtml}</div>` : '';
}

function sourceCard(sourceKey, adaptedPrefix) {
    const source = SOURCES[sourceKey];
    if (!source) throw new Error(`Fuente desconocida: ${sourceKey}`);
    const doiLink = source.doi
        ? ` <a href="https://doi.org/${source.doi}" target="_blank" rel="noopener">https://doi.org/${source.doi}</a>`
        : '';
    return `<div class="pt-source">${adaptedPrefix ? escapeHtml(adaptedPrefix) + ' ' : ''}${escapeHtml(source.cite)}${doiLink}</div>`;
}

/* ── Renderizadores de slide ─────────────────────────────────────────────── */
const SLIDE_RENDERERS = {
    intro(slide, lesson) {
        const stageItems = STAGE_NAMES.map((stageName, stageIndex) =>
            `<li data-step="${stageIndex + 1}">${escapeHtml(stageName)}</li>`).join('\n                ');
        return `
    <!-- SLIDE — LESSON HEADER -->
    <div class="slide active" data-type="CONTENT">
        <h2>${escapeHtml(lesson.title)}</h2>
        <div class="pt-hero">
            <p>${inlineHtml(slide.objective)}</p>
            <p class="pt-meta">Pattern: <strong>${escapeHtml(lesson.patternName)}</strong> &middot; About ${slide.minutes || 20} minutes &middot; Book chapter ${lesson.chapter}</p>
            <ol class="pt-stage-list">
                ${stageItems}
            </ol>
        </div>${teacherNote(slide.note)}
    </div>`;
    },

    model(slide) {
        const lead = slide.lead ? `<p class="pt-lead">${inlineHtml(slide.lead)}</p>` : '';
        const passages = (Array.isArray(slide.text) ? slide.text : [slide.text])
            .map(passageText => `<div class="pt-model">${inlineHtml(passageText)}</div>`).join('\n        ');
        const sourceKeys = [slide.source, ...(slide.extraSources || [])].filter(Boolean);
        const labeledSource = sourceKeys.map((key, keyIndex) =>
            sourceCard(key, keyIndex === 0 && slide.adapted ? 'Adapted from' : '')).join('\n        ');
        return `
    <!-- SLIDE — THE MODEL -->
    <div class="slide" data-type="CONTENT">
        <h2>${escapeHtml(slide.title || 'The model')}</h2>
        ${lead}
        ${passages}
        ${labeledSource}${teacherNote(slide.note)}
    </div>`;
    },

    read(slide) {
        return `
    <!-- SLIDE — CONTENT -->
    <div class="slide" data-type="CONTENT">
        <h2>${escapeHtml(slide.title)}</h2>
        ${slide.html}${teacherNote(slide.note)}
    </div>`;
    },

    tag(slide) {
        const segments = slide.segments.map(segment =>
            `        <div data-pt-segment data-pt-answer="${escapeHtml(segment.move)}"${segment.why ? ` data-pt-why="${escapeHtml(segment.why)}"` : ''}>${inlineHtml(segment.text)}</div>`
        ).join('\n');
        return `
    <!-- SLIDE — MOVE_TAG -->
    <div class="slide" data-type="MOVE_TAG" data-pt-moves="${escapeHtml(slide.moves.join('|'))}">
        <h2>${escapeHtml(slide.title)}</h2>
        <p data-se-instruction>${inlineHtml(slide.instruction)}</p>
${segments}
        ${slide.source ? sourceCard(slide.source, slide.adapted ? 'Adapted from' : '') : ''}${teacherNote(slide.note)}
    </div>`;
    },

    wave(slide) {
        const mode = slide.mode || 'place';
        const items = slide.items.map(item =>
            `        <div data-pt-wave-item data-pt-level="${item.level}"${item.why ? ` data-pt-why="${escapeHtml(item.why)}"` : ''}>${inlineHtml(item.text)}</div>`
        ).join('\n');
        return `
    <!-- SLIDE — WAVE (${mode}) -->
    <div class="slide" data-type="WAVE" data-pt-mode="${mode}">
        <h2>${escapeHtml(slide.title)}</h2>
        <p data-se-instruction>${inlineHtml(slide.instruction)}</p>
${items}${teacherNote(slide.note)}
    </div>`;
    },

    quiz(slide) {
        const letters = 'ABCDEFG';
        const options = slide.options.map((option, optionIndex) =>
            `        <div data-se-option${option.correct ? ' data-se-correct' : ''}>${letters[optionIndex]}. ${inlineHtml(option.text)}</div>`
        ).join('\n');
        return `
    <!-- SLIDE — QUIZ -->
    <div class="slide" data-type="QUIZ">
        <h2>${escapeHtml(slide.title)}</h2>
        <p data-se-question>${inlineHtml(slide.question)}</p>
${options}${teacherNote(slide.note)}
    </div>`;
    },

    sort(slide) {
        const sentences = slide.sentences.map((sentenceText, sentenceIndex) =>
            `        <div data-se-sort data-se-order="${sentenceIndex + 1}">${inlineHtml(sentenceText)}</div>`
        ).join('\n');
        return `
    <!-- SLIDE — SORT_PARAGRAPH -->
    <div class="slide" data-type="SORT_PARAGRAPH">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${inlineHtml(slide.instruction)}</p>
${sentences}${teacherNote(slide.note)}
    </div>`;
    },

    fill(slide) {
        const sentences = slide.sentences.map(sentenceText => {
            const withBlanks = inlineHtml(sentenceText)
                .replace(/\[\[(.+?)\]\]/g, (_, answer) => `<span data-se-blank data-se-answer="${answer}">___</span>`);
            return `        <p data-se-sentence>${withBlanks}</p>`;
        }).join('\n');
        return `
    <!-- SLIDE — FILL_BLANK -->
    <div class="slide" data-type="FILL_BLANK">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${inlineHtml(slide.instruction)}</p>
${sentences}
        <button data-se-check>Check my answers</button>${teacherNote(slide.note)}
    </div>`;
    },

    bank(slide) {
        const words = slide.words.map(word => `<span data-se-word>${escapeHtml(word)}</span>`).join('\n            ');
        const sentences = slide.sentences.map(sentenceText => {
            const withBlanks = inlineHtml(sentenceText)
                .replace(/\[\[(.+?)\]\]/g, (_, answer) => `<span data-se-blank data-se-answer="${answer}">[ ? ]</span>`);
            return `        <p data-se-sentence>${withBlanks}</p>`;
        }).join('\n');
        return `
    <!-- SLIDE — WORD_BANK -->
    <div class="slide" data-type="WORD_BANK">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${inlineHtml(slide.instruction)}</p>
        <div data-se-bank>
            ${words}
        </div>
${sentences}${teacherNote(slide.note)}
    </div>`;
    },

    categorize(slide) {
        const items = slide.items.map(item =>
            `        <div data-se-item data-se-category="${escapeHtml(item.category)}">${inlineHtml(item.text)}</div>`
        ).join('\n');
        const zones = slide.zones.map(zone =>
            `        <div data-se-category-zone data-se-accepts="${escapeHtml(zone.id)}" data-se-label="${escapeHtml(zone.label)}"></div>`
        ).join('\n');
        return `
    <!-- SLIDE — CATEGORIZE -->
    <div class="slide" data-type="CATEGORIZE">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${inlineHtml(slide.instruction)}</p>
${items}

${zones}${teacherNote(slide.note)}
    </div>`;
    },

    match(slide) {
        const pairIds = slide.pairs.map((_, pairIndex) => `p${pairIndex + 1}`);
        const lefts = slide.pairs.map((pair, pairIndex) =>
            `        <div data-se-left data-se-pair="${pairIds[pairIndex]}">${inlineHtml(pair.left)}</div>`).join('\n');
        const rights = slide.pairs.map((pair, pairIndex) =>
            `        <div data-se-right data-se-pair="${pairIds[pairIndex]}">${inlineHtml(pair.right)}</div>`).join('\n');
        return `
    <!-- SLIDE — MATCH -->
    <div class="slide" data-type="MATCH">
        <h2>${escapeHtml(slide.title)}</h2>
        <p>${inlineHtml(slide.instruction)}</p>
${lefts}

${rights}${teacherNote(slide.note)}
    </div>`;
    },

    applied(slide) {
        const rubricItems = slide.rubric.map(rubricItem =>
            `            <div data-se-rubric-item data-se-points="${rubricItem.points}">${inlineHtml(rubricItem.text)}</div>`
        ).join('\n');
        return `
    <!-- SLIDE — APPLIED_TASK -->
    <div class="slide" data-type="APPLIED_TASK">
        <h2>${escapeHtml(slide.title)}</h2>
        <div data-se-source style="background:#f8fafc; border-left:4px solid #6c757d; padding:14px; border-radius:8px; font-family:Georgia,serif; line-height:1.65;">
            ${slide.sourceHtml}
        </div>
        <div data-se-applied-prompt>
            <p>${inlineHtml(slide.prompt)}</p>
        </div>
        <div data-se-rubric>
${rubricItems}
        </div>${teacherNote(slide.note)}
    </div>`;
    },

    buildup(slide) {
        const steps = slide.steps.map(step => {
            const starter = step.starter ? `\n                <div data-se-starter>${escapeHtml(step.starter)}</div>` : '';
            const keyIdeas = (step.keyIdeas || []).map(idea => `\n                <div data-se-key-idea>${inlineHtml(idea)}</div>`).join('');
            const rubric = step.rubric.map(rubricItem =>
                `\n                <div data-se-rubric-item data-se-points="${rubricItem.points}">${inlineHtml(rubricItem.text)}</div>`).join('');
            return `            <div data-se-step data-se-min-words="${step.minWords || 8}">
                <p data-se-step-prompt>${inlineHtml(step.prompt)}</p>${starter}${keyIdeas}${rubric}
            </div>`;
        }).join('\n');
        return `
    <!-- SLIDE — BUILD_UP -->
    <div class="slide" data-type="BUILD_UP" data-se-task-key="${escapeHtml(slide.taskKey)}" data-se-accumulate="${slide.accumulate || 'append'}">
        <h2>${escapeHtml(slide.title)}</h2>
        <div data-se-source style="background:#f8fafc; border-left:4px solid #6c757d; padding:14px; border-radius:8px; font-family:Georgia,serif; line-height:1.65;">
            ${slide.sourceHtml}
        </div>
${steps}${teacherNote(slide.note)}
    </div>`;
    },

    field(slide) {
        const questions = slide.questions.map(questionText => `<li>${inlineHtml(questionText)}</li>`).join('\n            ');
        return `
    <!-- SLIDE — SPOT IT IN THE WILD (no calificado) -->
    <div class="slide" data-type="CONTENT">
        <h2>${escapeHtml(slide.title || 'Spot it in the wild')}</h2>
        <p class="pt-lead">${inlineHtml(slide.lead)}</p>
        <ol>
            ${questions}
        </ol>
        <p class="pt-source">Not graded. Bring your answers to class and compare them with a classmate.</p>${teacherNote(slide.note)}
    </div>`;
    },

    phrases(slide, lesson) {
        const groups = slide.groups.map(group => {
            const phrases = group.phrases.map(phrase => `<span data-pt-phrase>${escapeHtml(phrase)}</span>`).join('\n            ');
            return `        <div data-pt-phrase-group data-pt-label="${escapeHtml(group.label)}">
            ${phrases}
        </div>`;
        }).join('\n');
        return `
    <!-- SLIDE — PHRASE_BANK -->
    <div class="slide" data-type="PHRASE_BANK" data-pt-pattern="${escapeHtml(lesson.key)}">
        <h2>${escapeHtml(slide.title || 'Phrase bank')}</h2>
        <p class="pt-lead">${inlineHtml(slide.lead || 'Save the phrases you want to reuse. They go to your personal notebook.')}</p>
${groups}
    </div>`;
    },

    rubric(slide, lesson) {
        const rows = (slide.criteria || lesson.rubric).map(criterion =>
            `            <tr><td>${inlineHtml(criterion)}</td><td class="pt-rubric-tick">&#x2610;</td><td class="pt-rubric-tick">&#x2610;</td></tr>`
        ).join('\n');
        return `
    <!-- SLIDE — SELF-ASSESSMENT RUBRIC -->
    <div class="slide" data-type="CONTENT">
        <h2>Self-assessment rubric: ${escapeHtml(lesson.patternName)}</h2>
        <p class="pt-lead">Before you submit any paragraph in this pattern, check it against this rubric. If <strong>three or more</strong> rows are &ldquo;Needs work&rdquo;, rewrite before you hand it in.</p>
        <table class="pt-rubric">
            <thead><tr><th>Criterion</th><th>Achieved</th><th>Needs work</th></tr></thead>
            <tbody>
${rows}
            </tbody>
        </table>${teacherNote(slide.note)}
    </div>`;
    },

    essay(slide, lesson) {
        // Solo elementos inline: el motor inyecta el prompt dentro de un <p>
        const checklist = slide.checklist.map(item => `&#x2610; ${inlineHtml(item)}`).join('<br>\n            ');
        return `
    <!-- ESSAY — Warning -->
    <div class="slide" id="preEssaySlide"
         data-type="ESSAY" data-se-role="warning"
         data-se-lesson="${lesson.lessonName}">
        <h2>Now you write</h2>
        <p data-se-warning>
            ${inlineHtml(slide.warning || `You will write your own paragraph using the ${lesson.patternName} pattern. Allow about ${slide.minutes || 10} minutes. Your writing is tracked for academic integrity: write it yourself, in your own words.`)}
        </p>
    </div>

    <!-- ESSAY — Workspace -->
    <div class="slide" id="essaySlide"
         data-type="ESSAY" data-se-role="workspace"
         data-se-lesson="${lesson.lessonName}">
        <p data-se-prompt>
            ${slide.promptHtml}<br><br><strong>Check your paragraph before submitting:</strong><br>
            ${checklist}
        </p>${teacherNote(slide.note)}
    </div>`;
    }
};

/* ── Ensamblado de la página ─────────────────────────────────────────────── */
function renderLesson(lesson) {
    const usesBuildUp = lesson.slides.some(slide => slide.kind === 'buildup');
    const slideHtml = lesson.slides.map(slide => {
        const renderer = SLIDE_RENDERERS[slide.kind];
        if (!renderer) throw new Error(`${lesson.slug}: slide kind desconocido "${slide.kind}"`);
        return renderer(slide, lesson);
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>${escapeHtml(lesson.title)} | Academic Workspace</title>

    <link rel="stylesheet" href="../../css/modules.css">
    <link rel="stylesheet" href="../../css/patterns.css">

    <script src="../../js/activity-tracker.js"></script>
    <script src="../../js/essay-handler.js"></script>
    <script src="../../js/report.js"></script>
    <script src="../../js/slide-engine.js" defer></script>
${usesBuildUp ? '    <script src="../../js/build-up.js" defer></script>\n' : ''}    <script src="../../js/pattern-types.js" defer></script>
</head>
<body>
<!-- GENERADO por scripts/patterns/build.js — edita scripts/patterns/lessons/${lesson.sourceFile}, no este archivo -->

<div class="lesson-container">
    <div class="progress-bar">
        <div class="progress-fill" id="progressBar"></div>
    </div>
${slideHtml}

</div>

<script>
    window.onload = () => {
        SlideEngine.init('${lesson.lessonName}');
        ActivityTracker.init('${lesson.lessonName}');
    };
</script>

</body>
</html>
`;
}

function validateLesson(lesson) {
    const required = ['slug', 'key', 'lessonName', 'label', 'part', 'chapter', 'title', 'patternName', 'rubric', 'slides'];
    required.forEach(field => {
        if (lesson[field] === undefined) throw new Error(`${lesson.slug || '?'}: falta el campo "${field}"`);
    });
    if (/[-_]/.test(lesson.lessonName) || lesson.lessonName !== lesson.lessonName.toLowerCase()) {
        throw new Error(`${lesson.slug}: lessonName debe ir en minúsculas y sin guiones ("${lesson.lessonName}")`);
    }
    const essaySlides = lesson.slides.filter(slide => slide.kind === 'essay');
    if (essaySlides.length !== 1) throw new Error(`${lesson.slug}: debe tener exactamente 1 slide "essay"`);
    if (lesson.slides[lesson.slides.length - 1].kind !== 'essay') {
        throw new Error(`${lesson.slug}: el slide "essay" debe ser el último`);
    }
    lesson.slides.filter(slide => slide.kind === 'sort').forEach(slide => {
        if (slide.sentences.length < 3) throw new Error(`${lesson.slug}: sort con menos de 3 oraciones`);
    });
    lesson.slides.filter(slide => slide.kind === 'tag').forEach(slide => {
        slide.segments.forEach(segment => {
            if (!slide.moves.includes(segment.move)) {
                throw new Error(`${lesson.slug}: segmento con move "${segment.move}" fuera de [${slide.moves.join(', ')}]`);
            }
        });
    });
    lesson.slides.filter(slide => slide.kind === 'quiz').forEach(slide => {
        if (slide.options.filter(option => option.correct).length !== 1) {
            throw new Error(`${lesson.slug}: quiz "${slide.title}" debe tener exactamente 1 opción correcta`);
        }
    });
}

function main() {
    const lessonFiles = fs.readdirSync(LESSONS_DIR).filter(fileName => fileName.endsWith('.js')).sort();
    const lessons = lessonFiles.map(fileName => ({ ...require(path.join(LESSONS_DIR, fileName)), sourceFile: fileName }));
    lessons.sort((first, second) => first.order - second.order);

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    lessons.forEach(lesson => {
        validateLesson(lesson);
        const outputPath = path.join(OUTPUT_DIR, `${lesson.slug}.html`);
        fs.writeFileSync(outputPath, renderLesson(lesson), 'utf8');
    });

    // Phrase Bank maestro
    const phraseData = lessons.map(lesson => {
        const phraseSlide = lesson.slides.find(slide => slide.kind === 'phrases');
        return {
            key: lesson.key,
            label: lesson.label,
            title: lesson.patternName,
            file: `${lesson.slug}.html`,
            part: lesson.part,
            groups: phraseSlide ? phraseSlide.groups : []
        };
    }).filter(entry => entry.groups.length);
    fs.writeFileSync(
        PHRASES_OUTPUT,
        `// GENERADO por scripts/patterns/build.js — no editar a mano\nwindow.PATTERN_PHRASES = ${JSON.stringify(phraseData, null, 2)};\n`,
        'utf8'
    );

    // Configuración de integridad por lección (essay_requirements)
    const sqlRows = lessons.map(lesson => {
        const keywordList = (lesson.keywords || []).map(keyword => `"${keyword}": ""`).join(', ');
        // La tabla usa activity_key = lessonName con guiones (ver slide-engine.js: lessonName.replace(/ /g, '-'))
        const lessonTitle = lesson.title.replace(/'/g, "''");
        return `('${lesson.lessonName.replace(/ /g, '-')}', '${lessonTitle}',
    ${lesson.minWords || 40}, ${lesson.maxWords || 250}, 75,
    '{${keywordList}}',
    ${lesson.minKeywordMatches || 1},
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
)`;
    }).join(',\n\n');
    fs.writeFileSync(SQL_OUTPUT, `-- GENERADO por scripts/patterns/build.js — categoría 05. Writing Patterns
-- Ejecutar en el SQL Editor de Supabase. Idempotente (ON CONFLICT).
INSERT INTO essay_requirements
    (activity_key, lesson_title, min_words, max_words, min_integrity_score_required,
     target_keywords, min_keyword_matches, required_markers, forbidden_words)
VALUES

${sqlRows}

ON CONFLICT (activity_key) DO UPDATE SET
    lesson_title = EXCLUDED.lesson_title,
    min_words = EXCLUDED.min_words,
    max_words = EXCLUDED.max_words,
    min_integrity_score_required = EXCLUDED.min_integrity_score_required,
    target_keywords = EXCLUDED.target_keywords,
    min_keyword_matches = EXCLUDED.min_keyword_matches,
    required_markers = EXCLUDED.required_markers,
    forbidden_words = EXCLUDED.forbidden_words;
`, 'utf8');

    // Resumen para nav.js (copiar a MENU)
    console.log(`✅ ${lessons.length} lecciones generadas en modules/05-writing-patterns/`);
    lessons.forEach(lesson => {
        console.log(`  ${String(lesson.order).padStart(2)}  ${lesson.part.padEnd(34)} ${lesson.slug}.html  [${lesson.lessonName}]  slides=${lesson.slides.length}`);
    });
}

main();
