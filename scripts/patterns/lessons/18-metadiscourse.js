// Capítulo 16 — Metadiscurso: guiar al lector
module.exports = {
    order: 18,
    slug: 'metadiscourse',
    key: 'metadiscourse',
    lessonName: 'pattern metadiscourse',
    label: 'Metadiscourse: hedges and boosters',
    part: 'Part V. Integrating Sources and Cohesion',
    chapter: 16,
    title: 'Metadiscourse: Guiding the Reader',
    argumentative: true,
    patternName: 'Metadiscourse (hedges, boosters, connectors)',
    keywords: ['may', 'likely', 'however', 'suggests', 'clearly'],
    minWords: 50,
    maxWords: 180,
    rubric: [
        'Every claim without direct solid evidence carries at least one **hedge**.',
        'Every truly robust finding carries a **booster**, not a pile of unnecessary hedges.',
        'I use at least one **connector** that marks the logic between sentences.',
        'If a classmate reads only my hedges and boosters, they can guess how certain I am of each claim.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'An academic text does not only inform: it also manages the reader’s attention. **Metadiscourse** is the set of resources that do that work: <strong>connectors</strong> that mark the logic between sentences, <strong>hedges</strong> that soften a claim and <strong>boosters</strong> that reinforce it. Choosing between a hedge and a booster is an epistemic decision about how much certainty the evidence allows.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> hedges/boosters/conectores. Modelo: Tribushinina y Mackaaij (2023), el mismo párrafo de Toulmin. Enlaza con las lecciones de Toolbox «Hedging Language» y «Hedging Vocabulary».'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This is the same paragraph you analysed in the Toulmin lesson. Read it again, this time looking for the words that soften each claim.',
            text: ['Another potential source of L3 advantages pertains to the transfer of skills. For instance, early experience with two phonological systems appears to facilitate subsequent phonological learning later in life (Kaushanskaya and Marian, 2009). At the lexical level, young bilinguals are more likely to override the mutual exclusivity assumption because their vocabularies always contain double labels for the same concepts (Kalashnikova et al., 2015), which leads to higher flexibility in word learning (Hirosh and Degani, 2018).',
                'For contrast, here are two sentences from the 2015 gender-gap study: “This gender gap remained remarkably robust and constant when other learner characteristics were taken into account… For reading and listening skills in Dutch, no gender gap was found.”'
            ],
            source: 'tribushinina',
            extraSources: ['vanderslik']
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Decide what each sentence does with certainty: it contains a <strong>Hedge</strong>, a <strong>Booster</strong> or <strong>No marker</strong>.',
            moves: ['Hedge', 'Booster', 'No marker'],
            segments: [
                { text: 'Another potential source of L3 advantages pertains to the transfer of skills.', move: 'Hedge', why: '“potential” softens the Claim: one possible cause among several, not the only one.' },
                { text: 'early experience with two phonological systems appears to facilitate subsequent phonological learning later in life (Kaushanskaya and Marian, 2009).', move: 'Hedge', why: '“appears to” softens the main verb: the author does not say that it happens, but that it seems to.' },
                { text: 'This gender gap remained remarkably robust and constant when other learner characteristics were taken into account.', move: 'Booster', why: 'From the gender-gap study: “remarkably robust and constant” reinforces the claim. When the datum is truly robust, a booster tells the reader that no softening is needed.' },
                { text: 'For reading and listening skills in Dutch, no gender gap was found.', move: 'No marker', why: 'A plain report of a result: no hedge and no booster.' }
            ],
            note: '<strong>Ojo:</strong> las dos primeras provienen de Tribushinina y Mackaaij; la tercera y cuarta de Van der Slik et al. (2015), citado en el libro como contraste «los hedges y los boosters son las dos caras de la misma herramienta».'
        },
        {
            kind: 'read',
            title: 'Why this works',
            html: `<p>Metadiscourse works because it <strong>calibrates the certainty of a claim to the real level of the evidence</strong>. A text without hedges sounds more sure than the evidence allows; a text with too many hedges sounds unsure even when the evidence is solid. The expert reader detects the mismatch and discounts the author’s credibility.</p>
        <p>Boosters do the opposite job. When the datum is genuinely robust, an explicit booster (<em>remarkably robust and constant</em>) tells the reader there is no need to qualify. Choosing between hedge and booster is not a stylistic gesture: it is a decision about <strong>how much certainty the data allow</strong>.</p>`,
            note: 'Hedges y boosters = dos caras de la misma herramienta.'
        },
        {
            kind: 'categorize',
            title: 'Spot the pattern: sort the signals',
            instruction: 'Drag each expression to the kind of metadiscourse it is.',
            items: [
                { text: 'It appears that…', category: 'hedge' },
                { text: 'X may / might / could…', category: 'hedge' },
                { text: 'X is likely to…', category: 'hedge' },
                { text: 'X clearly / certainly demonstrates…', category: 'booster' },
                { text: 'It is well established that…', category: 'booster' },
                { text: 'In addition, / Furthermore,', category: 'connector' },
                { text: 'However, / By contrast,', category: 'connector' },
                { text: 'This is because… / As a result,', category: 'connector' }
            ],
            zones: [
                { id: 'hedge', label: 'Hedge (softens)' },
                { id: 'booster', label: 'Booster (reinforces)' },
                { id: 'connector', label: 'Connector (marks the logic)' }
            ],
            note: 'Phrase bank del Cap. 16.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: too categorical',
            sourceHtml: '“Bilingual education always improves academic outcomes for minority language students. Schools that do not offer bilingual programs are failing their students.”',
            prompt: 'This paragraph is <strong>too categorical</strong>. Rewrite it adding at least one hedge that acknowledges variation or exceptions.',
            rubric: [
                { points: 5, text: 'The rewrite replaces absolute words (always, are failing) with calibrated language (tends to, often, may) and acknowledges variation or exceptions.' },
                { points: 5, text: 'The paragraph keeps its message and is written in fluent academic English, without excessive hedging.' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> usar «tends to improve» en lugar de «always improves», y frases que admitan excepciones.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: too tentative',
            sourceHtml: '“It might perhaps be possible that extensive reading could maybe have some kind of effect on vocabulary, although this is not entirely certain and more research might be needed.”',
            prompt: 'This paragraph is <strong>over-hedged</strong>. Rewrite it, removing the overload of softeners and keeping only those needed for the real level of certainty.',
            rubric: [
                { points: 5, text: 'The rewrite eliminates redundant hedges (might / perhaps / possible / could / maybe) and keeps at most one or two that reflect the real level of certainty.' },
                { points: 5, text: 'The sentence is clear and direct, keeps the meaning (extensive reading and vocabulary, with further research needed) and sounds academic.' }
            ],
            note: '<strong>Modelo:</strong> «Extensive reading may have a positive effect on vocabulary, although further research is needed.» Un solo hedge que refleje el nivel real de certeza.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find a discussion paragraph in an article from your field. Underline every hedge and every booster.',
            questions: [
                'Is the balance between hedges and boosters appropriate for the kind of data being reported?',
                'Is the author more sure (or less sure) than the evidence allows?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: metadiscourse',
            groups: [
                { label: 'Hedges', phrases: ['It appears that... / It seems that...', 'X may/might/could...', 'X is likely to...'] },
                { label: 'Boosters', phrases: ['X clearly/certainly demonstrates...', 'It is well established that...'] },
                { label: 'Connectors', phrases: ['In addition, / Furthermore,', 'However, / By contrast,', 'This is because... / As a result,'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Write in English a paragraph of <strong>four to six sentences</strong> that reports two findings from your field: one that is <em>robust</em> and one that is <em>tentative</em>. Calibrate the certainty of each with hedges and boosters, and use at least one connector.',
            checklist: [
                'Every claim without direct solid evidence carries at least one hedge.',
                'Every truly robust finding carries a booster, not a pile of unnecessary hedges.',
                'I use at least one connector that marks the logic between sentences (however, therefore, in contrast).',
                'If a classmate reads only my hedges and boosters, they can guess how certain I am of each claim.'
            ],
            note: 'Error frecuente: hedges acumulados («might perhaps… could maybe…»).'
        }
    ]
};
