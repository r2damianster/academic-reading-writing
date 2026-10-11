// Capítulo 11 — Comparación en bloque y alternada
module.exports = {
    order: 11,
    slug: 'comparison',
    key: 'comparison',
    lessonName: 'pattern comparison',
    label: 'Comparison: block and alternating',
    part: 'Part IV. Whole Text Patterns',
    chapter: 11,
    title: 'Comparison: Block and Alternating',
    patternName: 'Comparison (block and alternating)',
    keywords: ['whereas', 'in contrast', 'similarly', 'both'],
    minWords: 90,
    maxWords: 260,
    rubric: [
        'I chose block or alternating according to the **number of points** of comparison.',
        'Each point of comparison appears for **both** elements, not just one.',
        'I use comparison and contrast connectors (whereas, in contrast, similarly).',
        'My conclusion says **what the comparison means**; it does not just summarise it.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'When a text compares two approaches, studies or phenomena it has two structural options. The **block** scheme presents everything about A and then everything about B. The **alternating** scheme presents one point of comparison at a time, alternating A and B. Both are legitimate; each fits a different situation.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> elegir esquema según el número de puntos y el lector. Modelo adaptado de Van der Slik et al. (2015). Error frecuente: comparación incompleta (A con detalle, B apenas mencionado).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This passage, adapted from the abstract of the 2015 study on the gender gap, organises a comparison between two types of language skills. Decide whether it follows a block or an alternating scheme.',
            text: 'The gender gap in second language acquisition is not uniform across language modalities. In productive skills, the gap is pronounced: female learners consistently outperformed male learners in speaking and writing proficiency, and this advantage persisted after controlling for education, age of arrival, length of residence, and hours studying Dutch. In receptive skills, the picture is different: for reading and listening, no significant gender difference was found. This contrast suggests that the advantage is tied specifically to the demands of language production rather than to a general cognitive difference between male and female learners.',
            source: 'vanderslik',
            adapted: true
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Label the role of each segment in the comparison.',
            moves: ['Frame', 'A (productive skills)', 'B (receptive skills)', 'Synthesis'],
            segments: [
                { text: 'The gender gap in second language acquisition is not uniform across language modalities.', move: 'Frame', why: 'It announces that the comparison is about modalities.' },
                { text: 'In productive skills, the gap is pronounced: female learners consistently outperformed male learners in speaking and writing proficiency…', move: 'A (productive skills)', why: 'Finding plus evidence for A.' },
                { text: 'In receptive skills, the picture is different: for reading and listening, no significant gender difference was found.', move: 'B (receptive skills)', why: 'A contrasting finding for B, placed right next to A.' },
                { text: 'This contrast suggests that the advantage is tied specifically to the demands of language production…', move: 'Synthesis', why: 'The comparison produces a conclusion: it interprets the contrast instead of just listing it.' }
            ],
            note: 'Esquema <strong>alternado</strong>: punto por punto. Si el mismo contenido fuese en bloque, el primer párrafo traería todo sobre destrezas productivas y el segundo todo sobre las receptivas, con la síntesis al final.'
        },
        {
            kind: 'quiz',
            title: 'Block or alternating?',
            question: 'A literature review compares two theories across <strong>eight</strong> criteria, and the reader needs a complete picture of Theory A before taking in Theory B. Which scheme fits better?',
            options: [
                { text: 'Block: it suits many points of comparison and a reader who needs the full picture of A first.', correct: true },
                { text: 'Alternating: it suits many points because it never repeats the subjects.' }
            ],
            note: '<strong>Respuesta:</strong> A. En bloque conviene cuando hay muchos puntos (revisiones largas); alternado, cuando hay pocos y el interés está en el contraste inmediato.'
        },
        {
            kind: 'categorize',
            title: 'Spot the pattern: comparison signals',
            instruction: 'Drag each signal to the relationship it marks.',
            items: [
                { text: 'Similarly, X also…', category: 'similarity' },
                { text: 'Both X and Y share…', category: 'similarity' },
                { text: 'In contrast, Y…', category: 'contrast' },
                { text: 'Whereas X [verb], Y [verb]…', category: 'contrast' },
                { text: 'Unlike X, Y…', category: 'contrast' },
                { text: 'The key difference between X and Y lies in…', category: 'contrast' }
            ],
            zones: [
                { id: 'similarity', label: 'Similarity' },
                { id: 'contrast', label: 'Contrast' }
            ],
            note: 'Phrase bank del Cap. 11.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: from block to alternating',
            sourceHtml: '“Explicit vocabulary instruction involves the teacher selecting target words, presenting definitions, and designing practice activities around those words. Students typically learn 8 to 10 words per lesson and retain them well on immediate posttests. Incidental vocabulary acquisition, by contrast, occurs when learners encounter unknown words during extensive reading without direct instruction. The number of words acquired per session is lower, usually 1 to 3, but the learning is embedded in meaningful context and may produce deeper retention over time.”',
            prompt: 'This paragraph compares two approaches in <strong>block</strong> format. Rewrite it in <strong>alternating</strong> format without losing any point of comparison.',
            rubric: [
                { points: 5, text: 'The rewrite is organised point by point (how words are presented, words learned per session, retention), treating both explicit instruction and incidental acquisition at each point, with no point lost.' },
                { points: 5, text: 'It uses visible comparison connectors (whereas, in contrast, by contrast, unlike) and keeps an academic register.' }
            ],
            note: '<strong>Solución (Apéndice C):</strong> la conversión organiza la comparación punto por punto: cantidad de palabras por sesión en ambos métodos, después la retención, después el contexto, en lugar de todo un método y luego todo el otro.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find a review article from your field in open access. Read a paragraph where the author compares two methods, two theories or two results.',
            questions: [
                'Does the paragraph follow a block scheme (all A, then all B) or an alternating one (point by point)?',
                'Which connectors does the author use to mark the comparison (similarly, in contrast, whereas, on the other hand)?',
                'Does the comparison end with a synthesis that interprets the contrast, or must the reader draw the conclusion?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: comparison',
            groups: [
                { label: 'Similarity', phrases: ['Similarly, X also…', 'Both X and Y share…'] },
                { label: 'Contrast', phrases: ['In contrast, Y…', 'Whereas X [verb], Y [verb]…', 'Unlike X, Y…', 'The key difference between X and Y lies in…', 'While X tends to…, Y is more likely to…'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Choose two approaches, methods or theories from your field. Write in English a comparative paragraph of <strong>six to eight sentences</strong>. Decide <em>before</em> writing whether you will use a block or an alternating scheme, and justify your choice in one sentence at the end.',
            checklist: [
                'Each point of comparison appears for both elements (A and B).',
                'The comparison connectors are visible (similarly, in contrast, whereas, however).',
                'The paragraph closes with a synthesis that interprets the contrast.',
                'If I switch scheme (block to alternating or vice versa), I do not lose any point.'
            ],
            note: 'Rúbrica de comparación (Apéndice B).'
        }
    ]
};
