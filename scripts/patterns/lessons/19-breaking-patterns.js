// Capítulo 17 — Cuándo romper el patrón
module.exports = {
    order: 19,
    slug: 'breaking-patterns',
    key: 'breaking-patterns',
    lessonName: 'pattern breaking patterns',
    label: 'When to break the pattern',
    part: 'Part VI. Beyond the Formula',
    chapter: 17,
    title: 'When to Break the Pattern',
    patternName: 'Breaking the pattern',
    keywords: ['pattern', 'move', 'reader'],
    minWords: 70,
    maxWords: 260,
    rubric: [
        'I can name exactly which move I omitted or reordered.',
        'My reason for breaking the pattern is not that I did not know how to apply it.',
        'A reader in my field would understand the missing move without my spelling it out.',
        'I can defend the break to someone who asks me to go back to the strict version.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'This course has taught patterns as if they were fixed rules. They are not. They are **learning scaffolds**, and a scaffold is removed when the building can stand on its own. This last lesson shows a real paragraph where an expert breaks, on purpose, the pattern you learned, and the paragraph works better for it.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> debate de cierre: Wesley (2000) vs. dominio previo del patrón. «Nadie rompe un move que no sabe reconocer.» Este capítulo no tiene Phrase bank; trae cuatro preguntas guía.'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'We return to the first model of the course: the final sentence of the 1953 Watson and Crick article. Read it again, now with a different question: not what it says, but <strong>which move it avoids stating</strong>.',
            text: '“It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.”',
            source: 'watson'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'In a strict PEEL paragraph the Link is an explicit sentence. Here the Link is disguised. Label each part.',
            moves: ['Litotes (distancing)', 'Given finding', 'Link (disguised)'],
            segments: [
                { text: 'It has not escaped our notice that', move: 'Litotes (distancing)', why: 'A litotes, a double negative that reduces emphasis instead of adding it. The grammatical subject is “it”, not “we”: the authors step out of the centre of the sentence just as they announce the most important finding in twentieth-century biology.' },
                { text: 'the specific pairing we have postulated', move: 'Given finding', why: 'The finding the reader already knows from earlier pages.' },
                { text: 'immediately suggests a possible copying mechanism for the genetic material.', move: 'Link (disguised)', why: 'The move does not disappear: it is disguised. “suggests” and “possible” soften what the sentence asserts with total confidence. It is a Link wrapped in hedging, not an absent Link.' }
            ],
            note: 'Versión PEEL estricta posible: «We have discovered the mechanism by which genetic material is copied», un Link directo, casi un titular.'
        },
        {
            kind: 'quiz',
            title: 'Why this works',
            question: 'According to the lesson, why does the Watson and Crick sentence work <em>better</em> than a triumphant, explicit Link?',
            options: [
                { text: 'Because patterns are unnecessary for experts.' },
                { text: 'Because the authors knew the pattern they were breaking, and in 1953 a triumphant Link would have sounded arrogant before anyone had replicated the finding.', correct: true },
                { text: 'Because shorter sentences are always better.' }
            ],
            note: '<strong>Respuesta:</strong> B. «La modestia retórica no debilitó el mensaje, lo hizo más creíble». No es prueba de que los patrones sobren; es prueba de que hay que dominarlos primero.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: the strict version',
            sourceHtml: '“It has not escaped our notice that the specific pairing we have postulated immediately suggests a possible copying mechanism for the genetic material.” (Watson &amp; Crick, 1953)',
            prompt: 'Rewrite this sentence as a <strong>strict PEEL Link</strong>: explicit, direct, without litotes. Then, in one sentence, say what is gained in clarity and what is lost in rhetorical effect.',
            rubric: [
                { points: 5, text: 'The rewritten sentence is an explicit, direct Link with no litotes and no distancing frame (for example, “We have discovered that DNA replicates by copying each strand using complementary base pairing.”).' },
                { points: 5, text: 'The reflection names what is gained (immediate clarity) and what is lost (the rhetorical modesty and the effect of letting the reader complete the implication).' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> «We have discovered that DNA replicates by copying each strand using complementary base pairing.» Se gana claridad inmediata; se pierde la modestia retórica del original.'
        },
        {
            kind: 'read',
            title: 'Four questions before you break a pattern',
            html: `<p>This lesson has no phrase bank. Instead, there are four questions you should be able to answer <strong>every time</strong> you decide to break a pattern from this course:</p>
        <ol>
            <li>Can I write the version that follows the pattern to the letter? <em>If I cannot, I am not breaking the pattern: I am avoiding it.</em></li>
            <li>What does my reader gain from the break that they would not gain from the strict version?</li>
            <li>Does the convention of my discipline or journal tolerate this break, or penalise it?</li>
            <li>Could I justify this decision in front of a professor, a reviewer or an editor?</li>
        </ol>
        <p>The debate: critics of formulaic writing, such as Wesley (2000) in <em>The Ill Effects of the Five-Paragraph Theme</em>, have noted that teaching a pattern as a rigid formula produces writers who do not know when to drop it. But the Watson and Crick paragraph is not proof that patterns are unnecessary; it is proof that they must be mastered first.</p>`,
            note: 'Preguntas guía del Cap. 17, textuales. Wesley (2000) aparece en el Apéndice D.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find, in an award acceptance speech, a letter to the editor or an opinion article from your field, a paragraph that deliberately breaks a pattern you already know.',
            questions: [
                'Which move does the author omit or disguise?',
                'Is the paragraph still understandable without that explicit move? Why?'
            ],
            note: 'Actividad no calificada.'
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 15,
            promptHtml: 'Take a paragraph you wrote in a previous lesson of this category. Write a <strong>second version that deliberately breaks one move</strong> of the pattern you used. Below it, write a short paragraph <strong>in English</strong> that justifies why the break improves the text for your reader and your purpose.',
            checklist: [
                'I can name exactly which move I omitted or reordered.',
                'My reason for breaking the pattern is not that I did not know how to apply it.',
                'A reader in my field would understand the missing move without my spelling it out.',
                'I can defend the break to someone who asks me to go back to the strict version.'
            ],
            note: 'Cierre del recorrido: el estudiante debe poder defender la ruptura. Si no sabe aplicar el patrón estricto, no está rompiendo: lo está evitando.'
        }
    ]
};
