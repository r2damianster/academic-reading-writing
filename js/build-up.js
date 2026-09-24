/* =============================================================================
   TIPO: BUILD_UP  (se carga DESPUÉS de slide-engine.js)
   Tarea de escritura acumulativa para summarizing / paraphrasing.
   El estudiante construye su respuesta en varios pasos; cada paso tiene UN solo
   criterio, se califica por separado con el agente 'test-grader' (vía
   window._gradeAppliedTask) y el score entra al promedio de tareas aplicadas de
   la lección. Nunca bloquea: tras la retroalimentación el estudiante siempre
   puede continuar (incluso si la IA no responde).

   Califica en dos capas:
     1. Checks deterministas en el cliente (sin IA): solapamiento con la fuente,
        proporción de longitud y presencia de cita. Si un check falla, el score
        del paso queda limitado a 50 %.
     2. IA con checklist binario: cada data-se-key-idea se verifica como
        presente/ausente frente al texto fuente.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="BUILD_UP" data-se-task-key="summ-1"
        data-se-accumulate="append">          <!-- append (por defecto) | revise -->
     <h2>Build It: ...</h2>
     <div data-se-source>...texto fuente...</div>

     <div data-se-step data-se-min-words="6"
          data-se-max-ratio="0.4"             <!-- checks opcionales -->
          data-se-max-overlap="0.35"
          data-se-require-citation
          data-se-grade="step">               <!-- step (por defecto) | accumulated -->
       <p data-se-step-prompt>1. Write the central idea in one sentence.</p>
       <div data-se-starter>The text argues that</div>   <!-- opcional -->
       <div data-se-key-idea>Idea que debe aparecer (solo la ve la IA)</div>
       <div data-se-rubric-item data-se-points="5">Criterio...</div>
     </div>
     <div data-se-step>...</div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   append : el texto de pasos anteriores queda bloqueado y el estudiante agrega.
   revise : el texto del paso anterior pasa al textarea para reescribirlo
            (paráfrasis por capas sobre la misma oración).
----------------------------------------------------------------------------- */

const BUILD_UP_REPORTING_VERBS = [
    'argue', 'argues', 'argued', 'state', 'states', 'stated', 'note', 'notes', 'noted',
    'claim', 'claims', 'claimed', 'suggest', 'suggests', 'suggested', 'explain', 'explains',
    'explained', 'report', 'reports', 'reported', 'maintain', 'maintains', 'maintained',
    'assert', 'asserts', 'contend', 'contends', 'find', 'finds', 'found', 'highlight',
    'highlights', 'emphasize', 'emphasizes', 'according to'
];

const BuildUpChecks = {
    tokenize(text) {
        return String(text || '')
            .toLowerCase()
            .replace(/\([^)]*\)/g, ' ')          // quita citas parentéticas: no cuentan como copia
            .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
            .split(/\s+/)
            .filter(Boolean);
    },

    countWords(text) {
        return String(text || '').trim().split(/\s+/).filter(Boolean).length;
    },

    // Fracción de n-gramas del estudiante (n=4) que aparecen literalmente en la fuente
    copyOverlap(studentText, sourceText) {
        const studentWords = this.tokenize(studentText);
        const sourceWords  = this.tokenize(sourceText);
        const gramSize     = Math.min(4, studentWords.length);
        if (gramSize < 2 || sourceWords.length < gramSize) return 0;

        const sourceGrams = new Set();
        for (let start = 0; start + gramSize <= sourceWords.length; start++) {
            sourceGrams.add(sourceWords.slice(start, start + gramSize).join(' '));
        }
        let copiedGrams = 0;
        const totalGrams = studentWords.length - gramSize + 1;
        for (let start = 0; start < totalGrams; start++) {
            if (sourceGrams.has(studentWords.slice(start, start + gramSize).join(' '))) copiedGrams++;
        }
        return copiedGrams / totalGrams;
    },

    hasAuthorYearCitation(text) {
        // \p{L} para aceptar apellidos con tilde/ñ (Peña, Cedeño)
        const parenthetical = /\(\s*\p{Lu}[\p{L}'&.\- ]*,?\s*(?:\d{4}|n\.d\.)\s*\)/u;
        const narrative     = /\p{Lu}[\p{L}'&.\-]*(?: (?:and|&) \p{Lu}[\p{L}'&.\-]*)?(?: et al\.)?\s*\(\s*\d{4}\s*\)/u;
        return parenthetical.test(text) || narrative.test(text);
    },

    hasReportingVerb(text) {
        const lowered = ' ' + String(text || '').toLowerCase() + ' ';
        return BUILD_UP_REPORTING_VERBS.some(verb => lowered.includes(' ' + verb + ' '));
    },

    // Devuelve { values, failures[] } según los data-se-* declarados en el paso
    run(stepEl, textToCheck, sourceText) {
        const values = {
            copyOverlap: Number(this.copyOverlap(textToCheck, sourceText).toFixed(2)),
            wordRatio:   Number((this.countWords(textToCheck) / Math.max(1, this.countWords(sourceText))).toFixed(2)),
            hasCitation: this.hasAuthorYearCitation(textToCheck),
            hasReportingVerb: this.hasReportingVerb(textToCheck)
        };
        const failures = [];
        const maxOverlap = parseFloat(stepEl.dataset.seMaxOverlap);
        const maxRatio   = parseFloat(stepEl.dataset.seMaxRatio);

        if (!isNaN(maxOverlap) && values.copyOverlap > maxOverlap) {
            failures.push(`Copiaste demasiadas frases literales de la fuente (${Math.round(values.copyOverlap * 100)}% de solapamiento; máximo ${Math.round(maxOverlap * 100)}%). Usa tus propias palabras y otra estructura.`);
        }
        if (!isNaN(maxRatio) && values.wordRatio > maxRatio) {
            failures.push(`Tu resumen es demasiado largo (${Math.round(values.wordRatio * 100)}% del original; máximo ${Math.round(maxRatio * 100)}%). Elimina ejemplos y detalles.`);
        }
        if (stepEl.hasAttribute('data-se-require-citation') && !values.hasCitation) {
            failures.push('Falta la cita del autor, por ejemplo: Swales & Feak (2012) o (Swales & Feak, 2012).');
        }
        return { values, failures };
    }
};

SlideTypes.BUILD_UP = {
    STEP_SCORE_CAP_ON_FAILED_CHECK: 50,

    mount(slide, index, lessonName) {
        const stepElements = Array.from(slide.querySelectorAll('[data-se-step]'));
        if (!stepElements.length) return;

        const sourceEl    = slide.querySelector('[data-se-source]');
        const sourceText  = sourceEl ? sourceEl.textContent.trim() : '';
        const taskKey     = slide.dataset.seTaskKey || `build-${index}`;
        const accumulateMode = (slide.dataset.seAccumulate || 'append').toLowerCase();

        // Extrae la configuración de cada paso y elimina del DOM lo que el estudiante no debe ver
        const steps = stepElements.map(stepEl => {
            const promptEl  = stepEl.querySelector('[data-se-step-prompt]');
            const starterEl = stepEl.querySelector('[data-se-starter]');
            const config = {
                element:      stepEl,
                promptHtml:   promptEl ? promptEl.innerHTML : '',
                starterText:  starterEl ? starterEl.textContent.trim() : '',
                minWords:     parseInt(stepEl.dataset.seMinWords, 10) || 5,
                gradeScope:   (stepEl.dataset.seGrade || 'step').toLowerCase(),
                keyIdeas:     Array.from(stepEl.querySelectorAll('[data-se-key-idea]')).map(el => el.textContent.trim()),
                indicators:   Array.from(stepEl.querySelectorAll('[data-se-rubric-item]')).map(el => ({
                    title:  el.textContent.trim(),
                    points: parseFloat(el.dataset.sePoints) || 1
                }))
            };
            stepEl.remove(); // se re-renderiza en el workspace; el elemento desacoplado conserva los data-se-* de los checks y las ideas clave no quedan visibles en el DOM
            return config;
        });

        const workspace = document.createElement('div');
        workspace.className = 'build-up-workspace';
        workspace.style.cssText = 'margin-top:14px;';
        slide.appendChild(workspace);

        const acceptedTexts = []; // texto final aceptado de cada paso ya enviado
        this._renderStep(slide, workspace, steps, 0, {
            lessonName, taskKey, sourceText, accumulateMode, acceptedTexts
        });

        _appendNextButton(slide, { hidden: true });
    },

    _renderStep(slide, workspace, steps, stepIndex, taskState) {
        const step = steps[stepIndex];
        const { accumulateMode, acceptedTexts } = taskState;
        const isLastStep = stepIndex === steps.length - 1;
        const domPrefix  = `${taskState.taskKey}-${stepIndex}`;

        const lockedTextHtml = (accumulateMode === 'append' && acceptedTexts.length)
            ? `<div style="background:#eef6ee; border-left:4px solid #2e7d32; padding:10px 14px; border-radius:8px;
                           margin-bottom:10px; font-family:'Georgia',serif; line-height:1.6; font-size:0.95rem;">
                   <div style="font-size:0.75rem; font-weight:700; color:#2e7d32; margin-bottom:4px;">YOUR TEXT SO FAR</div>
                   ${_appliedFeedbackText(acceptedTexts.join(' '))}
               </div>`
            : '';

        const initialText = accumulateMode === 'revise' && acceptedTexts.length
            ? acceptedTexts[acceptedTexts.length - 1]
            : (step.starterText ? step.starterText + ' ' : '');

        workspace.innerHTML = `
            <div style="font-size:0.78rem; font-weight:700; color:#6c757d; margin-bottom:6px;">
                STEP ${stepIndex + 1} OF ${steps.length}
            </div>
            ${lockedTextHtml}
            <div style="margin-bottom:8px; line-height:1.55;">${step.promptHtml}</div>
            <textarea id="bu-ta-${domPrefix}"
                style="width:100%; height:100px; padding:12px; border-radius:8px; border:1px solid #ccc;
                       font-family:'Georgia',serif; line-height:1.6; font-size:15px; box-sizing:border-box;
                       resize:vertical;"></textarea>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                <span style="font-size:0.82rem; color:#666;">
                    <span id="bu-wc-${domPrefix}">0</span> / ${step.minWords} words min.
                </span>
                <button id="bu-submit-${domPrefix}" style="display:none; padding:9px 20px; background:#2c3e50;
                        color:white; border:none; border-radius:8px; cursor:pointer; font-size:0.9rem; font-weight:600;">
                    Check this step
                </button>
            </div>
            <div id="bu-fb-${domPrefix}" style="display:none; margin-top:14px; border-radius:10px;
                 overflow:hidden; border:1px solid #dee2e6;">
                <div style="background:#2c3e50; color:white; padding:10px 14px; font-size:0.85rem; font-weight:600;">
                    &#x1F916; Feedback
                </div>
                <div class="bu-fb-body" style="padding:14px; background:#fff; font-size:0.86rem; line-height:1.7; color:#333;"></div>
            </div>
            <button id="bu-continue-${domPrefix}" style="display:none; margin-top:14px; padding:11px 24px;
                    background:#27ae60; color:white; border:none; border-radius:8px; cursor:pointer;
                    font-size:0.95rem; font-weight:600;">
                ${isLastStep ? 'Finish exercise →' : 'Next step →'}
            </button>`;

        const textarea       = workspace.querySelector(`#bu-ta-${domPrefix}`);
        const wordCounter    = workspace.querySelector(`#bu-wc-${domPrefix}`);
        const submitButton   = workspace.querySelector(`#bu-submit-${domPrefix}`);
        const feedbackPanel  = workspace.querySelector(`#bu-fb-${domPrefix}`);
        const feedbackBody   = feedbackPanel.querySelector('.bu-fb-body');
        const continueButton = workspace.querySelector(`#bu-continue-${domPrefix}`);

        textarea.value = initialText;
        const refreshWordCount = () => {
            const stepWords = BuildUpChecks.countWords(textarea.value)
                - (accumulateMode === 'append' ? BuildUpChecks.countWords(step.starterText) : 0);
            wordCounter.textContent = Math.max(0, stepWords);
            submitButton.style.display = stepWords >= step.minWords ? 'inline-block' : 'none';
        };
        textarea.addEventListener('input', refreshWordCount);
        refreshWordCount();

        submitButton.addEventListener('click', async () => {
            submitButton.disabled    = true;
            submitButton.textContent = 'Grading…';

            const stepText       = textarea.value.trim();
            const accumulatedText = accumulateMode === 'append'
                ? [...acceptedTexts, stepText].join(' ')
                : stepText;
            const textForGrading = step.gradeScope === 'accumulated' ? accumulatedText : stepText;

            const checkResult = BuildUpChecks.run(step.element, accumulatedText, taskState.sourceText);
            const failedCheck = checkResult.failures.length > 0;

            const gradingResult = await window._gradeAppliedTask(
                taskState.lessonName, step.indicators, textForGrading,
                {
                    taskKey:         `${taskState.taskKey}-s${stepIndex + 1}`,
                    source:          taskState.sourceText,
                    keyIdeas:        step.keyIdeas,
                    checks:          checkResult.values,
                    stepInstruction: step.element.querySelector('[data-se-step-prompt]')?.textContent.trim(),
                    scoreCap:        failedCheck ? this.STEP_SCORE_CAP_ON_FAILED_CHECK : null
                }
            );

            feedbackBody.innerHTML = this._buildFeedbackHtml(step, gradingResult, checkResult.failures);
            feedbackPanel.style.display = 'block';
            submitButton.style.display  = 'none';
            textarea.disabled           = true;
            continueButton.style.display = 'inline-block';

            acceptedTexts.push(stepText);
        });

        continueButton.addEventListener('click', () => {
            if (isLastStep) {
                workspace.innerHTML = `
                    <div style="background:#eef6ee; border-left:4px solid #2e7d32; padding:12px 16px; border-radius:8px;
                                font-family:'Georgia',serif; line-height:1.6;">
                        <div style="font-size:0.75rem; font-weight:700; color:#2e7d32; margin-bottom:4px;">FINAL TEXT</div>
                        ${_appliedFeedbackText(acceptedTexts[acceptedTexts.length - 1] && accumulateMode === 'revise'
                            ? acceptedTexts[acceptedTexts.length - 1]
                            : acceptedTexts.join(' '))}
                    </div>`;
                const nextButton = slide.querySelector('.btn-next');
                if (nextButton) nextButton.style.display = 'block';
            } else {
                this._renderStep(slide, workspace, steps, stepIndex + 1, taskState);
            }
        });
    },

    _buildFeedbackHtml(step, gradingResult, checkFailures) {
        const checkBlock = checkFailures.length
            ? `<div style="background:#fdecea; border-left:4px solid #c0392b; padding:8px 12px; border-radius:6px; margin-bottom:10px;">
                   <strong>&#x26A0;&#xFE0F; Revisión automática</strong>
                   <ul style="margin:4px 0 0; padding-left:18px;">${checkFailures.map(message => `<li>${_appliedFeedbackText(message)}</li>`).join('')}</ul>
               </div>`
            : '';

        if (!gradingResult) {
            return `${checkBlock}<p style="color:#999;">Feedback unavailable right now — you can still continue.</p>`;
        }

        const indicatorScores = gradingResult.evaluation.indicator_scores || [];
        const commentItems = indicatorScores.map((indicatorScore, indicatorIndex) => {
            const rubricItem = step.indicators[indicatorIndex] || {};
            const isFullMarks = rubricItem.points != null && indicatorScore.points >= rubricItem.points;
            const suggestion = indicatorScore.suggested_example
                ? `<br><em style="color:#555;">Ej. mejorable (EN): "${_appliedFeedbackText(indicatorScore.suggested_example)}"</em>`
                : '';
            return `<li>${isFullMarks ? '&#x2705;' : '&#x26A0;&#xFE0F;'} ${_appliedFeedbackText(indicatorScore.comment)}${suggestion}</li>`;
        }).join('');

        return `${checkBlock}
            <p style="margin:0 0 10px;">${_appliedFeedbackText(gradingResult.evaluation.overall_feedback)}</p>
            <ul style="margin:0; padding-left:18px; list-style:none;">${commentItems}</ul>
            <p style="margin:10px 0 0; font-size:0.8rem; color:#666;">Step score: <strong>${gradingResult.pct}%</strong></p>`;
    }
};
