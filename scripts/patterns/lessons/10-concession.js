// Capítulo 10 — Concesión y contraargumento: movidas rogerianas
module.exports = {
    order: 10,
    slug: 'concession',
    key: 'concession',
    lessonName: 'pattern concession',
    label: 'Concession and counterargument',
    part: 'Part III. Building Arguments',
    chapter: 10,
    title: 'Concession and Counterargument',
    argumentative: true,
    patternName: 'Concession and Rogerian moves',
    keywords: ['although', 'however', 'nevertheless', 'concession'],
    minWords: 70,
    maxWords: 240,
    rubric: [
        'My **concession** acknowledges a real objection, not an invented one that is easy to refute.',
        'I use a visible concessive structure (although, while, it is true that).',
        'My **reaffirmation** is stronger after the concession than before it.',
        'The tone is academic: I do not dismiss the opposing position, I move beyond it.',
        'If I include a **synthesis**, it offers a position that integrates the best of both sides.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'The difference between a competent argument and a strong one is often **concession**: acknowledging the merit of an objection or limitation <em>before</em> reaffirming your own position. Far from weakening the argument, it strengthens it, because it shows you considered the alternatives and still hold your ground. Carl Rogers called this non-adversarial argument; today it is known as a **Rogerian move**.',
            minutes: 25,
            note: '<strong>Objetivo:</strong> concesión + contraargumento + reafirmación (+ síntesis). Modelo: Lozano-Argüelles y Martínez-Gómez (2025), sección de limitaciones. Relación con Toulmin: la concesión es un Rebuttal anticipado.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This paragraph comes from the limitations section of an open-access article on translation and interpreting training. It shows concession in its most honest form: the author admits an objection to their own study before refuting it. Look for the exact pivot.',
            text: 'This study has two primary limitations that warrant discussion. First, the absence of a control group constrains our ability to isolate the effects of the program from other potential influences on language development. One might hypothesize that linguistic improvement occurs simply through immersion in an academic environment, which inherently demands Superior-level linguistic functions such as presenting opinions, using specialized vocabulary, formulating hypotheses, and engaging with abstract topics. However, this hypothesis is challenged by existing research on comparable populations, which indicates that nearly 70% of students in heritage learner courses fail to demonstrate improvements in written proficiency (Gatti et al., 2024).',
            source: 'lozano'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Label each step of the concession “ladder”.',
            moves: ['Acknowledged limitation', 'Concession', 'Counterargument', 'Reaffirmation'],
            segments: [
                { text: 'This study has two primary limitations that warrant discussion. First, the absence of a control group constrains our ability to isolate the effects of the program from other potential influences on language development.', move: 'Acknowledged limitation', why: 'The author opens by admitting a weakness of their own study. Starting with the limitation instead of hiding it is already a Rogerian move.' },
                { text: 'One might hypothesize that linguistic improvement occurs simply through immersion in an academic environment, which inherently demands Superior-level linguistic functions…', move: 'Concession', why: '“One might hypothesize that” states the most serious objection explicitly and generously, with all its details, as someone who defended it would.' },
                { text: 'However, this hypothesis is challenged by existing research on comparable populations,', move: 'Counterargument', why: '“However” is the pivot. After granting the objection in its strongest form, the author refutes it.' },
                { text: 'which indicates that nearly 70% of students in heritage learner courses fail to demonstrate improvements in written proficiency (Gatti et al., 2024).', move: 'Reaffirmation', why: 'The refutation is not an opinion but published evidence. The datum defuses the objection and gives strength back to the author’s interpretation.' }
            ],
            note: '«Escalera de tres peldaños»: reconocer la limitación, formular la objeción más seria en su versión más fuerte y refutarla con evidencia.'
        },
        {
            kind: 'read',
            title: 'Why concession works',
            html: `<p>The academic reader distrusts absolute positions. An author who admits no objection seems naive or dishonest; one who admits the strongest ones and still holds their position seems rigorous.</p>
        <p>In Toulmin’s terms, concession is an <strong>anticipated Rebuttal</strong>: you identify the conditions under which your Claim might fail and integrate them before the reader raises them.</p>
        <p>Carl Rogers proposed that the most effective way to persuade someone who disagrees is first to show that you understood them. A Rogerian move does not attack the opposing view; it <em>restates it precisely</em>, acknowledges what is valid, and then shows why your position covers wider ground. The reader feels included, not fought.</p>`,
            note: 'Pregunta de discusión: ¿una concesión fácil de refutar («straw man») sigue siendo rogeriana? No: la objeción debe ser real.'
        },
        {
            kind: 'fill',
            title: 'Rebuild it: concessive structures',
            instruction: 'Complete each sentence with the concessive or reaffirming expression.',
            sentences: [
                '[[Although]] it is true that online platforms cannot replicate a physical classroom, they offer flexible access to adult learners.',
                '[[Admittedly]], this study does not account for differences in prior proficiency.',
                '[[Nevertheless]], the evidence presented here suggests that the intervention was effective.',
                'This limitation [[notwithstanding]], the overall pattern remains consistent across groups.'
            ],
            note: 'Frases del Phrase bank del Cap. 10. Conectores concesivos: although / even though / while / despite / notwithstanding / granted that.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: add the concession',
            sourceHtml: '“Online language learning platforms provide learners with flexible scheduling and access to native speaker tutors regardless of geographic location. A meta-analysis of 45 studies found that students using synchronous online tutoring achieved proficiency gains comparable to those in face-to-face instruction (Means et al., 2013). These platforms should therefore be adopted as the primary mode of language instruction in universities with limited faculty resources.”',
            prompt: 'This paragraph states a position and gives evidence, but it has <strong>no concession</strong>, so it is vulnerable. Write <strong>one concession sentence</strong> that acknowledges the most obvious objection and <strong>one reaffirmation sentence</strong> that gives strength back to the original position. Say where you would insert them.',
            rubric: [
                { points: 5, text: 'The concession acknowledges a real, strong objection (for example, that online platforms cannot replicate spontaneous face-to-face interaction) using a visible concessive structure.' },
                { points: 5, text: 'The reaffirmation returns to the original position with a reason or evidence (for example, the flexibility benefit for adult learners) and the answer indicates where both sentences would be inserted in the paragraph.' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> «It could be argued that online platforms simply cannot replicate the spontaneous, embodied interaction of a physical classroom, and for some learners this loss is real. However, for adult learners balancing work and study, the flexibility of asynchronous access outweighs this limitation in practice.»'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find a discussion paragraph in an article from your field where the author acknowledges a limitation of their own study before reasserting the validity of their results.',
            questions: [
                'Does the author acknowledge the objection with a concessive structure (although, while, even though, it is true that), or simply mention it without accepting it?',
                'Is the reaffirmation that follows stronger or weaker than the initial position? What effect does that difference have?',
                'Does the author offer a synthesis that goes beyond the opposition, or keep both positions separate?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: concession',
            groups: [
                { label: 'Concession — acknowledge', phrases: ['Although it is true that… / While X has merit, …', 'Admittedly, this study does not account for…', 'It must be acknowledged that some studies have found…'] },
                { label: 'Reaffirmation — return with strength', phrases: ['Nevertheless, the evidence presented here suggests…', 'This limitation notwithstanding, the overall pattern remains…', 'What matters more than X, however, is…'] },
                { label: 'Counterargument — dismantle the premise', phrases: ['This objection assumes that…, but…', 'In fact, the very evidence cited against X actually supports…'] },
                { label: 'Synthesis — integrate both positions', phrases: ['Rather than choosing between X and Y, a more productive approach…', 'The question is not whether X but under what conditions…'] },
                { label: 'Concessive connectors', phrases: ['although / even though / while / despite / notwithstanding / granted that'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Choose a topic from your field on which you hold a firm position. Write in English a paragraph of <strong>five to seven sentences</strong> that includes at least one <strong>concession</strong> and one <strong>reaffirmation</strong>. Follow the structure: position → concession → reaffirmation (→ synthesis, if you have one).',
            checklist: [
                'My concession acknowledges a real objection, not an invented one that is easy to refute.',
                'I use a visible concessive structure (although, while, it is true that).',
                'My reaffirmation is stronger after the concession than before it.',
                'The tone is academic; I do not dismiss the opposing position, I go beyond it.',
                'If I have a synthesis, it offers a position that integrates the best of both sides.'
            ],
            note: 'Error frecuente: concesión «de paja» (objeción inventada, fácil de refutar).'
        }
    ]
};
