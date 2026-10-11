// Capítulo 7 — Párrafos de problema y solución: el patrón SPRE
module.exports = {
    order: 7,
    slug: 'spre',
    key: 'spre',
    lessonName: 'pattern spre',
    label: 'SPRE: problem and solution',
    part: 'Part II. The Formula Paragraph',
    chapter: 7,
    title: 'SPRE: Problem and Solution Paragraphs',
    patternName: 'SPRE (Situation, Problem, Response, Evaluation)',
    keywords: ['situation', 'problem', 'response', 'evaluation'],
    minWords: 45,
    maxWords: 180,
    rubric: [
        'The **Situation** gives the context the reader needs to understand the problem.',
        'The **Problem** presents a gap, a contradiction or an unanswered question.',
        'The **Response** describes a concrete action that addresses the problem.',
        'The **Evaluation** judges the result (or states what is expected of the response), not just reports it.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'PEEL builds a paragraph around a claim and its proof. **SPRE** builds it around a problem and the answer to it: **Situation, Problem, Response, Evaluation**. Proposed by Michael Hoey, it is the default pattern of article introductions in engineering and applied sciences, wherever a text must justify why something was done.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> arco narrativo de cuatro componentes. Modelo: Eustachio (2024). Relación: «PEEL argumenta, SPRE narra y justifica». Cuando SPRE escala a una introducción completa se convierte en CARS (Cap. 13).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This is the full abstract of an open-access article on energy poverty in Latin America. It compresses the four components in a single paragraph.',
            text: 'Many of the energy systems functioning across the developing world are poorly designed and largely inadequate to meet a country’s commercial and domestic energy needs. This is especially so in Latin America, where poverty trends have been exacerbated by limited access to energy, which could be used towards supporting industrial and small-scale commercial activities. This has characterised the widespread trend of energy poverty. This phenomenon poses a major barrier towards achieving the UN Sustainable Development Goals (SDGs) and addressing climate change, since lack of access to reliable energy generation systems hinders the development of economic activities and limits the comfort of living conditions. This paper reports on a study aimed at catering to a better understanding of the challenges related to energy poverty in Latin America and identifying some of the tools that may be deployed to address them. The methodological procedures used were bibliometric analysis and survey. The main findings of this research evidence that reducing energy poverty in Latin American countries is crucial to alleviating household costs since a considerable part of family income is used to pay the energy needs.',
            source: 'eustachio'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Choose the SPRE component of each segment.',
            moves: ['Situation', 'Problem', 'Response', 'Evaluation'],
            segments: [
                { text: 'Many of the energy systems functioning across the developing world are poorly designed and largely inadequate to meet a country’s commercial and domestic energy needs.', move: 'Situation', why: 'It sets the scene: a general state of the world, with no conflict pointed out yet. A neutral plateau.' },
                { text: 'This is especially so in Latin America, where poverty trends have been exacerbated by limited access to energy… This phenomenon poses a major barrier towards achieving the UN Sustainable Development Goals (SDGs) and addressing climate change…', move: 'Problem', why: '“This is especially so in Latin America” narrows the focus and names the lack. The text even coins a label (“energy poverty”) and explains why it matters.' },
                { text: 'This paper reports on a study aimed at catering to a better understanding of the challenges related to energy poverty in Latin America and identifying some of the tools that may be deployed to address them. The methodological procedures used were bibliometric analysis and survey.', move: 'Response', why: '“This paper reports on a study aimed at” links the answer to the gap; the next sentence names the methods.' },
                { text: 'The main findings of this research evidence that reducing energy poverty in Latin American countries is crucial to alleviating household costs since a considerable part of family income is used to pay the energy needs.', move: 'Evaluation', why: 'The last sentence judges the result. The reader leaves knowing what the study contributed.' }
            ],
            note: '<strong>Arco:</strong> un mundo estable (Situation), una ruptura (Problem), una acción reparadora (Response), un juicio del resultado (Evaluation).'
        },
        {
            kind: 'read',
            title: 'Why SPRE works',
            html: `<p>SPRE reproduces the most basic narrative structure there is: <em>something was fine, something broke, someone acted, and in the end we know whether the action worked</em>. That sequence is so natural that the reader follows it effortlessly, even when the content is technical.</p>
        <p>When a text opens with the problem without placing the reader first, or presents the solution before establishing the problem, reading becomes confusing, even if the data are correct.</p>
        <p><strong>PEEL and SPRE do not compete.</strong> PEEL organises a paragraph around a claim; SPRE organises a paragraph (or a whole section) around a problem. An empirical article may use SPRE in the introduction to justify the study and PEEL in the discussion to interpret each finding.</p>`,
            note: 'En el Cap. 13 veremos que SPRE escalado a una introducción completa se convierte en los tres moves de CARS (Swales).'
        },
        {
            kind: 'categorize',
            title: 'Spot the pattern: signal phrases',
            instruction: 'Each phrase is a typical signal of one SPRE component. Drag it to the right one.',
            items: [
                { text: '[Field/Topic] has become increasingly relevant in [context].', category: 'situation' },
                { text: '[Activity/Practice] is widely recognized as essential for [outcome].', category: 'situation' },
                { text: 'However, [gap/limitation] remains a significant challenge.', category: 'problem' },
                { text: 'Despite these advances, little is known about [specific aspect].', category: 'problem' },
                { text: 'To address this gap, the present study [verb]…', category: 'response' },
                { text: 'A [method/intervention] was implemented in [context] to [purpose].', category: 'response' },
                { text: 'The results suggest that [response] effectively [outcome].', category: 'evaluation' },
                { text: 'While the intervention showed promise, [limitation] warrants further investigation.', category: 'evaluation' }
            ],
            zones: [
                { id: 'situation', label: 'Situation' },
                { id: 'problem', label: 'Problem' },
                { id: 'response', label: 'Response' },
                { id: 'evaluation', label: 'Evaluation' }
            ],
            note: 'Frases del Phrase bank del Cap. 7. «However» y «Despite…» marcan el paso de Situation a Problem.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: restore the arc',
            instruction: 'These four sentences form a SPRE paragraph, but they are out of order. Drag them into Situation → Problem → Response → Evaluation.',
            sentences: [
                'Indoor air quality in rural households that rely on biomass cookstoves poses a persistent health risk, particularly for women and children.',
                'Despite government subsidies for cleaner fuels, more than 40% of rural households in Ecuador continue to use firewood or charcoal as their primary cooking fuel.',
                'A field trial in three communities in the highlands of Chimborazo province replaced traditional open-fire stoves with improved cookstoves equipped with chimneys.',
                'The monitoring campaign revealed that PM2.5 concentrations exceeded WHO guidelines on 43% of measured days, confirming that the intervention reduced exposure but did not eliminate the health risk entirely.'
            ],
            note: '<strong>Orden (Apéndice C):</strong> (b), (d), (c), (a). Observar el conector que marca el paso de Situation a Problem: «Despite…».'
        },
        {
            kind: 'bank',
            title: 'Rebuild it: the transition words',
            instruction: 'Choose the word or phrase that marks the transition between components.',
            words: ['However', 'To address this gap', 'The results suggest', 'Moreover', 'Therefore', 'For example'],
            sentences: [
                'Rural households rely on firewood for cooking. [[However]], indoor smoke remains a persistent health risk.',
                '[[To address this gap]], a field trial replaced open-fire stoves with improved cookstoves.',
                '[[The results suggest]] that the intervention reduced exposure but did not eliminate the risk.'
            ],
            note: 'Ejercicio de práctica con oraciones construidas.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find the abstract of an empirical article from your field in open access. Abstracts often compress the four SPRE components into one paragraph.',
            questions: [
                'Does the abstract start by placing the reader in a context (Situation), or does it jump straight to the problem?',
                'Is the Problem phrased as a lack, a contradiction or an unanswered question?',
                'Does the Response name what the study did, or does it only announce what it found?',
                'Does the Evaluation judge the result (positive, partial, negative), or does it simply report it?'
            ],
            note: 'Si falta algún componente, discutir si su ausencia debilita la justificación del estudio.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: SPRE',
            groups: [
                { label: 'Situation — establish context', phrases: ['[Field/Topic] has become increasingly relevant in [context].', 'In [region/discipline], [topic] plays a central role in [process].', '[Activity/Practice] is widely recognized as essential for [outcome].'] },
                { label: 'Problem — point to the gap', phrases: ['However, [gap/limitation] remains a significant challenge.', 'Despite these advances, little is known about [specific aspect].', 'Yet [negative condition] continues to affect [population/system].'] },
                { label: 'Response — present the action', phrases: ['To address this gap, the present study [verb] ...', 'This paper proposes [solution/approach] as a means of [goal].', 'A [method/intervention] was implemented in [context] to [purpose].'] },
                { label: 'Evaluation — judge the result', phrases: ['The results suggest that [response] effectively [outcome].', 'Preliminary findings indicate that [measure] improved by [amount].', 'While the intervention showed promise, [limitation] warrants further investigation.'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Think of a real problem in your professional field or community. Write in English a <strong>four-sentence SPRE paragraph</strong> that justifies the need to investigate or intervene.',
            checklist: [
                'My first sentence establishes a context the reader needs to understand the problem.',
                'My second sentence presents a lack, a contradiction or an unanswered question.',
                'My third sentence describes a concrete action that responds to the problem.',
                'My fourth sentence evaluates the result or anticipates what is expected of the response.'
            ],
            note: 'Si el estudiante omite Situation (abre con el problema), el lector queda sin marco: es el error más frecuente.'
        }
    ]
};
