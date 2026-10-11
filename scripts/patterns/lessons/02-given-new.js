// Capítulo 2 — La oración académica: el contrato dado/nuevo y la nominalización ligera
module.exports = {
    order: 2,
    slug: 'given-new',
    key: 'given-new',
    lessonName: 'pattern given new',
    label: 'The academic sentence: given and new',
    part: 'Part I. Foundations',
    chapter: 2,
    title: 'The Academic Sentence: Given and New',
    patternName: 'Given–New and light nominalization',
    keywords: ['this', 'increase', 'reduction', 'analysis'],
    minWords: 35,
    maxWords: 150,
    rubric: [
        'Each sentence after the first picks up, as its starting point, something the previous sentence introduced as new.',
        'At least one **nominalization** packages a process into a noun (increase, reduction, analysis).',
        'The reader can follow the thread without going back and re-reading.',
        'My last sentence is more general or abstract than the first.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Every well-built academic sentence handles two flows at once: it picks up something the reader already knows (**given** information) and delivers something **new**. The grammatical tool that makes this chain possible is the **nominalization**: turning a process into a noun so that what was new becomes the given of the next sentence.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> contrato dado/nuevo (entre oraciones y dentro de una oración) + nominalización ligera. Modelo: Watson y Crick (1953), usado dos veces. Anticipa hedging (Cap. 16).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'In 1953, James Watson and Francis Crick described the double-helix structure of DNA in <em>Nature</em>. We use their article twice. First, the two opening sentences; then the famous final sentence.',
            text: [
                'We wish to suggest a structure for the salt of deoxyribose nucleic acid (D.N.A.). This structure has novel features which are of considerable biological interest.',
                'It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.'
            ],
            source: 'watson',
            note: 'Fuente real. «structure» ya es una nominalización: Watson y Crick empaquetan su propuesta completa en una sola palabra.'
        },
        {
            kind: 'tag',
            title: 'Taking it apart (between sentences)',
            instruction: 'Look at the two opening sentences. Is each segment <strong>Given</strong> (the reader already has it) or <strong>New</strong> (introduced for the first time)?',
            moves: ['Given', 'New'],
            segments: [
                { text: 'We wish to suggest a structure for the salt of deoxyribose nucleic acid (D.N.A.).', move: 'New', why: '“a structure” is introduced here for the first time; all the informational weight falls on that noun.' },
                { text: 'This structure', move: 'Given', why: '“This” tells the reader they already know which structure. What was new is now given.' },
                { text: 'has novel features which are of considerable biological interest.', move: 'New', why: '“novel features” and “biological interest” are new, and could become the given of a third sentence.' }
            ],
            note: '<strong>Mecanismo:</strong> los autores empaquetan algo en un sustantivo («a structure»); la segunda oración lo retoma con «This structure» y avanza.'
        },
        {
            kind: 'tag',
            title: 'Taking it apart (inside one sentence)',
            instruction: 'The final sentence applies the same contract inside a single sentence. Label each segment: <strong>Given</strong>, <strong>Bridge</strong> (the verb that connects) or <strong>New</strong>.',
            moves: ['Given', 'Bridge', 'New'],
            segments: [
                { text: 'the specific pairing we have postulated', move: 'Given', why: 'It picks up something the reader already knows: the base pairing presented pages earlier.' },
                { text: 'immediately suggests', move: 'Bridge', why: 'The verbal bridge from given to new.' },
                { text: 'a possible copying mechanism for the genetic material.', move: 'New', why: '“copying mechanism” packages a whole process (the molecule copies itself) in a noun and raises the level of abstraction.' }
            ],
            note: 'Observación a retomar en el Cap. 16: la oración está envuelta en hedges deliberados («It has not escaped our notice», «suggests», «a possible»).'
        },
        {
            kind: 'read',
            title: 'Why this works',
            html: `<p>The given–new contract imitates how readers process information: first they look for a familiar foothold, then they accept something new resting on it. When a text breaks the contract &mdash; for example, by starting every sentence with a different topic that picks up nothing from the previous one &mdash; the reader feels they are jumping around with no thread.</p>
        <p>At sentence scale, <strong>nominalization</strong> is the grammatical resource that keeps the thread: <em>X increases</em> &rarr; <em>This increase&hellip;</em>; <em>Y was analyzed</em> &rarr; <em>This analysis&hellip;</em>. At paragraph scale, the same move (known anchor, new advance) is organised by patterns such as PEEL.</p>`,
            note: 'Enlace con la lección de Toolbox «Nominalization».'
        },
        {
            kind: 'quiz',
            title: 'Spot the pattern: Darwin',
            question: 'Here is the last sentence of <em>On the Origin of Species</em> (Darwin, 1859): “There is grandeur in <strong>this view of life</strong>, with its several powers, having been originally breathed into a few forms or into one…” Within the book, what role does the phrase <em>“this view of life”</em> play?',
            options: [
                { text: 'Given information: the reader already knows the view of life developed in the book.', correct: true },
                { text: 'New information: it is introduced here for the first time.' }
            ],
            note: '<strong>Respuesta:</strong> A. «this» marca información ya conocida por el lector tras todo el libro. Fuente: Darwin (1859), dominio público.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: restore the chain',
            instruction: 'These three sentences come from a hypothetical scientific text. Put them in the order that makes each sentence pick up as given something the previous one presented as new.',
            sentences: [
                'Deforestation in tropical regions has accelerated significantly over the past decade.',
                'The resulting habitat loss has led to a measurable reduction in local biodiversity.',
                'This reduction in biodiversity has prompted conservation efforts across multiple countries.'
            ],
            note: '<strong>Orden (libro, Apéndice C):</strong> (b), (c), (a). «Deforestation» introduce el proceso; «The resulting habitat loss» lo retoma; «This reduction» retoma la reducción que la anterior presentó como nueva. Nominalizaciones: <em>deforestation, habitat loss, reduction, efforts</em>.'
        },
        {
            kind: 'fill',
            title: 'Rebuild it: nominalize the process',
            instruction: 'Complete each second sentence with the noun that packages the process of the first sentence.',
            sentences: [
                'Prices increased sharply in 2023. This [[increase]] affected low-income households.',
                'The samples were analyzed in two laboratories. This [[analysis]] revealed no significant difference.',
                'The solution reacted with the metal. This [[reaction]] produced a measurable amount of heat.',
                'The research team observed the effect in both groups. This [[observation]] supports the original hypothesis.'
            ],
            note: 'Ejercicio de práctica (oraciones construidas, no de corpus). Corresponde a la tabla «Nominalización (proceso → sustantivo)» del Phrase bank del libro.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: extend the chain',
            sourceHtml: '(a) Deforestation in tropical regions has accelerated significantly over the past decade.<br>(b) The resulting habitat loss has led to a measurable reduction in local biodiversity.<br>(c) This reduction in biodiversity has prompted conservation efforts across multiple countries.',
            prompt: 'Write a <strong>fourth sentence</strong> that continues the chain. It must take as its given topic something that sentence (c) presented as new, and it should use a nominalization.',
            rubric: [
                { points: 5, text: 'The fourth sentence starts from something new in sentence (c) (for example, “conservation efforts” or “these efforts”) and uses it as its given information.' },
                { points: 5, text: 'The sentence adds genuinely new information and contains a nominalization (for example, “This expansion…”, “This protection…”) in academic English.' }
            ],
            note: 'Ejemplos válidos: «These conservation efforts have so far focused on protected areas, with uneven results.» / «This protection has been uneven.» Lo esencial: tomar como tema algo nuevo de (c).'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Choose a paragraph from an open-access article in your field. Underline the nominalizations that link one sentence with the next.',
            questions: [
                'Which words at the start of each sentence pick up something from the previous one?',
                'Which nouns package a process (increase, reduction, development, analysis)?',
                'Is there any sentence where you had to go back to understand the link? What is missing?'
            ],
            note: 'Actividad no calificada, complementaria al ejercicio Darwin del libro.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: given and new',
            groups: [
                { label: 'Given–New contract', phrases: ['This [noun] suggests that…', 'Such [noun] indicates…', 'These findings point to…', 'The resulting [noun]…', 'This pattern is consistent with…'] },
                { label: 'Nominalization (process → noun)', phrases: ['X increases → This increase…', 'Y was analyzed → This analysis…', 'Z reacted → This reaction…', 'The team observed → This observation…'] },
                { label: 'Hedging (preview of the Metadiscourse lesson)', phrases: ['It has not escaped our notice that…', 'These results suggest that…', 'One possible explanation is that…'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 10,
            promptHtml: 'Write a short paragraph in English, <strong>three to five sentences</strong>, about a process or phenomenon in your own field. Chain the sentences using the given–new contract, with <strong>at least one nominalization</strong> that turns a process into a noun.',
            checklist: [
                'Every sentence after the first picks up, as its topic, something the previous sentence introduced as new.',
                'I use at least one nominalization that packages a process into a noun (increase, reduction, development, analysis).',
                'The reader can follow the thread without re-reading; if they have to go back, the chain is broken.',
                'My last sentence is more general or abstract than the first.'
            ],
            note: 'Revisar con la rúbrica de la lección. Si el estudiante repite el mismo sujeto en cada oración sin retomar nada, la cadena dado/nuevo está rota.'
        }
    ]
};
