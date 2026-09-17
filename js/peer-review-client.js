/* js/peer-review-client.js
 * Cliente de la sesión de Peer Review en vivo. Autocontenido — no depende de
 * slide-engine.js. Habla con api/peer-review-session.js (una sola acción por
 * llamada, ver PeerReview.call).
 *
 * Roles:
 *   Docente (localStorage.isAdmin === 'true' && studentEmail === ADMIN_EMAIL)
 *   Estudiante (localStorage.studentId)
 */

window.PeerReview = (function () {

    const ADMIN_EMAIL   = 'arturo.rodriguez@uleam.edu.ec';
    const ROSTER_POLL_MS = 6000;

    let _configReady = null;
    let _sessionId    = null;
    let _studentId    = null;
    let _studentName  = null;
    let _isTeacher    = false;
    let _teacherPassword = '';
    let _pollTimer    = null;
    let _autosaveTimer = null;

    // ── Integridad de escritura (copia ligera de essay-handler.js) ──────────
    let _pastesMade = 0, _totalKeys = 0, _deletions = 0, _firstKeyTime = null, _lastKeyTime = null, _slideStart = null;

    function _calcIntegrityScore(pastes, keystrokes, totalChars, deletions, writingDuration, words) {
        let score = 100;
        if (pastes > 0 && totalChars > 30) {
            const ratio = Math.round((keystrokes / totalChars) * 100);
            const pastedPct = Math.max(0, 100 - ratio);
            if      (pastedPct >= 60) score -= 50;
            else if (pastedPct >= 30) score -= 25;
            else if (pastedPct >= 10) score -= 10;
            else                      score -= 5;
        } else if (pastes > 0) {
            score -= 20;
        }
        if (words > 10 && deletions > 0) {
            const delRatio = deletions / Math.max(keystrokes, 1);
            if (delRatio > 0.6) score -= 10;
        }
        if (pastes === 0 && words > 30 && writingDuration > 0 && writingDuration < 30) score -= 15;
        return Math.max(0, score);
    }

    function _getConfig() {
        if (!_configReady) {
            _configReady = fetch('/api/config').then(r => r.json());
        }
        return _configReady;
    }

    async function call(action, extra = {}) {
        const body = { action, sessionId: _sessionId, studentId: _studentId, payload: {}, ...extra };
        const res = await fetch('/api/peer-review-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
        return data;
    }

    function _resolveIdentity() {
        _studentId   = localStorage.getItem('studentId');
        _studentName = localStorage.getItem('studentName') || localStorage.getItem('studentEmail') || 'Estudiante';
        const email  = localStorage.getItem('studentEmail') || '';
        _isTeacher   = localStorage.getItem('isAdmin') === 'true' && email.toLowerCase() === ADMIN_EMAIL;
    }

    // ── Escritura con integridad ─────────────────────────────────────────────

    function initWritingTracker(textareaEl) {
        _pastesMade = 0; _totalKeys = 0; _deletions = 0; _firstKeyTime = null; _lastKeyTime = null;
        _slideStart = Date.now();
        textareaEl.addEventListener('paste', () => { _pastesMade++; });
        textareaEl.addEventListener('keydown', (e) => {
            const isPrintable = e.key.length === 1;
            const isDeletion  = e.key === 'Backspace' || e.key === 'Delete';
            if (isPrintable) { _totalKeys++; _lastKeyTime = Date.now(); if (!_firstKeyTime) _firstKeyTime = Date.now(); }
            if (isDeletion)  { _deletions++; _lastKeyTime = Date.now(); }
        });
    }

    function startAutosave(textareaEl) {
        stopAutosave();
        _autosaveTimer = setInterval(() => {
            call('autosave_draft', { payload: { text: textareaEl.value } }).catch(() => {});
        }, 20000);
    }

    function stopAutosave() {
        if (_autosaveTimer) clearInterval(_autosaveTimer);
        _autosaveTimer = null;
    }

    async function submitEssay(textareaEl, lessonName) {
        stopAutosave();
        const essayText  = textareaEl.value;
        const totalChars = essayText.trim().length;
        const words      = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;
        const writingDuration = (_firstKeyTime && _lastKeyTime) ? Math.round((_lastKeyTime - _firstKeyTime) / 1000) : 0;
        const integrityScore  = _calcIntegrityScore(_pastesMade, _totalKeys, totalChars, _deletions, writingDuration, words);

        const { supabaseUrl, supabaseKey } = await _getConfig();
        const res = await fetch(`${supabaseUrl}/rest/v1/essay_submissions`, {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'apikey':         supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Prefer':        'return=representation'
            },
            body: JSON.stringify({
                student_id:             _studentId,
                activity:               `peer-review:${_sessionId}`,
                essay_text:             essayText,
                words,
                pastes:                 _pastesMade,
                keystrokes:             _totalKeys,
                deletions:              _deletions,
                writing_duration:       writingDuration,
                integrity_score:        integrityScore,
                is_update:              false,
                skipped:                false,
                peer_review_session_id: _sessionId
            })
        });
        if (!res.ok) throw new Error('No se pudo guardar el ensayo en Supabase.');
        const rows = await res.json();
        const essaySubmissionId = rows[0].id;
        await call('finish_early', { payload: { essaySubmissionId } });
        return essaySubmissionId;
    }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────

    function startPolling(onUpdate) {
        stopPolling();
        const tick = () => call('roster').then(onUpdate).catch(console.warn);
        tick();
        _pollTimer = setInterval(tick, ROSTER_POLL_MS);
    }

    function stopPolling() {
        if (_pollTimer) clearInterval(_pollTimer);
        _pollTimer = null;
    }

    function setSessionId(id) { _sessionId = id; localStorage.setItem('peerReviewSessionId', id); }
    function getSessionId()   { return _sessionId; }
    function isTeacher()      { return _isTeacher; }
    function getStudentName() { return _studentName; }
    function setTeacherPassword(pw) { _teacherPassword = pw; }
    function teacherPayload(extra = {}) { return { teacherPassword: _teacherPassword, ...extra }; }

    function init() {
        _resolveIdentity();
        const savedSession = localStorage.getItem('peerReviewSessionId');
        if (savedSession) _sessionId = savedSession;
    }

    return {
        init, call, startPolling, stopPolling,
        setSessionId, getSessionId, isTeacher, getStudentName,
        setTeacherPassword, teacherPayload,
        initWritingTracker, startAutosave, stopAutosave, submitEssay
    };
})();
