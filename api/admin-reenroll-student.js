/* api/admin-reenroll-student.js
 * Reinscribe a un estudiante archivado (o activo) en un curso — reactiva su
 * fila y le da un arranque limpio de gamificación para el curso nuevo.
 * El historial de ensayos/lecturas/actividad NO se borra (queda como
 * registro del profesor), solo se resetea el dojo (puntos, racha, insignias)
 * para que no arrastre el desempeño del curso anterior al leaderboard nuevo.
 *
 * POST /api/admin-reenroll-student  body: { studentId, courseId, courseName? }
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { studentId, courseId, courseName } = req.body || {};
    if (!studentId || !/^[0-9a-f-]{36}$/i.test(studentId)) {
        return res.status(400).json({ error: 'Valid studentId (uuid) is required' });
    }
    if (!courseId || !/^[0-9a-f-]{36}$/i.test(courseId)) {
        return res.status(400).json({ error: 'Valid courseId (uuid) is required' });
    }

    const sbUrl = process.env.SUPABASE_URL || '';
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

    if (!sbUrl || !sbKey) {
        return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(sbUrl, sbKey);

    try {
        const studentUpdate = { is_active: true, course_id: courseId };
        if (courseName) studentUpdate.course = courseName;

        const { error: studentError } = await supabase.from('students').update(studentUpdate).eq('id', studentId);
        if (studentError) return res.status(500).json({ error: 'students: ' + studentError.message });

        // Arranque limpio del dojo para el curso nuevo — el desempeño del
        // curso anterior no debe inflar el leaderboard/racha/insignias nuevas.
        const GAMIFICATION_TABLES = ['gamification_student_dojo_progress', 'gamification_streaks', 'gamification_student_badges'];
        for (const table of GAMIFICATION_TABLES) {
            const { error } = await supabase.from(table).delete().eq('student_id', studentId);
            if (error) return res.status(500).json({ error: `${table}: ${error.message}` });
        }

        return res.status(200).json({ success: true, studentId, courseId });
    } catch (e) {
        console.error('🔥 admin-reenroll-student:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
