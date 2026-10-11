// Capítulo 12 (b) — Clasificación
module.exports = {
    order: 13,
    slug: 'classification',
    key: 'classification',
    lessonName: 'pattern classification',
    label: 'Classification',
    part: 'Part IV. Whole Text Patterns',
    chapter: 12,
    title: 'Classification',
    patternName: 'Classification',
    keywords: ['classified', 'categories', 'types'],
    minWords: 40,
    maxWords: 170,
    rubric: [
        'I chose **one** pattern; I did not mix classification with cause and effect in the same paragraph.',
        'I use at least one signal typical of classification (classified as, divided into, types, categories).',
        'The categories are clearly distinguished and none is missing from the scheme.',
        'A reader who reads only my first sentence can anticipate that a classification follows.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'A **classification** divides a concept into categories and answers the reader’s question: <em>what types are there?</em> Its signature is a verb that announces the pattern and an enumeration that makes the limits of each category visible.',
            minutes: 15,
            note: '<strong>Objetivo:</strong> patrón de clasificación con un fragmento real (Lozano-Argüelles y Martínez-Gómez, 2025). Nota para el docente: el ejercicio «cuarta categoría» del libro tiene la clave desalineada con la consigna (la clave habla de lenguas A, B, C de la AIIC); aquí se usa la clasificación de la AIIC.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This sentence comes from an open-access article about translation and interpreting training. Find the verb that announces the pattern.',
            text: 'The International Association of Conference Interpreters (AIIC) classifies interpreters’ working languages as A (native/active), B (non-native but near-native, also active), and C (passive, used for comprehension only).',
            source: 'lozano'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Label each segment: <strong>Classifier</strong> (announces the pattern) or <strong>Category</strong>.',
            moves: ['Classifier', 'Category'],
            segments: [
                { text: 'The International Association of Conference Interpreters (AIIC) classifies interpreters’ working languages as', move: 'Classifier', why: 'The verb “classifies” announces the pattern from the first clause.' },
                { text: 'A (native/active),', move: 'Category', why: 'Each letter gets its own definition in parentheses.' },
                { text: 'B (non-native but near-native, also active),', move: 'Category', why: 'The limits of each category are visible through its definition.' },
                { text: 'and C (passive, used for comprehension only).', move: 'Category', why: 'The enumeration “as A…, B…, and C…” closes the scheme.' }
            ],
            note: '«La enumeración hace visibles los límites de cada categoría; cada letra recibe su propia definición entre paréntesis.»'
        },
        {
            kind: 'categorize',
            title: 'Rebuild it: apply the scheme',
            instruction: 'Using the AIIC scheme above, place each description in the right category.',
            items: [
                { text: 'The interpreter’s native language, which they use actively', category: 'A' },
                { text: 'A non-native language mastered at near-native level and used actively', category: 'B' },
                { text: 'A language the interpreter only understands, without speaking it in the booth', category: 'C' },
                { text: 'A language used only for comprehension', category: 'C' }
            ],
            zones: [
                { id: 'A', label: 'A language' },
                { id: 'B', label: 'B language' },
                { id: 'C', label: 'C language' }
            ],
            note: 'Aplicación directa de la clasificación del modelo.'
        },
        {
            kind: 'fill',
            title: 'Rebuild it: complete the classification',
            instruction: 'Complete the key word of the classification.',
            sentences: [
                'The AIIC [[classifies]] interpreters’ working languages as A, B, and C.',
                'C languages are passive and used for [[comprehension]] only.',
                'B languages are non-native but near-native, and are also [[active]].'
            ],
            note: 'Respuestas derivadas del modelo.'
        },
        {
            kind: 'quiz',
            title: 'Is it a classification?',
            question: 'Which sentence is a <strong>classification</strong> and not a cause-effect or process sentence?',
            options: [
                { text: 'Sediment contamination rose because wastewater was discharged into the estuary.' },
                { text: 'Heavy metals can be classified into three groups according to their toxicity.', correct: true },
                { text: 'Samples were first collected, then filtered and finally analysed.' }
            ],
            note: '<strong>Respuesta:</strong> B («can be classified into…»). A es causa-efecto («because»); C es proceso («first… then… finally»).'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: classification',
            groups: [
                { label: 'Classification', phrases: ['X can be classified into three types.', 'X is divided into A, B, and C.', 'One way to categorize X is by…', '[Field] classifies [concept] as A, B, and C.'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write in English a short <strong>classification paragraph of three to five sentences</strong> about a concept from your field. Name the criterion you use to divide it and define each category.',
            checklist: [
                'I chose one pattern; I did not mix classification with cause and effect in the same paragraph.',
                'I use at least one classification signal (classified as, divided into, types, categories).',
                'The categories are clearly distinguished and none is missing from the scheme.',
                'A reader who reads only my first sentence can anticipate that a classification follows.'
            ],
            note: 'Error frecuente: categorías que se solapan o falta una que completa el esquema.'
        }
    ]
};
