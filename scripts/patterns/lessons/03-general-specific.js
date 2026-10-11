// Capítulo 3 — El patrón general a específico
module.exports = {
    order: 3,
    slug: 'general-specific',
    key: 'general-specific',
    lessonName: 'pattern general specific',
    label: 'General to specific',
    part: 'Part I. Foundations',
    chapter: 3,
    title: 'General to Specific',
    patternName: 'General → Specific',
    keywords: ['general', 'specific', 'focus'],
    minWords: 35,
    maxWords: 150,
    rubric: [
        'My first sentence places the reader in the broad field, without mentioning my particular topic.',
        'Each following sentence is **more specific** than the previous one.',
        'My last sentence names the exact topic or question.',
        'A reader who does not know my field can follow the thread without skipping a sentence.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Academic texts that introduce a topic start far away and end up close. The first sentence situates the reader in a broad field; the next ones narrow the focus until they reach the precise point the text needs to raise. This **general → specific** movement is the most basic pattern of academic writing.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> movimiento de lo general a lo específico (introducciones, definiciones, marcos teóricos). Modelo: Milgram (1963). Prepara CARS (Cap. 13), que es este patrón a escala de sección. Solapa con «Organizational Patterns» de Fundamentals.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'In 1963 Stanley Milgram published one of the most cited articles in the history of psychology. Its introduction opens with three sentences that visibly narrow the field.',
            text: 'Obedience is the psychological mechanism that links individual action to political purpose. It is the dispositional cement that binds men to systems of authority. Facts of recent history and observation in daily life suggest that for many people obedience may be a deeply ingrained behavior tendency, indeed, a prepotent impulse overriding training in ethics, sympathy, and moral conduct.',
            source: 'milgram',
            note: 'Fuente real (Journal of Abnormal and Social Psychology). El artículo continúa estrechando hasta la pregunta experimental exacta; el patrón ya está completo en estas tres oraciones.'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'At what level of generality does each sentence work?',
            moves: ['General', 'Intermediate', 'Specific'],
            segments: [
                { text: 'Obedience is the psychological mechanism that links individual action to political purpose.', move: 'General', why: 'It defines obedience as a universal mechanism. No context, no study: the reader is placed in an enormous field.' },
                { text: 'It is the dispositional cement that binds men to systems of authority.', move: 'Intermediate', why: 'The field narrows: from a psychological mechanism to a concrete social function.' },
                { text: 'Facts of recent history and observation in daily life suggest that for many people obedience may be a deeply ingrained behavior tendency, indeed, a prepotent impulse overriding training in ethics, sympathy, and moral conduct.', move: 'Specific', why: 'It lands on recent historical facts, everyday observation and moral consequences: a concrete problem that justifies research.' }
            ],
            note: 'Clave: General → Intermedio → Específico (Figura 3.1 del libro).'
        },
        {
            kind: 'wave',
            title: 'Why this works: a sustained descent',
            instruction: 'In semantic-wave terms, general → specific is one long descent: the first sentence has maximum abstraction and no data; the last one reverses the proportion.',
            mode: 'show',
            items: [
                { text: 'Obedience is the psychological mechanism that links individual action to political purpose.', level: 3, why: 'High abstraction, no example or data.' },
                { text: 'It is the dispositional cement that binds men to systems of authority.', level: 2, why: 'Still conceptual, but tied to a social function.' },
                { text: 'Facts of recent history and observation in daily life suggest…', level: 1, why: 'Concrete facts and consequences.' }
            ],
            note: '«Establece el terreno antes de sembrar»: por eso es el movimiento por defecto de introducciones y definiciones. Si empieza con un dato muy específico sin preparación, el lector no tiene marco donde ubicarlo.'
        },
        {
            kind: 'tag',
            title: 'Spot the pattern: a second text',
            instruction: 'This is the introduction of a 2023 open-access study. Label the level of each sentence.',
            moves: ['General', 'Intermediate', 'Specific'],
            segments: [
                { text: 'Bilingual advantages in learning novel languages have been attributed to both (i) direct transfer of previous language knowledge and skills and (ii) indirect effects of bilingualism, such as enhanced cognitive and metalinguistic skills (Hirosh and Degani, 2018).', move: 'General', why: 'It situates the reader in an established field of research.' },
                { text: 'Even though the literature on bilingual FL learning advantages is growing rapidly, evidence so far is limited to pupils with typical language development and it is unclear whether such advantages also extend to bilingual children with learning disabilities.', move: 'Intermediate', why: 'It narrows the field to a gap: pupils with typical development versus children with learning disabilities.' },
                { text: 'This paper aims to address this gap by comparing English as a foreign language (EFL) skills of monolingual and bilingual children with developmental language disorder (DLD) attending special education schools in the Netherlands.', move: 'Specific', why: 'It lands on the exact object, population and setting of the study.' }
            ],
            source: 'tribushinina',
            note: 'Mismo texto reaparece como CARS (Cap. 13): «el patrón general a específico a escala de sección completa».'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: restore the funnel',
            instruction: 'These five sentences belong to the introduction of an article about water pollution. Drag them into general → specific order.',
            sentences: [
                'Water pollution is one of the most pressing environmental challenges in developing countries.',
                'Coastal cities that depend on both fishing and tourism face a particular tension between economic productivity and environmental quality.',
                'In Ecuador, industrial and domestic wastewater treatment remains uneven, with coverage gaps concentrated in smaller coastal municipalities.',
                'In the municipality of Manta, untreated wastewater from the tuna processing industry is discharged directly into the estuary of the Río Muerto.',
                'The present study analyzes the concentration of heavy metals in sediment samples collected at five points along the estuary between January and June 2024.'
            ],
            note: '<strong>Orden (Apéndice C):</strong> (b), (c), (e), (a), (d): agua en general → ciudades costeras → Ecuador → Manta → el estudio puntual.'
        },
        {
            kind: 'quiz',
            title: 'Rebuild it: find the jump',
            question: 'A student’s introduction goes from “Education is important in modern society.” straight to “This study measures vocabulary gains in 12 learners in one Manta school in March 2024.” What is the problem?',
            options: [
                { text: 'The first sentence is too specific.' },
                { text: 'The text jumps from a very general level to a very specific one with no intermediate step, so the reader notices the leap.', correct: true },
                { text: 'The second sentence should come first.' }
            ],
            note: '<strong>Respuesta:</strong> B. Pregunta del libro: «¿Hay alguna oración que salte un nivel…? ¿el lector nota el salto?». Solución: añadir una o dos oraciones de nivel intermedio (vocabulario en L2, estudiantes ecuatorianos…).'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find the introduction of an empirical article from your field, published in open access. Read the first three or four sentences.',
            questions: [
                'Which is the most general sentence? What broad field does it set up?',
                'In which sentence is the specific topic of the article first mentioned?',
                'Is there a sentence that skips a level, going from very general to very specific without a transition? Does the reader notice the jump?'
            ],
            note: 'Comparar respuestas con un compañero (consigna del libro).'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: general to specific',
            groups: [
                { label: 'General — open broadly', phrases: ['[Field/Topic] has received increasing attention in recent decades.', '[Topic] is a widely recognized challenge in [discipline/context].', 'Research on [broad area] has grown substantially since [reference point].', '[Topic] remains one of the central concerns in [field].'] },
                { label: 'Intermediate — narrow one level', phrases: ['Within this broader context, [narrower topic] has emerged as a key concern.', 'A particularly relevant aspect of [broad topic] is [specific aspect].', 'Among these factors, [specific factor] has attracted particular interest.', 'In [specific region/context], this issue takes on additional significance.'] },
                { label: 'Specific — reach the exact point', phrases: ['Despite this growth, [specific gap] remains underexplored.', 'The present study addresses this gap by [specific action].', 'This paper examines [specific object] in the context of [specific setting].', 'The aim of this study is to [specific verb + object].'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write in English the <strong>introduction to a topic from your field</strong>, three to five sentences. The first sentence must be the most general; the last, the most specific.',
            checklist: [
                'My first sentence places the reader in the broad field, without mentioning my particular topic.',
                'Each following sentence is more specific than the previous one.',
                'My last sentence names the exact topic or question.',
                'A reader who does not know my field can follow the thread without skipping a sentence.'
            ],
            note: 'Rúbrica propia de la lección (el libro no incluye una en el Apéndice B para este capítulo).'
        }
    ]
};
