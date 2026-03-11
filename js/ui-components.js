/**
 * ui-components.js
 * Librería de componentes reutilizables - ULEAM
 * Optimizada para integrarse con interactions-handler.js y essay-handler.js
 * Corrección: Navegación dinámica y robustez en botones.
 */

const AcademicUI = {

    /**
     * Crea un botón de navegación.
     * @param {string} text - Texto del botón.
     * @param {string} onClickAction - Función a ejecutar. Si es null, usa nextSlide() por defecto.
     * @param {string} id - ID necesario para que el sistema lo controle (mostrar/ocultar).
     * @param {boolean} isHidden - Si es true, el botón inicia oculto (para quices).
     */
    createButton: function(text, onClickAction = null, id = null, isHidden = false) {
        const display = isHidden ? 'none' : 'block';
        const idAttr = id ? `id="${id}"` : '';
        // Si no se define acción, el estándar es avanzar a la siguiente slide
        const action = onClickAction || 'nextSlide()';
        
        return `<button ${idAttr} class="btn-next" style="display:${display}; margin-top:20px;" 
                onclick="${action}">${text}</button>`;
    },

    /**
     * Genera un bloque de quiz interactivo.
     * @param {string} questionId - Prefijo único para los IDs de feedback.
     * @param {string} questionText - El enunciado (soporta HTML).
     * @param {Array} options - Arreglo de objetos {text, isCorrect}.
     */
    createQuizBlock: function(questionId, questionText, options) {
        let optionsHTML = options.map(opt => `
            <button class="quiz-option" onclick="checkAnswer(this, ${opt.isCorrect}, '${questionId}f')">
                ${opt.text}
            </button>
        `).join('');

        return `
            <div class="quiz-container" style="margin-bottom: 20px;">
                <p><strong>${questionText}</strong></p>
                ${optionsHTML}
                <div id="${questionId}f" class="feedback" style="display:none; margin-top:10px; padding:10px; border-radius:5px;"></div>
            </div>`;
    },

    /**
     * Cuadros de contraste visual para ejemplos de "Correcto vs Incorrecto".
     */
    createContrastBox: function(type, label, content) {
        const isCorrect = type === 'correct';
        const bgColor = isCorrect ? '#d4edda' : '#f8d7da';
        const textColor = isCorrect ? '#155724' : '#721c24';
        const borderColor = isCorrect ? '#28a745' : '#dc3545';
        
        return `
            <div class="example-box" style="padding:15px; border-radius:8px; margin:10px 0; border-left:5px solid ${borderColor}; background-color:${bgColor}; color:${textColor};">
                <span style="font-weight:bold; text-transform:uppercase; font-size:0.8rem; display:block; margin-bottom:5px;">
                    ${label}
                </span>
                <p style="margin:0;">${content}</p>
            </div>`;
    },

    /**
     * Slide de advertencia ética y técnica previa al ensayo.
     * Se integra con EssayHandler para iniciar el cronómetro de escritura.
     */
    // En ui-components.js, actualiza esta parte:
    createEssayWarning: function(lessonName, warningText) {
        return `
            <div class="essay-warning" style="background:#f8f9fa; padding:20px; border-radius:10px; border:1px solid #dee2e6;">
                <h3>Writing Task Instructions</h3>
                <p>${warningText}</p>
                <div style="background:#fff; padding:10px; border-radius:5px; font-size:0.85rem; color:#555; border-left:4px solid #007bff; margin:15px 0;">
                    <strong>Research Tracking Active:</strong> This exercise records integrity data.
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-next" style="flex:2; display:block !important;" 
                            onclick="nextSlide('essaySlide'); if(window.EssayHandler) EssayHandler.init('${lessonName}')">
                        Understand & Start Essay →
                    </button>
                    <button onclick="skipLessonWithData('${lessonName}')" style="flex:1; background:#6c757d; color:white; border:none; border-radius:5px; cursor:pointer;">
                        Skip Writing
                    </button>
                </div>
            </div>`;
    },

    /**
     * Área de trabajo del ensayo.
     * Incluye contador de palabras en tiempo real.
     */
    renderEssaySection: function(lessonName, promptText) {
        return `
            <div class="essay-workspace">
                <h2>Writing Challenge</h2>
                <p style="background:#fff3cd; padding:10px; border-radius:5px; border:1px solid #ffeeba;">
                    <strong>Prompt:</strong> ${promptText}
                </p>
                <textarea id="essayInput" 
                    placeholder="Write your paragraph here..."
                    style="width:100%; height:200px; padding:15px; border-radius:8px; border:1px solid #ccc; font-family:'Georgia',serif; line-height:1.6; font-size:16px; box-sizing:border-box;"></textarea>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                    <span style="font-size:0.85rem; color:#666;">
                        Word count: <span id="wordCountDisplay">0</span> words
                    </span>
                    <button onclick="skipLessonWithData('${lessonName}')" style="background:none; border:none; color:#999; font-size:0.85rem; cursor:pointer; text-decoration:underline;">
                        Discard and Exit →
                    </button>
                </div>
                <button class="btn-next" id="finalBtn" style="display:block; margin-top:20px; width:100%;" 
                    onclick="EssayHandler.submit()">
                    Submit & Save Final Progress
                </button>
            </div>`;
    }
};

/**
 * Función global para salida limpia registrando lo avanzado.
 */
window.skipLessonWithData = function(lessonName) {
    if (confirm("Skip the writing exercise? Your current quiz progress will be saved.")) {
        if (typeof window.finishLessonWithEssay === 'function') {
            window.finishLessonWithEssay(lessonName, "[USER SKIPPED ESSAY]", { skipped: true });
        } else {
            // Fallback si no está el script de reportes
            window.location.href = 'fundamentals-hub.html';
        }
    }
};