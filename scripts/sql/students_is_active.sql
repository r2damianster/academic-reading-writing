-- =============================================================================
-- Archivado de estudiantes por semestre (soft-hide, login intacto)
-- =============================================================================

ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);

-- Uso al cerrar un semestre (o vía POST /api/admin-archive-course):
-- UPDATE students SET is_active = false WHERE course_id = 'WRITING101-2026A';

-- Reactivar un curso completo si hace falta:
-- UPDATE students SET is_active = true WHERE course_id = 'WRITING101-2026A';
