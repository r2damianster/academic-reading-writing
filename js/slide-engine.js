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
                case 'FILL_BLANK': SlideTypes.FILL_BLANK.mount(slide, index); break;
                case 'ESSAY':      SlideTypes.ESSAY.mount(slide, index, lessonName); break;
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
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
                <span style="font-size:0.85rem; color:#666;">
                    Word count: <span id="wordCountDisplay">0</span> words
                </span>
                <button onclick="skipLessonWithData('${lessonName}')"
                        style="background:none; border:none; color:#999; font-size:0.85rem;
                               cursor:pointer; text-decoration:underline;">
                    Discard and Exit →
                </button>
            </div>
            <button class="btn-next" id="finalBtn" style="display:block; margin-top:20px; width:100%;"
                    onclick="if(window.EssayHandler) EssayHandler.submit();
                             else finishLessonWithEssay('${lessonName}',
                                  document.getElementById('essayInput').value, {});">
                Submit &amp; Save Final Progress
            </button>`;

        slide.appendChild(workspace);

        // Word counter en tiempo real
        const textarea = workspace.querySelector('#essayInput');
        const counter  = workspace.querySelector('#wordCountDisplay');
        textarea.addEventListener('input', () => {
            const words = textarea.value.trim().split(/\s+/).filter(w => w.length > 0).length;
            counter.textContent = words;
        });
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