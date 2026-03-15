/* =============================================================================
   slide-engine.js
   Sistema unificado de slides para lecciones académicas — ULEAM
   
   REEMPLAZA:
     - module-logic.js        (navegación, quiz, score, envío al Sheet)
     - ui-components.js       (generación de HTML por componente)
     - interactions-handler.js (drag & drop)
   
   USO EN HTML:
     1. Cargar este archivo: <script src="../../js/slide-engine.js" defer></script>
     2. En cada .slide, añadir data-type con el tipo correspondiente
     3. Poner el contenido dentro usando los atributos estándar de cada tipo
     4. Llamar SlideEngine.init('nombre-de-leccion') en window.onload
   
   TIPOS DE SLIDE DISPONIBLES:
   ─────────────────────────────────────────────────────────────────────────────
     data-type="VIDEO"       → Iframe embed (Google Slides, YouTube, etc.)
     data-type="CONTENT"     → Texto informativo puro
     data-type="QUIZ"        → Opción múltiple con validación automática
     data-type="CONTRAST"    → Cuadros correcto vs incorrecto
     data-type="DRAG_DROP"   → Arrastrar elementos a zonas de destino
     data-type="FILL_BLANK"  → Completar espacios en blanco
     data-type="ESSAY"       → Área de escritura con tracking de integridad
   ─────────────────────────────────────────────────────────────────────────────
   
   VER CADA SECCIÓN PARA EJEMPLOS DE USO EN HTML.
   ============================================================================= */


/* =============================================================================
   SECCIÓN 1 — ENGINE CORE
   Navegación, barra de progreso, contador de errores.
   ============================================================================= */

const SlideEngine = (function () {

    let _currentIndex      = 0;
    let _mistakes          = 0;
    let _lessonName        = '';
    let _slides            = [];
    let _scoreAlreadySaved = false;

    // ── Inicialización ──────────────────────────────────────────────────────────
    // Llama esto en window.onload de cada lección.
    // Activa todos los tipos de slide que encuentre en el DOM.
    function init(lessonName) {
        _lessonName        = lessonName;
        _slides            = Array.from(document.querySelectorAll('.slide'));
        _mistakes          = 0;
        _scoreAlreadySaved = false;

        // Exponer globales para compatibilidad con essay-handler.js y activity-tracker.js
        window.mistakes    = _mistakes;
        window.nextSlide   = goTo;
        window.checkAnswer = _handleQuizAnswer;
        window.finishLesson           = finishLesson;
        window.finishLessonWithEssay  = finishLessonWithEssay;
        window.skipLessonWithData     = skipLessonWithData;
        // Compatibilidad con cualquier archivo externo que aún llame _sendToSheetBeacon
        window._sendToSheetBeacon     = (progress) => {
            const last = [...progress].reverse().find(i => i.result && i.result !== 'Visited');
            if (last) _sendLessonToSheet(last.module, last, last.audit || null);
        };

        // Activar cada tipo de slide
        _slides.forEach((slide, index) => {
            const type = (slide.dataset.type || '').toUpperCase();
            switch (type) {
                case 'VIDEO':      SlideTypes.VIDEO.mount(slide, index);      break;
                case 'CONTENT':    SlideTypes.CONTENT.mount(slide, index);    break;
                case 'QUIZ':       SlideTypes.QUIZ.mount(slide, index);       break;
                case 'CONTRAST':   SlideTypes.CONTRAST.mount(slide, index);   break;
                case 'DRAG_DROP':  SlideTypes.DRAG_DROP.mount(slide, index);  break;
                case 'FILL_BLANK':      SlideTypes.FILL_BLANK.mount(slide, index);      break;
                case 'ESSAY':          SlideTypes.ESSAY.mount(slide, index, lessonName); break;
                case 'SORT_PARAGRAPH': SlideTypes.SORT_PARAGRAPH.mount(slide, index);   break;
                case 'HIGHLIGHT':      SlideTypes.HIGHLIGHT.mount(slide, index);        break;
                case 'MATCH':           SlideTypes.MATCH.mount(slide, index);                     break;
                case 'WORD_BANK':       SlideTypes.WORD_BANK.mount(slide, index);                  break;
                case 'CATEGORIZE':      SlideTypes.CATEGORIZE.mount(slide, index);                 break;
                case 'CHOOSE_CONTEXT':  SlideTypes.CHOOSE_CONTEXT.mount(slide, index);             break;
                // Sin data-type → slide estática, sin procesamiento adicional
            }
        });

        _updateProgress();
        console.log(`✅ SlideEngine iniciado: "${lessonName}" — ${_slides.length} slides`);
    }

    // ── Navegación ───────────────────────────────────────────────────────────────
    // goTo(null)         → siguiente slide automática
    // goTo('essaySlide') → por ID de string
    // goTo(3)            → por índice numérico (compatibilidad legacy)
    function goTo(target) {
        const currentEl = _slides[_currentIndex];
        let nextEl;

        if (target === null || target === undefined) {
            if (_currentIndex < _slides.length - 1) {
                _currentIndex++;
                nextEl = _slides[_currentIndex];
            }
        } else if (typeof target === 'number') {
            _currentIndex = target;
            nextEl = _slides[target];
        } else {
            nextEl = document.getElementById(target);
            const idx = _slides.indexOf(nextEl);
            if (idx !== -1) _currentIndex = idx;
        }

        if (nextEl) {
            if (currentEl) currentEl.classList.remove('active');
            nextEl.classList.add('active');
            window.scrollTo(0, 0);
            _updateProgress();

            // ── Auto-guardar score al llegar a preEssaySlide ──────────────────
            // finishLesson() registra el score de quizzes en localStorage y Sheet.
            // Se ejecuta aquí y no en un botón, para que no dependa de ninguna
            // slide específica ni de que el autor recuerde llamarlo manualmente.
            if (nextEl.id === 'preEssaySlide' && !_scoreAlreadySaved) {
                _scoreAlreadySaved = true;
                finishLesson(_lessonName);
            }
        } else {
            console.error('SlideEngine: slide no encontrada →', target);
        }
    }

    function _updateProgress() {
        const bar = document.getElementById('progressBar');
        if (bar && _slides.length > 1) {
            bar.style.width = `${(_currentIndex / (_slides.length - 1)) * 100}%`;
        }
    }

    // ── Quiz: validación de respuesta ────────────────────────────────────────────
    // Llamada desde los botones generados por SlideTypes.QUIZ
    function _handleQuizAnswer(btn, isCorrect, feedbackId) {
        const feedback    = document.getElementById(feedbackId);
        const parentSlide = btn.closest('.slide');
        const nextBtn     = parentSlide.querySelector('.btn-next');

        if (feedback) feedback.style.display = 'block';

        if (isCorrect) {
            btn.style.backgroundColor = '#2ecc71';
            btn.style.color           = 'white';
            // Deshabilitar todas las opciones de esta slide al acertar
            parentSlide.querySelectorAll('.quiz-option').forEach(b => b.disabled = true);
            if (feedback) {
                feedback.innerHTML  = '✅ Correct! Well done.';
                feedback.style.color = '#27ae60';
            }
            if (nextBtn) nextBtn.style.display = 'block';
        } else {
            btn.style.backgroundColor = '#e74c3c';
            btn.style.color           = 'white';
            if (feedback) {
                feedback.innerHTML  = '❌ Not quite. Try again!';
                feedback.style.color = '#c0392b';
            }
            _mistakes++;
            window.mistakes = _mistakes;
        }
    }

    // ── Cierre de lección (con quiz) ─────────────────────────────────────────────
    function finishLesson(lessonName) {
        let score = Math.max(0, 100 - (_mistakes * 5));
        const entry = {
            module:    lessonName,
            result:    `Score: ${score}% (Errors: ${_mistakes})`,
            timestamp: new Date().toLocaleString()
        };

        _saveToLocalStorage(lessonName, entry);
        _sendLessonToSheet(lessonName, entry, null);
        // Nota: la navegación a preEssaySlide la ejecuta goTo() en el engine,
        // que detecta el id='preEssaySlide' y llama a esta función. No navegar aquí.
    }

    // ── Cierre de lección con essay ──────────────────────────────────────────────
    function finishLessonWithEssay(lessonName, essay, audit, redirectUrl) {
        let progress        = JSON.parse(localStorage.getItem('course_progress')) || [];
        let foundIndex      = progress.findIndex(i => i.module === lessonName);
        const alreadyExists = foundIndex !== -1;

        if (alreadyExists) {
            progress[foundIndex].essay     = essay || '';
            progress[foundIndex].audit     = audit || {};
            progress[foundIndex].timestamp = new Date().toLocaleString();
        } else {
            progress.push({
                module:    lessonName,
                result:    'Completed (No Quiz)',
                essay:     essay || '',
                audit:     audit || {},
                timestamp: new Date().toLocaleString()
            });
        }

        localStorage.setItem('course_progress', JSON.stringify(progress));

        if (alreadyExists) {
            _sendEssayToSheet(lessonName, essay, audit);
        } else {
            _sendLessonToSheet(lessonName, progress[progress.length - 1], audit, essay);
        }

        alert('Academic progress and Integrity Audit saved!');

        // Redirección automática por ruta
        let dest = redirectUrl || 'index.html';
        if (!redirectUrl) {
            const path = window.location.pathname;
            if (path.includes('/00-fundamentals/')) dest = 'fundamentals-hub.html';
            if (path.includes('/unit1-essays/'))    dest = 'unit1-essays-hub.html';
            if (path.includes('/unit2-papers/'))    dest = 'unit2-papers-hub.html';
            if (path.includes('/apa-integrity/'))   dest = 'apa-integrity-hub.html';
        }

        setTimeout(() => { window.location.href = dest; }, 1500);
    }

    // ── Skip essay ───────────────────────────────────────────────────────────────
    function skipLessonWithData(lessonName) {
        if (confirm('Skip the writing exercise? Your current quiz progress will be saved.')) {
            finishLessonWithEssay(lessonName, '[USER SKIPPED ESSAY]', { skipped: true });
        }
    }

    // ── Guardar en localStorage ───────────────────────────────────────────────────
    function _saveToLocalStorage(lessonName, entry) {
        let progress = JSON.parse(localStorage.getItem('course_progress')) || [];
        const idx    = progress.findIndex(p => p.module === lessonName);
        if (idx !== -1) progress[idx] = entry;
        else progress.push(entry);
        localStorage.setItem('course_progress', JSON.stringify(progress));
    }


    /* ===========================================================================
       SECCIÓN 2 — SHEET: Envío de datos a Google Sheets
       Dos funciones: una para lección completa, otra solo para actualizar essay.
       =========================================================================== */

    const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec';

    function _sendLessonToSheet(lessonName, lessonEntry, audit, essay) {
        const a = audit || {};
        const payload = {
            timestamp:        new Date().toLocaleString(),
            name:             localStorage.getItem('studentName')            || '',
            email:            localStorage.getItem('studentEmail')           || '',
            course:           localStorage.getItem('studentCourse')          || '',
            role:             localStorage.getItem('studentMajor')           || '',
            institution:      localStorage.getItem('studentInstitution')     || '',
            practiceType:     localStorage.getItem('studentPracticeType')    || '',
            dataConsent:      localStorage.getItem('studentAcademicConsent') || 'Yes',
            researchConsent:  localStorage.getItem('studentResearchConsent') || 'Yes',
            activity:         String(lessonEntry.module || lessonName),
            result:           String(lessonEntry.result || ''),
            words:            String(a.words           || '0'),
            pastes:           String(a.pastes          || '0'),
            tabSwitches:      String(a.tabSwitches     || '0'),
            keystrokes:       String(a.keystrokes      || '0'),
            deletions:        String(a.deletions       || '0'),
            timeToFirstKey:   String(a.timeToFirstKey  || '0'),
            writingDuration:  String(a.writingDuration || '0'),
            charsTypedRatio:  String(a.charsTypedRatio || '0'),
            essay:            essay || '',
            isEssayUpdate:    'No'
        };
        _beacon(payload, `LESSON "${lessonName}"`);
    }

    function _sendEssayToSheet(lessonName, essay, audit) {
        const a = audit || {};
        const payload = {
            timestamp:       new Date().toLocaleString(),
            email:           localStorage.getItem('studentEmail') || '',
            activity:        String(lessonName),
            words:           String(a.words           || '0'),
            pastes:          String(a.pastes          || '0'),
            tabSwitches:     String(a.tabSwitches     || '0'),
            keystrokes:      String(a.keystrokes      || '0'),
            deletions:       String(a.deletions       || '0'),
            timeToFirstKey:  String(a.timeToFirstKey  || '0'),
            writingDuration: String(a.writingDuration || '0'),
            charsTypedRatio: String(a.charsTypedRatio || '0'),
            essay:           String(essay || ''),
            isEssayUpdate:   'Yes'
        };
        _beacon(payload, `ESSAY "${lessonName}"`);
    }

    function _beacon(payload, label) {
        const params = new URLSearchParams();
        for (const key in payload) params.append(key, payload[key]);
        const sent = navigator.sendBeacon(SHEET_URL, params);
        console.log(`📡 sendBeacon ${label}:`, sent ? 'encolado ✅' : 'falló ❌');
        if (!sent) {
            fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', body: params })
                .catch(err => console.error('Fetch fallback falló:', err));
        }
    }

    // API pública del engine
    return { init, goTo };

})();


/* =============================================================================
   SECCIÓN 3 — SLIDE TYPES
   Cada tipo es una unidad autocontenida: genera su HTML y adjunta su lógica.
   
   CONVENCIÓN DE ATRIBUTOS HTML:
     Todos los atributos que el engine lee comienzan con data-se-*
     ("se" = slide engine) para no colisionar con otros sistemas.
   ============================================================================= */

const SlideTypes = {};


/* -----------------------------------------------------------------------------
   TIPO: VIDEO
   Muestra un iframe embed (Google Slides, YouTube, Vimeo, etc.)
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide active" data-type="VIDEO">
     <h2>Introduction</h2>
     <iframe data-se-src="https://docs.google.com/presentation/d/.../embed"
             data-se-height="320"></iframe>
     <!-- data-se-height es opcional, default: 320px -->
   </div>
   ─────────────────────────────────────────────────────────────────────────────
----------------------------------------------------------------------------- */
SlideTypes.VIDEO = {
    mount(slide) {
        const iframe = slide.querySelector('iframe[data-se-src]');
        if (iframe) {
            iframe.src    = iframe.dataset.seSrc;
            iframe.width  = '100%';
            iframe.height = iframe.dataset.seHeight || '320';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            iframe.style.cssText = 'border-radius:8px; display:block;';
        }
        _appendNextButton(slide);
    }
};


/* -----------------------------------------------------------------------------
   TIPO: CONTENT
   Slide de texto informativo puro. El contenido va directamente en el HTML.
   El engine solo añade el botón de continuar automáticamente.
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="CONTENT">
     <h2>What is it?</h2>
     <p>In academic writing, a paragraph is like a contract...</p>
     <p>The One-Point Rule means: <strong>One paragraph = One single idea.</strong></p>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
----------------------------------------------------------------------------- */
SlideTypes.CONTENT = {
    mount(slide) {
        _appendNextButton(slide);
    }
};


/* -----------------------------------------------------------------------------
   TIPO: QUIZ
   Opción múltiple con validación automática.
   El botón "Next" aparece solo cuando el alumno acierta.
   Los errores se suman al contador global de mistakes.
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="QUIZ">
     <h2>Got it?</h2>
     <p data-se-question>
       Does this sentence follow the One-Point Rule?
       <em>"Regular exercise improves heart health and also helps the local economy..."</em>
     </p>
     <div data-se-option>A. Yes</div>
     <div data-se-option data-se-correct>B. No, it mixes Health and Economy</div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-correct marca la respuesta correcta (solo una por quiz)
   - Soporta HTML dentro de data-se-question (cursivas, negritas, etc.)
----------------------------------------------------------------------------- */
SlideTypes.QUIZ = {
    mount(slide, index) {
        const questionEl = slide.querySelector('[data-se-question]');
        const optionEls  = Array.from(slide.querySelectorAll('[data-se-option]'));
        if (!questionEl || optionEls.length === 0) return;

        const feedbackId = `se-quiz-feedback-${index}`;

        // Generar botones de opción
        const optionsHTML = optionEls.map(opt => {
            const isCorrect = opt.hasAttribute('data-se-correct');
            const text      = opt.innerHTML.trim();
            return `<button class="quiz-option" 
                        onclick="checkAnswer(this, ${isCorrect}, '${feedbackId}')"
                        style="display:block; width:100%; text-align:left; padding:12px 15px;
                               margin:6px 0; border:2px solid #dee2e6; border-radius:8px;
                               background:#fff; cursor:pointer; font-size:1rem;
                               transition: border-color 0.2s;">
                        ${text}
                    </button>`;
        }).join('');

        // Reemplazar los data-se-option originales con los botones
        optionEls.forEach(el => el.remove());

        const quizBlock = document.createElement('div');
        quizBlock.className = 'quiz-container';
        quizBlock.innerHTML = `
            ${optionsHTML}
            <div id="${feedbackId}" class="feedback" 
                 style="display:none; margin-top:10px; padding:10px; border-radius:5px; font-weight:bold;">
            </div>`;

        questionEl.insertAdjacentElement('afterend', quizBlock);

        // Botón next oculto — aparece al acertar
        _appendNextButton(slide, { hidden: true });
    }
};


/* -----------------------------------------------------------------------------
   TIPO: CONTRAST
   Muestra cuadros de contraste "correcto vs incorrecto" con un ejemplo inicial.
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="CONTRAST">
     <h2>Proving it</h2>
     <p data-se-intro><strong>Point:</strong> <em>"Regular exercise improves mental health."</em></p>
   
     <div data-se-correct data-se-label="Correct Evidence">
       A 2023 study found reduction in anxiety symptoms.
     </div>
     <div data-se-incorrect data-se-label="Incorrect Evidence">
       Market for footwear is increasing.
     </div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - Puedes tener múltiples pares correct/incorrect
   - data-se-label es el título del cuadro (opcional, tiene defaults)
   - data-se-intro es opcional
----------------------------------------------------------------------------- */
SlideTypes.CONTRAST = {
    mount(slide) {
        const corrects   = Array.from(slide.querySelectorAll('[data-se-correct]'));
        const incorrects = Array.from(slide.querySelectorAll('[data-se-incorrect]'));

        const renderBox = (el, type) => {
            const isCorrect   = type === 'correct';
            const bg          = isCorrect ? '#d4edda' : '#f8d7da';
            const color       = isCorrect ? '#155724' : '#721c24';
            const border      = isCorrect ? '#28a745' : '#dc3545';
            const defaultLabel = isCorrect ? 'Correct ✅' : 'Incorrect ❌';
            const label       = el.dataset.seLabel || defaultLabel;
            const content     = el.innerHTML.trim();

            const box = document.createElement('div');
            box.style.cssText = `padding:15px; border-radius:8px; margin:10px 0;
                                  border-left:5px solid ${border};
                                  background-color:${bg}; color:${color};`;
            box.innerHTML = `<span style="font-weight:bold; text-transform:uppercase;
                                          font-size:0.8rem; display:block; margin-bottom:5px;">
                                 ${label}
                             </span>
                             <p style="margin:0;">${content}</p>`;
            el.replaceWith(box);
        };

        corrects.forEach(el   => renderBox(el, 'correct'));
        incorrects.forEach(el => renderBox(el, 'incorrect'));

        _appendNextButton(slide);
    }
};


/* -----------------------------------------------------------------------------
   TIPO: DRAG_DROP
   Arrastra elementos a sus zonas de destino correctas.
   El botón "Next" aparece cuando todas las zonas están completadas correctamente.
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="DRAG_DROP">
     <h2>Match the concept</h2>
     <p>Drag each item to where it belongs.</p>
   
     <!-- Elementos arrastrables: data-se-drag + data-se-drag-type -->
     <div data-se-drag data-se-drag-type="point">🔵 Topic Sentence</div>
     <div data-se-drag data-se-drag-type="evidence">📊 Statistical Data</div>
     <div data-se-drag data-se-drag-type="closing">🔒 Closing Sentence</div>
   
     <!-- Zonas de destino: data-se-drop + data-se-drop-accepts -->
     <div data-se-drop data-se-drop-accepts="point"    data-se-label="Point"></div>
     <div data-se-drop data-se-drop-accepts="evidence" data-se-label="Evidence"></div>
     <div data-se-drop data-se-drop-accepts="closing"  data-se-label="Closing"></div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-drag-type debe coincidir exactamente con data-se-drop-accepts
   - Puedes tener tantos pares como necesites
   - data-se-label en la zona muestra el nombre mientras está vacía
----------------------------------------------------------------------------- */
SlideTypes.DRAG_DROP = {
    mount(slide, index) {
        const drags = Array.from(slide.querySelectorAll('[data-se-drag]'));
        const drops = Array.from(slide.querySelectorAll('[data-se-drop]'));
        if (drags.length === 0 || drops.length === 0) return;

        const feedbackId = `se-dd-feedback-${index}`;

        // Estilar y preparar elementos arrastrables
        drags.forEach((el, i) => {
            el.id = `se-drag-${index}-${i}`;
            el.setAttribute('draggable', 'true');
            el.style.cssText = `padding:10px 16px; margin:6px; border-radius:8px;
                                 background:#e8f4fd; border:2px solid #3498db;
                                 cursor:grab; display:inline-block; font-weight:500;
                                 user-select:none;`;
            el.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', el.id);
                e.dataTransfer.effectAllowed = 'move';
            });
        });

        // Estilar y preparar zonas de destino
        drops.forEach(zone => {
            const label = zone.dataset.seLabel || zone.dataset.seDropAccepts;
            zone.style.cssText = `min-height:50px; padding:10px; margin:8px 0;
                                   border:2px dashed #adb5bd; border-radius:8px;
                                   background:#f8f9fa; display:flex; align-items:center;
                                   justify-content:center; color:#adb5bd; font-style:italic;
                                   transition: background 0.2s, border-color 0.2s;`;
            zone.textContent = label;

            zone.addEventListener('dragenter', e => {
                e.preventDefault();
                zone.style.background    = '#eaf6ff';
                zone.style.borderColor   = '#3498db';
            });
            zone.addEventListener('dragleave', () => {
                if (!zone.querySelector('[data-se-drag]')) {
                    zone.style.background  = '#f8f9fa';
                    zone.style.borderColor = '#adb5bd';
                }
            });
            zone.addEventListener('dragover', e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                const id      = e.dataTransfer.getData('text/plain');
                const dragged = document.getElementById(id);
                const accepts = zone.dataset.seDropAccepts;

                if (dragged && dragged.dataset.seDragType === accepts) {
                    zone.innerHTML = '';
                    zone.appendChild(dragged);
                    dragged.setAttribute('draggable', 'false');
                    dragged.style.cursor    = 'default';
                    zone.style.borderColor  = '#2ecc71';
                    zone.style.background   = '#d4edda';
                    SlideTypes.DRAG_DROP._checkCompletion(slide, feedbackId);
                } else {
                    zone.style.borderColor = '#e74c3c';
                    setTimeout(() => {
                        zone.style.borderColor = '#adb5bd';
                        zone.style.background  = '#f8f9fa';
                    }, 800);
                }
            });
        });

        // Área de feedback y botón next (oculto hasta completar)
        const feedback = document.createElement('div');
        feedback.id    = feedbackId;
        feedback.style.cssText = 'display:none; margin-top:10px; padding:10px;' +
                                  'border-radius:5px; font-weight:bold; color:#27ae60;';
        slide.appendChild(feedback);

        _appendNextButton(slide, { hidden: true });
    },

    _checkCompletion(slide, feedbackId) {
        const drops  = Array.from(slide.querySelectorAll('[data-se-drop]'));
        const filled = drops.every(z => z.querySelector('[data-se-drag]'));
        if (filled) {
            const feedback = document.getElementById(feedbackId);
            if (feedback) {
                feedback.innerHTML  = '✅ All matched correctly! Well done.';
                feedback.style.display = 'block';
            }
            const nextBtn = slide.querySelector('.btn-next');
            if (nextBtn) nextBtn.style.display = 'block';
        }
    }
};


/* -----------------------------------------------------------------------------
   TIPO: FILL_BLANK
   El alumno escribe la palabra o frase que falta en cada espacio.
   Se puede configurar si la validación es exacta o flexible (contiene la palabra).
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="FILL_BLANK">
     <h2>Complete the sentence</h2>
   
     <p data-se-sentence>
       A paragraph must have <span data-se-blank data-se-answer="one">___</span>
       main idea, and it always starts with a
       <span data-se-blank data-se-answer="topic sentence">___</span>.
     </p>
   
     <button data-se-check>Check my answers</button>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-answer es la respuesta correcta (no case-sensitive)
   - Puedes tener múltiples data-se-blank en una misma slide
   - La validación admite respuestas que "contienen" la palabra clave
   - El botón "Next" aparece cuando todos los blancos son correctos
----------------------------------------------------------------------------- */
SlideTypes.FILL_BLANK = {
    mount(slide, index) {
        const blanks     = Array.from(slide.querySelectorAll('[data-se-blank]'));
        const checkBtn   = slide.querySelector('[data-se-check]');
        const feedbackId = `se-fb-feedback-${index}`;
        if (blanks.length === 0) return;

        // Reemplazar cada span data-se-blank con un input inline
        blanks.forEach((blank, i) => {
            const answer  = blank.dataset.seAnswer || '';
            const approxWidth = Math.max(answer.length * 11, 80);
            const input   = document.createElement('input');
            input.type    = 'text';
            input.dataset.seAnswer = answer;
            input.id      = `se-blank-${index}-${i}`;
            input.placeholder = '...';
            input.style.cssText = `width:${approxWidth}px; border:none; border-bottom:2px solid #3498db;
                                    padding:2px 6px; font-size:inherit; font-family:inherit;
                                    background:transparent; outline:none; text-align:center;
                                    margin:0 4px;`;
            blank.replaceWith(input);
        });

        // Estilar el botón de verificación
        if (checkBtn) {
            checkBtn.className = 'btn-check';
            checkBtn.style.cssText = `margin-top:16px; padding:10px 24px; background:#3498db;
                                       color:white; border:none; border-radius:8px;
                                       cursor:pointer; font-size:1rem;`;
            checkBtn.addEventListener('click', () => {
                SlideTypes.FILL_BLANK._validate(slide, index, feedbackId);
            });
        }

        // Feedback
        const feedback = document.createElement('div');
        feedback.id    = feedbackId;
        feedback.style.cssText = 'display:none; margin-top:10px; padding:10px;' +
                                  'border-radius:5px; font-weight:bold;';
        if (checkBtn) checkBtn.insertAdjacentElement('afterend', feedback);
        else slide.appendChild(feedback);

        _appendNextButton(slide, { hidden: true });
    },

    _validate(slide, index, feedbackId) {
        const inputs    = Array.from(slide.querySelectorAll(`input[id^="se-blank-${index}-"]`));
        const feedback  = document.getElementById(feedbackId);
        let allCorrect  = true;

        inputs.forEach(input => {
            const expected = (input.dataset.seAnswer || '').toLowerCase().trim();
            const given    = input.value.toLowerCase().trim();
            const correct  = given === expected || given.includes(expected) || expected.includes(given);

            input.style.borderBottomColor = correct ? '#2ecc71' : '#e74c3c';
            input.style.color             = correct ? '#27ae60' : '#c0392b';
            if (!correct) allCorrect = false;
        });

        if (feedback) {
            feedback.style.display = 'block';
            if (allCorrect) {
                feedback.innerHTML  = '✅ All correct! Well done.';
                feedback.style.color = '#27ae60';
                const nextBtn = slide.querySelector('.btn-next');
                if (nextBtn) nextBtn.style.display = 'block';
            } else {
                feedback.innerHTML  = '❌ Some answers need revision. Try again!';
                feedback.style.color = '#c0392b';
                window.mistakes++;
            }
        }
    }
};


/* -----------------------------------------------------------------------------
   TIPO: ESSAY
   Área de escritura con tracking de integridad académica.
   Incluye advertencia previa, contador de palabras y envío al Sheet.
   
   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <!-- Slide 1 de 2: Advertencia previa (obligatoria) -->
   <div class="slide" id="preEssaySlide" data-type="ESSAY" data-se-role="warning"
        data-se-lesson="one point">
     <h2>Writing Task Instructions</h2>
     <p data-se-warning>
       You will write an essay that will take 5 minutes or more.
       This exercise is essential for assessing your understanding.
     </p>
   </div>
   
   <!-- Slide 2 de 2: Área de escritura -->
   <div class="slide" id="essaySlide" data-type="ESSAY" data-se-role="workspace"
        data-se-lesson="one point">
     <p data-se-prompt>
       Write a simple paragraph about how making mistakes can help students learn.
       Ensure you follow the One-Point Rule.
     </p>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-role="warning"   → genera el panel de advertencia + botones
   - data-se-role="workspace" → genera el textarea + word counter + submit
   - data-se-lesson debe coincidir en ambas slides con el ID de la lección
   - El tracking (pastes, tab switches, keystrokes) se activa automáticamente
     si window.EssayHandler está disponible (essay-handler.js externo)
----------------------------------------------------------------------------- */
SlideTypes.ESSAY = {
    mount(slide, index, lessonName) {
        const role = slide.dataset.seRole;
        if (role === 'warning')   this._mountWarning(slide, lessonName);
        if (role === 'workspace') this._mountWorkspace(slide, lessonName);
    },

    _mountWarning(slide, lessonName) {
        const warningEl   = slide.querySelector('[data-se-warning]');
        const warningText = warningEl ? warningEl.innerHTML : '';
        if (warningEl) warningEl.remove();

        const panel = document.createElement('div');
        panel.style.cssText = 'background:#f8f9fa; padding:20px; border-radius:10px;' +
                               'border:1px solid #dee2e6;';
        panel.innerHTML = `
            ${warningText ? `<p>${warningText}</p>` : ''}
            <div style="background:#fff; padding:10px; border-radius:5px; font-size:0.85rem;
                         color:#555; border-left:4px solid #007bff; margin:15px 0;">
                <strong>Research Tracking Active:</strong> This exercise records integrity data.
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-start-essay"
                        style="flex:2; display:block; padding:12px; background:#2c3e50; color:white;
                               border:none; border-radius:8px; cursor:pointer;
                               font-size:1rem; font-weight:600;">
                    Understand &amp; Start Essay →
                </button>
                <button class="btn-skip-essay"
                        style="flex:1; background:#6c757d; color:white; border:none;
                               border-radius:5px; cursor:pointer; padding:10px;
                               font-size:0.95rem;">
                    Skip Writing
                </button>
            </div>`;

        // ── Botón principal: navegar al essay + iniciar EssayHandler ──────────
        // Se usa addEventListener para evitar la fragilidad de onclick con múltiples sentencias
        panel.querySelector('.btn-start-essay').addEventListener('click', () => {
            SlideEngine.goTo('essaySlide');
            if (window.EssayHandler) EssayHandler.init(lessonName);
        });

        // ── Botón secundario: saltar essay guardando progreso actual ──────────
        panel.querySelector('.btn-skip-essay').addEventListener('click', () => {
            skipLessonWithData(lessonName);
        });

        slide.appendChild(panel);
    },

    _mountWorkspace(slide, lessonName) {
        const promptEl   = slide.querySelector('[data-se-prompt]');
        const promptText = promptEl ? promptEl.innerHTML : '';
        if (promptEl) promptEl.remove();

        const workspace = document.createElement('div');
        workspace.className = 'essay-workspace';
        workspace.innerHTML = `
            <h2>Writing Challenge</h2>
            ${promptText ? `
            <p style="background:#fff3cd; padding:10px; border-radius:5px; border:1px solid #ffeeba;">
                <strong>Prompt:</strong> ${promptText}
            </p>` : ''}
            <textarea id="essayInput"
                placeholder="Write your paragraph here..."
                style="width:100%; height:200px; padding:15px; border-radius:8px;
                       border:1px solid #ccc; font-family:'Georgia',serif;
                       line-height:1.6; font-size:16px; box-sizing:border-box;
                       resize:vertical;"></textarea>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <span style="font-size:0.85rem; color:#666;">
                    Word count: <span id="wordCountDisplay">0</span> words
                </span>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span id="se-integrity-icon" style="font-size:1.1rem;">&#x2705;</span>
                        <span style="font-size:0.82rem; color:#666; font-weight:600;">Integrity:</span>
                        <span id="se-integrity-score"
                              style="font-size:0.9rem; font-weight:700; color:#27ae60;">100%</span>
                        <div style="position:relative; display:inline-block;">
                            <span id="se-info-btn"
                                  style="display:inline-flex; align-items:center; justify-content:center;
                                         width:17px; height:17px; border-radius:50%;
                                         background:#adb5bd; color:#fff; font-size:0.65rem;
                                         font-weight:700; cursor:default; user-select:none;">i</span>
                            <div id="se-integrity-tooltip"
                                 style="display:none; position:absolute; right:0; bottom:26px;
                                        width:230px; background:#2c3e50; color:#ecf0f1;
                                        border-radius:8px; padding:12px 14px; font-size:0.78rem;
                                        line-height:1.7; z-index:999; box-shadow:0 4px 16px rgba(0,0,0,0.25);
                                        pointer-events:none;">
                                <div style="font-weight:700; margin-bottom:6px; letter-spacing:0.04em;
                                             color:#bdc3c7; font-size:0.72rem;">INTEGRITY BREAKDOWN</div>
                                <div id="se-tip-paste"></div>
                                <div id="se-tip-ratio"></div>
                                <div id="se-tip-tabs"></div>
                                <div id="se-tip-del"></div>
                                <div id="se-tip-dur"></div>
                                <div style="position:absolute; right:6px; bottom:-6px; width:0; height:0;
                                             border-left:6px solid transparent; border-right:6px solid transparent;
                                             border-top:6px solid #2c3e50;"></div>
                            </div>
                        </div>
                    </div>
                    <button onclick="skipLessonWithData('${lessonName}')"
                            style="background:none; border:none; color:#999; font-size:0.82rem;
                                   cursor:pointer; text-decoration:underline;">
                        Discard and Exit &#x2192;
                    </button>
                </div>
            </div>
            <button class="btn-next" id="finalBtn" style="display:block; margin-top:20px; width:100%;"
                    onclick="if(window.EssayHandler) EssayHandler.submit();
                             else finishLessonWithEssay('${lessonName}',
                                  document.getElementById('essayInput').value, {});">
                Submit &amp; Save Final Progress
            </button>`;

        slide.appendChild(workspace);

        // Word counter + live integrity dashboard
        const textarea = workspace.querySelector('#essayInput');
        const counter  = workspace.querySelector('#wordCountDisplay');

        // ── Integrity score calculation ───────────────────────────────────────
        // Returns 0–100. Starts at 100 and deducts weighted penalties.
        // Each signal is relative (not binary) so occasional deletions don't
        // collapse the score — only genuine anomaly patterns do.
        function _calcIntegrity(s, words) {
            let score = 100;
            const lines = [];

            // 1. PASTE PENALTY — heavy: each paste deducts 25pts (max -50)
            if (s.pastes > 0) {
                const pen = Math.min(s.pastes * 25, 50);
                score -= pen;
                lines.push(`📋 Pastes detected: ${s.pastes} (-${pen}pts)`);
            }

            // 2. TYPED RATIO — checks if chars were actually typed
            //    Only applied once there are enough chars to be meaningful (>30)
            if (s.totalChars > 30) {
                const ratio = Math.round((s.keystrokes / s.totalChars) * 100);
                if (ratio < 40) {
                    const pen = 30;
                    score -= pen;
                    lines.push(`⌨ Low typed ratio: ${ratio}% (-${pen}pts)`);
                } else if (ratio < 70) {
                    const pen = 15;
                    score -= pen;
                    lines.push(`⌨ Typed ratio: ${ratio}% (-${pen}pts)`);
                }
            }

            // 3. TAB SWITCHES — leaving the window mid-essay
            if (s.tabSwitches >= 5) {
                const pen = Math.min(s.tabSwitches * 4, 25);
                score -= pen;
                lines.push(`🔀 Tab switches: ${s.tabSwitches} (-${pen}pts)`);
            } else if (s.tabSwitches >= 2) {
                const pen = s.tabSwitches * 3;
                score -= pen;
                lines.push(`🔀 Tab switches: ${s.tabSwitches} (-${pen}pts)`);
            }

            // 4. EXCESSIVE DELETIONS relative to word count
            //    A student editing naturally deletes ~10-20% of chars; > 60% is suspicious
            if (words > 10 && s.deletions > 0) {
                const delRatio = s.deletions / Math.max(s.keystrokes, 1);
                if (delRatio > 0.6) {
                    const pen = 10;
                    score -= pen;
                    lines.push(`⌫ High deletion rate: ${Math.round(delRatio*100)}% (-${pen}pts)`);
                }
            }

            // 5. WRITING DURATION — flag very fast completion
            //    < 30s for > 30 words is suspicious
            if (words > 30 && s.writingDuration > 0 && s.writingDuration < 30) {
                const pen = 15;
                score -= pen;
                lines.push(`⏱ Very fast completion: ${s.writingDuration}s (-${pen}pts)`);
            }

            score = Math.max(0, score);

            // If all good, show positive note
            if (lines.length === 0) {
                lines.push('✅ No integrity flags detected.');
            }

            return { score, lines };
        }

        function _refreshStats() {
            const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
            counter.textContent = words;

            const h = window.EssayHandler;
            if (!h || typeof h.getLiveStats !== 'function') return;
            const s = h.getLiveStats();

            const { score, lines } = _calcIntegrity(s, words);

            // Update score badge
            const scoreEl = document.getElementById('se-integrity-score');
            const iconEl  = document.getElementById('se-integrity-icon');
            if (scoreEl) {
                scoreEl.textContent = score + '%';
                if (score >= 85) {
                    scoreEl.style.color = '#27ae60';
                    if (iconEl) iconEl.textContent = '\u2705'; // ✅
                } else if (score >= 60) {
                    scoreEl.style.color = '#e67e22';
                    if (iconEl) iconEl.textContent = '\u26A0\uFE0F'; // ⚠️
                } else {
                    scoreEl.style.color = '#e74c3c';
                    if (iconEl) iconEl.textContent = '\u274C'; // ❌
                }
            }

            // Update tooltip lines
            ['paste','ratio','tabs','del','dur'].forEach((k, i) => {
                const el = document.getElementById('se-tip-' + k);
                if (el) el.textContent = lines[i] || '';
            });
        }

        // Tooltip show/hide on hover
        const infoBtn  = workspace.querySelector('#se-info-btn');
        const tooltip  = workspace.querySelector('#se-integrity-tooltip');
        if (infoBtn && tooltip) {
            infoBtn.addEventListener('mouseenter', () => { tooltip.style.display = 'block'; });
            infoBtn.addEventListener('mouseleave', () => { tooltip.style.display = 'none';  });
        }

        textarea.addEventListener('input',   _refreshStats);
        textarea.addEventListener('keydown', _refreshStats);
        textarea.addEventListener('paste',   () => setTimeout(_refreshStats, 50));
        setInterval(_refreshStats, 2000);
    }
};


/* =============================================================================
   SECCIÓN 4 — UTILIDADES INTERNAS
   Helpers compartidos entre tipos. No se exportan al scope global.
   ============================================================================= */

// Añade el botón "Next →" al final de una slide.
// options.hidden = true  → inicia oculto (para quiz, drag_drop, fill_blank)
// options.text          → texto personalizado del botón
function _appendNextButton(slide, options = {}) {
    const { hidden = false, text = 'Next →' } = options;
    const btn       = document.createElement('button');
    btn.className   = 'btn-next';
    btn.textContent = text;
    btn.style.cssText = `display:${hidden ? 'none' : 'block'}; margin-top:20px;
                          padding:12px 28px; background:#2c3e50; color:white;
                          border:none; border-radius:8px; cursor:pointer;
                          font-size:1rem; font-weight:600;
                          transition: background 0.2s;`;
    btn.onmouseover = () => btn.style.background = '#1a252f';
    btn.onmouseout  = () => btn.style.background = '#2c3e50';
    btn.onclick     = () => SlideEngine.goTo(null);
    slide.appendChild(btn);
    return btn;
}


/* =============================================================================
   SECCIÓN 5 — NUEVOS TIPOS DE SLIDE
   Añadidos sin modificar nada de las Secciones 1–4.
   Cada tipo se auto-registra en SlideTypes y se activa en el switch de init().
   
   NUEVOS TIPOS:
   ─────────────────────────────────────────────────────────────────────────────
     data-type="SORT_PARAGRAPH"  → Ordenar oraciones arrastrando verticalmente
     data-type="HIGHLIGHT"       → Hacer clic en la oración incorrecta/correcta
     data-type="MATCH"           → Emparejar dos columnas con clic
   ─────────────────────────────────────────────────────────────────────────────
   IMPORTANTE: Para activar estos tipos, añadir los tres cases al switch en init():
   
     case 'SORT_PARAGRAPH': SlideTypes.SORT_PARAGRAPH.mount(slide, index); break;
     case 'HIGHLIGHT':      SlideTypes.HIGHLIGHT.mount(slide, index);      break;
     case 'MATCH':          SlideTypes.MATCH.mount(slide, index);          break;
   ============================================================================= */


/* -----------------------------------------------------------------------------
   TIPO: SORT_PARAGRAPH
   El alumno arrastra oraciones verticalmente para ordenarlas correctamente.
   El botón "Next" aparece cuando el orden es correcto.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="SORT_PARAGRAPH">
     <h2>Put the sentences in order</h2>
     <p>Drag the sentences to build a coherent paragraph.</p>

     <!-- data-se-order indica la posición correcta (1 = primero) -->
     <div data-se-sort data-se-order="3">Exercise also improves sleep quality.</div>
     <div data-se-sort data-se-order="1">Regular physical activity benefits mental health.</div>
     <div data-se-sort data-se-order="4">Therefore, an active lifestyle leads to overall wellbeing.</div>
     <div data-se-sort data-se-order="2">A 2023 study found a 30% reduction in anxiety symptoms.</div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-order es la posición correcta final (empieza en 1)
   - El engine desordena las oraciones automáticamente al montar
   - El alumno arrastra; al soltar se revalida el orden completo
   - El botón "Check Order" valida manualmente; "Next" aparece si es correcto
----------------------------------------------------------------------------- */
SlideTypes.SORT_PARAGRAPH = {
    mount(slide, index) {
        const items = Array.from(slide.querySelectorAll('[data-se-sort]'));
        if (items.length === 0) return;

        const feedbackId  = `se-sort-feedback-${index}`;
        const containerId = `se-sort-container-${index}`;

        // Recoger textos y orden correcto antes de modificar el DOM
        const correctOrder = items
            .map(el => ({ text: el.innerHTML.trim(), order: parseInt(el.dataset.seOrder, 10) }))
            .sort((a, b) => a.order - b.order)
            .map(item => item.text);

        // Desordenar (Fisher-Yates) para que nunca salga en orden correcto
        const shuffled = [...correctOrder];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        // Si por azar salió igual al correcto, rotar uno
        if (shuffled.every((t, i) => t === correctOrder[i])) {
            shuffled.push(shuffled.shift());
        }

        // Eliminar los elementos originales del DOM
        items.forEach(el => el.remove());

        // Crear contenedor de lista ordenable
        const container = document.createElement('div');
        container.id = containerId;
        container.style.cssText = 'display:flex; flex-direction:column; gap:8px; margin:16px 0;';

        shuffled.forEach((text, i) => {
            const item = document.createElement('div');
            item.className        = 'se-sort-item';
            item.draggable        = true;
            item.dataset.seText   = text;
            item.style.cssText    = `padding:12px 16px; background:#fff; border:2px solid #dee2e6;
                                      border-radius:8px; cursor:grab; user-select:none;
                                      display:flex; align-items:center; gap:10px;
                                      transition: box-shadow 0.15s, border-color 0.15s;`;
            item.innerHTML        = `<span style="color:#adb5bd; font-size:0.8rem; min-width:20px;">⠿</span>
                                      <span>${text}</span>`;

            // Drag events
            item.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', i.toString());
                item.style.opacity = '0.5';
                item._dragIndex    = Array.from(container.children).indexOf(item);
            });
            item.addEventListener('dragend', () => { item.style.opacity = '1'; });

            item.addEventListener('dragover', e => {
                e.preventDefault();
                item.style.borderColor = '#3498db';
            });
            item.addEventListener('dragleave', () => {
                item.style.borderColor = '#dee2e6';
            });
            item.addEventListener('drop', e => {
                e.preventDefault();
                item.style.borderColor = '#dee2e6';
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                const allItems  = Array.from(container.children);
                const draggedEl = allItems[fromIndex] ||
                    [...container.querySelectorAll('.se-sort-item')]
                        .find(el => el.style.opacity === '0.5');
                const toIndex   = Array.from(container.children).indexOf(item);

                if (draggedEl && draggedEl !== item) {
                    const rect = item.getBoundingClientRect();
                    const mid  = rect.top + rect.height / 2;
                    if (e.clientY < mid) {
                        container.insertBefore(draggedEl, item);
                    } else {
                        container.insertBefore(draggedEl, item.nextSibling);
                    }
                }
            });

            container.appendChild(item);
        });

        // Insertar contenedor en la slide (antes del último hijo para no romper estructura)
        slide.appendChild(container);

        // Botón de verificación
        const checkBtn = document.createElement('button');
        checkBtn.textContent  = 'Check Order';
        checkBtn.style.cssText = `margin-top:8px; padding:10px 24px; background:#3498db;
                                   color:white; border:none; border-radius:8px;
                                   cursor:pointer; font-size:1rem;`;
        checkBtn.addEventListener('click', () => {
            SlideTypes.SORT_PARAGRAPH._validate(slide, containerId, feedbackId, correctOrder);
        });
        slide.appendChild(checkBtn);

        // Feedback
        const feedback = document.createElement('div');
        feedback.id    = feedbackId;
        feedback.style.cssText = 'display:none; margin-top:10px; padding:10px;' +
                                  'border-radius:5px; font-weight:bold;';
        slide.appendChild(feedback);

        _appendNextButton(slide, { hidden: true });
    },

    _validate(slide, containerId, feedbackId, correctOrder) {
        const container   = document.getElementById(containerId);
        const feedback    = document.getElementById(feedbackId);
        const currentOrder = Array.from(container.querySelectorAll('.se-sort-item'))
            .map(el => el.dataset.seText);

        const isCorrect = currentOrder.every((text, i) => text === correctOrder[i]);

        // Colorear bordes según posición correcta o no
        container.querySelectorAll('.se-sort-item').forEach((el, i) => {
            el.style.borderColor = (el.dataset.seText === correctOrder[i])
                ? '#2ecc71'
                : '#e74c3c';
        });

        if (feedback) {
            feedback.style.display = 'block';
            if (isCorrect) {
                feedback.innerHTML  = '✅ Perfect order! The paragraph is coherent.';
                feedback.style.color = '#27ae60';
                const nextBtn = slide.querySelector('.btn-next');
                if (nextBtn) nextBtn.style.display = 'block';
            } else {
                feedback.innerHTML  = '❌ Not quite. Some sentences are out of order — try again!';
                feedback.style.color = '#c0392b';
                window.mistakes++;
            }
        }
    }
};


/* -----------------------------------------------------------------------------
   TIPO: HIGHLIGHT
   El alumno hace clic en la oración que contiene el error (o el acierto).
   Feedback inmediato al hacer clic. El botón "Next" aparece al acertar.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="HIGHLIGHT">
     <h2>Find the problem</h2>
     <p data-se-instruction>Click on the sentence that breaks the One-Point Rule.</p>

     <div data-se-paragraph>
       <span data-se-sentence>Regular exercise improves cardiovascular health.</span>
       <span data-se-sentence data-se-highlight-correct>
         Many people also enjoy cooking as a hobby.
       </span>
       <span data-se-sentence>Studies show a 25% reduction in heart disease risk.</span>
       <span data-se-sentence>Therefore, physical activity is key to a healthy heart.</span>
     </div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-highlight-correct marca la oración que el alumno debe seleccionar
   - Solo una oración debe tener data-se-highlight-correct
   - data-se-instruction es el texto de consigna (opcional)
   - Las oraciones se separan visualmente con un leve espaciado entre ellas
----------------------------------------------------------------------------- */
SlideTypes.HIGHLIGHT = {
    mount(slide, index) {
        const sentences = Array.from(slide.querySelectorAll('[data-se-sentence]'));
        if (sentences.length === 0) return;

        const feedbackId = `se-hl-feedback-${index}`;

        // Estilar cada oración como bloque cliqueable
        sentences.forEach(el => {
            el.style.cssText = `display:block; padding:10px 14px; margin:6px 0;
                                 border-radius:6px; border:2px solid #dee2e6;
                                 background:#fff; cursor:pointer;
                                 transition: background 0.15s, border-color 0.15s;
                                 line-height:1.6;`;

            el.addEventListener('mouseenter', () => {
                if (!el.dataset.seAnswered) {
                    el.style.background   = '#eaf6ff';
                    el.style.borderColor  = '#3498db';
                }
            });
            el.addEventListener('mouseleave', () => {
                if (!el.dataset.seAnswered) {
                    el.style.background  = '#fff';
                    el.style.borderColor = '#dee2e6';
                }
            });

            el.addEventListener('click', () => {
                // Bloquear si ya se respondió correctamente
                if (slide.dataset.seHighlightDone) return;

                const isCorrect = el.hasAttribute('data-se-highlight-correct');
                const feedback  = document.getElementById(feedbackId);

                el.dataset.seAnswered = 'true';

                if (isCorrect) {
                    // Marcar la correcta en verde y bloquear todas
                    el.style.background   = '#d4edda';
                    el.style.borderColor  = '#28a745';
                    el.style.color        = '#155724';
                    slide.dataset.seHighlightDone = 'true';

                    sentences.forEach(s => { s.style.cursor = 'default'; });

                    if (feedback) {
                        feedback.innerHTML  = '✅ Correct! That sentence breaks the focus of the paragraph.';
                        feedback.style.color = '#27ae60';
                        feedback.style.display = 'block';
                    }
                    const nextBtn = slide.querySelector('.btn-next');
                    if (nextBtn) nextBtn.style.display = 'block';
                } else {
                    // Marcar el intento fallido en rojo, luego limpiar
                    el.style.background  = '#f8d7da';
                    el.style.borderColor = '#dc3545';
                    el.style.color       = '#721c24';

                    if (feedback) {
                        feedback.innerHTML  = '❌ That\'s not the one — look more carefully!';
                        feedback.style.color = '#c0392b';
                        feedback.style.display = 'block';
                    }
                    window.mistakes++;

                    setTimeout(() => {
                        el.style.background  = '#fff';
                        el.style.borderColor = '#dee2e6';
                        el.style.color       = '';
                        delete el.dataset.seAnswered;
                    }, 900);
                }
            });
        });

        // Feedback
        const feedback = document.createElement('div');
        feedback.id    = feedbackId;
        feedback.style.cssText = 'display:none; margin-top:10px; padding:10px;' +
                                  'border-radius:5px; font-weight:bold;';
        slide.appendChild(feedback);

        _appendNextButton(slide, { hidden: true });
    }
};


/* -----------------------------------------------------------------------------
   TIPO: MATCH
   Dos columnas: el alumno hace clic en un item de cada columna para emparejarlos.
   Los pares correctos se marcan en verde; los incorrectos parpadean en rojo.
   El botón "Next" aparece cuando todos los pares están completos.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="MATCH">
     <h2>Match the concept</h2>
     <p>Click one item from each column to create a pair.</p>

     <!-- data-se-pair debe ser idéntico en el item izquierdo y su pareja derecha -->
     <div data-se-left  data-se-pair="point">Point (P)</div>
     <div data-se-left  data-se-pair="evidence">Evidence (E)</div>
     <div data-se-left  data-se-pair="explain">Explanation (E)</div>
     <div data-se-left  data-se-pair="relevance">Relevance (R)</div>

     <div data-se-right data-se-pair="explain">Connects evidence to the claim</div>
     <div data-se-right data-se-pair="relevance">Links paragraph back to thesis</div>
     <div data-se-right data-se-pair="point">The Topic Sentence you will defend</div>
     <div data-se-right data-se-pair="evidence">Data, quotes, or statistics</div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-pair debe ser idéntico en el left y su right correspondiente
   - El engine mezcla automáticamente la columna derecha
   - Se pueden tener de 2 a 6 pares (más de 6 se vuelve incómodo en móvil)
   - El alumno hace clic en uno de la izquierda, luego uno de la derecha
----------------------------------------------------------------------------- */
SlideTypes.MATCH = {
    mount(slide, index) {
        const lefts  = Array.from(slide.querySelectorAll('[data-se-left]'));
        const rights = Array.from(slide.querySelectorAll('[data-se-right]'));
        if (lefts.length === 0 || rights.length === 0) return;

        const feedbackId = `se-match-feedback-${index}`;
        let   selected   = null;   // el item de la izquierda actualmente seleccionado
        let   matched    = 0;

        // Mezclar la columna derecha (Fisher-Yates)
        for (let i = rights.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [rights[i], rights[j]] = [rights[j], rights[i]];
        }

        // Construir tabla de dos columnas
        const grid = document.createElement('div');
        grid.style.cssText = `display:grid; grid-template-columns:1fr 1fr; gap:8px;
                               margin:16px 0;`;

        const styleItem = (el, side) => {
            el.style.cssText = `padding:12px; border-radius:8px; border:2px solid #dee2e6;
                                  background:#fff; cursor:pointer; text-align:center;
                                  font-size:0.95rem; transition: background 0.15s, border-color 0.15s;
                                  min-height:44px; display:flex; align-items:center;
                                  justify-content:center;`;
            el.dataset.seSide = side;
        };

        lefts.forEach(el  => styleItem(el, 'left'));
        rights.forEach(el => styleItem(el, 'right'));

        // Colocar en columnas: primero todos los lefts, luego todos los rights
        // usando CSS grid con grid-column para que queden lado a lado fila a fila
        const maxRows = Math.max(lefts.length, rights.length);
        for (let r = 0; r < maxRows; r++) {
            if (lefts[r])  grid.appendChild(lefts[r]);
            else           grid.appendChild(document.createElement('div')); // placeholder
            if (rights[r]) grid.appendChild(rights[r]);
            else           grid.appendChild(document.createElement('div'));
        }

        // Eliminar elementos originales del DOM
        [...lefts, ...rights].forEach(el => {
            if (el.parentNode && el.parentNode !== grid) el.parentNode.removeChild(el);
        });

        slide.appendChild(grid);

        // Lógica de selección y emparejamiento
        const handleClick = (el) => {
            if (el.dataset.seMatched || el.dataset.seSide === undefined) return;

            const feedback = document.getElementById(feedbackId);

            if (el.dataset.seSide === 'left') {
                // Deseleccionar el anterior izquierdo si lo había
                if (selected) {
                    selected.style.background   = '#fff';
                    selected.style.borderColor  = '#dee2e6';
                }
                selected = el;
                el.style.background  = '#eaf6ff';
                el.style.borderColor = '#3498db';

            } else if (el.dataset.seSide === 'right' && selected) {
                // Intentar emparejar
                const isCorrect = selected.dataset.sePair === el.dataset.sePair;

                if (isCorrect) {
                    // Marcar ambos como emparejados
                    [selected, el].forEach(item => {
                        item.style.background   = '#d4edda';
                        item.style.borderColor  = '#28a745';
                        item.style.color        = '#155724';
                        item.style.cursor       = 'default';
                        item.dataset.seMatched  = 'true';
                    });
                    matched++;
                    selected = null;

                    if (feedback) {
                        feedback.innerHTML  = `✅ Correct pair! (${matched}/${lefts.length} matched)`;
                        feedback.style.color = '#27ae60';
                        feedback.style.display = 'block';
                    }

                    // Comprobar si todos están emparejados
                    if (matched === lefts.length) {
                        if (feedback) feedback.innerHTML = '✅ All pairs matched! Excellent work.';
                        const nextBtn = slide.querySelector('.btn-next');
                        if (nextBtn) nextBtn.style.display = 'block';
                    }

                } else {
                    // Fallo: parpadeo rojo y reset
                    [selected, el].forEach(item => {
                        item.style.background  = '#f8d7da';
                        item.style.borderColor = '#dc3545';
                    });
                    if (feedback) {
                        feedback.innerHTML  = '❌ That pair doesn\'t match — try again!';
                        feedback.style.color = '#c0392b';
                        feedback.style.display = 'block';
                    }
                    window.mistakes++;

                    const prevSelected = selected;
                    selected = null;
                    setTimeout(() => {
                        [prevSelected, el].forEach(item => {
                            if (!item.dataset.seMatched) {
                                item.style.background  = '#fff';
                                item.style.borderColor = '#dee2e6';
                            }
                        });
                    }, 800);
                }
            }
        };

        [...lefts, ...rights].forEach(el => {
            el.addEventListener('click', () => handleClick(el));
        });

        // Feedback
        const feedback = document.createElement('div');
        feedback.id    = feedbackId;
        feedback.style.cssText = 'display:none; margin-top:10px; padding:10px;' +
                                  'border-radius:5px; font-weight:bold;';
        slide.appendChild(feedback);

        _appendNextButton(slide, { hidden: true });
    }
};

/* =============================================================================
   SECCIÓN 6 — TIPOS PARA MÓDULO DE CONNECTORS
   Diseñados específicamente para ejercicios de selección y clasificación
   de conectores y marcadores del discurso.

   NUEVOS TIPOS:
   ─────────────────────────────────────────────────────────────────────────────
     data-type="WORD_BANK"      → Banco de palabras clicables → se insertan en blancos
     data-type="CATEGORIZE"     → Clasificar items en columnas por categoría semántica
     data-type="CHOOSE_CONTEXT" → Elegir entre dos opciones incrustadas en la oración
   ─────────────────────────────────────────────────────────────────────────────
   Los tres siguen la misma convención data-se-* del resto del engine.
   Los tres registran mistakes en window.mistakes.
   Los tres revelan btn-next solo al completar correctamente.
   ============================================================================= */


/* -----------------------------------------------------------------------------
   TIPO: WORD_BANK
   Banco de palabras clicables que se insertan en los blancos del texto.
   Hay más palabras en el banco que blancos — los extras son distractores.
   Al hacer clic en una palabra del banco → se inserta en el blanco activo.
   Al hacer clic en una zona ya ocupada → la palabra regresa al banco.
   Botón "Check" valida todos los blancos. Next aparece al acertar.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="WORD_BANK">
     <h2>Choose the right connector</h2>

     <!-- Banco: más palabras que blancos. Las extras son distractores. -->
     <div data-se-bank>
       <span data-se-word>however</span>
       <span data-se-word>therefore</span>
       <span data-se-word>although</span>
       <span data-se-word>due to</span>
       <span data-se-word>furthermore</span>
       <span data-se-word>despite</span>
     </div>

     <!-- Texto con blancos: data-se-blank + data-se-answer -->
     <p data-se-sentence>
       The study was inconclusive;
       <span data-se-blank data-se-answer="however">[ ? ]</span>,
       a second trial produced clearer results.
     </p>
     <p data-se-sentence>
       Sales dropped
       <span data-se-blank data-se-answer="due to">[ ? ]</span>
       disruptions in the supply chain.
     </p>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-answer debe coincidir con el texto de un data-se-word (case-insensitive)
   - Un blanco solo acepta una palabra a la vez
   - Las palabras usadas se ocultan del banco; al devolverse reaparecen
   - La validación admite includes() bidireccional
----------------------------------------------------------------------------- */
SlideTypes.WORD_BANK = {
    mount(slide, index) {
        const bankEl     = slide.querySelector('[data-se-bank]');
        const blanks     = Array.from(slide.querySelectorAll('[data-se-blank]'));
        const feedbackId = `se-wb-feedback-${index}`;
        if (!bankEl || blanks.length === 0) return;

        bankEl.style.cssText = `display:flex; flex-wrap:wrap; gap:8px; padding:14px;
                                  background:#eaf6ff; border-radius:10px; margin-bottom:16px;
                                  border:2px dashed #3498db; min-height:50px;`;

        const words = Array.from(bankEl.querySelectorAll('[data-se-word]'));
        words.forEach(word => {
            word.style.cssText = `padding:6px 14px; background:#3498db; color:white;
                                   border-radius:20px; cursor:pointer; font-size:0.95rem;
                                   font-weight:500; user-select:none; transition:background 0.15s;`;
            word.addEventListener('mouseenter', () => { word.style.background = '#2980b9'; });
            word.addEventListener('mouseleave', () => { word.style.background = '#3498db'; });
        });

        let activeBlank = null;

        blanks.forEach((blank, i) => {
            const answer = blank.dataset.seAnswer || '';
            const zone   = document.createElement('span');
            zone.id      = `se-wb-blank-${index}-${i}`;
            zone.dataset.seAnswer = answer;
            zone.dataset.seEmpty  = 'true';
            zone.dataset.seWord   = '';
            zone.style.cssText = `display:inline-block;
                                   min-width:${Math.max(answer.length * 11, 80)}px;
                                   padding:2px 10px; border-bottom:2px solid #3498db;
                                   background:#f0f8ff; border-radius:4px; cursor:pointer;
                                   text-align:center; font-weight:600; color:#7f8c8d;
                                   margin:0 4px; font-size:inherit; transition:background 0.15s;`;
            zone.textContent = '?';

            zone.addEventListener('click', () => {
                if (zone.dataset.seEmpty === 'false') {
                    const wordText = zone.dataset.seWord;
                    zone.textContent      = '?';
                    zone.dataset.seEmpty  = 'true';
                    zone.dataset.seWord   = '';
                    zone.style.background = '#f0f8ff';
                    zone.style.borderColor = '#3498db';
                    zone.style.color      = '#7f8c8d';
                    SlideTypes.WORD_BANK._returnWordToBank(bankEl, wordText);
                    activeBlank = null;
                    return;
                }
                slide.querySelectorAll(`[id^="se-wb-blank-${index}-"]`).forEach(z => {
                    if (z.dataset.seEmpty === 'true') z.style.background = '#f0f8ff';
                });
                zone.style.background = '#d6eaf8';
                activeBlank = zone;
            });

            blank.replaceWith(zone);
        });

        const getZones = () => Array.from(
            slide.querySelectorAll(`[id^="se-wb-blank-${index}-"]`)
        );

        words.forEach(word => {
            word.addEventListener('click', () => {
                let target = (activeBlank && activeBlank.dataset.seEmpty === 'true')
                    ? activeBlank
                    : getZones().find(z => z.dataset.seEmpty === 'true') || null;
                if (!target) return;

                target.textContent       = word.textContent;
                target.dataset.seEmpty   = 'false';
                target.dataset.seWord    = word.textContent;
                target.style.background  = '#d5f5e3';
                target.style.borderColor = '#2ecc71';
                target.style.color       = '#1a5276';
                activeBlank = null;
                word.style.display = 'none';
            });
        });

        const checkBtn = document.createElement('button');
        checkBtn.textContent  = 'Check Answers';
        checkBtn.style.cssText = `margin-top:14px; padding:10px 24px; background:#3498db;
                                   color:white; border:none; border-radius:8px;
                                   cursor:pointer; font-size:1rem; display:block;`;
        checkBtn.addEventListener('click', () => {
            SlideTypes.WORD_BANK._validate(slide, index, feedbackId, getZones());
        });
        slide.appendChild(checkBtn);

        const fb = document.createElement('div');
        fb.id    = feedbackId;
        fb.style.cssText = 'display:none; margin-top:10px; padding:10px; border-radius:5px; font-weight:bold;';
        slide.appendChild(fb);

        _appendNextButton(slide, { hidden: true });
    },

    _returnWordToBank(bankEl, wordText) {
        const match = Array.from(bankEl.querySelectorAll('[data-se-word]'))
            .find(w => w.textContent.toLowerCase().trim() === wordText.toLowerCase().trim());
        if (match) match.style.display = '';
    },

    _validate(slide, index, feedbackId, zones) {
        const fb = document.getElementById(feedbackId);
        let allCorrect = true;

        zones.forEach(zone => {
            const expected = (zone.dataset.seAnswer || '').toLowerCase().trim();
            const given    = (zone.dataset.seWord   || '').toLowerCase().trim();
            const correct  = given === expected || given.includes(expected) || expected.includes(given);
            zone.style.borderColor = correct ? '#2ecc71' : '#e74c3c';
            zone.style.background  = correct ? '#d4edda' : '#f8d7da';
            zone.style.color       = correct ? '#155724' : '#721c24';
            if (!correct) allCorrect = false;
        });

        if (fb) {
            fb.style.display = 'block';
            if (allCorrect) {
                fb.innerHTML  = '✅ All correct! Well done.';
                fb.style.color = '#27ae60';
                const nextBtn = slide.querySelector('.btn-next');
                if (nextBtn) nextBtn.style.display = 'block';
            } else {
                fb.innerHTML  = '❌ Some connectors are not right — try again!';
                fb.style.color = '#c0392b';
                window.mistakes++;
            }
        }
    }
};


/* -----------------------------------------------------------------------------
   TIPO: CATEGORIZE
   El alumno arrastra items a columnas de categorías semánticas.
   A diferencia de MATCH (1:1), aquí varias palabras pueden ir a la misma columna.
   El botón "Check" valida. Next aparece si todo es correcto.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="CATEGORIZE">
     <h2>Sort by function</h2>
     <p>Drag each connector to its correct category.</p>

     <div data-se-item data-se-category="contrast">nevertheless</div>
     <div data-se-item data-se-category="contrast">on the other hand</div>
     <div data-se-item data-se-category="addition">moreover</div>
     <div data-se-item data-se-category="addition">in addition</div>
     <div data-se-item data-se-category="cause">since</div>
     <div data-se-item data-se-category="result">consequently</div>

     <div data-se-category-zone data-se-accepts="contrast" data-se-label="Contrast"></div>
     <div data-se-category-zone data-se-accepts="addition" data-se-label="Addition"></div>
     <div data-se-category-zone data-se-accepts="cause"    data-se-label="Cause / Reason"></div>
     <div data-se-category-zone data-se-accepts="result"   data-se-label="Result"></div>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - data-se-category debe coincidir con data-se-accepts de la zona correcta
   - Múltiples items pueden compartir la misma categoría
   - Items mal colocados se pueden mover sin reiniciar
   - La validación comprueba que TODOS los items estén en su zona correcta
----------------------------------------------------------------------------- */
SlideTypes.CATEGORIZE = {
    mount(slide, index) {
        const items      = Array.from(slide.querySelectorAll('[data-se-item]'));
        const zones      = Array.from(slide.querySelectorAll('[data-se-category-zone]'));
        const feedbackId = `se-cat-feedback-${index}`;
        if (items.length === 0 || zones.length === 0) return;

        const pool = document.createElement('div');
        pool.id    = `se-cat-pool-${index}`;
        pool.style.cssText = `display:flex; flex-wrap:wrap; gap:8px; padding:12px;
                               background:#f8f9fa; border-radius:10px; margin-bottom:16px;
                               border:2px dashed #adb5bd; min-height:52px;`;

        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }

        items.forEach((el, i) => {
            el.id = `se-cat-item-${index}-${i}`;
            el.setAttribute('draggable', 'true');
            el.style.cssText = `padding:7px 16px; background:#2c3e50; color:white;
                                 border-radius:20px; cursor:grab; font-size:0.9rem;
                                 font-weight:500; user-select:none; transition:opacity 0.15s;`;
            el.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', el.id);
                el.style.opacity = '0.4';
            });
            el.addEventListener('dragend', () => { el.style.opacity = '1'; });
            pool.appendChild(el);
        });

        const firstZone = zones[0];
        slide.insertBefore(pool, firstZone);

        pool.addEventListener('dragover', e => e.preventDefault());
        pool.addEventListener('drop', e => {
            e.preventDefault();
            const dragged = document.getElementById(e.dataTransfer.getData('text/plain'));
            if (dragged) pool.appendChild(dragged);
        });

        // ── Guardar referencia al padre ANTES de mover nada ──────────────
        // firstZone.parentNode se pierde en cuanto la zona se mueve al grid
        const slideParent  = slide;
        const insertAnchor = firstZone.nextSibling;

        // Eliminar zonas del DOM antes de construir el grid
        zones.forEach(z => z.parentNode && z.parentNode.removeChild(z));

        const cols = Math.min(zones.length, 2);
        const grid = document.createElement('div');
        grid.style.cssText = `display:grid; grid-template-columns:repeat(${cols},1fr);
                               gap:10px; margin:10px 0;`;

        zones.forEach(zone => {
            const label = zone.dataset.seLabel || zone.dataset.seAccepts;
            zone.style.cssText = `min-height:90px; padding:10px; border-radius:8px;
                                   border:2px dashed #adb5bd; background:#fff;
                                   display:flex; flex-wrap:wrap; gap:6px;
                                   align-content:flex-start;
                                   transition:background 0.15s, border-color 0.15s;`;

            const labelEl = document.createElement('div');
            labelEl.textContent = label;
            labelEl.style.cssText = `width:100%; font-size:0.75rem; font-weight:700;
                                      text-transform:uppercase; color:#6c757d;
                                      letter-spacing:0.05em; margin-bottom:6px;
                                      pointer-events:none;`;
            zone.prepend(labelEl);

            zone.addEventListener('dragover', e => {
                e.preventDefault();
                zone.style.background  = '#eaf6ff';
                zone.style.borderColor = '#3498db';
            });
            zone.addEventListener('dragleave', e => {
                if (!zone.contains(e.relatedTarget)) {
                    zone.style.background  = '#fff';
                    zone.style.borderColor = '#adb5bd';
                }
            });
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.style.background  = '#fff';
                zone.style.borderColor = '#adb5bd';
                const dragged = document.getElementById(e.dataTransfer.getData('text/plain'));
                if (dragged) zone.appendChild(dragged);
            });

            grid.appendChild(zone);
        });

        // Insertar el grid usando la referencia al slide directamente
        slideParent.insertBefore(grid, insertAnchor);

        const checkBtn = document.createElement('button');
        checkBtn.textContent  = 'Check Categories';
        checkBtn.style.cssText = `margin-top:14px; padding:10px 24px; background:#3498db;
                                   color:white; border:none; border-radius:8px;
                                   cursor:pointer; font-size:1rem; display:block;`;
        checkBtn.addEventListener('click', () => {
            SlideTypes.CATEGORIZE._validate(slide, feedbackId, items);
        });
        slide.appendChild(checkBtn);

        const fb = document.createElement('div');
        fb.id    = feedbackId;
        fb.style.cssText = 'display:none; margin-top:10px; padding:10px; border-radius:5px; font-weight:bold;';
        slide.appendChild(fb);

        _appendNextButton(slide, { hidden: true });
    },

    _validate(slide, feedbackId, items) {
        const fb = document.getElementById(feedbackId);
        let correct = 0;

        items.forEach(item => {
            const pz        = item.closest('[data-se-category-zone]');
            const isCorrect = pz && pz.dataset.seAccepts === item.dataset.seCategory;
            item.style.background = isCorrect ? '#2ecc71' : '#e74c3c';
            if (isCorrect) correct++;
        });

        const allCorrect = correct === items.length;
        if (fb) {
            fb.style.display = 'block';
            if (allCorrect) {
                fb.innerHTML  = `✅ Perfect! All ${items.length} connectors correctly categorised.`;
                fb.style.color = '#27ae60';
                const nextBtn = slide.querySelector('.btn-next');
                if (nextBtn) nextBtn.style.display = 'block';
            } else {
                fb.innerHTML  = `❌ ${correct} of ${items.length} correct — fix the red ones and try again.`;
                fb.style.color = '#c0392b';
                window.mistakes++;
                setTimeout(() => {
                    items.forEach(item => {
                        const pz = item.closest('[data-se-category-zone]');
                        if (!(pz && pz.dataset.seAccepts === item.dataset.seCategory)) {
                            item.style.background = '#2c3e50';
                        }
                    });
                }, 1500);
            }
        }
    }
};


/* -----------------------------------------------------------------------------
   TIPO: CHOOSE_CONTEXT
   Dos opciones incrustadas dentro de la oración misma — no como botones externos.
   El alumno hace clic en la opción correcta directamente en el flujo del texto.
   Feedback inmediato por oración. Next aparece cuando todas están resueltas.

   USO EN HTML:
   ─────────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="CHOOSE_CONTEXT">
     <h2>Which connector fits?</h2>

     <p data-se-sentence>
       Sales dropped significantly last quarter
       <span data-se-choice>
         <span data-se-option>due to</span>
         <span data-se-option data-se-correct>because of</span>
       </span>
       a disruption in the supply chain.
     </p>

     <p data-se-sentence>
       <span data-se-choice>
         <span data-se-option data-se-correct>Although</span>
         <span data-se-option>Despite</span>
       </span>
       the team worked overtime, the deadline was missed.
     </p>
   </div>
   ─────────────────────────────────────────────────────────────────────────────
   NOTAS:
   - Cada data-se-sentence tiene exactamente un data-se-choice con dos data-se-option
   - Solo uno lleva data-se-correct
   - Al acertar, ambas opciones se bloquean (la incorrecta se desvanece)
   - Al fallar, el botón parpadea en rojo y permite reintentar
----------------------------------------------------------------------------- */
SlideTypes.CHOOSE_CONTEXT = {
    mount(slide, index) {
        const sentences  = Array.from(slide.querySelectorAll('[data-se-sentence]'));
        const feedbackId = `se-cc-feedback-${index}`;
        if (sentences.length === 0) return;

        let solvedCount = 0;
        const total     = sentences.length;

        sentences.forEach(sentence => {
            const choiceEl = sentence.querySelector('[data-se-choice]');
            if (!choiceEl) return;

            const options = Array.from(choiceEl.querySelectorAll('[data-se-option]'));
            const wrapper = document.createElement('span');
            wrapper.style.cssText = `display:inline-flex; gap:4px; flex-wrap:wrap;
                                      vertical-align:middle; margin:0 3px;`;

            options.forEach(opt => {
                const isCorrect = opt.hasAttribute('data-se-correct');
                const btn       = document.createElement('button');
                btn.textContent = opt.textContent.trim();
                btn.style.cssText = `padding:3px 12px; border-radius:20px; cursor:pointer;
                                      border:2px solid #3498db; background:#eaf6ff;
                                      color:#2c3e50; font-size:inherit; font-family:inherit;
                                      font-weight:600; transition:background 0.15s;`;
                btn.addEventListener('mouseenter', () => { if (!btn.disabled) btn.style.background = '#d6eaf8'; });
                btn.addEventListener('mouseleave', () => { if (!btn.disabled) btn.style.background = '#eaf6ff'; });

                btn.addEventListener('click', () => {
                    if (btn.disabled) return;
                    const fb = document.getElementById(feedbackId);

                    if (isCorrect) {
                        btn.style.background  = '#2ecc71';
                        btn.style.borderColor = '#27ae60';
                        btn.style.color       = 'white';
                        wrapper.querySelectorAll('button').forEach(b => {
                            b.disabled = true;
                            if (b !== btn) {
                                b.style.opacity     = '0.3';
                                b.style.background  = '#f8f9fa';
                                b.style.borderColor = '#dee2e6';
                                b.style.color       = '#adb5bd';
                            }
                        });
                        solvedCount++;
                        if (fb) {
                            fb.style.display = 'block';
                            fb.innerHTML  = solvedCount === total
                                ? '✅ All correct! Great choices.'
                                : `✅ Correct! (${solvedCount}/${total} done)`;
                            fb.style.color = '#27ae60';
                        }
                        if (solvedCount === total) {
                            const nextBtn = slide.querySelector('.btn-next');
                            if (nextBtn) nextBtn.style.display = 'block';
                        }
                    } else {
                        btn.style.background  = '#e74c3c';
                        btn.style.borderColor = '#c0392b';
                        btn.style.color       = 'white';
                        window.mistakes++;
                        if (fb) {
                            fb.innerHTML  = '❌ Not quite — try the other option!';
                            fb.style.color = '#c0392b';
                            fb.style.display = 'block';
                        }
                        setTimeout(() => {
                            btn.style.background  = '#eaf6ff';
                            btn.style.borderColor = '#3498db';
                            btn.style.color       = '#2c3e50';
                        }, 800);
                    }
                });

                wrapper.appendChild(btn);
            });

            choiceEl.replaceWith(wrapper);
        });

        const fb = document.createElement('div');
        fb.id    = feedbackId;
        fb.style.cssText = 'display:none; margin-top:14px; padding:10px; border-radius:5px; font-weight:bold;';
        slide.appendChild(fb);

        _appendNextButton(slide, { hidden: true });
    }
};