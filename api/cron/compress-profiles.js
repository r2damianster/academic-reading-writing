/* api/cron/compress-profiles.js
 * Cron nocturno del Memory Agent — compresión de perfiles de estudiantes.
 *
 * Qué hace:
 *   1. Obtiene todos los estudiantes con actividad en los últimos 90 días
 *   2. Para cada uno, llama a Memory.compressHistory() que:
 *      - Lee activity_logs + essay_submissions + reading_progress
 *      - Llama a Haiku para generar el perfil comprimido JSON
 *      - Guarda el resultado en student_profiles y session_cache
 *   3. Devuelve un resumen de cuántos perfiles se actualizaron
 *
 * Configuración en Vercel (vercel.json):
 *   {
 *     "crons": [{ "path": "/api/cron/compress-profiles", "schedule": "0 3 * * *" }]
 *   }
 *   → Se ejecuta todos los días a las 03:00 UTC (UTC-5 = 22:00 Ecuador)
 *
 * Seguridad:
 *   - Vercel añade automáticamente el header "authorization: Bearer <CRON_SECRET>"
 *   - Este endpoint valida ese token antes de ejecutar.
 *   - Agregar CRON_SECRET a las variables de entorno en Vercel.
 */

require('dotenv').config();

const Memory = require('../agents/memory');

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');

    // ── Seguridad: solo Vercel Cron o llamadas autorizadas ───────────────────
    const cronSecret  = process.env.CRON_SECRET || '';
    const authHeader  = req.headers['authorization'] || '';
    const isVercelCron = req.headers['x-vercel-cron'] === '1'; // header interno de Vercel

    if (cronSecret && !isVercelCron) {
        const provided = authHeader.replace('Bearer ', '').trim();
        if (provided !== cronSecret) {
            res.statusCode = 401;
            res.end(JSON.stringify({ error: 'Unauthorized' }));
            return;
        }
    }

    if (req.method !== 'GET' && req.method !== 'POST') {
        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const SB_URL     = process.env.SUPABASE_URL        || '';
    const SB_SERVICE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || '';
    const GROQ_KEY   = process.env.GROQ_TOKEN           || '';

    if (!SB_URL || !SB_SERVICE || !GROQ_KEY) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Missing required environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, GROQ_TOKEN)' }));
        return;
    }

    const startTime = Date.now();
    const results   = { updated: 0, skipped: 0, errors: 0, students: [] };

    try {
        // 1. Obtener estudiantes activos en los últimos 90 días
        const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

        const studentsRes = await fetch(
            `${SB_URL}/rest/v1/activity_logs?select=student_id&created_at=gte.${cutoff}&student_id=not.is.null`,
            { headers: { 'apikey': SB_SERVICE, 'Authorization': `Bearer ${SB_SERVICE}` } }
        );

        if (!studentsRes.ok) {
            throw new Error(`Supabase query failed: ${studentsRes.status}`);
        }

        const rows       = await studentsRes.json();
        const studentIds = [...new Set(rows.map(r => r.student_id).filter(Boolean))];

        console.log(`🔄 compress-profiles: ${studentIds.length} students to process`);

        // 2. Procesar en lotes de 5 (evitar rate limiting en la API de Anthropic)
        const BATCH = 5;
        for (let i = 0; i < studentIds.length; i += BATCH) {
            const batch = studentIds.slice(i, i + BATCH);

            await Promise.all(batch.map(async (studentId) => {
                try {
                    await Memory.compressHistory(studentId, SB_URL, SB_SERVICE, GROQ_KEY);
                    results.updated++;
                    results.students.push({ id: studentId, status: 'updated' });
                    console.log(`  ✅ Profile compressed: ${studentId}`);
                } catch (e) {
                    results.errors++;
                    results.students.push({ id: studentId, status: 'error', error: e.message });
                    console.warn(`  ⚠️ Profile compression failed for ${studentId}:`, e.message);
                }
            }));

            // Pausa entre lotes para no saturar la API
            if (i + BATCH < studentIds.length) {
                await new Promise(r => setTimeout(r, 1000));
            }
        }

        // 3. Limpiar session_cache expirado
        try {
            await fetch(
                `${SB_URL}/rest/v1/session_cache?expires_at=lt.${new Date().toISOString()}`,
                {
                    method:  'DELETE',
                    headers: { 'apikey': SB_SERVICE, 'Authorization': `Bearer ${SB_SERVICE}` }
                }
            );
            console.log('🧹 Expired session_cache entries cleaned');
        } catch (e) {
            console.warn('⚠️ session_cache cleanup failed (non-critical):', e.message);
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`✅ compress-profiles done: ${results.updated} updated, ${results.errors} errors in ${elapsed}s`);

        res.statusCode = 200;
        res.end(JSON.stringify({
            success:      true,
            updated:      results.updated,
            skipped:      results.skipped,
            errors:       results.errors,
            total:        studentIds.length,
            elapsed_sec:  parseFloat(elapsed),
            run_at:       new Date().toISOString()
        }));

    } catch (e) {
        console.error('❌ compress-profiles fatal error:', e.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: e.message, partial_results: results }));
    }
};
