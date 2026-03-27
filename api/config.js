// api/config.js
// Expone las credenciales públicas de Supabase al browser.
// Solo la anon key — nunca la service_role key.
// En Vercel: las variables vienen de Settings → Environment Variables.
// En local: vienen de .env (leídas por server.js con dotenv).

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_KEY || '';

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({
            message: 'Supabase credentials not configured in environment variables.'
        });
    }

    return res.status(200).json({ supabaseUrl, supabaseKey });
};