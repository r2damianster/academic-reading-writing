/* js/essay-handler.js
 * Dos responsabilidades:
 * 1. BÓVEDA: guardar y recuperar ensayos en localStorage
 * 2. EssayHandler: trackear el textarea (keystrokes, pastes,
 *    deletions, tiempos, ratio) y enviar al log al hacer submit
 *
 * Uso en cualquier HTML con textarea:
 *   EssayHandler.init('lesson name')   ← cuando el slide del essay se vuelve visible
 *   EssayHandler.submit()              ← en el botón Submit
 */

// --- BÓVEDA ---

window.saveEssay = function (lessonName, content, auditData = null) {
    if (!content || content.trim().length < 5) return;
    let vault = JSON.parse(localStorage.getItem('academicEssays')) || {};
    vault[lessonName] = {
        text:      content,
        timestamp: new Date().toLocaleString(),
        wordCount: content.trim().split(/\s+/).length,
        audit:     auditData || null
    };
    localStorage.setItem('academicEssays', JSON.stringify(vault));
    console.log("📝 Essay saved to vault:", lessonName);
};

window.getEssay = function (lessonName) {
    let vault = JSON.parse(localStorage.getItem('academicEssays')) || {};
    return vault[lessonName] ? vault[lessonName].text : null;
};

window.getEssayAudit = function (lessonName) {
    let vault = JSON.parse(localStorage.getItem('academicEssays')) || {};
    return vault[lessonName] ? vault[lessonName].audit : null;
};


// --- ESSAY HANDLER ---

window.EssayHandler = (function () {

    let _lessonName    = "";
    let _textareaId    = "essayInput";
    let _wordCountId   = "wordCountDisplay";

    let _pastesMade    = 0;
    let _totalKeys     = 0;
    let _deletions     = 0;
    let _slideStart    = null;
    let _firstKeyTime  = null;
    let _lastKeyTime   = null;
    let _tabBaseline   = 0;  // tab-switches already accumulated before essay init

    function _onPaste()  { _pastesMade++; }

    function _onKeydown(e) {
        const isPrintable = e.key.length === 1;
        const isDeletion  = e.key === 'Backspace' || e.key === 'Delete';

        if (isPrintable) {
            _totalKeys++;
            _lastKeyTime = Date.now();
            if (!_firstKeyTime) _firstKeyTime = Date.now();
        }
        if (isDeletion) {
            _deletions++;
            _lastKeyTime = Date.now();
        }
    }

    function _updateWordCount() {
        const textarea = document.getElementById(_textareaId);
        const display  = document.getElementById(_wordCountId);
        if (!textarea || !display) return;
        const words = textarea.value.trim() ? textarea.value.trim().split(/\s+/).length : 0;
        display.innerText = words;
    }

    function init(lessonName, textareaId = "essayInput", wordCountId = "wordCountDisplay") {
        _lessonName   = lessonName;
        _textareaId   = textareaId;
        _wordCountId  = wordCountId;
        _pastesMade   = 0;
        _totalKeys    = 0;
        _deletions    = 0;
        _slideStart   = Date.now();
        _firstKeyTime = null;
        _lastKeyTime  = null;
        // Snapshot tab-switches already accumulated reading prior slides —
        // integrity only counts switches that happen while writing.
        _tabBaseline  = (typeof ActivityTracker !== 'undefined')
            ? (ActivityTracker.getActivityAudit().tabSwitches || 0)
            : 0;

        const textarea = document.getElementById(_textareaId);
        if (textarea) {
            textarea.addEventListener('paste',   _onPaste);
            textarea.addEventListener('keydown', _onKeydown);
            textarea.addEventListener('input',   _updateWordCount);
        }

        console.log("✍️ EssayHandler initialized for:", _lessonName);
    }

    // Mirrors the same logic as _calcIntegrity in slide-engine.js.
    // Kept here so the final audit is self-contained at submit time.
    function _calcIntegrityScore(pastes, keystrokes, totalChars, tabSwitches, deletions, writingDuration, words) {
        let score = 100;

        // PASTE: severity depends on how much text was actually pasted (inverse of typed ratio)
        // A paste of a short quote with ratio=94% is very different from dumping a full essay
        if (pastes > 0 && totalChars > 30) {
            const ratio     = Math.round((keystrokes / totalChars) * 100);
            const pastedPct = Math.max(0, 100 - ratio);
            if      (pastedPct >= 60) score -= 50;
            else if (pastedPct >= 30) score -= 25;
            else if (pastedPct >= 10) score -= 10;
            else                      score -= 5;   // paste detected but typed almost everything
        } else if (pastes > 0) {
            score -= 20; // not enough chars to judge — conservative
        }

        if (tabSwitches >= 5)        score -= Math.min(tabSwitches * 4, 25);
        else if (tabSwitches >= 2)   score -= tabSwitches * 3;

        if (words > 10 && deletions > 0) {
            const delRatio = deletions / Math.max(keystrokes, 1);
            if (delRatio > 0.6)      score -= 10;
        }
        // Fast completion only flags genuine speed — not when paste explains it
        if (pastes === 0 && words > 30 && writingDuration > 0 && writingDuration < 30) score -= 15;

        return Math.max(0, score);
    }

    function submit() {
        try {
            const textarea   = document.getElementById(_textareaId);
            const essayText  = textarea ? textarea.value : "";
            const totalChars = essayText.trim().length;
            const words      = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

            // 1. OBTENER DATOS DEL ACTIVITY TRACKER
            const activityAudit = (typeof ActivityTracker !== 'undefined')
                ? ActivityTracker.getActivityAudit()
                : { tabSwitches: 0 };

            const timeToFirstKey  = (_firstKeyTime && _slideStart)
                ? Math.round((_firstKeyTime - _slideStart) / 1000)
                : 0;

            const writingDuration = (_firstKeyTime && _lastKeyTime)
                ? Math.round((_lastKeyTime - _firstKeyTime) / 1000)
                : 0;

            const charsTypedRatio = totalChars > 0
                ? Math.round((_totalKeys / totalChars) * 100)
                : 0;

            const tabSwitches = Math.max(0, (activityAudit.tabSwitches || 0) - _tabBaseline);

            const integrityScore = _calcIntegrityScore(
                _pastesMade, _totalKeys, totalChars,
                tabSwitches, _deletions, writingDuration, words
            );

            // 2. CONSTRUIR EL AUDIT — nombres canónicos usados en TODO el sistema
            const fullAudit = {
                words:           words,
                pastes:          _pastesMade,
                tabSwitches:     tabSwitches,
                keystrokes:      _totalKeys,
                deletions:       _deletions,
                timeToFirstKey:  timeToFirstKey,
                writingDuration: writingDuration,
                charsTypedRatio: charsTypedRatio,
                integrityScore:  integrityScore      // ← nuevo campo canónico
            };

            console.log("🚀 Enviando auditoría completa:", fullAudit);

            // 3. GUARDAR EN BÓVEDA LOCAL
            const saver = (window.parent && window.parent.saveEssay) || window.saveEssay;
            if (typeof saver === 'function') {
                saver(_lessonName, essayText, fullAudit);
            }

            // 4. FINALIZAR Y ENVIAR AL SHEET — llamada ÚNICA (sin duplicado)
            if (typeof window.finishLessonWithEssay === 'function') {
                window.finishLessonWithEssay(_lessonName, essayText, fullAudit);
            } else {
                console.error("❌ finishLessonWithEssay no encontrada");
                alert("Progress saved locally, but server sync function is missing.");
            }

        } catch (error) {
            console.error("❌ ERROR CRÍTICO EN SUBMIT:", error);
            alert("Error al procesar el envío. Revisa la consola (F12).");
        }
    }

    function getLiveStats() {
        const textarea  = document.getElementById(_textareaId);
        const totalChars = textarea ? textarea.value.trim().length : 0;
        const now        = Date.now();
        const writingDuration = (_firstKeyTime && _lastKeyTime)
            ? Math.round((_lastKeyTime - _firstKeyTime) / 1000)
            : 0;
        const rawTabs     = (typeof ActivityTracker !== 'undefined')
            ? (ActivityTracker.getActivityAudit().tabSwitches || 0)
            : 0;
        const tabSwitches = Math.max(0, rawTabs - _tabBaseline);
        return {
            keystrokes:      _totalKeys,
            deletions:       _deletions,
            pastes:          _pastesMade,
            tabSwitches:     tabSwitches,
            totalChars:      totalChars,
            writingDuration: writingDuration
        };
    }

    return { init, submit, getLiveStats };

})();