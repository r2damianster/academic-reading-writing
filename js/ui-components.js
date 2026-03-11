/**
 * ui-components.js
 * Librería de componentes reutilizables - ULEAM
 * Optimizada para integrarse con interactions-handler.js y essay-handler.js
 */

const AcademicUI = {

    /**
     * Crea un botón de navegación.
     * @param {boolean} isHidden - Si es true, el botón inicia oculto (esperando interacción).
     * @param {string} id - ID necesario para que interactions-handler.js lo muestre.
     */
    createButton: function(text, onClickAction, id = null, isHidden = false) {
        const display = isHidden ? 'none' : 'block';
        const idAttr = id ? `id="${id}"` : '';
        return `<button ${idAttr} class="btn-next" style="display:${display}; margin-top:20px;" 
                onclick="${onClickAction}">${text}</button>`;
    },

    /**
     * Genera un bloque de quiz.
     * @param {string} feedbackId - Debe coincidir con el ID que espera su lógica de feedback.
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
     * Cuadros de contraste visual con estilos integrados.
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
     * Área de ensayo conectada con EssayHandler.js
     */
    renderEssaySection: function(promptText) {
        return `
            <div class="essay-workspace">
                <h2>Writing Challenge</h2>
                <p style="background:#fff3cd; padding:10px; border-radius:5px; border:1px solid #ffeeba;">
                    <strong>Prompt:</strong> ${promptText}
                </p>
                <textarea id="essayInput" 
                    placeholder="Write your paragraph here..."
                    style="width:100%; height:200px; padding:15px; border-radius:8px; border:1px solid #ccc; font-family:'Georgia',serif; line-height:1.6; font-size:16px; box-sizing:border-box;"></textarea>
                <div style="display:flex; justify-content:between; align-items:center; margin-top:5px;">
                    <span style="font-size:0.85rem; color:#666;">
                        Word count: <span id="wordCountDisplay">0</span> words
                    </span>
                </div>
                <button class="btn-next" id="finalBtn" style="display:block; margin-top:20px; width:100%;" 
                    onclick="EssayHandler.submit()">
                    Submit & Save Progress
                </button>
                <button onclick="skipEssay()" style="display:block; margin-top:15px; background:none; border:none; color:#999; font-size:0.85rem; cursor:pointer; text-decoration:underline; width:100%;">
                    Skip writing exercise →
                </button>
            </div>`;
    }
};