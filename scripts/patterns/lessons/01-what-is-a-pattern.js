// Capítulo 1 — Qué es un patrón de escritura
module.exports = {
    order: 1,
    slug: 'what-is-a-pattern',
    key: 'what-is-a-pattern',
    lessonName: 'pattern what is a pattern',
    label: 'What is a writing pattern?',
    part: 'Part I. Foundations',
    chapter: 1,
    title: 'What Is a Writing Pattern?',
    generalCriteria: false,
    patternName: 'Writing patterns',
    keywords: ['pattern', 'move', 'structure'],
    minWords: 30,
    maxWords: 150,
    rubric: [],
    slides: [
        {
            kind: 'intro',
            objective: 'Academic writing is far more predictable than it looks. Behind the variety of articles, essays and reports there is a small repertoire of structures that repeat. In this lesson you learn what a **pattern** and a **move** are, and how this course will use them.',
            minutes: 15,
            note: '<strong>Objetivo:</strong> marco conceptual de toda la categoría. Define patrón y move (Swales), las tres escalas y la secuencia fija de siete etapas. No tiene modelo real porque es un capítulo conceptual.'
        },
        {
            kind: 'read',
            title: 'Patterns are functional skeletons',
            html: `<p>A <strong>pattern</strong> is a functional skeleton that repeats because it answers what the academic reader expects to find. Each of its components is called a <strong>move</strong>, a term coined by John Swales for every rhetorical step that performs a recognisable function inside a text.</p>
        <p>The idea is very old: Aristotle defined rhetoric as the ability to see, in each case, what is available to persuade. Every pattern in this course is a modern answer to that ancient problem: how to arrange words so they do their job for the reader.</p>
        <p><strong>A pattern is not a straitjacket or a fill-in-the-blanks recipe.</strong> It is a learning scaffold. Expert writers master patterns so well that they can break them on purpose &mdash; and the last lesson of this category is about exactly that.</p>`,
            note: 'Aristóteles (trad. 1990) y Swales (1990) como marco. Insistir en «andamios, no jaulas» (Wesley, 2000 se discute en la última lección).'
        },
        {
            kind: 'categorize',
            title: 'Three scales of pattern',
            instruction: 'Patterns work at different scales. Drag each pattern to the scale where it operates.',
            items: [
                { text: 'Moving from information the reader already knows to new information', category: 'sentence' },
                { text: 'PEEL: Point, Evidence, Explanation, Link', category: 'paragraph' },
                { text: 'Problem and solution (Situation, Problem, Response, Evaluation)', category: 'paragraph' },
                { text: 'The three moves of an article introduction', category: 'section' },
                { text: 'Introduction, Methods, Results and Discussion', category: 'section' }
            ],
            zones: [
                { id: 'sentence', label: 'Inside the sentence' },
                { id: 'paragraph', label: 'A whole paragraph' },
                { id: 'section', label: 'A section or whole text' }
            ],
            note: '<strong>Clave:</strong> oración (dado/nuevo), párrafo (PEEL, SPRE), sección/texto (CARS, IMRaD). El libro recorre el repertorio «de menor a mayor escala».'
        },
        {
            kind: 'read',
            title: 'The wave: up and down between abstract and concrete',
            html: `<p>One idea will accompany you throughout: good academic paragraphs move up and down between the abstract and the concrete, like a <strong>wave</strong>. They present a general idea, descend into data and examples, and climb back to say what it all means.</p>
        <p>When a paragraph does not work, it is almost always stuck <em>up</em> (pure abstraction) or <em>down</em> (data with no interpretation).</p>`,
            note: 'Anticipo de la onda semántica (Cap. 2–4). Se retoma con el ejercicio WAVE en cada lección.'
        },
        {
            kind: 'match',
            title: 'Key terms',
            instruction: 'Match each term with its meaning.',
            pairs: [
                { left: 'Pattern', right: 'A functional skeleton that repeats because it answers what the reader expects' },
                { left: 'Move', right: 'One rhetorical step that performs a recognisable function in a text' },
                { left: 'Semantic wave', right: 'The rise and fall between abstract ideas and concrete details' }
            ],
            note: 'Si el estudiante falla «Move», recordar que es término de Swales (1990).'
        },
        {
            kind: 'quiz',
            title: 'What patterns are for',
            question: 'Your paragraph does not convince the reader. According to this lesson, how can a pattern help you?',
            options: [
                { text: 'It writes the paragraph for you if you fill in the blanks.' },
                { text: 'It lets you compare your paragraph with the pattern and discover which move is missing or out of place.', correct: true },
                { text: 'It guarantees that the paragraph will receive a high grade.' }
            ],
            note: '<strong>Tres funciones (libro):</strong> reducen la carga cognitiva, alinean el texto con las expectativas del lector académico, y sirven de instrumento de diagnóstico.'
        },
        {
            kind: 'read',
            title: 'How every lesson works',
            html: `<p>From the next lesson on, each pattern is taught in the same seven steps:</p>
        <ol>
            <li><strong>The model</strong> &mdash; a real, published passage with its full reference. We never work with invented examples.</li>
            <li><strong>Taking it apart</strong> &mdash; you label the passage move by move.</li>
            <li><strong>Why this works</strong> &mdash; a short explanation, often with the wave.</li>
            <li><strong>Spot the pattern</strong> &mdash; you recognise the pattern in a second text.</li>
            <li><strong>Rebuild it</strong> &mdash; you order, complete or repair a text.</li>
            <li><strong>Now you write</strong> &mdash; your own paragraph, with a checklist.</li>
            <li><strong>Phrase bank</strong> &mdash; template phrases to save in your personal notebook.</li>
        </ol>
        <p>Keep a notebook of phrases: every time a phrase bank is useful, save it and extend it with examples from your own field.</p>`,
            note: 'Secuencia fija de siete secciones (Cap. 1, «Cómo usar este libro»). Los modelos provienen de un corpus de 11 fuentes de acceso abierto (Apéndice D).'
        },
        {
            kind: 'essay',
            minutes: 8,
            promptHtml: 'In <strong>three to five sentences</strong>, describe in English a text from your field that you have read recently (an article, a textbook chapter, a report). What <em>structure</em> did it repeat? For example: how did its paragraphs usually begin and end?',
            checklist: [
                'I name the type of text I am describing.',
                'I describe at least one structure that repeats (for example, how paragraphs start or end).',
                'I use my own words; I do not copy phrases from the text.'
            ],
            note: 'Actividad diagnóstica. No hay rúbrica de patrón; sirve para detectar qué estructuras ya reconocen los estudiantes.'
        }
    ]
};
