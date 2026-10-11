// Capítulo 6 — CER: escribir sobre resultados y datos
module.exports = {
    order: 6,
    slug: 'cer',
    key: 'cer',
    lessonName: 'pattern cer',
    label: 'CER: reporting results',
    part: 'Part II. The Formula Paragraph',
    chapter: 6,
    title: 'CER: Reporting Results and Data',
    patternName: 'CER (Claim, Evidence, Reasoning)',
    keywords: ['claim', 'evidence', 'reasoning', 'significant', 'mean'],
    minWords: 40,
    maxWords: 160,
    rubric: [
        'The **Claim** announces the finding, not just the numbers.',
        'The **Evidence** includes means, dispersion and statistical significance.',
        'The **Reasoning** explains what the data mean, even if they are not significant.',
        'There is **no Link**: the connection with the general argument is left for the discussion.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'When a paragraph reports empirical results, PEEL loses its fourth move. **CER** has only three: **Claim**, **Evidence** and **Reasoning**. The link with the big argument is saved for the Discussion. CER is the default pattern of results sections in science, engineering and quantitative social science.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> párrafo de resultados con tres moves. Modelo: Faytong-Haro (2025), caso instructivo porque significancia y tamaño del efecto apuntan en direcciones distintas. Relación: Claim = Point, Reasoning = Explanation.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This paragraph comes from the results section of an open-access study on spaced retrieval practice with Ecuadorian learners of English. Significance and effect size point in different directions, and the Reasoning resolves that tension.',
            text: 'The Wilcoxon Signed-Rank Test comparing Target Vocabulary Usage between the pretest and posttest showed an increase in vocabulary integration, with the mean rising from 23.13% (SD = 9.57) to 27.52% (SD = 4.58). The median also increased from 21.08% to 27.37%. However, the difference was not statistically significant (W = 9, p = 0.117). Despite this, the effect size (r = 0.45) is considered medium.',
            source: 'faytong'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Choose the CER move of each segment.',
            moves: ['Claim', 'Evidence', 'Reasoning'],
            segments: [
                { text: 'The Wilcoxon Signed-Rank Test comparing Target Vocabulary Usage between the pretest and posttest showed an increase in vocabulary integration.', move: 'Claim', why: 'It announces the finding (an increase) without dwelling on the figures yet. It works like the Point of PEEL.' },
                { text: 'with the mean rising from 23.13% (SD = 9.57) to 27.52% (SD = 4.58). The median also increased from 21.08% to 27.37%. However, the difference was not statistically significant (W = 9, p = 0.117).', move: 'Evidence', why: 'Means, standard deviations and the significance test. The report is honest and nuanced: the mean rises, but not significantly.' },
                { text: 'Despite this, the effect size (r = 0.45) is considered medium.', move: 'Reasoning', why: 'Faced with a non-significant difference, the author uses the effect size to interpret the finding. Numbers alone looked negative; only the interpretation reveals an appreciable effect.' }
            ],
            note: 'Obsérvese que el Reasoning es indispensable: «los números por sí solos parecían negativos». CER no tiene Link porque en IMRaD el vínculo se desarrolla en la discusión (Cap. 14).'
        },
        {
            kind: 'read',
            title: 'Why CER works in results sections',
            html: `<p>A reader of a results section wants three things, in this order: <strong>what did you find</strong>, <strong>what are the numbers</strong>, and <strong>what do the numbers mean</strong>.</p>
        <ul>
            <li>A paragraph that only gives means and <em>p</em>-values is <em>a table disguised as prose</em>: the reader has to do the analytical work.</li>
            <li>A paragraph that interprets without data is an <em>unsupported opinion</em>.</li>
        </ul>
        <p>CER and PEEL are the same wave with a different reach: <strong>Claim = Point</strong>, <strong>Evidence = Evidence</strong>, <strong>Reasoning = Explanation</strong>. The only structural difference is the missing Link, which is a convention of the genre.</p>`,
            note: 'Si el párrafo que el estudiante encuentra no tiene Reasoning, es un patrón CE incompleto: ¿la interpretación está en otro párrafo cercano o en la discusión?'
        },
        {
            kind: 'categorize',
            title: 'Rebuild it: which move is each sentence?',
            instruction: 'These sentences come from a hypothetical study on spaced retrieval. Drag each one to its CER move.',
            items: [
                { text: 'Learners who practised vocabulary with spaced retrieval produced more target words in the posttest than learners who did not.', category: 'claim' },
                { text: 'Students in the experimental group wrote longer sentences than the control group after the intervention.', category: 'claim' },
                { text: 'The spaced group used a mean of 31.4% target vocabulary (SD = 6.2), compared with 24.8% (SD = 7.1) in the control group, t(28) = 2.74, p = .011.', category: 'evidence' },
                { text: 'The experimental group averaged 18.2 words per sentence (SD = 3.1) and the control group 15.9 (SD = 3.6), t(40) = 2.20, p = .034.', category: 'evidence' },
                { text: 'This difference suggests that retrieving words at increasing intervals strengthens memory traces more than massed repetition.', category: 'reasoning' },
                { text: 'The size of this gap indicates that the intervention supported more elaborate sentence construction, not just more words.', category: 'reasoning' }
            ],
            zones: [
                { id: 'claim', label: 'Claim (the finding)' },
                { id: 'evidence', label: 'Evidence (the data)' },
                { id: 'reasoning', label: 'Reasoning (what the data mean)' }
            ],
            note: 'Ejercicio de práctica con oraciones construidas (no de corpus). Si el estudiante confunde Claim y Evidence: el Claim no lleva cifras.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: write the Evidence and the Reasoning',
            sourceHtml: '<strong>Hypothetical study:</strong> bilingual versus monolingual dictionaries in an English reading class.<br><br><table class="pt-table"><thead><tr><th>Group</th><th><em>n</em></th><th>Mean</th><th>SD</th></tr></thead><tbody><tr><td>Bilingual dictionary</td><td>32</td><td>74.3</td><td>8.6</td></tr><tr><td>Monolingual dictionary</td><td>30</td><td>69.1</td><td>10.2</td></tr></tbody></table><em>t</em>(60) = 2.19, <em>p</em> = .033, <em>d</em> = 0.56<br><br><strong>Claim (given):</strong> “Students who used bilingual dictionaries during reading tasks scored higher on the comprehension posttest than students who used monolingual dictionaries.”',
            prompt: 'Write one sentence of <strong>Evidence</strong> that reports the data in the table, and one sentence of <strong>Reasoning</strong> that explains what they mean for the Claim.',
            rubric: [
                { points: 5, text: 'The Evidence sentence reports both group means, at least one SD, and the test result (t(60) = 2.19, p = .033, d = 0.56) accurately and concisely.' },
                { points: 5, text: 'The Reasoning sentence interprets the data (for example, that access to a first-language equivalent reduces lookup effort or that the effect is medium) instead of repeating the numbers, and uses hedged academic language.' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> Evidence: «Students who used bilingual dictionaries scored an average of 74.3 (SD = 8.6) on the comprehension posttest, compared to 69.1 (SD = 10.2) for the monolingual dictionary group, t(60) = 2.19, p = .033, d = 0.56.» Reasoning: «This small but significant difference suggests that access to a first language equivalent reduces the cognitive load of lookup, leaving more attentional resources for comprehension itself.»'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find an empirical article from your field in open access and read one paragraph from the <em>Results</em> section. Identify the three CER moves.',
            questions: [
                'Does the first sentence announce a finding (Claim), or does it just report a number with no context?',
                'Does the data include measures of dispersion (SD, CI) and statistical significance (p, d)?',
                'Does the author explain what the data mean for the research question (Reasoning), or does the paragraph end with the last number?'
            ],
            note: 'Si falta el Reasoning, observar si aparece en otro párrafo cercano o en la discusión.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: CER',
            groups: [
                { label: 'Claim — announce the finding', phrases: ['X was significantly higher/lower than Y.', 'Participants in the [group] condition outperformed those in the [group] condition.', 'A significant difference was found between X and Y.'] },
                { label: 'Evidence — report the data', phrases: ['The [group] achieved a mean score of M = ... (SD = ...).', 'As shown in Table/Figure N, ...', 'The difference was statistically significant, t(df) = ..., p = ..., d = ...'] },
                { label: 'Reasoning — interpret the data', phrases: ['This result suggests that...', 'The magnitude of the effect (d = ...) indicates that...', 'This pattern is consistent with [theory], which predicts that...'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Invent or recall a data set from your field (two groups, two means and a difference) and write a complete <strong>CER paragraph</strong> in English, three to four sentences. If you have no data of your own, use the table from the previous exercise.',
            checklist: [
                'My first sentence presents the finding, not the numbers.',
                'My Evidence sentence includes at least means, standard deviations and a p value.',
                'My Reasoning sentence explains what the data mean; it does not repeat them in other words.',
                'There is no Link: the connection with the general argument is left for the discussion.'
            ],
            note: 'Rúbrica CER (Apéndice B). Error frecuente: el Claim ya trae las cifras o el Reasoning repite la Evidence.'
        }
    ]
};
