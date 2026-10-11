// Capítulo 15 — ICE: el sándwich de la cita
module.exports = {
    order: 17,
    slug: 'ice',
    key: 'ice',
    lessonName: 'pattern ice',
    label: 'ICE: the quotation sandwich',
    part: 'Part V. Integrating Sources and Cohesion',
    chapter: 15,
    title: 'ICE: The Quotation Sandwich',
    patternName: 'ICE (Introduce, Cite, Explain)',
    keywords: ['according', 'puts it', 'suggests', 'quotation'],
    minWords: 45,
    maxWords: 170,
    rubric: [
        'The **Introduce** names the source and the context before the quotation.',
        'The quotation is inside quotation marks and is verbatim, not a paraphrase passed off as a quotation.',
        'The **Explain** connects the quotation with my argument without repeating it.',
        'No quotation is left orphaned, without an introduction or without an explanation.'
    ],
    slides: [
        {
            kind: 'intro',
            objective: 'Citing a source is not pasting a phrase between quotation marks. Every well-integrated quotation does three things, in sequence: it is **Introduced**, it is **Cited** and it is **Explained**. Its absence produces the most visible defect of student writing: the <em>orphan quotation</em>, which appears without warning and disappears without comment.',
            minutes: 20,
            note: '<strong>Objetivo:</strong> sándwich ICE. Modelo: discusión de Van der Slik et al. (2015) que cita a Cohen y Dörnyei (2002). Conecta con verbos de reporte (Cap. 9) y con APA/Citation (Core Syllabus).'
        },
        {
            kind: 'model',
            title: 'The model',
            lead: 'This fragment comes from the discussion of the 2015 gender-gap study. It contains a complete ICE sandwich.',
            text: 'There are good reasons for such an interest, because as Cohen and Dörnyei (2002, p. 172) put it, “Motivation is often seen as the key learner variable because without it, nothing much happens.” Several studies have observed that women are more motivated than men in L2 learning.',
            source: 'vanderslik'
        },
        {
            kind: 'tag',
            title: 'Taking it apart',
            instruction: 'Label the three moments of the sandwich.',
            moves: ['Introduce', 'Cite', 'Explain'],
            segments: [
                { text: 'There are good reasons for such an interest, because as Cohen and Dörnyei (2002, p. 172) put it,', move: 'Introduce', why: 'It prepares the reader before the quotation. The verb “put it” is neutral: it does not yet reveal whether the author agrees.' },
                { text: '“Motivation is often seen as the key learner variable because without it, nothing much happens.”', move: 'Cite', why: 'The verbatim quotation, in quotation marks, with the exact page already given in the Introduce.' },
                { text: 'Several studies have observed that women are more motivated than men in L2 learning.', move: 'Explain', why: 'It does not repeat the quotation: it connects it with the paragraph’s argument, the role of motivation in the gender gap.' }
            ],
            note: 'Figura 15.1: «El Introduce y el Explain envuelven la cita».'
        },
        {
            kind: 'quiz',
            title: 'Why this works',
            question: 'A quotation arrives without an Introduce and without an Explain. What is the reader’s main problem?',
            options: [
                { text: 'The reader does not know why they are reading the quotation, nor what it means for the argument.', correct: true },
                { text: 'The quotation is too short to be useful.' },
                { text: 'The author’s name appears twice.' }
            ],
            note: '<strong>Respuesta:</strong> A. «Una cita sin Introduce llega sin aviso… Una cita sin Explain se queda flotando.» El verbo de reporte del Introduce ya comunica la postura (Cap. 9).'
        },
        {
            kind: 'quiz',
            title: 'Explain, don’t repeat',
            question: 'The quotation is: “Motivation is often seen as the key learner variable because without it, nothing much happens.” Which sentence is a good <strong>Explain</strong>?',
            options: [
                { text: 'In other words, motivation is the key variable because nothing happens without it.' },
                { text: 'This statement suggests that motivation may be the mediating variable between gender and L2 performance, which would help account for the gap.', correct: true },
                { text: 'Cohen and Dörnyei wrote this in 2002.' }
            ],
            note: '<strong>Respuesta:</strong> B. A repite la cita con otras palabras; C solo añade dato bibliográfico. El Explain debe aportar interpretación nueva (Apéndice C: «la motivación actúa como variable mediadora entre el género y el desempeño en L2»).'
        },
        {
            kind: 'bank',
            title: 'Rebuild it: the Introduce',
            instruction: 'Complete each Introduce with the right word or phrase.',
            words: ['According to', 'put it', 'words', 'argues', 'suggests', 'quotation'],
            sentences: [
                '[[According to]] Cohen and Dörnyei (2002), motivation is the key learner variable.',
                'As Cohen and Dörnyei (2002, p. 172) [[put it]], motivation is often seen as the key learner variable.',
                'In the [[words]] of Cohen and Dörnyei (2002), nothing much happens without motivation.'
            ],
            note: 'Phrase bank del Cap. 15.'
        },
        {
            kind: 'applied',
            title: 'Rebuild it: rescue the orphan quotation',
            sourceHtml: '“Motivation is often seen as the key learner variable because without it, nothing much happens.” Female learners in this study also outperformed male learners in speaking and writing.',
            prompt: 'This quotation is an orphan: it has no Introduce and no Explain. Rewrite the fragment adding the two missing moves. Use Cohen and Dörnyei (2002, p. 172) as the source.',
            rubric: [
                { points: 5, text: 'The Introduce names the source with author, year and page (e.g. “As Cohen and Dörnyei (2002, p. 172) explain,”) and uses a reporting verb before the verbatim quotation.' },
                { points: 5, text: 'The Explain connects the quotation with the paragraph’s argument (for example, motivation as a mediating variable in the gender gap) and does not just repeat the quotation.' }
            ],
            note: '<strong>Modelo (Apéndice C):</strong> Introduce: «As Cohen and Dörnyei (2002, p. 172) explain,» y un Explain que conecte la cita con el argumento propio.'
        },
        {
            kind: 'field',
            title: 'Spot it in the wild',
            lead: 'Find an article from your field in open access and locate a direct quotation. Identify the three moments.',
            questions: [
                'Does the Introduce give the author’s name and some context, or does it only say “he said”?',
                'Does the Explain repeat the quotation in other words, or does it add a new interpretation?'
            ],
            note: 'Actividad no calificada.'
        },
        {
            kind: 'phrases',
            title: 'Phrase bank: ICE',
            groups: [
                { label: 'Introduce', phrases: ['As [Author] (Year, p. X) puts it,', 'According to [Author] (Year),', '[Author] (Year) argues that', 'In the words of [Author] (Year),'] },
                { label: 'Explain', phrases: ['This statement suggests that', 'What this shows is that', 'This connects to [broader point] because', 'In other words,'] }
            ]
        },
        { kind: 'rubric' },
        {
            kind: 'essay',
            minutes: 12,
            promptHtml: 'Find a real quotation from an article in your field and write in English a short paragraph that integrates it with the <strong>complete ICE scheme</strong>.',
            checklist: [
                'My Introduce gives the author’s name, the year and some context before the quotation.',
                'My quotation is inside quotation marks and is verbatim, word for word.',
                'My Explain does not repeat the quotation: it connects it with my own argument.',
                'A reader who skips the quotation still understands the thread of the paragraph, thanks to the Introduce and the Explain.'
            ],
            note: 'Rúbrica ICE (Apéndice B).'
        }
    ]
};
