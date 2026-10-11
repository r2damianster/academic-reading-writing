-- GENERADO por scripts/patterns/build.js — categoría 05. Writing Patterns
-- Ejecutar en el SQL Editor de Supabase. Idempotente (ON CONFLICT).
INSERT INTO essay_requirements
    (activity_key, lesson_title, min_words, max_words, min_integrity_score_required,
     target_keywords, min_keyword_matches, required_markers, forbidden_words)
VALUES

('pattern-what-is-a-pattern', 'What Is a Writing Pattern?',
    30, 150, 75,
    '{"pattern": "", "move": "", "structure": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-given-new', 'The Academic Sentence: Given and New',
    35, 150, 75,
    '{"this": "", "increase": "", "reduction": "", "analysis": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-general-specific', 'General to Specific',
    35, 150, 75,
    '{"general": "", "specific": "", "focus": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-peel', 'PEEL: The Master Paragraph',
    50, 180, 75,
    '{"point": "", "evidence": "", "explanation": "", "link": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-peel-family', 'The PEEL Family: MEAL, TEEL, PIE, TRI, WEED',
    70, 280, 75,
    '{"point": "", "evidence": "", "explanation": "", "link": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-cer', 'CER: Reporting Results and Data',
    40, 160, 75,
    '{"claim": "", "evidence": "", "reasoning": "", "significant": "", "mean": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-spre', 'SPRE: Problem and Solution Paragraphs',
    45, 180, 75,
    '{"situation": "", "problem": "", "response": "", "evaluation": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-toulmin', 'Toulmin: The Anatomy of an Argument',
    70, 230, 75,
    '{"claim": "", "grounds": "", "warrant": "", "because": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-they-say-i-say', 'They Say / I Say: Entering the Academic Conversation',
    70, 240, 75,
    '{"argues": "", "however": "", "evidence": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-concession', 'Concession and Counterargument',
    70, 240, 75,
    '{"although": "", "however": "", "nevertheless": "", "concession": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-comparison', 'Comparison: Block and Alternating',
    90, 260, 75,
    '{"whereas": "", "in contrast": "", "similarly": "", "both": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-cause-effect', 'Cause and Effect',
    45, 170, 75,
    '{"since": "", "because": "", "result": "", "leads to": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-classification', 'Classification',
    40, 170, 75,
    '{"classified": "", "categories": "", "types": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-process', 'Process Description',
    45, 170, 75,
    '{"first": "", "then": "", "finally": "", "were": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-cars', 'CARS: Introductions That Create a Research Space',
    45, 170, 75,
    '{"however": "", "this study": "", "gap": "", "research": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-imrad', 'IMRaD: The Macrostructure of a Paper',
    50, 180, 75,
    '{"introduction": "", "methods": "", "results": "", "discussion": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-ice', 'ICE: The Quotation Sandwich',
    45, 170, 75,
    '{"according": "", "puts it": "", "suggests": "", "quotation": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-metadiscourse', 'Metadiscourse: Guiding the Reader',
    50, 180, 75,
    '{"may": "", "likely": "", "however": "", "suggests": "", "clearly": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-breaking-patterns', 'When to Break the Pattern',
    70, 260, 75,
    '{"pattern": "", "move": "", "reader": ""}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
),

('pattern-midterm', 'Midterm: Writing Patterns 2–7',
    20, 200, 75,
    '{}',
    1,
    ARRAY[]::TEXT[],
    '["gonna","wanna","kinda","I think","I believe"]'::jsonb
)

ON CONFLICT (activity_key) DO UPDATE SET
    lesson_title = EXCLUDED.lesson_title,
    min_words = EXCLUDED.min_words,
    max_words = EXCLUDED.max_words,
    min_integrity_score_required = EXCLUDED.min_integrity_score_required,
    target_keywords = EXCLUDED.target_keywords,
    min_keyword_matches = EXCLUDED.min_keyword_matches,
    required_markers = EXCLUDED.required_markers,
    forbidden_words = EXCLUDED.forbidden_words;
