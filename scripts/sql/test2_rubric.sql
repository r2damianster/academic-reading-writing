-- Migration: seed Test 2 — Essays rubric (8 indicators / 10 pts)
-- Table test_rubrics already created in scripts/sql/test_rubrics.sql

INSERT INTO test_rubrics (test_id, version, is_active, total_points, indicators, created_by)
VALUES (
    'test2 essays',
    1,
    TRUE,
    10.00,
    '[
      {
        "key": "topic_sentence_formulation",
        "title": "Topic Sentence Formulation (Phase 1)",
        "max_points": 1.00,
        "levels": [
          {"label": "Excellent",      "points": 1.00, "desc": "Accurately drafts all 3 Topic Sentences in the outline boxes, each a clear, arguable claim that supports the given thesis."},
          {"label": "Satisfactory",   "points": 0.70, "desc": "Drafts all 3 Topic Sentences, but at least one is conceptually ambiguous or lacks the strength of a main argument."},
          {"label": "In Progress",    "points": 0.40, "desc": "Planning phase is incomplete; 1 or 2 Topic Sentences are missing or written as simple phrases rather than complete sentences."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Omits Phase 1 completely, leaving the planning outline boxes entirely blank."}
        ]
      },
      {
        "key": "peer_architecture_rigor",
        "title": "PEER Architecture Rigor",
        "max_points": 2.00,
        "levels": [
          {"label": "Excellent",      "points": 2.00, "desc": "All 3 argument paragraphs explicitly, sequentially, and correctly execute the complete model: Point, Evidence, Explanation, Relevance."},
          {"label": "Satisfactory",   "points": 1.35, "desc": "The paragraphs follow the model, but in 1 argument a component (frequently Evidence or Relevance) is weak, redundant, or misplaced."},
          {"label": "In Progress",    "points": 0.70, "desc": "PEER architecture is deficient or missing in two or more arguments (e.g., jumping from Point to Explanation without providing Evidence)."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Total absence of the PEER structure. Paragraphs are purely descriptive narratives lacking academic scaffolding."}
        ]
      },
      {
        "key": "thesis_argument_alignment",
        "title": "Thesis-Argument Alignment",
        "max_points": 1.50,
        "levels": [
          {"label": "Excellent",      "points": 1.50, "desc": "Each of the 3 arguments directly and unambiguously supports the given thesis, with no drift toward unrelated claims."},
          {"label": "Satisfactory",   "points": 1.00, "desc": "Arguments generally support the thesis, but one drifts slightly or is only loosely connected."},
          {"label": "In Progress",    "points": 0.50, "desc": "One or more arguments contradict or fail to meaningfully support the given thesis."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Arguments show no coherent relationship to the given thesis."}
        ]
      },
      {
        "key": "heading_vocabulary_connectors",
        "title": "Heading Vocabulary / Organizational Connectors",
        "max_points": 1.50,
        "levels": [
          {"label": "Excellent",      "points": 1.50, "desc": "Uses varied, sophisticated organizational connectors to link ideas within and between paragraphs; avoids basic sequencers (firstly/secondly/finally)."},
          {"label": "Satisfactory",   "points": 1.00, "desc": "Uses organizational connectors correctly, but the range is limited or occasionally relies on basic sequencers."},
          {"label": "In Progress",    "points": 0.50, "desc": "Connector use is sparse, repetitive, or grammatically inaccurate, weakening the essay''s cohesion."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "No organizational connectors are used; paragraphs read as disconnected, unlinked statements."}
        ]
      },
      {
        "key": "awl_integration",
        "title": "AWL Integration",
        "max_points": 1.00,
        "levels": [
          {"label": "Excellent",      "points": 1.00, "desc": "Organically incorporates 2 or more distinct AWL words, correctly used in context."},
          {"label": "Satisfactory",   "points": 0.70, "desc": "Incorporates exactly 2 AWL words, but usage feels forced or slightly imprecise."},
          {"label": "In Progress",    "points": 0.35, "desc": "Includes only 1 AWL word, or attempts are miscategorized (non-AWL vocabulary)."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "No conscious or correct use of AWL vocabulary is detected."}
        ]
      },
      {
        "key": "nominalization_usage",
        "title": "Nominalization and Formality",
        "max_points": 1.50,
        "levels": [
          {"label": "Excellent",      "points": 1.50, "desc": "Consistently uses nominalizations (verb/adjective → noun) throughout the essay to sustain a rigorous, formal academic register."},
          {"label": "Satisfactory",   "points": 1.00, "desc": "Uses nominalizations in several places, but the essay still relies heavily on verbal, less formal phrasing in parts."},
          {"label": "In Progress",    "points": 0.50, "desc": "Only 1 or 2 isolated nominalizations are present; the overall register remains conversational."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "No evidence of nominalization; the essay reads as informal, verb-driven prose."}
        ]
      },
      {
        "key": "conclusion_quality",
        "title": "Conclusion Quality",
        "max_points": 1.00,
        "levels": [
          {"label": "Excellent",      "points": 1.00, "desc": "The conclusion restates the thesis in new words and synthesizes all 3 arguments without introducing new ideas."},
          {"label": "Satisfactory",   "points": 0.70, "desc": "The conclusion restates the thesis and references the arguments, but the synthesis is superficial or one argument is omitted."},
          {"label": "In Progress",    "points": 0.35, "desc": "The conclusion is present but merely repeats the thesis verbatim or introduces new, undeveloped ideas."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "No identifiable conclusion paragraph is present."}
        ]
      },
      {
        "key": "sentence_mechanics",
        "title": "Sentence Mechanics and Erasure Control",
        "max_points": 0.50,
        "levels": [
          {"label": "Excellent",      "points": 0.50, "desc": "Advanced grammatical, spelling, and syntactic control in English. Strikethroughs or erasures are clean and orderly, never interrupting teacher reading."},
          {"label": "Satisfactory",   "points": 0.35, "desc": "Minor grammatical or punctuation errors that do not compromise clarity."},
          {"label": "In Progress",    "points": 0.15, "desc": "Recurrent mechanical or syntactic errors that hinder readability."},
          {"label": "Unsatisfactory", "points": 0.00, "desc": "Severe language deficiencies that prevent comprehension of the student written argument."}
        ]
      }
    ]'::jsonb,
    'arturo.rodriguez@uleam.edu.ec'
)
ON CONFLICT (test_id, version) DO NOTHING;
