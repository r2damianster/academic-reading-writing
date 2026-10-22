-- Migration: seed Test 5 — Writing Patterns rubric (8 indicators / 10 pts)
-- Generado con un script a partir de los datos de la rúbrica; test_rubrics se crea en test_rubrics.sql.
-- El estudiante elige un patrón distinto (SPRE, PEEL, CER, Toulmin) para cada párrafo y lo declara en la Fase 1;
-- el texto evaluado incluye "[PHASE 1 — PLAN]" con "Paragraph N [PATRÓN]: oración".

INSERT INTO test_rubrics (test_id, version, is_active, total_points, indicators, created_by)
VALUES (
    'test5 patterns',
    1,
    TRUE,
    10.00,
    $rubric$[
  {
    "key": "planning_pattern_declaration",
    "title": "Planning and Pattern Declaration (Phase 1)",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Declares a different pattern (SPRE, PEEL, CER, Toulmin) for each of the 4 paragraphs and drafts a complete opening sentence for each, appropriate to that pattern (Situation, Point, Claim, Claim)."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "All 4 patterns are declared once and all 4 opening sentences are written, but at least one is vague or does not suit its pattern."
      },
      {
        "label": "In Progress",
        "points": 0.4,
        "desc": "Planning is incomplete: a pattern is repeated or missing, or 1 or 2 opening sentences are missing or are only phrases."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Omits Phase 1 completely."
      }
    ]
  },
  {
    "key": "paragraph_1_pattern_execution",
    "title": "Paragraph 1 — Executes the declared pattern",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 1 executes every component of the pattern the student declared for it in Phase 1, in order and with clear function (SPRE = Situation, Problem, Response, Evaluation; PEEL = Point, Evidence, Explanation, Link; CER = Claim, Evidence with data, Reasoning; Toulmin = at least 4 of Claim, Grounds, Warrant, Backing, Qualifier, Rebuttal, including an explicit Warrant). Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 1 follows the declared pattern, but one component is weak, redundant or misplaced (for example a Warrant that only repeats the Grounds, or Evidence without data)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 1 only partly follows the declared pattern (two or more components missing), or what was written corresponds to a different pattern than the one declared."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 1 is missing, or shows no recognizable structure of the declared pattern."
      }
    ]
  },
  {
    "key": "paragraph_2_pattern_execution",
    "title": "Paragraph 2 — Executes the declared pattern",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 2 executes every component of the pattern the student declared for it in Phase 1, in order and with clear function (SPRE = Situation, Problem, Response, Evaluation; PEEL = Point, Evidence, Explanation, Link; CER = Claim, Evidence with data, Reasoning; Toulmin = at least 4 of Claim, Grounds, Warrant, Backing, Qualifier, Rebuttal, including an explicit Warrant). Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 2 follows the declared pattern, but one component is weak, redundant or misplaced (for example a Warrant that only repeats the Grounds, or Evidence without data)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 2 only partly follows the declared pattern (two or more components missing), or what was written corresponds to a different pattern than the one declared."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 2 is missing, or shows no recognizable structure of the declared pattern."
      }
    ]
  },
  {
    "key": "paragraph_3_pattern_execution",
    "title": "Paragraph 3 — Executes the declared pattern",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 3 executes every component of the pattern the student declared for it in Phase 1, in order and with clear function (SPRE = Situation, Problem, Response, Evaluation; PEEL = Point, Evidence, Explanation, Link; CER = Claim, Evidence with data, Reasoning; Toulmin = at least 4 of Claim, Grounds, Warrant, Backing, Qualifier, Rebuttal, including an explicit Warrant). Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 3 follows the declared pattern, but one component is weak, redundant or misplaced (for example a Warrant that only repeats the Grounds, or Evidence without data)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 3 only partly follows the declared pattern (two or more components missing), or what was written corresponds to a different pattern than the one declared."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 3 is missing, or shows no recognizable structure of the declared pattern."
      }
    ]
  },
  {
    "key": "paragraph_4_pattern_execution",
    "title": "Paragraph 4 — Executes the declared pattern",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 4 executes every component of the pattern the student declared for it in Phase 1, in order and with clear function (SPRE = Situation, Problem, Response, Evaluation; PEEL = Point, Evidence, Explanation, Link; CER = Claim, Evidence with data, Reasoning; Toulmin = at least 4 of Claim, Grounds, Warrant, Backing, Qualifier, Rebuttal, including an explicit Warrant). Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 4 follows the declared pattern, but one component is weak, redundant or misplaced (for example a Warrant that only repeats the Grounds, or Evidence without data)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 4 only partly follows the declared pattern (two or more components missing), or what was written corresponds to a different pattern than the one declared."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 4 is missing, or shows no recognizable structure of the declared pattern."
      }
    ]
  },
  {
    "key": "pattern_choice_and_coherence",
    "title": "Pertinence of the Pattern Choices and Coherence of the Whole",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Each pattern suits what its paragraph does for the topic, and the four paragraphs read as one coherent mini-essay on the given topic with a sensible order."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Choices are acceptable and the paragraphs relate to the topic, but one pattern is a weak fit for its content or the order feels arbitrary."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Several patterns fit their content poorly, or the paragraphs drift from the topic and do not build on one another."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "The paragraphs bear no relation to the topic or to each other."
      }
    ]
  },
  {
    "key": "hedging_nominalization",
    "title": "Hedging and Nominalization",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Every paragraph includes at least one calibrated hedge (modal verb, approximator, distancing verb or reporting structure) and at least one natural nominalization."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Hedging and nominalization appear in most paragraphs, but one paragraph lacks either, or a hedge is badly calibrated (over- or under-claiming)."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Only isolated hedges or nominalizations appear; most paragraphs lack them."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "No hedging and no nominalization are detected."
      }
    ]
  },
  {
    "key": "register_cohesion_mechanics",
    "title": "Formal Register, Cohesion and Sentence Mechanics",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Consistently formal register with no contractions or vague lexis, clear transitions, and advanced grammatical, spelling and punctuation control. Erasures are clean."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Predominantly formal and cohesive; minor errors or a vague word do not compromise clarity."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Recurrent informal lexis or mechanical errors that hinder readability, or connectors are sparse."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Severe language deficiencies prevent comprehension."
      }
    ]
  }
]$rubric$::jsonb,
    'arturo.rodriguez@uleam.edu.ec'
)
ON CONFLICT (test_id, version) DO NOTHING;
