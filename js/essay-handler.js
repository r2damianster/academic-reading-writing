/* js/essay-handler.js
 * Responsabilidades:
 * 1. BÓVEDA: Guardar y recuperar ensayos en localStorage.
 * 2. EssayHandler: Trackear métricas de escritura (teclas, borrados, tiempos) 
 * y enviar los datos al finalizar.
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
            // Cargar si ya existe algo en la bóveda
            const saved = getEssay(lessonName);
            if (saved) {
                textarea.value = saved;
                _updateWordCount();
            }
        }

        console.log("✍️ EssayHandler initialized for:", _lessonName);
    }

    function submit() {
        try {
            const textarea   = document.getElementById(_textareaId);
            const essayText  = textarea ? textarea.value : "";
            
            if (essayText.trim().length < 10) {
                alert("Please write a more substantial response before submitting.");
                return;
            }

            const totalChars = essayText.trim().length;
            const words      = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

            // 1. Obtener datos del ActivityTracker (si existe)
            const activityAudit = (typeof ActivityTracker !== 'undefined')
                ? ActivityTracker.getActivityAudit()
                : { tabSwitches: 0 };

            // 2. Cálculos de tiempos y ratios
            const timeToFirstKey  = (_firstKeyTime && _slideStart)
                ? Math.round((_firstKeyTime - _slideStart) / 1000)
                : "";

            const writingDuration = (_firstKeyTime && _lastKeyTime)
                ? Math.round((_lastKeyTime - _firstKeyTime) / 1000)
                : "";

            const charsTypedRatio = totalChars > 0
                ? Math.round((_totalKeys / totalChars) * 100)
                : "";

            // 3. Construir objeto de auditoría único
            const fullAudit = {
                words:           words,
                pastes:          _pastesMade,
                tabSwitches:     activityAudit.tabSwitches || 0,
                keystrokes:      _totalKeys,
                deletions:       _deletions,
                timeToFirstKey:  timeToFirstKey,
                writingDuration: writingDuration,
                charsTypedRatio: charsTypedRatio
            };

            console.log("🚀 Enviando auditoría única:", fullAudit);

            // 4. Guardar en Bóveda local primero (Seguridad)
            const saver = window.saveEssay || (window.parent && window.parent.saveEssay);
            if (typeof saver === 'function') {
                saver(_lessonName, essayText, fullAudit);
            }

            // 5. LLAMADA ÚNICA al servidor (Google Sheets)
            // Buscamos la función en el entorno global o el padre (si es un iframe)
            const finisher = window.finishLessonWithEssay || 
                           (window.parent && window.parent.finishLessonWithEssay);

            if (typeof finisher === 'function') {
                finisher(_lessonName, essayText, fullAudit);
            } else {
                console.error("❌ No se encontró la función finishLessonWithEssay en ningún contexto.");
                alert("Progress saved locally, but server sync is not available.");
            }

        } catch (error) {
            console.error("❌ ERROR CRÍTICO EN SUBMIT:", error);
            alert("Error al procesar el envío. Revisa la consola (F12).");
        }
    }

    return { init, submit };

})();