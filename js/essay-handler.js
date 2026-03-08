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

        const textarea = document.getElementById(_textareaId);
        if (textarea) {
            textarea.addEventListener('paste',   _onPaste);
            textarea.addEventListener('keydown', _onKeydown);
            textarea.addEventListener('input',   _updateWordCount);
        }

        console.log("✍️ EssayHandler initialized for:", _lessonName);
    }

    function submit() {
        const textarea   = document.getElementById(_textareaId);
        const essayText  = textarea ? textarea.value : "";
        const totalChars = essayText.trim().length;
        const words      = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

        const timeToFirstKey  = (_firstKeyTime && _slideStart)
            ? Math.round((_firstKeyTime - _slideStart) / 1000)
            : null;

        const writingDuration = (_firstKeyTime && _lastKeyTime)
            ? Math.round((_lastKeyTime - _firstKeyTime) / 1000)
            : null;

        const charsTypedRatio = totalChars > 0
            ? Math.round((_totalKeys / totalChars) * 100)
            : null;

        // Métricas del essay
        const essayAudit = {
            words:              words,
            pastes:             _pastesMade,
            actualKeystrokes:   _totalKeys,
            deletions:          _deletions,
            timeToFirstKeySec:  timeToFirstKey,
            writingDurationSec: writingDuration,
            charsTypedRatio:    charsTypedRatio
        };

        // Combinar con métricas generales de ActivityTracker si está disponible
        const activityAudit = (typeof ActivityTracker !== 'undefined')
            ? ActivityTracker.getActivityAudit()
            : {};

        const fullAudit = { ...essayAudit, ...activityAudit };

        // Guardar en bóveda
        const saver = window.parent.saveEssay || window.saveEssay;
        if (typeof saver === 'function') {
            saver(_lessonName, essayText, fullAudit);
        }

        // Actualizar entrada existente con essay
        if (typeof finishLessonWithEssay === 'function') {
            finishLessonWithEssay(_lessonName, essayText, fullAudit);
        }
    }

    return { init, submit };

})();