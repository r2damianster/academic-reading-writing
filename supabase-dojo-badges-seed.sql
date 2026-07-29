-- Dojo Académico — Catálogo de insignias
--
-- gamification_student_badges.badge_id es FK hacia gamification_badges.badge_id,
-- así que sin estas filas TODO unlock de insignia falla con violación de FK.
-- Los badge_id deben coincidir exactamente con los de checkAndUnlockBadges()
-- en api/gamification.js.
--
-- Aplicado en producción: 2026-07-29

INSERT INTO gamification_badges
  (badge_id, name, name_es, description, description_es, category, source_type, unlock_criteria, points_reward)
VALUES
  ('consistency', 'Consistency', 'Constancia',
   'Maintain a 7-day activity streak.',
   'Mantén una racha de 7 días de actividad.',
   'streak', 'streak', '{"metric":"longest_streak","threshold":7}', 50),

  ('speed-demon', 'Speed Demon', 'Velocista',
   'Earn 10 speed bonuses by finishing exercises quickly.',
   'Consigue 10 bonos de velocidad terminando ejercicios rápido.',
   'performance', 'dojo', '{"metric":"speed_bonus_count","threshold":10}', 50),

  ('quick-thinker', 'Quick Thinker', 'Pensamiento Rápido',
   'Answer 50 QuickThink questions correctly.',
   'Responde correctamente 50 preguntas de QuickThink.',
   'performance', 'dojo', '{"metric":"qt_correct_count","threshold":50}', 75),

  ('essay-master', 'Essay Master', 'Maestro del Ensayo',
   'Complete 25 Dojo exercises.',
   'Completa 25 ejercicios del Dojo.',
   'mastery', 'dojo', '{"metric":"total_exercise_count","threshold":25}', 75),

  ('writing-legend', 'Writing Legend', 'Leyenda de la Escritura',
   'Complete 100 Dojo exercises.',
   'Completa 100 ejercicios del Dojo.',
   'mastery', 'dojo', '{"metric":"total_exercise_count","threshold":100}', 150)

ON CONFLICT (badge_id) DO NOTHING;
