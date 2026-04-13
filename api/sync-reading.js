/* api/sync-reading.js
 * Endpoint auxiliar para sincronización de progreso de lectura.
 * Reescrito de ES Modules a CommonJS para ser compatible con el resto del proyecto.
 *
 * NOTA: reading-engine.js ya sincroniza reading_progress directamente via Supabase REST
 * en _persistLessonResult() al finalizar cada lección. Este endpoint es un punto de
 * entrada alternativo para integraciones externas o futuros agentes que necesiten
 * registrar progreso de forma incremental (slide a slide) en lugar de al finalizar.
 *
 * POST /api/sync-reading
 * Body: { email, lesson_name, slide_id, action_data, session_id? }
 */

require('dotenv').config();

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin',  '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    // Parsear body — compatible con Vercel y Node.js nativo
    let body;
    try {
        if (req.body && typeof req.body === 'object') {
            body = req.body;
        } else {
            const raw = await new Promise((resolve, reject) => {
                let data = '';
                req.on('data', chunk => { data += chunk.toString(); });
                req.on('end',  ()    => resolve(data));
                req.on('error', e   => reject(e));
            });
            body = JSON.parse(raw);
        }
    } catch (e) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid JSON body' }));
        return;
    }

    const { email, lesson_name, slide_id, action_data, session_id } = body;

    if (!email) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing required field: email' }));
        return;
    }

    const SB_URL = process.env.SUPABASE_URL        || '';
    const SB_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';

    if (!SB_URL || !SB_KEY) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Supabase credentials not configured' }));
        return;
    }

    try {
        // 1. Resolver UUID del estudiante desde su email
        const studentRes = await fetch(
            `${SB_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
            {
                headers: {
                    'apikey':         SB_KEY,
                    'Authorization': `Bearer ${SB_KEY}`
                }
            }
        );
        const students = await studentRes.json();

        if (!students || students.length === 0) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'Student not found' }));
            return;
        }

        const studentId = students[0].id;

        // 2. Insertar fila en reading_progress
        const insertRes = await fetch(`${SB_URL}/rest/v1/reading_progress`, {
            method:  'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':         SB_KEY,
                'Authorization': `Bearer ${SB_KEY}`,
                'Prefer':        'return=minimal'
            },
            body: JSON.stringify({
                student_id:  studentId,
                lesson_name: lesson_name || null,
                slide_id:    slide_id    != null ? parseInt(slide_id) : null,
                action_data: action_data || null,
                session_id:  session_id  || null
            })
        });

        if (!insertRes.ok) {
            const errText = await insertRes.text();
            console.error('sync-reading: Supabase insert error:', insertRes.status, errText);
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Failed to save reading progress', detail: errText }));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, message: 'Progress saved' }));

    } catch (e) {
        console.error('sync-reading: unexpected error:', e.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error', detail: e.message }));
    }
};
