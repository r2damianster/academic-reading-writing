-- Migration: create test_rubrics table and seed Test 1 rubric (8 indicators / 10 pts)

CREATE TABLE IF NOT EXISTS test_rubrics (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id      TEXT        NOT NULL,           -- matches essay_submissions.activity
    version      INTEGER     NOT NULL DEFAULT 1,
    is_active    BOOLEAN     DEFAULT TRUE,
    total_points NUMERIC(4,2) DEFAULT 10.00,
    indicators   JSONB       NOT NULL,
    created_by   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(test_id, version)
);

CREATE INDEX IF NOT EXISTS idx_test_rubrics_active ON test_rubrics(test_id) WHERE is_active = TRUE;

-- Row-level security: read-only for anon, full access for service role
ALTER TABLE test_rubrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read rubrics" ON test_rubrics FOR SELECT USING (true);
CREATE POLICY "Service role can manage rubrics" ON test_rubrics FOR ALL USING (auth.role() = 'service_role');

-- ── Seed: Test 1 — Fundamentals rubric (8 indicators, 10 pts total) ────────────
INSERT INTO test_rubrics (test_id, version, is_active, total_points, indicators, created_by)
VALUES (
    'test1 fundamentals',
    1,
    TRUE,
    10.00,
    '[
      {
        "key": "topic_sentence_formulation",
        "title": "Topic Sentence Formulation (Phase 1)",
        "max_points": 1.25,
        "levels": [
          {"label": "Excellent",      "points": 1.25, "desc": "Accurately drafts all 4 Topic Sentences in the outline boxes, demonstrating clear, structured planning."},
          {"label": "Satisfactory",   "points": 0.85, "desc": "Drafts all 4 Topic Sentences, but at least one is conceptually ambiguous or lacks the strength of a main argument."},
          {"label": "In Progress",    "points": 0.50, "desc": "Planning phase is incomplete; 1 or 2 Topic Sentences are missing or written as simple phrases rather than complete sentences."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Omits Phase 1 completely, leaving the planning outline boxes entirely blank."}
        ]
      },
      {
        "key": "block_logical_coherence",
        "title": "Block Logical Coherence (Phase 1 vs. 2)",
        "max_points": 1.25,
        "levels": [
          {"label": "Excellent",      "points": 1.25, "desc": "Faithfully adheres to the chosen structural pattern (Block/Alternating). Exact symmetrical alignment exists between the outline and the final body paragraphs."},
          {"label": "Satisfactory",   "points": 0.85, "desc": "The chosen pattern is evident, but minor thematic or conceptual deviations occur in Phase 2. Transitions between blocks feel somewhat forced."},
          {"label": "In Progress",    "points": 0.50, "desc": "The final paragraphs break the logic of the selected pattern, functioning as isolated and disconnected ideas rather than cohesive blocks."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "The developed body paragraphs bear no logical or thematic relationship to the planning mapped out in Phase 1."}
        ]
      },
      {
        "key": "peer_architecture_rigor",
        "title": "PEER Architecture Rigor",
        "max_points": 1.50,
        "levels": [
          {"label": "Excellent",      "points": 1.50, "desc": "All 4 body paragraphs explicitly, sequentially, and correctly execute the complete model: Point, Evidence, Explanation, Relevance."},
          {"label": "Satisfactory",   "points": 1.00, "desc": "The paragraphs follow the model, but in 1 or 2 of them, a component (frequently Evidence or Relevance) is weak, redundant, or misplaced."},
          {"label": "In Progress",    "points": 0.50, "desc": "PEER architecture is deficient or missing in more than two paragraphs (e.g., jumping from Point to Explanation without providing Evidence)."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Total absence of the PEER structure. Paragraphs are purely descriptive narratives lacking academic scaffolding."}
        ]
      },
      {
        "key": "one_point_rule_compliance",
        "title": "One Point Rule Compliance",
        "max_points": 1.50,
        "levels": [
          {"label": "Excellent",      "points": 1.50, "desc": "Each of the 4 paragraphs remains strictly faithful to a single variable subordinate to the thesis, completely avoiding argumentative drift."},
          {"label": "Satisfactory",   "points": 1.00, "desc": "The rule is generally respected, but a paragraph introduces a minor secondary idea that slightly distracts from the central focus."},
          {"label": "In Progress",    "points": 0.50, "desc": "Systematically violates the rule by mixing multiple independent variables within a single paragraph, diluting the argument’s power."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Paragraphs lack a recognizable central focus, presenting instead an unorganized brainstorming style."}
        ]
      },
      {
        "key": "cause_effect_directionality",
        "title": "Cause and Effect Directionality",
        "max_points": 1.25,
        "levels": [
          {"label": "Excellent",      "points": 1.25, "desc": "Organically integrates at least 1 Cause-oriented and 1 Effect-oriented structure. Connectors point accurately in the direction of scientific reality."},
          {"label": "Satisfactory",   "points": 0.85, "desc": "Includes the required structures, but the use of connectors is repetitive, basic, or feels mechanically forced within the sentence flow."},
          {"label": "In Progress",    "points": 0.50, "desc": "Missing one of the two requirements (presents only cause or only effect) or displays severe errors of inverse directionality."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Fails to use cause/effect connectors, or uses them so incorrectly that it reverses logic and misrepresents scientific fact."}
        ]
      },
      {
        "key": "informal_lexis_exclusion",
        "title": "Exclusion of Informal and Imprecise Lexis",
        "max_points": 1.25,
        "levels": [
          {"label": "Excellent",      "points": 1.25, "desc": "Fully abides by the absolute prohibition: zero use of colloquial or vague terms (thing, bad, good, stuff, a lot). The tone is rigorously scholarly."},
          {"label": "Satisfactory",   "points": 0.85, "desc": "The register is predominantly formal, but a vague term or casual expression occasionally slips in without ruining the global academic tone."},
          {"label": "In Progress",    "points": 0.50, "desc": "Evident and repeated presence of informal or colloquial words that compromise the academic seriousness of the essay."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Systematic failure to maintain a formal register; the text is saturated with informal, slang, or imprecise vocabulary."}
        ]
      },
      {
        "key": "awl_integration",
        "title": "AWL Integration and Weak Verb Substitution",
        "max_points": 1.00,
        "levels": [
          {"label": "Excellent",      "points": 1.00, "desc": "Organically incorporates 5 or more distinct words from the AWL and successfully substitutes general weak verbs (make, do, have, get)."},
          {"label": "Satisfactory",   "points": 0.75, "desc": "Correctly incorporates 3 to 4 words from the AWL. Uses a few weak verbs in isolation but maintains an acceptable undergraduate level."},
          {"label": "In Progress",    "points": 0.25, "desc": "Includes only 1 or 2 words from the AWL, or their use is forced. Heavy reliance on generic, weak everyday verbs."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "No conscious or correct use of the AWL is detected. Vocabulary is flat, basic, and lacks formal academic substitution."}
        ]
      },
      {
        "key": "sentence_mechanics",
        "title": "Sentence Mechanics and Erasure Control",
        "max_points": 1.00,
        "levels": [
          {"label": "Excellent",      "points": 1.00, "desc": "Advanced grammatical, spelling, and syntactic control in English. Strikethroughs or erasures are clean and orderly, never interrupting teacher reading."},
          {"label": "Satisfactory",   "points": 0.75, "desc": "Minor grammatical or punctuation errors that do not compromise clarity. Erasures or strikethroughs disrupt reading very slightly."},
          {"label": "In Progress",    "points": 0.25, "desc": "Recurrent mechanical or syntactic errors that hinder readability. Messy strikethroughs actively interrupt the evaluation process."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Severe language deficiencies (accumulated basic grammatical errors) that prevent comprehension of the student written argument."}
        ]
      }
    ]'::jsonb,
    'arturo.rodriguez@uleam.edu.ec'
)
ON CONFLICT (test_id, version) DO NOTHING;
