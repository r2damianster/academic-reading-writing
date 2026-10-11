-- DT-009: PEER (Relevance) → PEEL (Link) en las rúbricas ya sembradas.
-- Cambia SOLO los textos; la clave técnica "peer_architecture_rigor" se conserva
-- para no romper test_evaluations ni el prompt del test-grader.
-- Idempotente: si ya está migrado, los replace no encuentran nada.
-- Ejecutar en el SQL Editor de Supabase. Revisar el SELECT final antes de dar por bueno.

UPDATE test_rubrics
SET indicators = replace(replace(replace(replace(replace(
        indicators::text,
        'PEER Architecture Rigor', 'PEEL Architecture Rigor'),
        'Point, Evidence, Explanation, Relevance.', 'Point, Evidence, Explanation, Link.'),
        '(frequently Evidence or Relevance)', '(frequently Evidence or Link)'),
        'PEER architecture is deficient', 'PEEL architecture is deficient'),
        'Total absence of the PEER structure', 'Total absence of the PEEL structure')::jsonb
WHERE test_id IN ('test1 fundamentals', 'test2 essays')
  AND indicators::text LIKE '%PEER%';

-- Verificación: no debe quedar ninguna fila con "PEER" ni "Relevance"
SELECT test_id, version, is_active,
       indicators::text LIKE '%PEER%'      AS aun_dice_peer,
       indicators::text LIKE '%Relevance%' AS aun_dice_relevance
FROM test_rubrics
WHERE test_id IN ('test1 fundamentals', 'test2 essays');
