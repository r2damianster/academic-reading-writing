-- Migration: seed Test 1 — PEEL Essentials rubric (8 indicators / 10 pts)
-- test_id 'test peel'. Test esencial: 4 párrafos PEEL que responden una pregunta guía.
-- Generado con un script; test_rubrics se crea en test_rubrics.sql.

INSERT INTO test_rubrics (test_id, version, is_active, total_points, indicators, created_by)
VALUES (
    'test peel',
    1,
    TRUE,
    10.00,
    $rubric$[
  {
    "key": "planning_position_and_points",
    "title": "Planning: Position and Four Points (Phase 1)",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "States a clear position that answers the question and drafts four complete, arguable Point sentences, each a distinct reason that supports that position."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Position and four Points are written, but at least one Point is vague, is not arguable, or overlaps with another."
      },
      {
        "label": "In Progress",
        "points": 0.4,
        "desc": "Planning is incomplete: the position is missing or unclear, or 1 or 2 Points are missing or are only phrases."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Omits Phase 1 completely."
      }
    ]
  },
  {
    "key": "paragraph_1_peel_execution",
    "title": "Paragraph 1 — PEEL execution",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 1 executes Point, Evidence, Explanation and Link in order: a clear Point opens it, the Evidence is concrete (datum, source or specific example), the Explanation interprets the Evidence without repeating it, and the Link ties back to the question or the next paragraph. Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 1 follows PEEL, but one component is weak, redundant or misplaced (for example Evidence that is only a general statement, or an Explanation that repeats the Evidence)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 1 only partly follows PEEL (two or more components missing, for example it jumps from Point to Explanation without Evidence)."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 1 is missing, or is a purely descriptive narrative with no PEEL structure."
      }
    ]
  },
  {
    "key": "paragraph_2_peel_execution",
    "title": "Paragraph 2 — PEEL execution",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 2 executes Point, Evidence, Explanation and Link in order: a clear Point opens it, the Evidence is concrete (datum, source or specific example), the Explanation interprets the Evidence without repeating it, and the Link ties back to the question or the next paragraph. Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 2 follows PEEL, but one component is weak, redundant or misplaced (for example Evidence that is only a general statement, or an Explanation that repeats the Evidence)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 2 only partly follows PEEL (two or more components missing, for example it jumps from Point to Explanation without Evidence)."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 2 is missing, or is a purely descriptive narrative with no PEEL structure."
      }
    ]
  },
  {
    "key": "paragraph_3_peel_execution",
    "title": "Paragraph 3 — PEEL execution",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 3 executes Point, Evidence, Explanation and Link in order: a clear Point opens it, the Evidence is concrete (datum, source or specific example), the Explanation interprets the Evidence without repeating it, and the Link ties back to the question or the next paragraph. Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 3 follows PEEL, but one component is weak, redundant or misplaced (for example Evidence that is only a general statement, or an Explanation that repeats the Evidence)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 3 only partly follows PEEL (two or more components missing, for example it jumps from Point to Explanation without Evidence)."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 3 is missing, or is a purely descriptive narrative with no PEEL structure."
      }
    ]
  },
  {
    "key": "paragraph_4_peel_execution",
    "title": "Paragraph 4 — PEEL execution",
    "max_points": 1.5,
    "levels": [
      {
        "label": "Excellent",
        "points": 1.5,
        "desc": "Paragraph 4 executes Point, Evidence, Explanation and Link in order: a clear Point opens it, the Evidence is concrete (datum, source or specific example), the Explanation interprets the Evidence without repeating it, and the Link ties back to the question or the next paragraph. Labels are not written."
      },
      {
        "label": "Satisfactory",
        "points": 1,
        "desc": "Paragraph 4 follows PEEL, but one component is weak, redundant or misplaced (for example Evidence that is only a general statement, or an Explanation that repeats the Evidence)."
      },
      {
        "label": "In Progress",
        "points": 0.5,
        "desc": "Paragraph 4 only partly follows PEEL (two or more components missing, for example it jumps from Point to Explanation without Evidence)."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraph 4 is missing, or is a purely descriptive narrative with no PEEL structure."
      }
    ]
  },
  {
    "key": "one_point_and_position_alignment",
    "title": "One Point per Paragraph and Alignment with the Position",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Each paragraph develops exactly one idea, the four ideas are distinct, each paragraph matches the Point planned in Phase 1, and all of them support the stated position."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "The rule is generally respected, but one paragraph adds a secondary idea or drifts slightly from its planned Point or from the position."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Paragraphs mix several ideas, repeat each other, or contradict the position."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Paragraphs lack a recognizable focus or bear no relation to the question."
      }
    ]
  },
  {
    "key": "register_and_vocabulary",
    "title": "Formal Register and Academic Vocabulary",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Consistently formal register: no contractions, no vague or colloquial words (thing, stuff, a lot, good, bad), precise academic vocabulary and at least one nominalization or hedge where the claim calls for it."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Predominantly formal; an occasional vague word or contraction does not spoil the academic tone."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Repeated informal or vague lexis compromises the academic tone."
      },
      {
        "label": "Unsatisfactory",
        "points": 0,
        "desc": "Systematically informal; the text reads as spoken language."
      }
    ]
  },
  {
    "key": "sentence_mechanics",
    "title": "Sentence Mechanics and Erasure Control",
    "max_points": 1,
    "levels": [
      {
        "label": "Excellent",
        "points": 1,
        "desc": "Advanced grammatical, spelling and punctuation control. Strikethroughs or erasures are clean and never interrupt reading."
      },
      {
        "label": "Satisfactory",
        "points": 0.7,
        "desc": "Minor errors that do not compromise clarity."
      },
      {
        "label": "In Progress",
        "points": 0.35,
        "desc": "Recurrent errors that hinder readability."
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
