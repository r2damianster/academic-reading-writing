// Capítulo 4 — PEEL, el patrón maestro (piloto de la plantilla "Pattern Lab")
module.exports = {
    order: 4,
    slug: 'peel',
    key: 'peel',
    lessonName: 'pattern peel',
    label: 'PEEL: the master paragraph',
    part: 'Part II. The Formula Paragraph',
    chapter: 4,
    title: 'PEEL: The Master Paragraph',
    patternName: 'PEEL',
    keywords: ['point', 'evidence', 'explanation', 'link'],
    minWords: 50,
    maxWords: 180,
    rubric: [
        'The **Point** announces a clear idea in the first sentence.',
        'The **Evidence** presents a concrete datum, quotation or example.',
        'The **Explanation** interprets the evidence without repeating it.',
        'The **Link** connects with the general argument or the next paragraph.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Almost every solid academic paragraph performs four jobs: it announces an idea (**Point**), proves it (**Evidence**), says what the proof means (**Explanation**) and connects it to the bigger argument (**Link**). PEEL is not a recipe: it is a wave that rises, falls into the data and rises again.',
            minutes: 25,
            note: '<strong>Objetivo:</strong> que el estudiante reconozca y produzca los cuatro moves de PEEL. Esta lección <em>reemplaza</em> a «The P.E.E.R. Structure» (Relevance se renombra Link, como en el libro). <strong>Conexión:</strong> retoma la onda semántica (Cap. 2–3) y prepara la familia PEEL (Cap. 5) y CER (Cap. 6).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This is an excerpt (cut marked with …) from the abstract of a 2015 open-access article. Read it once and try to find the four moves before moving on.',
            text: 'Female learners consistently outperformed male learners in speaking and writing proficiency in Dutch as a second language. This gender gap remained remarkably robust and constant when other learner characteristics were taken into account, such as education, age of arrival, length of residence and hours studying Dutch. For reading and listening skills in Dutch, no gender gap was found. … These findings do not seem to match nurture-oriented explanatory frameworks based for instance on a human capital approach or gender-specific acculturation processes. Rather, they seem to corroborate a nature-based, gene-environment correlational framework in which language proficiency being a genetically influenced ability interacting with environmental factors such as motivation, orientation, education, and learner strategies that still mediate between endowment and acquiring language proficiency at an adult stage.',
            source: 'vanderslik',
            note: '<strong>Fuente real</strong> (PLOS ONE, acceso abierto). Es el mismo texto que reaparece en los capítulos 5, 11 y 15: sirve para mostrar que <em>un mismo texto instancia patrones distintos</em>.'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'The excerpt has been split into four segments. Choose the move each one performs.',
            moves: ['Point', 'Evidence', 'Explanation', 'Link'],
            segments: [
                {
                    text: 'Female learners consistently outperformed male learners in speaking and writing proficiency in Dutch as a second language.',
                    move: 'Point',
                    why: 'It announces the central finding. No figures yet, only the main claim.'
                },
                {
                    text: 'This gender gap remained remarkably robust and constant when other learner characteristics were taken into account, such as education, age of arrival, length of residence and hours studying Dutch. For reading and listening skills in Dutch, no gender gap was found.',
                    move: 'Evidence',
                    why: 'Concrete controls and a contrast between skills: this is the data valley.'
                },
                {
                    text: 'These findings do not seem to match nurture-oriented explanatory frameworks based for instance on a human capital approach or gender-specific acculturation processes.',
                    move: 'Explanation',
                    why: '“These findings” packages the data and “match” tests it against theory. It evaluates the evidence instead of repeating it.'
                },
                {
                    text: 'Rather, they seem to corroborate a nature-based, gene-environment correlational framework in which language proficiency being a genetically influenced ability interacting with environmental factors…',
                    move: 'Link',
                    why: '“Rather” turns toward the preferred interpretation and places the finding inside a wider debate.'
                }
            ],
            note: '<strong>Clave:</strong> P → E → Explanation → Link. En textos reales la Explanation y el Link a veces se funden en una sola oración; aquí están separados, por eso es buen modelo. La Explanation «no repite las cifras, las evalúa».'
        },
        {
            kind: 'wave',
            title: 'Why this works: the semantic wave',
            instruction: 'A good paragraph moves between abstract ideas and concrete details. Place each sentence on the wave, then draw it.',
            mode: 'place',
            items: [
                { text: 'Female learners consistently outperformed male learners in speaking and writing proficiency in Dutch as a second language.', level: 3, why: 'Broad claim, no data yet.' },
                { text: 'This gender gap remained remarkably robust and constant when other learner characteristics were taken into account… For reading and listening skills in Dutch, no gender gap was found.', level: 1, why: 'Maximum concreteness: variables and results.' },
                { text: 'These findings do not seem to match nurture-oriented explanatory frameworks…', level: 2, why: 'The wave climbs: the data are interpreted.' },
                { text: 'Rather, they seem to corroborate a nature-based, gene-environment correlational framework…', level: 3, why: 'It exits at the height of the crest or higher: a broad framework.' }
            ],
            note: '<strong>Onda semántica:</strong> cresta (Point, alta densidad semántica) → valle (Evidence, máxima gravedad semántica) → sube (Explanation) → sale arriba (Link). Corresponde a la Figura 4.1 del libro.'
        },
        {
            kind: 'read',
            title: 'Why PEEL works for the reader',
            html: `<p>PEEL gives the reader what they need, in the order they need it:</p>
        <ol>
            <li><strong>Point</strong> &mdash; a frame: what will this paragraph defend?</li>
            <li><strong>Evidence</strong> &mdash; the proof: why should I believe it?</li>
            <li><strong>Explanation</strong> &mdash; the interpretation: what does the proof mean?</li>
            <li><strong>Link</strong> &mdash; the exit: where does this lead?</li>
        </ol>
        <p><strong>The most common student mistake is not a missing source but a missing Explanation.</strong> The paragraph drops into the valley and never climbs back: the reader is left with data and has to guess what they mean. The second mistake is a missing Link: the point is understood, but not why it appears <em>here</em>.</p>`,
            note: '<strong>Errores típicos:</strong> (1) <em>Evidence dump</em>: dato sin Explanation, la onda baja y no sube. (2) Sin Link: el párrafo queda aislado de la tesis.'
        },
        {
            kind: 'quiz',
            title: 'Diagnose the paragraph',
            question: 'A student writes a clear first sentence, adds two statistics with their sources, and then moves on to the next topic. Which move is missing?',
            options: [
                { text: 'Point' },
                { text: 'Explanation', correct: true },
                { text: 'Evidence' }
            ],
            note: '<strong>Respuesta:</strong> B. Sin Explanation el lector «tiene que llenar la brecha por sí mismo». Pregunta guía para el estudiante: «¿y eso qué significa para mi punto?».'
        },
        {
            kind: 'tag',
            title: 'Spot the pattern: a second text',
            instruction: 'Same article family, different paragraph. This text is from a 2023 open-access study on bilingual learners. One PEEL move is missing. Label what is there.',
            moves: ['Point', 'Evidence', 'Explanation', 'Link'],
            segments: [
                {
                    text: 'Another potential source of L3 advantages pertains to the transfer of skills.',
                    move: 'Point',
                    why: 'It opens the idea the paragraph will develop.'
                },
                {
                    text: 'For instance, early experience with two phonological systems appears to facilitate subsequent phonological learning later in life (Kaushanskaya and Marian, 2009).',
                    move: 'Evidence',
                    why: '“For instance” + a cited study: a concrete example with its source.'
                },
                {
                    text: 'At the lexical level, young bilinguals are more likely to override the mutual exclusivity assumption because their vocabularies always contain double labels for the same concepts (Kalashnikova et al., 2015), which leads to higher flexibility in word learning (Hirosh and Degani, 2018).',
                    move: 'Explanation',
                    why: 'The “because … which leads to” chain explains the mechanism. Here the evidence and its explanation are fused in one sentence.'
                }
            ],
            source: 'tribushinina',
            note: '<strong>Mismo texto, otro patrón:</strong> este párrafo reaparece en Toulmin (Cap. 8) y metadiscurso (Cap. 16). Aquí falta el Link; en el texto real el párrafo continúa. Es normal que Explanation y Evidence se fusionen.'
        },
        {
            kind: 'quiz',
            title: 'Which move is missing?',
            question: 'In the Tribushinina and Mackaaij paragraph you just labelled, which PEEL move does not appear in the three sentences?',
            options: [
                { text: 'Point' },
                { text: 'Link', correct: true },
                { text: 'Evidence' },
                { text: 'Explanation' }
            ],
            note: '<strong>Respuesta:</strong> Link. Discusión: ¿el párrafo se debilita? Depende del párrafo siguiente; en un texto más largo, el Link puede estar en la frase que abre el siguiente párrafo.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: put the paragraph back together',
            instruction: 'These four sentences belong to one paragraph, but they are out of order. Drag them into PEEL order.',
            sentences: [
                'Extensive reading programs have been shown to improve vocabulary acquisition more effectively than traditional instruction.',
                'Nakanishi (2015) conducted a meta-analysis of 34 studies and reported a mean effect size of d = 0.71 in favor of extensive reading over conventional methods.',
                'This effect is likely attributable to the high volume of contextualized input that extensive reading provides, which allows learners to encounter target words repeatedly in meaningful contexts.',
                'These findings lend support to the inclusion of sustained silent reading components in EFL curricula at the university level.'
            ],
            note: '<strong>Orden:</strong> Point (Extensive reading programs have been shown…) → Evidence (Nakanishi, d = 0.71) → Explanation (This effect is likely attributable…) → Link (These findings lend support…). Fuente de la serie: Nakanishi (2015). Se reutiliza en el Cap. 5 para PIE.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: write the missing Explanation',
            sourceHtml: '<strong>(Point)</strong> Collaborative writing tasks tend to produce more syntactically complex output than individual writing tasks.<br><br><strong>(Evidence)</strong> In a study of 48 university EFL students, pairs who wrote together produced texts with significantly more subordinate clauses per T-unit than students who wrote alone (<em>M</em> = 1.42 vs. <em>M</em> = 0.97, <em>p</em> &lt; .01).<br><br><strong>(Explanation)</strong> <em>[missing]</em><br><br><strong>(Link)</strong> This pattern feeds into a larger debate in L2 pedagogy over how much of writing quality depends on task design rather than learner proficiency alone.',
            prompt: 'This paragraph has Point, Evidence and Link, but the Explanation is missing. Write 1–2 sentences of Explanation that connect the evidence to the Point. Explain WHY pair writing might lead to more complex sentences; do not just repeat the numbers.',
            rubric: [
                { points: 5, text: 'The Explanation proposes a reason or mechanism (for example, negotiating meaning with a partner pushes learners to expand and clarify their sentences) instead of repeating the statistics.' },
                { points: 5, text: 'The Explanation connects the evidence (subordinate clauses per T-unit) with the Point (syntactic complexity) and leads naturally into the Link; it is written in academic English with hedged claims (e.g. “likely”, “suggests”).' }
            ],
            note: '<strong>Modelo de respuesta (libro, Apéndice C):</strong> «This pattern likely reflects the fact that negotiating meaning with a partner requires learners to expand and clarify their utterances, which pushes them toward more complex grammatical structures than they would produce writing alone.» Cualquier versión que explique el POR QUÉ es válida.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Search Google Scholar for an open-access article from your own field. Read a paragraph from the <em>Discussion</em> section (not the abstract or results) and mark the four PEEL moves.',
            questions: [
                'Does the first sentence announce an idea that the rest of the paragraph develops?',
                'Is there at least one sentence with data, figures or a reference to a specific study?',
                'Does the author explain what the data mean for their argument, or jump straight to the next point?',
                'Does the last sentence connect the paragraph with the article’s thesis or with the next paragraph?'
            ],
            note: 'Actividad no calificada. Es normal que en textos reales Explanation y Link se fusionen; si falta un move, que el estudiante lo marque.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: PEEL',
            groups: [
                { label: 'Point — announce the central idea', phrases: ['One important factor in [topic] is...', 'A key difference between X and Y lies in...', 'The relationship between X and Y is not straightforward.'] },
                { label: 'Evidence — present the data', phrases: ['According to [Author] (Year), ...', 'Data from [study/source] indicates that...', '[Author] (Year) found that...'] },
                { label: 'Explanation — interpret the evidence', phrases: ['This finding suggests that...', 'One possible explanation for this pattern is...', 'The implication is that...'] },
                { label: 'Link — connect with the argument', phrases: ['Taken together, these findings indicate that...', 'This has practical implications for...', 'In the context of [broader topic], this means that...'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Choose a topic from your own field and write a paragraph in English of <strong>four to six sentences</strong> that follows the PEEL pattern. <strong>Do not write the labels</strong> (Point, Evidence, Explanation, Link): the reader must not see them.',
            checklist: [
                'My first sentence announces a clear idea that the rest of the paragraph develops.',
                'I present at least one concrete datum, quotation or example that supports that idea.',
                'I explain what that evidence means for my argument, without repeating the data.',
                'My last sentence connects the point with the general thesis or anticipates the next paragraph.',
                'If I read only the first and last sentences, the paragraph still makes sense as a unit.'
            ],
            note: 'Redacción libre del campo del estudiante. El agente de escritura da feedback; revisar contra la rúbrica PEEL (Apéndice B).'
        }
    ]
};
