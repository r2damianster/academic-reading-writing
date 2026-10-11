// Capítulo 12 (c) — Descripción de proceso
module.exports = {
    order: 14,
    slug: 'process',
    key: 'process',
    lessonName: 'pattern process',
    label: 'Process description',
    part: 'Part IV. Whole Text Patterns',
    chapter: 12,
    title: 'Process Description',
    patternName: 'Process description',
    keywords: ['first', 'then', 'finally', 'were'],
    minWords: 45,
    maxWords: 170,
    rubric: [
        'I chose **one** pattern; I did not mix process with cause and effect or classification.',
        'I use at least one signal or verb sequence that marks the order of the steps.',
        'The order of the steps is unambiguous, even if I do not use first/then in every sentence.',
        'A reader who reads only my first sentence can anticipate that a process follows.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'A **process description** orders a sequence of steps and answers the reader’s question: <em>how, and in what order?</em> It is the pattern that most often works <strong>without visible signals</strong>: real methods rely on the order of the verbs, not on first, then and finally.',
            minutes: 15,
            note: '<strong>Objetivo:</strong> proceso con fragmento real (Faytong-Haro, 2025). Lección clave: no depender solo de first/then.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This sentence pair comes from the methods section of the spaced-retrieval study. Look for any “first”, “then” or “finally”.',
            text: 'Participants completed a pretest and posttest, during which their oral responses were recorded and analyzed using PRAAT software to measure MLR and AR. Target Vocabulary Usage was also calculated through percentage comparisons.',
            source: 'faytong'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Even without first/then, the order is clear. Put each segment in its step.',
            moves: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
            segments: [
                { text: 'Participants completed a pretest and posttest,', move: 'Step 1', why: 'The task comes first: “completed”.' },
                { text: 'during which their oral responses were recorded', move: 'Step 2', why: '“during which” places the recording inside the task.' },
                { text: 'and analyzed using PRAAT software to measure MLR and AR.', move: 'Step 3', why: 'The chain of verbs (recorded and analyzed) carries the sequence.' },
                { text: 'Target Vocabulary Usage was also calculated through percentage comparisons.', move: 'Step 4', why: 'A further step in the procedure, marked only by “also calculated”.' }
            ],
            note: '«No hay marcadores explícitos como first o then. La secuencia se sostiene con verbos encadenados… y con la conjunción “during which”.»'
        },
        {
            kind: 'read',
            title: 'Why this works',
            html: `<p>Real methods rarely mark each step with <em>first, then, finally</em>; they trust the reader to follow the <strong>chain of verbs</strong>.</p>
        <p>When your own process is confusing, the solution is not always adding connectors: sometimes it is enough to <strong>order the verbs better</strong>.</p>`,
            note: 'Moraleja del Cap. 12: no depender solo de los señalizadores para reconocer ni para escribir un proceso.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: order the steps',
            instruction: 'These four sentences describe a data-collection method, but they are out of order. Drag them into the sequence in which the steps happened.',
            sentences: [
                'Participants were first asked to complete a background questionnaire.',
                'They then completed a timed writing task under controlled conditions.',
                'Their responses were subsequently recorded for later analysis.',
                'Finally, the recordings were transcribed and coded by two independent raters.'
            ],
            note: '<strong>Orden (libro):</strong> (b), (c), (d), (a). Verificar que cada paso dependa lógicamente del anterior.'
        },
        {
            kind: 'quiz',
            title: 'How is the order carried?',
            question: 'A methods paragraph contains no “first”, “then” or “finally”, yet the order of the steps is clear. What carries the sequence?',
            options: [
                { text: 'The chain of verbs and linking structures such as “during which”.', correct: true },
                { text: 'The citations in parentheses.' },
                { text: 'The tense of the first sentence only.' }
            ],
            note: '<strong>Respuesta:</strong> A.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: process',
            groups: [
                { label: 'Process', phrases: ['First, X was done. Then, Y followed.', 'The process began with X and concluded with Y.', 'Participants completed [task], during which [measure] was recorded.'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write in English a short <strong>process paragraph of three to five sentences</strong> describing how something is done in your field (a method, a procedure, a routine). Make the order of the steps unambiguous.',
            checklist: [
                'I chose one pattern; I did not mix process with cause and effect or classification.',
                'I use at least one signal or verb sequence that marks the order of the steps.',
                'The order of the steps is unambiguous, even if I do not use first/then in every sentence.',
                'A reader who reads only my first sentence can anticipate that a process follows.'
            ],
            note: 'Si el proceso es confuso, revisar el orden de los verbos antes de añadir conectores.'
        }
    ]
};
