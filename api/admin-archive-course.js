/* api/admin-archive-course.js
 * Archiva o reactiva de golpe a todos los estudiantes de un course_id (cierre de semestre).
 * POST /api/admin-archive-course  body: { courseId, isActive }
 */
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { courseId, isActive } = req.body || {};
    if (!courseId || typeof courseId !== 'string') {
        return res.status(400).json({ error: 'courseId is required' });
    }
    if (typeof isActive !== 'boolean') {
        return res.status(400).json({ error: 'Body must include boolean isActive' });
    }

    const sbUrl = process.env.SUPABASE_URL || '';
    const sbKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

    if (!sbUrl || !sbKey) {
        return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    const supabase = createClient(sbUrl, sbKey);

    try {
        const { data, error } = await supabase
            .from('students')
            .update({ is_active: isActive })
            .eq('course_id', courseId)
            .select('id');

        if (error) return res.status(500).json({ error: 'students: ' + error.message });

        return res.status(200).json({ success: true, courseId, isActive, affected: (data || []).length });
    } catch (e) {
        console.error('🔥 admin-archive-course:', e.message);
        return res.status(500).json({ error: e.message });
    }
};
