/* api/admin-students.js
 * Lista todos los estudiantes con stats agregados para el admin dashboard.
 * Usa SUPABASE_SERVICE_KEY (o SUPABASE_KEY como fallback) para leer todas las filas.
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const sbUrl = process.env.SUPABASE_URL || '';
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

    if (!sbUrl || !sbKey) {
        return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(sbUrl, sbKey);

    try {
        const [
            { data: students, error: e1 },
            { data: essays,   error: e2 },
            { data: activities, error: e3 },
            { data: reading,  error: e4 }
        ] = await Promise.all([
            supabase.from('students').select('id,name,email,course,major').order('name'),
            supabase.from('essay_submissions').select('student_id,integrity_score,created_at').order('created_at', { ascending: false }).limit(5000),
            supabase.from('activity_logs').select('student_id,activity,created_at').order('created_at', { ascending: false }).limit(5000),
            supabase.from('reading_progress').select('student_id,lesson_name,score,completed_at').eq('slide_id', -1).order('completed_at', { ascending: false }).limit(5000)
        ]);

        if (e1) return res.status(500).json({ error: 'students: ' + e1.message });
        if (e2) return res.status(500).json({ error: 'essay_submissions: ' + e2.message });
        if (e3) return res.status(500).json({ error: 'activity_logs: ' + e3.message });
        if (e4) return res.status(500).json({ error: 'reading_progress: ' + e4.message });

        const essayMap = {};
        for (const e of (essays || [])) {
            if (!essayMap[e.student_id]) essayMap[e.student_id] = { scores: [], count: 0, alerts: 0 };
            essayMap[e.student_id].scores.push(e.integrity_score ?? 100);
            essayMap[e.student_id].count++;
            if ((e.integrity_score ?? 100) < 60) essayMap[e.student_id].alerts++;
        }

        const activityMap = {};
        for (const a of (activities || [])) {
            if (!activityMap[a.student_id])
                activityMap[a.student_id] = { activity: a.activity, date: a.created_at, count: 0 };
            activityMap[a.student_id].count++;
        }

        const readingMap = {};
        for (const r of (reading || [])) {
            if (!readingMap[r.student_id])
                readingMap[r.student_id] = { lesson: r.lesson_name, date: r.completed_at, count: 0, scores: [] };
            readingMap[r.student_id].count++;
            if (r.score !== null) readingMap[r.student_id].scores.push(r.score);
        }

        const result = (students || []).map(s => {
            const em = essayMap[s.id]    || { scores: [], count: 0, alerts: 0 };
            const am = activityMap[s.id] || null;
            const rm = readingMap[s.id]  || null;
            const avgEssay = em.scores.length
                ? Math.round(em.scores.reduce((a, b) => a + b, 0) / em.scores.length)
                : null;
            const avgReading = rm?.scores.length
                ? Math.round(rm.scores.reduce((a, b) => a + b, 0) / rm.scores.length)
                : null;
            return {
                id: s.id, name: s.name, email: s.email,
                course: s.course || '', major: s.major || '',
                essays_submitted: em.count, avg_integrity: avgEssay,
                low_integrity_count: em.alerts,
                activity_count: am?.count || 0,
                last_activity: am?.activity || null,
                last_activity_date: am?.date || null,
                reading_completed: rm?.count || 0,
                avg_reading_score: avgReading,
                last_reading: rm?.lesson || null,
                last_reading_date: rm?.date || null
            };
        });

        return res.status(200).json(result);

    } catch (e) {
        console.error('🔥 admin-students:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
