/* api/agents/memory.js
 * Agente de Memoria — gestión interna de perfiles de estudiantes.
 * NO es un endpoint HTTP. El orquestador lo llama internamente.
 *
 * Responsabilidades:
 *   getProfile(studentId, sbUrl, sbKey)   → lee session_cache → student_profiles
 *   buildContextString(profile)           → convierte perfil a Segmento B
 *   saveSessionCache(studentId, ...)      → actualiza cache de 4 horas
 *   compressHistory(studentId, ...)       → comprime historial con Claude (cron)
 */

const { groqChat } = require('../groq-client');
const PROMPTS      = require('./_prompts');

// ── Helpers de Supabase ──────────────────────────────────────────────────────

async function _sbGet(supabaseUrl, supabaseKey, path) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        headers: {
            'apikey':        supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
        }
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase GET ${path} → ${res.status}: ${text}`);
    }
    return res.json();
}

async function _sbUpsert(supabaseUrl, supabaseKey, table, record, onConflict) {
    const url = `${supabaseUrl}/rest/v1/${table}`;
    const res = await fetch(url, {
        method:  'POST',
        headers: {
            'Content-Type':  'application/json',
            'apikey':         supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Prefer':        `resolution=merge-duplicates,return=minimal`
        },
        body: JSON.stringify(record)
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Supabase UPSERT ${table} → ${res.status}: ${text}`);
    }
    return true;
}

// ── Perfil vacío para estudiantes nuevos ─────────────────────────────────────

function _defaultProfile(studentId) {
    return {
        student_id:       studentId,
        strengths:        [],
        weaknesses:       [],
        writing_patterns: {
            avg_words_per_essay:  0,
            avg_integrity_score:  null,
            paste_tendency:       'unknown',
            vocabulary_level:     'unknown',
            common_errors:        []
        },
        engagement: {
            sessions_completed:    0,
            days_since_last_session: null,
            completion_rate_pct:   0,
            risk_level:            'active'
        },
        session_summary: 'New student — no sessions recorded yet.',
        is_default:      true   // indica que no hay datos reales aún
    };
}

// ── getProfile ───────────────────────────────────────────────────────────────
// Prioridad: session_cache (4h) → student_profiles → perfil vacío

async function getProfile(studentId, supabaseUrl, supabaseKey) {
    if (!studentId || !supabaseUrl || !supabaseKey) {
        return _defaultProfile(studentId || 'unknown');
    }

    // 1. Buscar en session_cache (TTL 4 horas)
    try {
        const cacheRows = await _sbGet(
            supabaseUrl, supabaseKey,
            `session_cache?student_id=eq.${studentId}&select=context_blob,expires_at&limit=1`
        );
        if (cacheRows && cacheRows.length > 0) {
            const row = cacheRows[0];
            if (new Date(row.expires_at) > new Date()) {
                // Cache válido — parsear y devolver
                return JSON.parse(row.context_blob);
            }
        }
    } catch (e) {
        console.warn('⚠️ Memory: session_cache read failed:', e.message);
    }

    // 2. Buscar en student_profiles (datos persistentes)
    try {
        const profileRows = await _sbGet(
            supabaseUrl, supabaseKey,
            `student_profiles?student_id=eq.${studentId}&select=*&limit=1`
        );
        if (profileRows && profileRows.length > 0) {
            const profile = profileRows[0];
            // Guardar en session_cache para próxima llamada
            await saveSessionCache(studentId, profile, supabaseUrl, supabaseKey);
            return profile;
        }
    } catch (e) {
        console.warn('⚠️ Memory: student_profiles read failed:', e.message);
    }

    // 3. Estudiante nuevo — devolver perfil vacío (sin guardarlo aún)
    return _defaultProfile(studentId);
}

// ── buildContextString ────────────────────────────────────────────────────────
// Convierte el perfil JSON en el Segmento B (texto para el mensaje del usuario)

function buildContextString(profile) {
    if (!profile || profile.is_default) {
        return 'STUDENT CONTEXT: New student. No prior sessions recorded.';
    }

    const p = profile;
    const wp = p.writing_patterns || {};
    const eng = p.engagement || {};

    const strengths  = (p.strengths  || []).length > 0
        ? p.strengths.join('; ')
        : 'Not enough data yet';
    const weaknesses = (p.weaknesses || []).length > 0
        ? p.weaknesses.join('; ')
        : 'Not enough data yet';
    const errors = (wp.common_errors || []).length > 0
        ? wp.common_errors.join(', ')
        : 'none identified';

    return `STUDENT CONTEXT:
Strengths: ${strengths}
Weaknesses: ${weaknesses}
Vocabulary level: ${wp.vocabulary_level || 'unknown'}
Avg words/essay: ${wp.avg_words_per_essay || 0}
Avg integrity score: ${wp.avg_integrity_score != null ? wp.avg_integrity_score + '%' : 'no data'}
Paste tendency: ${wp.paste_tendency || 'unknown'}
Common errors: ${errors}
Sessions completed: ${eng.sessions_completed || 0}
Completion rate: ${eng.completion_rate_pct || 0}%
Engagement status: ${eng.risk_level || 'active'}
Recent sessions: ${p.session_summary || 'no summary available'}`;
}

// ── saveSessionCache ──────────────────────────────────────────────────────────
// Guarda o actualiza el cache de sesión (TTL = 4 horas, igual que auth)

async function saveSessionCache(studentId, profile, supabaseUrl, supabaseKey) {
    if (!studentId || !supabaseUrl || !supabaseKey) return;

    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    try {
        await _sbUpsert(supabaseUrl, supabaseKey, 'session_cache', {
            student_id:   studentId,
            context_blob: JSON.stringify(profile),
            expires_at:   expiresAt,
            created_at:   new Date().toISOString()
        });
    } catch (e) {
        console.warn('⚠️ Memory: saveSessionCache failed (non-critical):', e.message);
    }
}

// ── compressHistory ───────────────────────────────────────────────────────────
// Llama a Claude Haiku para comprimir el historial del estudiante en un perfil.
// Llamado por el cron nocturno — nunca en tiempo real.

async function compressHistory(studentId, supabaseUrl, supabaseKey, groqApiKey) {
    if (!studentId || !supabaseUrl || !supabaseKey || !groqApiKey) {
        throw new Error('compressHistory: missing required parameters');
    }

    // 1. Obtener datos del estudiante (últimos 90 días)
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const [logs, essays] = await Promise.all([
        _sbGet(supabaseUrl, supabaseKey,
            `activity_logs?student_id=eq.${studentId}&created_at=gte.${since}&select=activity,result,created_at&order=created_at.desc&limit=50`),
        _sbGet(supabaseUrl, supabaseKey,
            `essay_submissions?student_id=eq.${studentId}&created_at=gte.${since}&select=activity,words,integrity_score,pastes,chars_typed_ratio,created_at&order=created_at.desc&limit=20`)
    ]);

    if ((!logs || logs.length === 0) && (!essays || essays.length === 0)) {
        return _defaultProfile(studentId);
    }

    // 2. Preparar resumen de datos para Claude
    const dataSummary = `
ACTIVITY LOGS (last 90 days, most recent first):
${(logs || []).slice(0, 20).map(l => `- ${l.activity}: ${l.result} (${l.created_at?.slice(0,10)})`).join('\n')}

ESSAY SUBMISSIONS (last 90 days):
${(essays || []).slice(0, 10).map(e =>
    `- ${e.activity}: ${e.words} words, integrity=${e.integrity_score}%, pastes=${e.pastes}, typed_ratio=${e.chars_typed_ratio}%`
).join('\n')}
`.trim();

    // 3. Llamar a Groq (llama-3.1-8b-instant ≈ Haiku) para generar el perfil comprimido
    const groqResult = await groqChat({
        apiKey:      groqApiKey,
        model:       'llama-3.1-8b-instant',
        system:      PROMPTS.memory,
        userContent: `Compress the following student activity data into the required JSON profile format:\n\n${dataSummary}`,
        maxTokens:   600
    });

    const responseText = groqResult.text;

    // 4. Parsear JSON de la respuesta
    let profile;
    try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        profile = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
        profile.student_id = studentId;
        profile.updated_at = new Date().toISOString();
    } catch (e) {
        console.error('⚠️ Memory: compressHistory failed to parse response:', e.message);
        return _defaultProfile(studentId);
    }

    // 5. Guardar en student_profiles
    try {
        await _sbUpsert(supabaseUrl, supabaseKey, 'student_profiles', profile);
        await saveSessionCache(studentId, profile, supabaseUrl, supabaseKey);
    } catch (e) {
        console.error('⚠️ Memory: failed to save profile:', e.message);
    }

    return profile;
}

module.exports = { getProfile, buildContextString, saveSessionCache, compressHistory };
