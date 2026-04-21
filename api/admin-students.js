/* api/admin-students.js
 * Returns all students with aggregated progress stats for the admin dashboard.
 * Uses SUPABASE_SERVICE_KEY to bypass RLS.
 */
require('dotenv').config();

const SB_URL = process.env.SUPABASE_URL || '';
const SB_KEY = process.env.SUPABASE_SERVICE_KEY || '';

async function sbFetch(path) {
    const r = await fetch(`${SB_URL}/rest/v1/${path}`, {
        headers: {
            'apikey': SB_KEY,
            'Authorization': `Bearer ${SB_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
    return r.json();
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const [students, essays, activities, reading] = await Promise.all([
            sbFetch('students?select=id,name,email,course,major&order=name.asc'),
            sbFetch('essay_submissions?select=student_id,integrity_score,created_at&order=created_at.desc&limit=5000'),
            sbFetch('activity_logs?select=student_id,activity,created_at&order=created_at.desc&limit=5000'),
            sbFetch('reading_progress?select=student_id,lesson,completed,created_at&order=created_at.desc&limit=5000')
        ]);

        // Build lookup maps
        const essayMap = {};
        for (const e of essays) {
            if (!essayMap[e.student_id]) essayMap[e.student_id] = { scores: [], count: 0, alerts: 0 };
            essayMap[e.student_id].scores.push(e.integrity_score ?? 100);
            essayMap[e.student_id].count++;
            if ((e.integrity_score ?? 100) < 60) essayMap[e.student_id].alerts++;
        }

        const activityMap = {};
        for (const a of activities) {
            if (!activityMap[a.student_id]) {
                activityMap[a.student_id] = { activity: a.activity, date: a.created_at };
            }
        }

        const readingMap = {};
        for (const r of reading) {
            if (!readingMap[r.student_id]) {
                readingMap[r.student_id] = { lesson: r.lesson, date: r.created_at };
            }
        }

        const result = students.map(s => {
            const em = essayMap[s.id] || { scores: [], count: 0, alerts: 0 };
            const am = activityMap[s.id] || null;
            const rm = readingMap[s.id] || null;
            const avg = em.scores.length
                ? Math.round(em.scores.reduce((a, b) => a + b, 0) / em.scores.length)
                : null;

            return {
                id: s.id,
                name: s.name,
                email: s.email,
                course: s.course || '',
                major: s.major || '',
                essays_submitted: em.count,
                avg_integrity: avg,
                low_integrity_count: em.alerts,
                last_activity: am ? am.activity : null,
                last_activity_date: am ? am.date : null,
                last_reading: rm ? rm.lesson : null,
                last_reading_date: rm ? rm.date : null
            };
        });

        return res.status(200).json(result);

    } catch (e) {
        console.error('🔥 admin-students error:', e.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
