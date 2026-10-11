-- GENERADO por scripts/patterns/build.js — categoría 05. Writing Patterns
-- Ejecutar en el SQL Editor de Supabase. Idempotente (ON CONFLICT).
INSERT INTO essay_requirements
    (activity_key, min_words, max_words, min_integrity_score_required,
     target_keywords, min_keyword_matches, required_markers, forbidden_words)
VALUES

('pattern-what-is-a-pattern',
    30, 150, 75,
    '{"pattern": "", "move": "", "structure": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-given-new',
    35, 150, 75,
    '{"this": "", "increase": "", "reduction": "", "analysis": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-general-specific',
    35, 150, 75,
    '{"general": "", "specific": "", "focus": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-peel',
    50, 180, 75,
    '{"point": "", "evidence": "", "explanation": "", "link": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-peel-family',
    70, 280, 75,
    '{"point": "", "evidence": "", "explanation": "", "link": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-cer',
    40, 160, 75,
    '{"claim": "", "evidence": "", "reasoning": "", "significant": "", "mean": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-spre',
    45, 180, 75,
    '{"situation": "", "problem": "", "response": "", "evaluation": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-toulmin',
    70, 230, 75,
    '{"claim": "", "grounds": "", "warrant": "", "because": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-they-say-i-say',
    70, 240, 75,
    '{"argues": "", "however": "", "evidence": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-concession',
    70, 240, 75,
    '{"although": "", "however": "", "nevertheless": "", "concession": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-comparison',
    90, 260, 75,
    '{"whereas": "", "in contrast": "", "similarly": "", "both": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-cause-effect',
    45, 170, 75,
    '{"since": "", "because": "", "result": "", "leads to": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-classification',
    40, 170, 75,
    '{"classified": "", "categories": "", "types": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-process',
    45, 170, 75,
    '{"first": "", "then": "", "finally": "", "were": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-cars',
    45, 170, 75,
    '{"however": "", "this study": "", "gap": "", "research": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-imrad',
    50, 180, 75,
    '{"introduction": "", "methods": "", "results": "", "discussion": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-ice',
    45, 170, 75,
    '{"according": "", "puts it": "", "suggests": "", "quotation": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-metadiscourse',
    50, 180, 75,
    '{"may": "", "likely": "", "however": "", "suggests": "", "clearly": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-breaking-patterns',
    70, 260, 75,
    '{"pattern": "", "move": "", "reader": ""}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
),

('pattern-midterm',
    20, 200, 75,
    '{}',
    1,
    ARRAY[]::TEXT[],
    ARRAY['gonna','wanna','kinda','I think','I believe']
)

ON CONFLICT (activity_key) DO UPDATE SET
    min_words = EXCLUDED.min_words,
    max_words = EXCLUDED.max_words,
    min_integrity_score_required = EXCLUDED.min_integrity_score_required,
    target_keywords = EXCLUDED.target_keywords,
    min_keyword_matches = EXCLUDED.min_keyword_matches,
    required_markers = EXCLUDED.required_markers,
    forbidden_words = EXCLUDED.forbidden_words;
