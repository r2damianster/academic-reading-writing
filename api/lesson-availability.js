// api/lesson-availability.js
// Admin-only CRUD proxy for lesson_availability — uses service_role key
// Replaces direct anon-key calls from admin.html for write operations

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const adminPwd = req.headers['x-admin-password'];
    if (!adminPwd || adminPwd !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const BASE = `${process.env.SUPABASE_URL}/rest/v1/lesson_availability`;
    const hdrs = {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    };

    try {
        if (req.method === 'GET') {
            const r = await fetch(
                `${BASE}?select=*,students(name,email)&order=lesson_id.asc,created_at.desc`,
                { headers: hdrs }
            );
            return res.status(r.status).json(await r.json());
        }

        if (req.method === 'POST') {
            const r = await fetch(BASE, {
                method: 'POST',
                headers: { ...hdrs, 'Prefer': 'return=minimal' },
                body: JSON.stringify(req.body)
            });
            return res.status(r.status).end();
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'id required' });
            const r = await fetch(`${BASE}?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
            return res.status(r.status).end();
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (e) {
        console.error('lesson-availability error:', e);
        return res.status(500).json({ error: e.message });
    }
};
