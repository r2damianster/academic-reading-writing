-- Peer review: rúbrica por sesión + plantilla "SPRE + PEEL + CER + Toulmin" (directriz A).
-- Aditivo y seguro: las sesiones/plantillas existentes quedan con rubric_key = 'peel'.
-- Las rúbricas viven en lib/peer-rubrics.js (claves válidas: 'peel', 'combined').

ALTER TABLE peer_review_sessions  ADD COLUMN IF NOT EXISTS rubric_key TEXT NOT NULL DEFAULT 'peel';
ALTER TABLE peer_review_templates ADD COLUMN IF NOT EXISTS rubric_key TEXT NOT NULL DEFAULT 'peel';

INSERT INTO peer_review_templates (name, rubric_key, instructions, writing_minutes, review_minutes, reviewers_per_essay)
SELECT
    'Peer Review — SPRE + PEEL + CER + Toulmin',
    'combined',
    $instructions$TOPIC: Should universities in Ecuador adopt AI writing assistants in EFL courses?

Write FOUR paragraphs (about 90-120 words each), one per pattern, in this exact order. Do NOT write the labels (Point, Claim, Situation...): the reader must not see them.

1. SPRE (Situation -> Problem -> Response -> Evaluation). Place the reader in the context, point to the gap, describe a concrete response, and judge its result. 4 sentences.
2. PEEL (Point -> Evidence -> Explanation -> Link). Defend ONE benefit. Include a datum or source, interpret it without repeating it, and link back to the topic. 4-6 sentences.
3. CER (Claim -> Evidence -> Reasoning). Invent or recall a small data set (two groups, two means, a difference) and report what the data show. 3-4 sentences.
4. Toulmin. Argue your position with at least FOUR of the six components: Claim, Grounds, Warrant, Qualifier, Backing, Rebuttal. Include at least one hedge and one condition under which your claim would not apply.

Formal academic register. No contractions. Minimum 350 words, maximum 500.$instructions$,
    35, 20, 3
WHERE NOT EXISTS (
    SELECT 1 FROM peer_review_templates WHERE name = 'Peer Review — SPRE + PEEL + CER + Toulmin'
);
