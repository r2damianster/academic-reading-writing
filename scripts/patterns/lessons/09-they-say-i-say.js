// Capítulo 9 — They Say / I Say: entrar en la conversación académica
module.exports = {
    order: 9,
    slug: 'they-say-i-say',
    key: 'they-say-i-say',
    lessonName: 'pattern they say i say',
    label: 'They Say / I Say',
    part: 'Part III. Building Arguments',
    chapter: 9,
    title: 'They Say / I Say: Entering the Academic Conversation',
    argumentative: true,
    patternName: 'They Say / I Say',
    keywords: ['argues', 'however', 'evidence'],
    minWords: 70,
    maxWords: 240,
    rubric: [
        'My **They Say** summarises the other position with an appropriate reporting verb, without distorting it.',
        'The **pivot** between They Say and I Say is visible (however, yet, while, by contrast).',
        'My **I Say** is not just an opinion: it includes at least one datum, example or reference.',
        'The tone of my disagreement is academic, not personal or dismissive.',
        'A reader who does not know the sources can follow the argument without getting lost.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Until now each pattern organised ideas inside a paragraph. This one organises the relationship between **your voice and the voices of other researchers**: first you say what others say (**They Say**), then what you say (**I Say**). A student who gives only their opinion writes in a vacuum; one who only summarises sources writes a report, not an argument.',
            minutes: 25,
            note: '<strong>Objetivo:</strong> Graff y Birkenstein (2014). Modelo: Ellis (2009), debate Truscott–Ferris. Conecta con verbos de reporte (Toolbox) y con la concesión rogeriana (Cap. 10) y los hedges/boosters (Cap. 16).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'In this open-access article on corrective feedback, the author does not defend a position of his own: he narrates a real debate between two researchers and closes it with his own judgement. Notice the reporting verbs.',
            text: 'Truscott, reflecting the views of teachers who adhere to process theories of writing, advanced the strong claim that correcting learners’ errors in a written composition may enable them to eliminate the errors in a subsequent draft but has no effect on grammatical accuracy in a new piece of writing (i.e., it does not result in acquisition). Ferris disputed this claim, arguing that it was not possible to dismiss correction in general as it depended on the quality of the correction—in other words, if the correction was clear and consistent it would work for acquisition. Truscott replied by claiming that Ferris failed to cite any evidence in support of her contention. To correct or not to correct written errors, then, remains contentious…',
            source: 'ellis'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Whose voice is each segment, and what role does it play in the conversation?',
            moves: ['They Say', 'Counter-voice', 'Reply', 'I Say'],
            segments: [
                { text: 'Truscott… advanced the strong claim that correcting learners’ errors in a written composition… has no effect on grammatical accuracy in a new piece of writing.', move: 'They Say', why: '“advanced the strong claim” shows this is someone else’s position, held firmly, and the author does not commit to it yet.' },
                { text: 'Ferris disputed this claim, arguing that it was not possible to dismiss correction in general as it depended on the quality of the correction.', move: 'Counter-voice', why: '“disputed this claim, arguing” presents Ferris opposing Truscott. The reader sees a disagreement between sources, not yet the author’s opinion.' },
                { text: 'Truscott replied by claiming that Ferris failed to cite any evidence in support of her contention.', move: 'Reply', why: '“replied by claiming” keeps the distance: the author reports the reply without endorsing it.' },
                { text: 'To correct or not to correct written errors, then, remains contentious…', move: 'I Say', why: 'Here the author’s voice appears. After narrating the exchange, he issues his own judgement. An I Say does not always take sides: sometimes it synthesises the state of a debate.' }
            ],
            note: 'El autor «orquesta un debate y lo cierra con su juicio». Los verbos de reporte (advanced, disputed, replied) señalizan quién habla.'
        },
        {
            kind: 'categorize',
            title: 'Why this works: reporting verbs take a stance',
            instruction: 'Choosing a reporting verb is already taking a position. Drag each verb or phrase to the stance it signals.',
            items: [
                { text: 'argues that', category: 'neutral' },
                { text: 'suggests that', category: 'neutral' },
                { text: 'maintains that', category: 'neutral' },
                { text: 'According to [Author]', category: 'distance' },
                { text: 'It has been claimed that', category: 'distance' },
                { text: 'demonstrates that', category: 'credibility' },
                { text: 'shows that', category: 'credibility' },
                { text: 'establishes that', category: 'credibility' }
            ],
            zones: [
                { id: 'neutral', label: 'Neutral summary' },
                { id: 'distance', label: 'Keeps distance' },
                { id: 'credibility', label: 'Grants credibility' }
            ],
            note: 'Clasificación del Phrase bank del Cap. 9. «Elegir el verbo de reporte es ya tomar posición.» Conecta con hedging/boosting (Cap. 16).'
        },
        {
            kind: 'quiz',
            title: 'The pivot',
            question: 'Which pivot is rhetorically <strong>stronger</strong> when you partly disagree with a source?',
            options: [
                { text: '“However, …”' },
                { text: '“While [Author]’s point is well taken, …”', correct: true },
                { text: '“Nevertheless, …”' }
            ],
            note: '<strong>Respuesta:</strong> B. «Un “however” es directo; un “while X is correct” reconoce mérito antes de disentir, y por eso es más fuerte retóricamente.» El Cap. 10 desarrolla esta idea (movida rogeriana).'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: write the I Say',
            sourceHtml: '<strong>They Say:</strong> “Several scholars have argued that extensive reading alone is sufficient for second language vocabulary acquisition and that explicit vocabulary instruction is unnecessary in programs where students read at least 200,000 words per semester (Krashen, 2004; Nation, 2015).”',
            prompt: 'Write an <strong>I Say</strong> that responds with one of three options: agreement, disagreement or partial agreement. Include at least one datum or reference that supports your position.',
            rubric: [
                { points: 5, text: 'The I Say takes a clear position (agreement, disagreement or partial agreement) and signals the pivot (e.g. “While…”, “However…”, “I agree with… and would add…”).' },
                { points: 5, text: 'The position is backed by at least one datum, example or reference (not just an opinion) and the tone is academic, not personal.' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> «While extensive reading undoubtedly builds vocabulary through repeated exposure, research on incidental acquisition suggests that low-frequency or technical vocabulary rarely receives enough exposure through reading alone, which means some explicit instruction remains necessary for specialized registers.»'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find a paragraph from the discussion of an open-access article in your field where the author cites another researcher before presenting their own interpretation.',
            questions: [
                'Where does the They Say end and the I Say begin? Which word or phrase marks the turn?',
                'Which reporting verb introduces the other position? Does it signal agreement, disagreement or neutrality?',
                'Is the author’s I Say based on their own evidence, or is it just an opinion? Which is more convincing?',
                'Does the author reject the other position completely, or propose a synthesis? What effect does that have on credibility?'
            ],
            note: 'Actividad no calificada. Compararla con un compañero.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: They Say / I Say',
            groups: [
                { label: 'They Say — summarise the other position', phrases: ['[Author] (Year) argues / suggests / maintains that…', 'According to [Author], … / It has been claimed that…', '[Author] (Year) demonstrates / shows / establishes that…'] },
                { label: 'Pivot — signal disagreement or partial agreement', phrases: ['However, … / Nevertheless, … / Yet …', 'While [Author]’s point is well taken, … / Although X is correct, …'] },
                { label: 'I Say — take your position', phrases: ['I agree with [Author] that…, and would add that…', 'By contrast, [Author] (Year) found that… / The evidence suggests otherwise.', 'A more nuanced view would consider both… / The question is not whether X but how…', 'In the present study, … / Data from [source] indicate that…'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Choose a source from your field with which you partly disagree. Write in English a paragraph of <strong>five to seven sentences</strong> that follows the They Say / I Say pattern: a They Say with a reporting verb, a clear pivot and an I Say with evidence.',
            checklist: [
                'My They Say summarises the other position with an appropriate reporting verb, without distorting it.',
                'The pivot between They Say and I Say is visible (however, yet, while, by contrast).',
                'My I Say is not just an opinion; it includes at least one datum, example or reference.',
                'The tone of my disagreement is academic, not personal or dismissive.',
                'A reader who does not know the sources can follow the argument without getting lost.'
            ],
            note: 'En el libro este capítulo no tiene rúbrica en el Apéndice B; la de esta lección se construyó a partir de la lista de verificación del Cap. 9.'
        }
    ]
};
