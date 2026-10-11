// Capítulo 13 — CARS: introducciones que crean un espacio de investigación
module.exports = {
    order: 15,
    slug: 'cars',
    key: 'cars',
    lessonName: 'pattern cars',
    label: 'CARS: article introductions',
    part: 'Part IV. Whole Text Patterns',
    chapter: 13,
    title: 'CARS: Introductions That Create a Research Space',
    patternName: 'CARS (Swales)',
    keywords: ['however', 'this study', 'gap', 'research'],
    minWords: 45,
    maxWords: 170,
    rubric: [
        'My first sentence establishes the **territory** with a general claim or a reference to previous research.',
        'My second sentence opens a clear **niche**, with a connector such as <em>however</em> or a word such as <em>unclear</em>.',
        'My third sentence **occupies the niche** and announces what my study or text will do.',
        'A reader who reads only these three sentences understands why my text exists.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'General → specific organises a sentence; **CARS** applies the same logic to a whole article introduction. John Swales identified three moves that almost every academic introduction performs, in order: **establish a territory**, **establish a niche** and **occupy the niche**.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> Create a Research Space (Swales, 1990). Modelo: Tribushinina y Mackaaij (2023), ahora leído a escala de introducción. Relación: SPRE escalado = CARS; es general→específico a escala de sección.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This is the complete introduction of the bilingual-advantage article you met in the Toulmin lesson, read now at introduction scale.',
            text: [
                'Bilingual advantages in learning novel languages have been attributed to both (i) direct transfer of previous language knowledge and skills and (ii) indirect effects of bilingualism, such as enhanced cognitive and metalinguistic skills (Hirosh and Degani, 2018).',
                'Even though the literature on bilingual FL learning advantages is growing rapidly, evidence so far is limited to pupils with typical language development and it is unclear whether such advantages also extend to bilingual children with learning disabilities.',
                'This paper aims to address this gap by comparing English as a foreign language (EFL) skills of monolingual and bilingual children with developmental language disorder (DLD) attending special education schools in the Netherlands.'
            ],
            source: 'tribushinina'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Choose the CARS move of each sentence.',
            moves: ['Establish a territory', 'Establish a niche', 'Occupy the niche'],
            segments: [
                { text: 'Bilingual advantages in learning novel languages have been attributed to both (i) direct transfer of previous language knowledge and skills and (ii) indirect effects of bilingualism… (Hirosh and Degani, 2018).', move: 'Establish a territory', why: 'The authors affirm that the phenomenon is already a recognised object of research, with two documented lines of explanation. The topic matters because others have studied it.' },
                { text: 'Even though the literature on bilingual FL learning advantages is growing rapidly, evidence so far is limited to pupils with typical language development and it is unclear whether such advantages also extend to bilingual children with learning disabilities.', move: 'Establish a niche', why: '“Even though” signals the turn: the territory is validated, and immediately a crack opens. The key word is “unclear”.' },
                { text: 'This paper aims to address this gap by comparing English as a foreign language (EFL) skills of monolingual and bilingual children with developmental language disorder (DLD)…', move: 'Occupy the niche', why: '“address this gap” literally picks up “gap” from the previous sentence: the reader watches the niche close in real time.' }
            ],
            note: 'Embudo de CARS (Figura 13.1). Move 2 es el corazón retórico: «Sin un Move 2 claro, el lector no entiende por qué debería seguir leyendo.»'
        },
        {
            kind: 'categorize',
            title: 'Spot the pattern: signal phrases',
            instruction: 'Each phrase is a typical signal of one CARS move. Drag it to the right one.',
            items: [
                { text: '[Topic] has received increasing attention in recent years.', category: 'territory' },
                { text: 'Research has attributed [phenomenon] to both X and Y.', category: 'territory' },
                { text: 'However, it remains unclear whether...', category: 'niche' },
                { text: 'Despite this progress, few studies have examined...', category: 'niche' },
                { text: 'This paper aims to address this gap by...', category: 'occupy' },
                { text: 'The present study examines...', category: 'occupy' }
            ],
            zones: [
                { id: 'territory', label: 'Move 1: Establish a territory' },
                { id: 'niche', label: 'Move 2: Establish a niche' },
                { id: 'occupy', label: 'Move 3: Occupy the niche' }
            ],
            note: 'Phrase bank del Cap. 13. Señales del nicho: however, yet, but; palabras como unclear, limited, remains unknown.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: restore the three moves',
            instruction: 'These three sentences belong to the introduction of an article on subtitles and language learning. Put them in CARS order.',
            sentences: [
                'Subtitled video has been widely studied as a tool for incidental vocabulary acquisition in second language learners.',
                'However, most studies have examined subtitles in fiction and entertainment content, and it remains unclear whether the same benefits apply to academic or documentary material.',
                'The present study addresses this gap by comparing vocabulary gains among learners who watched subtitled academic documentaries with those who watched the same content without subtitles.'
            ],
            note: '<strong>Orden (Apéndice C):</strong> (b), (a), (c): territorio sobre subtítulos y vocabulario → nicho (falta de estudios con material académico) → ocupación (estudio presente).'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find the introduction of an empirical article from your field in open access. Read the first full paragraph and identify the three moves.',
            questions: [
                'Which sentence establishes the territory, with general claims or citations to previous studies?',
                'Which sentence opens the niche? Look for connectors such as however, yet, but, or words such as unclear, limited, remains.',
                'Which sentence occupies the niche? It often starts with “this study”, “this paper” or “we aim to”.'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: CARS',
            groups: [
                { label: 'Move 1 — establish a territory', phrases: ['[Topic] has received increasing attention in recent years.', 'Research has attributed [phenomenon] to both X and Y.'] },
                { label: 'Move 2 — establish a niche', phrases: ['However, it remains unclear whether...', 'Despite this progress, few studies have examined...'] },
                { label: 'Move 3 — occupy the niche', phrases: ['This paper aims to address this gap by...', 'The present study examines...'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write in English a <strong>three-sentence introduction</strong> for a topic from your field, following the three CARS moves.',
            checklist: [
                'My first sentence establishes the territory with a general claim or a reference to previous research.',
                'My second sentence opens a clear niche, with a connector such as however or a word such as unclear.',
                'My third sentence occupies the niche and announces what my study or text will do.',
                'A reader who reads only these three sentences understands why my text exists.'
            ],
            note: 'Error frecuente: omitir el nicho (pasar del territorio directamente a «This study…»).'
        }
    ]
};
