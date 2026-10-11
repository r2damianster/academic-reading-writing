// Capítulo 14 — IMRaD y los moves de abstracts y discusiones
module.exports = {
    order: 16,
    slug: 'imrad',
    key: 'imrad',
    lessonName: 'pattern imrad',
    label: 'IMRaD: the structure of a paper',
    part: 'Part IV. Whole Text Patterns',
    chapter: 14,
    title: 'IMRaD: The Macrostructure of a Paper',
    patternName: 'IMRaD',
    keywords: ['introduction', 'methods', 'results', 'discussion'],
    minWords: 50,
    maxWords: 180,
    rubric: [
        'My **Introduction** sentence uses the present tense and explains why the topic matters.',
        'My **Methods** sentence uses the past tense and describes an action, not a finding.',
        'My **Results** sentence reports a concrete datum without interpreting it yet.',
        'My **Discussion** sentence interprets that datum and does not simply repeat it.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'This lesson takes one more step: reading a whole empirical article by its macrostructure. **IMRaD** (Introduction, Methods, Results and Discussion) is the skeleton of almost every quantitative paper. Each section has its own dominant verb tense and its own rhetorical function.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> macroestructura y señales lingüísticas por sección. Modelo: Faytong-Haro (2025), el mismo artículo del Cap. 6 leído de principio a fin.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This is the same article you met in the CER lesson, now read from beginning to end. Four fragments, one per section.',
            text: [
                '**Introduction.** This small-scale case study explores the impact of Spaced Retrieval Practice (SRP) on vocabulary acquisition and oral fluency in Spanish-speaking A1 EFL adult learners, addressing the need for effective instructional strategies that enhance long-term retention and fluency development. Given the importance of lexical knowledge in oral proficiency, this research aims to determine the extent to which SRP influences Mean Length of Run (MLR), Articulation Rate (AR), and Target Vocabulary Usage.',
                '**Methods.** A quasi-experimental design was implemented with eight adult learners enrolled in an A1-level English course. Participants completed a pretest and posttest, during which their oral responses were recorded and analyzed using PRAAT software to measure MLR and AR.',
                '**Results.** The Wilcoxon Signed-Rank Test comparing Target Vocabulary Usage between the pretest and posttest showed an increase in vocabulary integration, with the mean rising from 23.13% (SD = 9.57) to 27.52% (SD = 4.58). The median also increased from 21.08% to 27.37%. However, the difference was not statistically significant (W = 9, p = 0.117).',
                '**Discussion.** Despite this, the effect size (r = 0.45) is considered medium.'
            ],
            source: 'faytong'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'The section headings have been removed. Use only the language to decide which IMRaD section each fragment comes from.',
            moves: ['Introduction', 'Methods', 'Results', 'Discussion'],
            segments: [
                { text: 'This small-scale case study explores the impact of Spaced Retrieval Practice (SRP) on vocabulary acquisition… this research aims to determine the extent to which SRP influences…', move: 'Introduction', why: 'Present-tense verbs (explores, aims to determine): the study is placed in front of a problem that is still current.' },
                { text: 'A quasi-experimental design was implemented with eight adult learners… Participants completed a pretest and posttest, during which their oral responses were recorded and analyzed…', move: 'Methods', why: 'Past tense, passive and active mixed (was implemented, completed, were recorded): it describes what was done, not what was found.' },
                { text: 'The Wilcoxon Signed-Rank Test… showed an increase in vocabulary integration, with the mean rising from 23.13% (SD = 9.57) to 27.52% (SD = 4.58)… the difference was not statistically significant (W = 9, p = 0.117).', move: 'Results', why: 'Past tense plus statistics (showed, the mean rising from, was not statistically significant): data without interpretation yet.' },
                { text: 'Despite this, the effect size (r = 0.45) is considered medium.', move: 'Discussion', why: 'A concession marker (Despite this) plus an evaluative verb (is considered): the author decides here what the numbers mean.' }
            ],
            note: 'Tabla del libro: cada sección tiene una «firma lingüística» (tiempo verbal dominante + función retórica).'
        },
        {
            kind: 'read',
            title: 'Why IMRaD works',
            html: `<p>IMRaD answers the four questions an expert reader asks, <strong>in order</strong>:</p>
        <ol>
            <li><strong>Introduction</strong> &mdash; why does this matter?</li>
            <li><strong>Methods</strong> &mdash; what did they do?</li>
            <li><strong>Results</strong> &mdash; what did they find?</li>
            <li><strong>Discussion</strong> &mdash; what does it mean?</li>
        </ol>
        <p>Each question needs the previous answer to make sense: you cannot evaluate a result without knowing the method that produced it, nor judge a method without knowing the question it tries to answer.</p>
        <p>IMRaD also solves what to do with a non-significant finding: it reserves a fixed space, the last section, precisely for the interpretive work that a bare <em>p</em>-value cannot do.</p>`,
            note: 'Si un «Results» ya contiene una palabra evaluativa (surprisingly, notably, only), ¿por qué el autor adelantó la interpretación? Pregunta de discusión del libro.'
        },
        {
            kind: 'match',
            title: 'Spot the pattern: linguistic signatures',
            instruction: 'Match each IMRaD section with its dominant linguistic signature.',
            pairs: [
                { left: 'Introduction', right: 'Present-tense verbs; situates the study before a current problem' },
                { left: 'Methods', right: 'Past tense, passive and active; describes what was done' },
                { left: 'Results', right: 'Past tense plus statistics; reports data without interpreting yet' },
                { left: 'Discussion', right: 'Concession markers and evaluative verbs; decides what the numbers mean' }
            ],
            note: 'Tabla «Señal lingüística dominante» del Cap. 14.'
        },
        {
            kind: 'sort',
            title: 'Rebuild it: restore the abstract',
            instruction: 'These four sentences come from a real abstract, but they are out of order. Put them in IMRaD order.',
            sentences: [
                'Translation and interpreting training offers a promising context for advancing bilingual proficiency, integrating skill development while bridging second language acquisition and translation studies.',
                'Twenty-three bilingual learners, primarily heritage Spanish speakers, enrolled in a semester-long translation and interpreting program and completed ACTFL Oral Proficiency Interviews at the beginning and end of the semester.',
                'Results showed no significant overall gains in Spanish oral proficiency, but students with lower initial proficiency levels demonstrated greater gains across the semester.',
                'This suggests that initial proficiency is a key factor in how much learners benefit from this type of instruction.'
            ],
            note: '<strong>Orden (libro):</strong> (b), (a), (c), (d): Introduction, Methods, Results, Discussion. (c) y (d) casi se fusionan: el dato y su interpretación aparecen en oraciones consecutivas. Fuente: Lozano-Argüelles y Martínez-Gómez (2025).'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Take an empirical article from your field in open access. <em>Without reading the section headings</em>, identify where the Introduction ends and Methods begins, and where Results ends and Discussion begins, guided only by tense and type of language.',
            questions: [
                'At which exact sentence does the text stop talking in the present about the general problem and start describing in the past what the authors did?',
                'Is there any sentence in Results that already contains an evaluative word (surprisingly, notably, only) before the Discussion? Why do you think the author brought the interpretation forward?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: IMRaD',
            groups: [
                { label: 'Introduction', phrases: ['[Topic] has received increasing attention in recent years.', 'This study explores the impact of [X] on [Y].'] },
                { label: 'Methods', phrases: ['A [design] was implemented with [N] participants.', 'Participants completed [task], during which [measure] was recorded.'] },
                { label: 'Results', phrases: ['The results indicate that [X] increased/decreased significantly (p = ...).', 'However, the difference was not statistically significant.'] },
                { label: 'Discussion', phrases: ['Despite this, the effect size is considered [small/medium/large].', 'These results suggest that...'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Choose a real article from your field (or the data of your own work) and write <strong>four sentences in English, one per IMRaD section</strong>, that summarise that work. Do not write the section names.',
            checklist: [
                'My Introduction sentence uses the present tense and explains why the topic matters.',
                'My Methods sentence uses the past tense and describes an action, not a finding.',
                'My Results sentence reports a concrete datum without interpreting it yet.',
                'My Discussion sentence interprets that datum and does not simply repeat it.'
            ],
            note: 'Error frecuente: interpretar ya en Results o repetir el dato en Discussion.'
        }
    ]
};
