// Capítulo 8 — Toulmin: la anatomía de un argumento
module.exports = {
    order: 8,
    slug: 'toulmin',
    key: 'toulmin',
    lessonName: 'pattern toulmin',
    label: 'Toulmin: the anatomy of an argument',
    part: 'Part III. Building Arguments',
    chapter: 8,
    title: 'Toulmin: The Anatomy of an Argument',
    argumentative: true,
    patternName: 'Toulmin model',
    keywords: ['claim', 'grounds', 'warrant', 'because'],
    minWords: 70,
    maxWords: 230,
    rubric: [
        'The **Claim** is a disputable thesis, not an obvious fact.',
        'The **Grounds** offer concrete evidence with its source.',
        'The **Warrant** explains why the evidence supports the Claim.',
        'I use at least one **Qualifier** that limits the scope of my claim.',
        'I consider at least one condition under which my Claim would not apply (**Rebuttal**).'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Stephen Toulmin proposed in 1958 that every argument is built from six pieces. Not all appear in every paragraph, but **three are indispensable**: a Claim, Grounds and a Warrant. Their absence is the most precise diagnosis of a weak argument.',
            minutes: 25,
            note: '<strong>Objetivo:</strong> radiografía del párrafo argumentativo. Modelo: Tribushinina y Mackaaij (2023), párrafo «no escrito como ejemplo de manual», por eso no encaja de forma perfecta. Relación: la Explanation de PEEL es el Warrant de Toulmin.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This paragraph comes from an open-access article on the advantages of bilingual children when learning a foreign language. It was not written as a textbook example, so it does not fit the six boxes perfectly, and that is exactly why it is useful.',
            text: 'Another potential source of L3 advantages pertains to the transfer of skills. For instance, early experience with two phonological systems appears to facilitate subsequent phonological learning later in life (Kaushanskaya and Marian, 2009). At the lexical level, young bilinguals are more likely to override the mutual exclusivity assumption because their vocabularies always contain double labels for the same concepts (Kalashnikova et al., 2015), which leads to higher flexibility in word learning (Hirosh and Degani, 2018).',
            source: 'tribushinina'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Five of the six components are present in this paragraph. Label each segment with its Toulmin component.',
            moves: ['Claim', 'Grounds', 'Warrant', 'Backing', 'Qualifier'],
            segments: [
                { text: 'Another potential source of L3 advantages pertains to the transfer of skills.', move: 'Claim', why: 'The central assertion. A disputable thesis about one cause of the advantages.' },
                { text: 'early experience with two phonological systems appears to facilitate subsequent phonological learning later in life (Kaushanskaya and Marian, 2009); young bilinguals are more likely to override the mutual exclusivity assumption (Kalashnikova et al., 2015).', move: 'Grounds', why: 'The evidence that supports the Claim: two concrete findings, each with its source.' },
                { text: '…because their vocabularies always contain double labels for the same concepts…, which leads to higher flexibility in word learning.', move: 'Warrant', why: 'The logical bridge: it explains WHY bilinguals override the constraint. Without it, the reader would have the datum but not the causal connection.' },
                { text: '(Kaushanskaya and Marian, 2009; Kalashnikova et al., 2015; Hirosh and Degani, 2018)', move: 'Backing', why: 'The support for the Warrant here is not a separate sentence but the published studies cited in parentheses.' },
                { text: 'potential… appears to… more likely…', move: 'Qualifier', why: 'The hedges scattered through the paragraph limit the scope of the Claim: a tendency backed by evidence, not a certainty.' }
            ],
            note: '<strong>Ausente:</strong> Rebuttal. El autor no señala condiciones bajo las cuales la transferencia no se produciría. Identificar lo que falta también es parte del análisis (Figura 8.1).'
        },
        {
            kind: 'quiz',
            title: 'What is missing?',
            question: 'Which of the six Toulmin components is <strong>absent</strong> from the paragraph you just analysed?',
            options: [
                { text: 'Claim' },
                { text: 'Warrant' },
                { text: 'Rebuttal', correct: true },
                { text: 'Grounds' }
            ],
            note: '<strong>Respuesta:</strong> Rebuttal. Es normal en un párrafo que reporta evidencia; el contraargumento suele reservarse para la discusión.'
        },
        {
            kind: 'read',
            title: 'Why Toulmin works',
            html: `<p>Toulmin works like an X-ray of the argumentative paragraph. When a PEEL paragraph argues (rather than reporting results), its Explanation is exactly Toulmin’s <strong>Warrant</strong>. Toulmin simply makes visible the piece PEEL groups under one label.</p>
        <p><strong>Three components are indispensable:</strong> without a Claim there is no argument; without Grounds there is no proof; without a Warrant there is no connection between the proof and what is claimed. <strong>Backing, Qualifier and Rebuttal</strong> make the argument more resistant to criticism, but may be absent without the paragraph falling apart.</p>
        <p>The most frequent error in student argumentative writing is the <strong>missing Warrant</strong>: the student asserts something, cites a source and moves on. The reader who does not know the field asks, “and what does that prove?”. That question is the sign that the Warrant is missing.</p>`,
            note: 'Qualifier y Rebuttal son herramientas de credibilidad: reaparecen en Concesión (Cap. 10) y Metadiscurso (Cap. 16).'
        },
        {
            kind: 'categorize',
            title: 'Spot the pattern: classify the sentence',
            instruction: 'These sentences belong to a hypothetical argument that extensive reading improves reading fluency. Drag each to its Toulmin component.',
            items: [
                { text: 'Nakanishi (2015) conducted a meta-analysis of 34 studies and found a mean effect size of d = 0.71 in favor of extensive reading.', category: 'grounds' },
                { text: 'A report on programmes in several countries showed that learners who read extensively improved their reading speed.', category: 'grounds' },
                { text: 'This is likely because extensive reading exposes learners to naturally occurring complex sentences far more often than explicit grammar instruction does.', category: 'warrant' },
                { text: 'The underlying reason is that repeated exposure allows structures to be acquired implicitly.', category: 'warrant' },
                { text: 'In most cases, the effect appears after a full semester of sustained reading.', category: 'qualifier' },
                { text: 'This claim does not hold, however, in contexts where learners lack access to level-appropriate books.', category: 'rebuttal' }
            ],
            zones: [
                { id: 'grounds', label: 'Grounds' },
                { id: 'warrant', label: 'Warrant' },
                { id: 'qualifier', label: 'Qualifier' },
                { id: 'rebuttal', label: 'Rebuttal' }
            ],
            note: 'Ejercicio de práctica con oraciones construidas (Grounds y Warrant del libro, Apéndice C). Si confunden Grounds y Warrant: Grounds = el dato; Warrant = POR QUÉ el dato respalda el Claim.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: write the Warrant',
            sourceHtml: '<strong>(Claim)</strong> Extensive reading programs improve L2 reading fluency more effectively than intensive reading instruction.<br><br><strong>(Grounds)</strong> Nakanishi (2015) conducted a meta-analysis of 34 studies and found a mean effect size of <em>d</em> = 0.71 in favor of extensive reading on measures of reading speed and comprehension.<br><br><strong>(Warrant)</strong> <em>[missing]</em>',
            prompt: 'The paragraph has a Claim and Grounds but no Warrant. Write a <strong>Warrant</strong> that explains WHY the evidence supports the Claim. If you can, add a <strong>Qualifier</strong> that limits its scope.',
            rubric: [
                { points: 5, text: 'The Warrant explains WHY the evidence supports the Claim (a mechanism or principle, for example implicit acquisition through repeated exposure) instead of repeating the data.' },
                { points: 5, text: 'The sentence is written in academic English, connects logically with the Grounds, and includes a Qualifier or hedge (e.g. “likely”, “in most cases”, “tends to”).' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> «This is likely because extensive reading exposes learners to naturally occurring complex sentences far more often than explicit grammar instruction does, allowing structures to be acquired implicitly through repeated exposure.»'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find an argumentative paragraph in the discussion section of an open-access article in your field. Identify at least three Toulmin components.',
            questions: [
                'Does the paragraph have an explicit Claim in the first sentence, or must the reader infer it?',
                'Do the Grounds include specific data (figures, citations, results), or only general statements?',
                'Is there a Warrant explaining why the Grounds support the Claim, or does the paragraph jump from datum to conclusion?',
                'Do you find any Qualifier or Rebuttal? If not, does the argument sound too categorical?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: Toulmin',
            groups: [
                { label: 'Warrant — connect evidence and claim', phrases: ['This is because...', 'The underlying reason is that...', 'This evidence supports the claim because...'] },
                { label: 'Qualifier — limit the scope', phrases: ['In most cases, ...', 'Under certain conditions, ...', 'The effect is strongest when...'] },
                { label: 'Rebuttal — anticipate objections', phrases: ['One might object that...; however, ...', 'Although X could be argued, the evidence suggests...', 'This claim does not hold, however, in contexts where...'] },
                { label: 'Backing — support the Warrant', phrases: ['This principle is supported by [theory/framework].', '[Author] (Year) provides further support for this reasoning.', 'This mechanism has been validated across...'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Choose a debatable topic from your field and write an <strong>argumentative paragraph of five to seven sentences</strong> in English that includes <strong>at least four of the six Toulmin components</strong>. Do not write the labels (Claim, Grounds, Warrant…): the reader must not see them.',
            checklist: [
                'My first sentence presents a disputable claim, not an indisputable fact.',
                'I present at least one concrete datum, quotation or example that supports my claim.',
                'I explain why the evidence supports my claim (Warrant), without repeating the data.',
                'I include at least one hedge (Qualifier) that limits the scope of my claim.',
                'My paragraph stands without the reader having to fill in the logic on their own.'
            ],
            note: 'Rúbrica Toulmin (Apéndice B). Error clave: Warrant ausente («¿y eso qué prueba?»).'
        }
    ]
};
