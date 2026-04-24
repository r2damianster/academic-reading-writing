/* api/admin-student-detail.js
 * Historial completo de un estudiante para el admin dashboard.
 * GET /api/admin-student-detail?studentId=<uuid>
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const studentId = req.query && req.query.studentId;
    if (!studentId || !/^[0-9a-f-]{36}$/i.test(studentId)) {
        return res.status(400).json({ error: 'Valid studentId required' });
    }

    const sbUrl = process.env.SUPABASE_URL || '';
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

    if (!sbUrl || !sbKey) {
        return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(sbUrl, sbKey);

    try {
        const [
            { data: activities, error: e1 },
            { data: essays,     error: e2 },
            { data: compliance, error: e3 },
            { data: reading,    error: e4 }
        ] = await Promise.all([
            supabase.from('activity_logs')
                .select('activity,result,created_at')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })
                .limit(500),
            supabase.from('essay_submissions')
                .select('id,activity,words,pastes,keystrokes,deletions,tab_switches,writing_duration,chars_typed_ratio,integrity_score,essay_text,created_at')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })
                .limit(200),
            supabase.from('essay_compliance_results')
                .select('submission_id,criteria_met,criteria_total,compliance_pct,created_at')
                .eq('student_id', studentId)
                .order('created_at', { ascending: false })
                .limit(200),
            supabase.from('reading_progress')
                .select('lesson_name,score,completed_at,duration_sec,slides_total,slide_id')
                .eq('student_id', studentId)
                .eq('slide_id', -1)
                .order('completed_at', { ascending: false })
                .limit(200)
        ]);

        if (e1) return res.status(500).json({ error: 'activity_logs: ' + e1.message });
        if (e2) return res.status(500).json({ error: 'essay_submissions: ' + e2.message });
        if (e3) return res.status(500).json({ error: 'essay_compliance_results: ' + e3.message });
        if (e4) return res.status(500).json({ error: 'reading_progress: ' + e4.message });

        const compMap = {};
        for (const c of (compliance || [])) compMap[c.submission_id] = c;

        const essaysWithCompliance = (essays || []).map(e => ({
            ...e,
            compliance: compMap[e.id] || null
        }));

        const readingMapped = (reading || []).map(r => ({
            lesson:     r.lesson_name,
            completed:  !!(r.completed_at || r.score !== null),
            score:      r.score,
            created_at: r.completed_at
        }));

        return res.status(200).json({
            activities: activities || [],
            essays: essaysWithCompliance,
            reading: readingMapped
        });

    } catch (e) {
        console.error('🔥 admin-student-detail:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
