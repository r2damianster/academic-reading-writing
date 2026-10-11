// Capítulo 12 (a) — Causa y efecto
module.exports = {
    order: 12,
    slug: 'cause-effect',
    key: 'cause-effect',
    lessonName: 'pattern cause effect',
    label: 'Cause and effect',
    part: 'Part IV. Whole Text Patterns',
    chapter: 12,
    title: 'Cause and Effect',
    patternName: 'Cause and effect',
    keywords: ['since', 'because', 'result', 'leads to'],
    minWords: 45,
    maxWords: 170,
    rubric: [
        'I chose **one** pattern; I did not mix cause and effect with classification in the same paragraph.',
        'I use at least one signal typical of cause and effect (since, due to, as a result of, leads to).',
        'The cause-effect chain is logical: each effect follows from its cause.',
        'A reader who reads only my first sentence can anticipate that this is a cause-effect paragraph.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Three expository patterns organise much of the academic prose that neither argues nor narrates a problem: <strong>cause and effect</strong> (why does something happen?), <strong>classification</strong> (what types exist?) and <strong>process</strong> (how, and in what order?). This lesson covers the first. The next two lessons cover the other two.',
            minutes: 15,
            note: '<strong>Objetivo:</strong> patrón causa-efecto. El Cap. 12 del libro agrupa tres patrones; aquí se separan en tres lecciones breves, con un fragmento real cada una. Cada patrón responde a una pregunta distinta del lector.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This sentence comes from the energy-poverty article you met in the SPRE lesson. Read it looking for the word that connects the cause with its effects.',
            text: 'This phenomenon poses a major barrier towards achieving the UN Sustainable Development Goals (SDGs) and addressing climate change, since lack of access to reliable energy generation systems hinders the development of economic activities and limits the comfort of living conditions.',
            source: 'eustachio'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Label each segment: <strong>Effect</strong>, <strong>Signal</strong> (the connector) or <strong>Cause</strong>.',
            moves: ['Effect', 'Signal', 'Cause'],
            segments: [
                { text: 'This phenomenon poses a major barrier towards achieving the UN Sustainable Development Goals (SDGs) and addressing climate change,', move: 'Effect', why: 'The consequence is stated first: energy poverty is a barrier.' },
                { text: 'since', move: 'Signal', why: '“since” connects cause and effect in the middle of the sentence, not at the start, and still organises the entire relationship.' },
                { text: 'lack of access to reliable energy generation systems', move: 'Cause', why: 'The cause: a lack of access.' },
                { text: 'hinders the development of economic activities and limits the comfort of living conditions.', move: 'Effect', why: 'Two chained effects of the same cause: it hinders economic activity and limits comfort.' }
            ],
            note: 'Libro: «“since” conecta la causa (falta de acceso a energía) con dos efectos encadenados; frena la actividad económica y limita el confort».'
        },
        {
            kind: 'read',
            title: 'Why this works',
            html: `<p>Each pattern answers a different reader question: <strong>cause and effect</strong> answers <em>why does it happen?</em>, <strong>classification</strong> answers <em>what types are there?</em>, <strong>process</strong> answers <em>how, and in what order?</em>.</p>
        <p>Confusing the pattern a text needs is as serious as omitting a move: a reader who expects a classification and receives a causal chain loses the thread, even if every sentence is well written.</p>`,
            note: 'Anclaje: elegir el patrón correcto es una decisión retórica previa a escribir.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: order the causal chain',
            instruction: 'These four sentences form a cause-and-effect chain from a hypothetical article on water pollution. Put them in order, from the first cause to the last effect.',
            sentences: [
                'Untreated wastewater from the processing industry is discharged directly into the estuary.',
                'As a result of this discharge, the concentration of heavy metals in the sediments has risen.',
                'This contamination accumulates in the organisms that feed on the sediment.',
                'Consequently, the fishing communities that depend on those organisms face a health risk.'
            ],
            note: 'Ejercicio de práctica con oraciones construidas. Observar que cada oración retoma el efecto anterior como causa de la siguiente (dado/nuevo, Cap. 2).'
        },
        {
            kind: 'bank',
            title: 'Rebuild it: causal connectors',
            instruction: 'Choose the connector that expresses the cause-effect relationship in each sentence.',
            words: ['since', 'due to', 'as a result of', 'however', 'for example', 'in contrast'],
            sentences: [
                'The harvest declined [[due to]] irregular rainfall over three consecutive seasons.',
                'Prices rose sharply [[since]] imported inputs became more expensive.',
                '[[As a result of]] the policy change, enrolment increased in rural schools.'
            ],
            note: 'Phrase bank del Cap. 12: “X leads to Y, since Z.”, “This is due to…”, “As a result of X, Y occurs.”'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find a short passage in an open-access article from your field that explains <em>why</em> something happens.',
            questions: [
                'Does the passage explain why something happens, what types there are, or how something was done step by step?',
                'Is the signal a single word (since, due to) or a complete structure (leads to, as a result of)?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: cause and effect',
            groups: [
                { label: 'Cause and effect', phrases: ['X leads to Y, since Z.', 'This is due to…', 'As a result of X, Y occurs.', 'This phenomenon poses a barrier, since [cause] hinders [effect].'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write in English a short <strong>cause-and-effect paragraph of three to five sentences</strong> about a topic from your own field. Use a single pattern; do not mix it with classification or process.',
            checklist: [
                'I chose one pattern; I did not mix cause and effect with classification in the same paragraph.',
                'I use at least one signal typical of cause and effect.',
                'The chain is logical: each effect follows from its cause.',
                'A reader who reads only my first sentence can anticipate what kind of paragraph follows.'
            ],
            note: 'Checklist adaptada del Cap. 12 (la lista original cubre los tres patrones).'
        }
    ]
};
