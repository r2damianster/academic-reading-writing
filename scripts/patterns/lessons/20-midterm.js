// Evaluación de medio término: patrones de los capítulos 2 a 7 (12 ejercicios del libro)
// Cada tarea se califica con el agente test-grader mediante una rúbrica en el HTML (APPLIED_TASK),
// sin tablas nuevas ni endpoints nuevos.

const openTopicTasks = [
    {
        title: 'Open topic 1: Academic sentence (given–new and light nominalization)',
        source: 'Topic: <em>the use of technology in Ecuadorian classrooms</em>.',
        prompt: 'Write <strong>two consecutive sentences</strong> about the use of technology in Ecuadorian classrooms, so that the second sentence picks up as given information something the first sentence presented as new, and includes at least one light nominalization.',
        criteria: ['Thematic continuity: the second sentence starts from something new in the first.', 'Correct use of at least one nominalization (e.g. “This expansion…”, “This integration…”).', 'Precision of academic vocabulary.']
    },
    {
        title: 'Open topic 2: General to specific',
        source: 'Topic: <em>school dropout rates in rural areas</em>.',
        prompt: 'Write a paragraph about <strong>school dropout rates in rural areas</strong> that moves from a general idea toward increasingly specific information.',
        criteria: ['Clarity of the opening general sentence.', 'Logical progression toward details, with each sentence more specific than the previous.', 'No abrupt jumps between levels of generality.']
    },
    {
        title: 'Open topic 3: PEEL',
        source: 'Topic: <em>the importance of critical reading at university</em>.',
        prompt: 'Write a paragraph about <strong>the importance of critical reading at university</strong> following the four-part PEEL structure (Point, Evidence, Explanation, Link).',
        criteria: ['The four parts (Point, Evidence, Explanation, Link) are clearly present.', 'The logical relationship between the parts is clear.', 'The closing sentence connects back to the main idea.']
    },
    {
        title: 'Open topic 4: PEEL family',
        source: 'Topic: <em>the use of artificial intelligence in educational assessment</em>.',
        prompt: 'Choose one PEEL-family variant (MEAL, TEEL, PIE, TRI or WEED) and write a paragraph about <strong>the use of artificial intelligence in educational assessment</strong>. Name the variant you chose in brackets at the end.',
        criteria: ['Fidelity to the chosen structure.', 'Clarity of the central idea.', 'Quality of the evidence or example provided.']
    },
    {
        title: 'Open topic 5: CER',
        source: 'Topic: <em>the academic performance of students who use mobile devices in class</em>.',
        prompt: 'Write a paragraph about <strong>the academic performance of students who use mobile devices in class</strong>, presenting a Claim supported by Evidence and a Reasoning statement that connects both.',
        criteria: ['Clarity of the Claim.', 'Relevance of the Evidence cited.', 'Strength of the Reasoning that links the Evidence to the Claim.']
    },
    {
        title: 'Open topic 6: SPRE',
        source: 'Topic: <em>the digital divide in Ecuadorian education</em>.',
        prompt: 'Write a paragraph about <strong>the digital divide in Ecuadorian education</strong> that presents the Situation, then a Problem arising from it, then a Response, and finally an Evaluation of that response.',
        criteria: ['Clear presence of all four stages.', 'Logic connecting the Problem and the proposed Response.', 'Critical quality of the final Evaluation.']
    }
];

const paraphraseTasks = [
    {
        title: 'Paraphrase 1: Academic sentence (given–new and light nominalization)',
        source: '“A teacher casually mentions that kids these days just learn everything on their own from their phones and that it changes the whole classroom.”',
        prompt: 'Rewrite this idea as <strong>two consecutive academic sentences</strong>, applying the given–new pattern and using at least one light nominalization.',
        criteria: ['Successful shift from an informal register to an academic one.', 'Given–new continuity between the two sentences.', 'Correct use of the nominalization.']
    },
    {
        title: 'Paraphrase 2: General to specific',
        source: '“Someone posts in a group chat that online learning during the pandemic was a disaster, that almost nobody in their town had internet, and that teachers didn’t even know how to use the platforms.”',
        prompt: 'Rewrite this idea as an <strong>academic paragraph</strong> that moves from general to specific.',
        criteria: ['Shift from an informal register to a formal one.', 'General-to-specific progression.', 'Cohesion between sentences.']
    },
    {
        title: 'Paraphrase 3: PEEL',
        source: '“A student says that reading just because you have to doesn’t really work, that you actually have to understand what you’re reading instead of just running your eyes over the page.”',
        prompt: 'Turn this idea into a complete academic paragraph following the <strong>PEEL</strong> structure.',
        criteria: ['Shift to a formal register.', 'Presence of all four parts of the pattern.', 'Argumentative coherence.']
    },
    {
        title: 'Paraphrase 4: PEEL family',
        source: '“A teacher jokes that with AI around, nobody can tell anymore if a student actually did the homework or the computer did it for them.”',
        prompt: 'Rewrite this idea as an academic paragraph applying <strong>one of the PEEL-family variants</strong> (name it in brackets at the end).',
        criteria: ['Shift from an informal register to a formal one.', 'Consistent use of the chosen structure.', 'Cohesion of the paragraph.']
    },
    {
        title: 'Paraphrase 5: CER',
        source: '“Someone comments that students who use their phones in class end up with worse grades, and that they’ve seen it happen with their own eyes.”',
        prompt: 'Rewrite this idea as an academic paragraph with a <strong>Claim, Evidence and Reasoning</strong>. You may invent plausible, clearly hypothetical data.',
        criteria: ['Shift to formal language.', 'Quality of the Evidence presented.', 'Clarity of the Reasoning that connects the Claim and the Evidence.']
    },
    {
        title: 'Paraphrase 6: SPRE',
        source: '“A friend says that almost nobody at their school has a computer at home, that it leaves them way behind, and that somebody should really do something about it.”',
        prompt: 'Rewrite this idea as an academic paragraph that presents the <strong>Situation, Problem, Response and Evaluation</strong>.',
        criteria: ['Shift from a casual register to a formal one.', 'Presence of all four stages of the pattern.', 'Coherence between the Problem and the proposed Response.']
    }
];

function toAppliedSlide(task) {
    // 12 puntos por tarea: 3 criterios × 4 puntos
    return {
        kind: 'applied',
        title: task.title,
        sourceHtml: task.source,
        prompt: task.prompt,
        rubric: task.criteria.map(criterionText => ({ points: 4, text: criterionText })),
        note: 'Criterios de calificación tomados de «Writing Exercises for Assessment (Midterm 1, Chapters 2 to 7)» del libro.'
    };
}

module.exports = {
    order: 20,
    slug: 'midterm',
    key: 'midterm',
    lessonName: 'pattern midterm',
    label: 'Midterm: patterns 2–7',
    part: 'Assessment',
    chapter: '2–7',
    title: 'Midterm: Writing Patterns 2–7',
    generalCriteria: false,
    patternName: 'Patterns from chapters 2 to 7',
    keywords: [],
    minWords: 20,
    maxWords: 200,
    rubric: [],
    slides: [
        {
            kind: 'intro',
            objective: 'This assessment has <strong>12 short writing tasks</strong>: six open-topic tasks and six paraphrase tasks, one pair for each pattern from lessons 2 to 7. Each task states the criteria it will be graded on. Write every answer yourself, in your own words.',
            minutes: 60,
            note: '<strong>Evaluación:</strong> 12 ejercicios de «Writing Exercises for Assessment» (Cap. 2–7). Se califican con el agente test-grader y la rúbrica embebida (4 puntos × 3 criterios). El promedio entra al score de la lección.'
        },
        {
            kind: 'read',
            title: 'Instructions',
            html: `<ul>
            <li>Part A: <strong>open-topic</strong> tasks. You choose the content; the pattern is assigned.</li>
            <li>Part B: <strong>paraphrase</strong> tasks. You turn an informal remark into academic prose using the assigned pattern.</li>
            <li>Each answer is graded on three criteria shown under the task.</li>
            <li>Write complete sentences. Do not label the moves in the text unless the task asks you to name a variant.</li>
        </ul>`
        },
        ...openTopicTasks.map(toAppliedSlide),
        ...paraphraseTasks.map(toAppliedSlide),
        {
            kind: 'essay',
            minutes: 5,
            warning: 'Last step: a short reflection. Your writing is still tracked for academic integrity.',
            promptHtml: 'In <strong>three to five sentences</strong>, name the pattern you found most difficult in this assessment and explain, in English, which move was hardest to produce and why.',
            checklist: [
                'I name one specific pattern.',
                'I identify one specific move that was hard (for example, Explanation, Reasoning or Evaluation).',
                'I give a reason, not just a feeling.'
            ],
            note: 'Reflexión metacognitiva de cierre.'
        }
    ]
};
