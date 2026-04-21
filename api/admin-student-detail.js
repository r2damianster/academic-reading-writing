/* api/admin-student-detail.js
 * Returns full activity and essay history for a single student.
 * Uses SUPABASE_SERVICE_KEY to bypass RLS.
 * GET /api/admin-student-detail?studentId=<uuid>
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

    const studentId = req.query && req.query.studentId;
    if (!studentId || !/^[0-9a-f-]{36}$/i.test(studentId)) {
        return res.status(400).json({ error: 'Valid studentId required' });
    }

    try {
        const id = encodeURIComponent(studentId);

        const [activities, essays, compliance, reading] = await Promise.all([
            sbFetch(`activity_logs?student_id=eq.${id}&order=created_at.desc&limit=500`),
            sbFetch(`essay_submissions?student_id=eq.${id}&select=id,activity,words,pastes,keystrokes,deletions,tab_switches,writing_duration,chars_typed_ratio,integrity_score,essay_text,created_at&order=created_at.desc&limit=200`),
            sbFetch(`essay_compliance_results?student_id=eq.${id}&select=submission_id,criteria_met,criteria_total,compliance_pct,created_at&order=created_at.desc&limit=200`),
            sbFetch(`reading_progress?student_id=eq.${id}&order=created_at.desc&limit=200`)
        ]);

        // Index compliance by submission_id
        const compMap = {};
        for (const c of compliance) {
            compMap[c.submission_id] = c;
        }

        const essaysWithCompliance = essays.map(e => ({
            ...e,
            compliance: compMap[e.id] || null
        }));

        return res.status(200).json({
            activities,
            essays: essaysWithCompliance,
            reading
        });

    } catch (e) {
        console.error('🔥 admin-student-detail error:', e.message);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
