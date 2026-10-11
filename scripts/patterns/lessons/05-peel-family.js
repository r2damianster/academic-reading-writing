// Capítulo 5 — La familia PEEL: MEAL, TEEL, PIE, TRI, WEED
module.exports = {
    order: 5,
    slug: 'peel-family',
    key: 'peel-family',
    lessonName: 'pattern peel family',
    label: 'The PEEL family',
    part: 'Part II. The Formula Paragraph',
    chapter: 5,
    title: 'The PEEL Family: MEAL, TEEL, PIE, TRI, WEED',
    patternName: 'PEEL family',
    keywords: ['point', 'evidence', 'explanation', 'link'],
    minWords: 70,
    maxWords: 280,
    rubric: [
        'My **Point / Main idea** announces a clear idea that the rest of the paragraph develops.',
        'I present at least one concrete datum in the **Evidence / Illustration** move.',
        'My **Explanation / Analysis** interprets the evidence without repeating the data.',
        'The PEEL version connects with the general argument; the PIE version ends satisfactorily without that closing sentence.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Open ten writing manuals and you will find ten acronyms for the same structure: MEAL, TEEL, PIE, TRI, WEED. The labels change; the **wave** does not. Whoever masters one, masters them all. You will relabel the same paragraph with two systems and then drop a move on purpose.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> equivalencia entre sistemas y variantes de 3 moves (PIE, TRI). Se reutiliza el modelo de PEEL (Van der Slik, 2015) para que el estudiante vea que cambian las etiquetas, no la estructura.'
        },
        {
            kind: 'model',
            title: 'The model (again)',
            lead: 'This is the same paragraph you met in the PEEL lesson. We will label it with two systems at once.',
            text: 'Female learners consistently outperformed male learners in speaking and writing proficiency in Dutch as a second language. This gender gap remained remarkably robust and constant when other learner characteristics were taken into account, such as education, age of arrival, length of residence and hours studying Dutch. For reading and listening skills in Dutch, no gender gap was found. … These findings do not seem to match nurture-oriented explanatory frameworks based for instance on a human capital approach or gender-specific acculturation processes. Rather, they seem to corroborate a nature-based, gene-environment correlational framework in which language proficiency being a genetically influenced ability interacting with environmental factors such as motivation, orientation, education, and learner strategies that still mediate between endowment and acquiring language proficiency at an adult stage.',
            source: 'vanderslik'
        },
        {
            kind: 'tag',
            title: 'Taking it apart: the MEAL system',
            instruction: 'You already know this paragraph as PEEL. Now label it with <strong>MEAL</strong>: Main idea, Evidence, Analysis, Link.',
            moves: ['Main idea', 'Evidence', 'Analysis', 'Link'],
            segments: [
                { text: 'Female learners consistently outperformed male learners in speaking and writing proficiency in Dutch as a second language.', move: 'Main idea', why: 'Same function as Point.' },
                { text: 'This gender gap remained remarkably robust and constant when other learner characteristics were taken into account… For reading and listening skills in Dutch, no gender gap was found.', move: 'Evidence', why: 'Evidence is called Evidence in both systems.' },
                { text: 'These findings do not seem to match nurture-oriented explanatory frameworks…', move: 'Analysis', why: 'Analysis = Explanation: the same interpretive move.' },
                { text: 'Rather, they seem to corroborate a nature-based, gene-environment correlational framework…', move: 'Link', why: 'Link is identical in both systems.' }
            ],
            note: '<strong>Conclusión del libro:</strong> «Las etiquetas cambian; la estructura no.» Point = Main idea; Explanation = Analysis.'
        },
        {
            kind: 'read',
            title: 'Six names, one wave',
            html: `<table class="pt-table">
            <thead><tr><th>Function</th><th>PEEL</th><th>MEAL</th><th>TEEL</th><th>PIE</th><th>TRI</th><th>WEED</th></tr></thead>
            <tbody>
                <tr><td>Central idea</td><td>Point</td><td>Main idea</td><td>Topic sentence</td><td>Point</td><td>Topic</td><td>What?</td></tr>
                <tr><td>Data or examples</td><td>Evidence</td><td>Evidence</td><td>Evidence</td><td>Illustration</td><td>Restriction</td><td>Evidence</td></tr>
                <tr><td>Interpretation</td><td>Explanation</td><td>Analysis</td><td>Explanation</td><td>Explanation</td><td>Illustration</td><td>Evaluation</td></tr>
                <tr><td>Connection</td><td>Link</td><td>Link</td><td>Link</td><td>&mdash;</td><td>&mdash;</td><td>Done</td></tr>
            </tbody>
        </table>
        <p><strong>PIE</strong> and <strong>TRI</strong> have three moves instead of four. PIE drops the Link: the paragraph ends after the interpretation. TRI, proposed by Becker in 1965, works on levels of generality: Topic generalises, Restriction narrows it, Illustration makes it concrete. Despite these differences, the three core moves (idea, data, analysis) appear in every variant.</p>`,
            note: 'Becker (1965) describió los niveles de generalidad mucho antes de que PEEL se popularizara en la educación secundaria australiana (años 90). MEAL: writing centers de EE. UU.; WEED: mnemotecnia británica para estudiantes de quince años.'
        },
        {
            kind: 'categorize',
            title: 'One function, many labels',
            instruction: 'Drag each label to the function it performs in its own system.',
            items: [
                { text: 'Main idea (MEAL)', category: 'idea' },
                { text: 'Topic sentence (TEEL)', category: 'idea' },
                { text: 'What? (WEED)', category: 'idea' },
                { text: 'Illustration (PIE)', category: 'evidence' },
                { text: 'Restriction (TRI)', category: 'evidence' },
                { text: 'Analysis (MEAL)', category: 'interpretation' },
                { text: 'Evaluation (WEED)', category: 'interpretation' },
                { text: 'Illustration (TRI)', category: 'interpretation' },
                { text: 'Done (WEED)', category: 'link' }
            ],
            zones: [
                { id: 'idea', label: 'Present the central idea' },
                { id: 'evidence', label: 'Offer data or examples' },
                { id: 'interpretation', label: 'Interpret the evidence' },
                { id: 'link', label: 'Connect with the argument' }
            ],
            note: 'Según la tabla del Cap. 5. Ojo: «Illustration» ocupa funciones distintas en PIE (datos) y en TRI (interpretación/concreción).'
        },
        {
            kind: 'tag',
            title: 'Spot the pattern: relabel a TEEL paragraph',
            instruction: 'This paragraph is built as TEEL (Topic sentence, Evidence, Explanation, Link). Relabel each sentence with the <strong>MEAL</strong> system.',
            moves: ['Main idea', 'Evidence', 'Analysis', 'Link'],
            segments: [
                { text: 'Extensive reading programs have been shown to improve vocabulary acquisition more effectively than traditional instruction.', move: 'Main idea', why: 'TEEL: Topic sentence. The label changes, the function does not.' },
                { text: 'Nakanishi (2015) conducted a meta-analysis of 34 studies and reported a mean effect size of d = 0.71 in favor of extensive reading over conventional methods.', move: 'Evidence', why: 'TEEL: Evidence. Identical in both systems.' },
                { text: 'This effect is likely attributable to the high volume of contextualized input that extensive reading provides, which allows learners to encounter target words repeatedly in meaningful contexts.', move: 'Analysis', why: 'TEEL: Explanation → MEAL: Analysis.' },
                { text: 'These findings lend support to the inclusion of sustained silent reading components in EFL curricula at the university level.', move: 'Link', why: 'Link in both.' }
            ],
            note: 'Párrafo del libro (etiquetado TEEL). Fuente temática: Nakanishi (2015).'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: the three-move PIE',
            instruction: 'Remove the Link. Put these three sentences into PIE order: Point, Illustration, Explanation.',
            sentences: [
                'Extensive reading programs have been shown to improve vocabulary acquisition more effectively than traditional instruction.',
                'Nakanishi (2015) conducted a meta-analysis of 34 studies and reported a mean effect size of d = 0.71 in favor of extensive reading over conventional methods.',
                'This effect is likely attributable to the high volume of contextualized input that extensive reading provides, which allows learners to encounter target words repeatedly in meaningful contexts.'
            ],
            note: '<strong>Orden:</strong> (b), (c), (a). «Se pierde la conexión hacia afuera del párrafo, no el contenido interpretativo.»'
        },
        {
            kind: 'quiz',
            title: 'What do you lose?',
            question: 'When you remove the Link from the paragraph (PEEL → PIE), what is lost?',
            options: [
                { text: 'The evidence, because the Link contains the data.' },
                { text: 'The connection outward: the paragraph no longer ties back to the general argument, although the interpretation remains.', correct: true },
                { text: 'The main idea, because it moves to the end.' }
            ],
            note: '<strong>Discusión:</strong> ¿el párrafo sigue siendo convincente? En un párrafo de resultados (CER) la ausencia del Link es una convención del género.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: the PEEL family',
            groups: [
                { label: 'Point — central idea', phrases: ['One important factor in [topic] is... (PEEL/PIE)', 'The main argument here is that... (MEAL)', 'This paragraph examines the claim that... (TEEL)'] },
                { label: 'Evidence — all systems', phrases: ['According to [Author] (Year), ...', '[Author] (Year) found that...'] },
                { label: 'Explanation — interpretation', phrases: ['This finding suggests that... (PEEL/TEEL)', 'This evidence supports the argument because... (MEAL)', 'An evaluation of these results shows that... (WEED)'] },
                { label: 'Link — connection', phrases: ['Taken together, these findings indicate that... (PEEL/MEAL/TEEL)'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Choose a topic from your field and write the <strong>same paragraph twice</strong> in English. First follow <strong>PEEL</strong> (four moves). Then follow <strong>PIE</strong> (three moves, no Link). Label them “Version 1” and “Version 2”, and add one sentence saying which one you prefer and why.',
            checklist: [
                'My Point / Main idea announces a clear idea that the rest of the paragraph develops.',
                'I present at least one concrete datum in the Evidence / Illustration move.',
                'My Explanation / Analysis interprets the evidence without repeating the data.',
                'The PEEL version connects with the general argument; the PIE version ends satisfactorily without that closing sentence.'
            ],
            note: 'Consigna del libro: comparar los dos resultados. El alumno debe poder explicar qué se pierde y qué se gana al quitar el Link.'
        }
    ]
};
