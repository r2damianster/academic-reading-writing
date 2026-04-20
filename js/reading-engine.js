/* =============================================================================
   reading-engine.js — Motor de Lectura Interactiva para ULEAM
   
   Paralelo a slide-engine.js — NO lo modifica ni lo reemplaza.
   Solo se usa en lecciones de tipo READING (core-syllabus).
   
   TIPOS DE SLIDE SOPORTADOS:
   ─────────────────────────────────────────────────────────────────────────────
     data-type="VIDEO"            → Igual que slide-engine (iframe embed)
     data-type="CONTENT"          → Texto informativo, avanza solo
     data-type="READING_FOCUS"    → PDF + instrucción de lectura (solo scroll)
     data-type="READING_HIGHLIGHT"→ PDF + subrayado obligatorio para avanzar
     data-type="READING_COMMENT"  → PDF + área de comentario para avanzar
     data-type="READING_QUIZ"     → PDF visible + preguntas en sidebar
     data-type="READING_DRAGDROP" → PDF visible + drag & drop en sidebar
     data-type="READING_FILL"     → PDF visible + fill-in-the-blank en sidebar
   ─────────────────────────────────────────────────────────────────────────────
   
   ATRIBUTOS DE CONFIGURACIÓN EN .slide:
     data-re-pdf="URL"        → URL del PDF (se hereda entre slides si no se define)
     data-re-page="N"         → Página inicial del PDF (default: 1)
     data-re-task="texto"     → Instrucción principal del reto
     data-re-label="texto"    → Etiqueta del encabezado del sidebar
   
   USO:
     <script src="../../js/reading-engine.js" defer></script>
     window.onload = () => ReadingEngine.init('chain-essay');
   ============================================================================= */

/* ─── Visibilidad de slides ────────────────────────────────────────────────────
   modules.css oculta .slide con display:none !important y muestra .slide.active.
   Las reading-slides usan la misma clase .slide ADEMÁS de .reading-slide para
   heredar ese comportamiento sin modificar modules.css.
   Este bloque inyecta la regla equivalente en caso de que el HTML no cargue
   modules.css, garantizando que solo la slide activa sea visible.
────────────────────────────────────────────────────────────────────────────── */
(function _injectReadingSlideCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .reading-slide          { display: none !important; }
        .reading-slide.active   { display: block !important; animation: re-fadeIn 0.4s ease both; }
        @keyframes re-fadeIn    { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    `;
    document.head.appendChild(style);
})();

const ReadingEngine = (function () {

    /* ──────────────────────────────────────────────────────────────────────────
       ESTADO INTERNO
    ────────────────────────────────────────────────────────────────────────── */
    let _slides        = [];
    let _current       = 0;
    let _lessonName    = '';
    let _pdfCache      = {};     // url → pdfDoc
    let _currentPdfUrl = null;
    let _studentId     = null;   // UUID real de la tabla students
    let _studentName   = null;   // nombre para mostrar
    let _startTime     = null;   // timestamp de inicio de lección
    let _totalMistakes = 0;
    let _slideResults  = [];     // snapshot ligero de cada slide completado
    let _isAdmin       = false;
    let _helperWindow  = null;

    // Credenciales leídas desde /api/config — mismo patrón que slide-engine.js
    // Nunca hardcodeadas en el JS ni en meta tags del HTML.
    let SUPABASE_URL = '';
    let SUPABASE_KEY = '';

    // FIX BUG-001: promesa singleton — cualquier método que use SUPABASE_URL / SUPABASE_KEY
    // debe hacer `await _configReady` antes de ejecutar fetch a Supabase.
    const _configReady = fetch('/api/config')
        .then(r => r.json())
        .then(cfg => {
            SUPABASE_URL = cfg.supabaseUrl || '';
            SUPABASE_KEY = cfg.supabaseKey || '';
            console.log('🔑 ReadingEngine: Supabase config cargada');
        })
        .catch(e => console.error('❌ ReadingEngine: /api/config falló:', e));

    /* ──────────────────────────────────────────────────────────────────────────
       INICIALIZACIÓN
    ────────────────────────────────────────────────────────────────────────── */
    async function init(lessonName) {
        _lessonName = lessonName.toLowerCase().replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
        _slides     = Array.from(document.querySelectorAll('.reading-slide'));

        if (_slides.length === 0) {
            console.warn('ReadingEngine: no se encontraron .reading-slide en el DOM.');
            return;
        }

        // Identidad del estudiante — igual que slide-engine.js
        // Prioridad: studentId cacheado → resolución por email → fallback nombre
        _studentId   = localStorage.getItem('studentId')   || null;
        _studentName = localStorage.getItem('studentName') || localStorage.getItem('readingStudentName') || null;

        // Resolver student_id siempre que haya email disponible
        // Si ya está cacheado en localStorage, _resolveStudentId lo retorna inmediato
        const email = localStorage.getItem('studentEmail');
        if (email && !_studentId) {
            // await para garantizar que _studentId esté listo antes de cualquier insert
            await _resolveStudentId(email);
        }

        _startTime = Date.now();

        // Modo Instructor (soporta multi-tab con localStorage)
        _isAdmin = (sessionStorage.getItem('adminUnlocked') === 'true') || (localStorage.getItem('adminUnlocked') === 'true');
        console.log('🛡️ ReadingEngine: Instructor mode check:', _isAdmin);
        
        if (_isAdmin) {
            _mountInstructorUI();
        }

        // Montar cada slide
        _slides.forEach((slide, i) => {
            const type = (slide.dataset.type || '').toUpperCase();
            switch (type) {
                case 'VIDEO':             ReadingTypes.VIDEO.mount(slide, i);            break;
                case 'CONTENT':           ReadingTypes.CONTENT.mount(slide, i);          break;
                case 'READING_FOCUS':     ReadingTypes.READING_FOCUS.mount(slide, i);    break;
                case 'READING_HIGHLIGHT': ReadingTypes.READING_HIGHLIGHT.mount(slide, i); break;
                case 'READING_COMMENT':   ReadingTypes.READING_COMMENT.mount(slide, i);  break;
                case 'READING_QUIZ':      ReadingTypes.READING_QUIZ.mount(slide, i);     break;
                case 'READING_DRAGDROP':  ReadingTypes.READING_DRAGDROP.mount(slide, i); break;
                case 'READING_FILL':      ReadingTypes.READING_FILL.mount(slide, i);     break;
                case 'READING_TFNG':      ReadingTypes.READING_TFNG.mount(slide, i);     break;
                case 'READING_MATCH':     ReadingTypes.READING_MATCH.mount(slide, i);    break;
            }
        });

        _showSlide(0);
        _updateProgress();
        _mountReadingAIPanel();
        if (_isAdmin) _notifyHelper();
        console.log(`✅ ReadingEngine iniciado: "${lessonName}" — ${_slides.length} slides`);
    }

    /* ──────────────────────────────────────────────────────────────────────────
       NAVEGACIÓN
    ────────────────────────────────────────────────────────────────────────── */
    function _showSlide(index) {
        _slides.forEach(s => s.classList.remove('active'));
        _slides[index].classList.add('active');
        _current = index;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        _updateProgress();

        // Si la slide activa tiene un PDF, precargarlo para la siguiente
        const next = _slides[index + 1];
        if (next && next.dataset.rePdf) _preloadPdf(next.dataset.rePdf);

        if (_isAdmin) {
            _notifyHelper();
            _forceUnlockNext(index);
        }
    }

    function prev() {
        if (_current > 0) {
            _showSlide(_current - 1);
        }
    }

    function next() {
        if (_current < _slides.length - 1) {
            if (!_isAdmin) _saveProgress(_current, 'completed');
            _showSlide(_current + 1);
        } else {
            if (!_isAdmin) _finishLesson();
            else alert('End of presentation (Instructor Mode)');
        }
    }

    function _updateProgress() {
        const bar = document.getElementById('readingProgressBar');
        const container = bar ? bar.parentElement : null;

        if (bar && _slides.length > 1) {
            bar.style.width = `${(_current / (_slides.length - 1)) * 100}%`;
        }
        
        if (_isAdmin && container && !container.dataset.adminInited) {
            container.dataset.adminInited = 'true';
            container.style.cursor = 'pointer';
            container.title = 'Click to jump to slide (Instructor Only)';
            container.addEventListener('click', (e) => {
                const rect = container.getBoundingClientRect();
                const pct  = (e.clientX - rect.left) / rect.width;
                const idx  = Math.round(pct * (_slides.length - 1));
                _showSlide(idx);
            });
        }

        const counter = document.getElementById('readingSlideCounter');
        if (counter) counter.textContent = `${_current + 1} / ${_slides.length}`;
    }

/* ──────────────────────────────────────────────────────────────────────────
        BOTÓN "SIGUIENTE" — helpers (CONEXIÓN CON ACTIVITY TRACKER)
    ────────────────────────────────────────────────────────────────────────── */

    // Busca el btn-next-slide dentro de una slide y lo muestra
    function _unlockNext(slide) {
        if (_isAdmin) return; // Ya está desbloqueado por _forceUnlockNext
        const btn = slide.querySelector('.btn-next-slide');
        if (btn) {
            btn.style.display = 'block';
            // Opcional: podrías trackear aquí si quieres saber cuántas veces 
            // llegaron al final de una slide antes de hacer clic
        }
    }

    // Crea y appends el botón next al final de la slide
    function _appendNextBtn(slide, label) {
        const btn = document.createElement('button');
        btn.className   = 'btn-next-slide';
        btn.textContent = label || 'Continue →';
        
        // INTEGRACIÓN: Al hacer clic, notificamos al ActivityTracker
        btn.addEventListener('click', () => {
            if (typeof ActivityTracker !== 'undefined') {
                ActivityTracker.trackSlide(); 
                console.log("🚀 Slide tracked via ActivityTracker");
            }
            next(); // Tu función original para cambiar de slide
        });

        const sidebar = slide.querySelector('.reading-sidebar');
        if (sidebar) sidebar.appendChild(btn);
        else         slide.appendChild(btn);

        return btn;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       PDF ENGINE (PDF.js)
    ────────────────────────────────────────────────────────────────────────── */
    async function _getPdf(url) {
        if (_pdfCache[url]) return _pdfCache[url];
        if (!window.pdfjsLib) {
            console.error('ReadingEngine: pdfjsLib no está cargado.');
            return null;
        }
        try {
            const doc = await pdfjsLib.getDocument(url).promise;
            _pdfCache[url] = doc;
            return doc;
        } catch(e) {
            console.error('ReadingEngine: error cargando PDF', url, e);
            return null;
        }
    }

    async function _preloadPdf(url) {
        if (url && !_pdfCache[url]) await _getPdf(url);
    }

    // Renderiza una página en el contenedor dado.
    // Devuelve el PDFPageProxy para calcular alturas si necesario.
    async function _renderPage(containerId, url, pageNum) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const doc = await _getPdf(url);
        if (!doc) {
            container.innerHTML = '<p style="color:#c0392b;padding:16px;">⚠️ Could not load PDF. Check the URL.</p>';
            return null;
        }

        pageNum = Math.max(1, Math.min(pageNum || 1, doc.numPages));

        const page     = await doc.getPage(pageNum);
        const cWidth   = container.clientWidth || 680;
        const vp0      = page.getViewport({ scale: 1 });
        const scale    = (cWidth / vp0.width) * 0.97;
        const viewport = page.getViewport({ scale });

        const canvas  = document.createElement('canvas');
        canvas.width  = viewport.width;
        canvas.height = viewport.height;
        canvas.style.cssText = 'display:block; max-width:100%; border-radius:4px; box-shadow:0 2px 12px rgba(0,0,0,0.12);';

        container.innerHTML = '';
        container.appendChild(canvas);

        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

        _currentPdfUrl = url;
        return { doc, pageNum, numPages: doc.numPages };
    }

    // Renderiza con controles de paginación
    async function _renderWithControls(slide, renderId, navId, url, startPage) {
        const state = { page: startPage || 1 };
        const info  = await _renderPage(renderId, url, state.page);
        if (!info) return;

        // Actualizar indicador de página
        const _updateNav = () => {
            const cur   = slide.querySelector('.pdf-page-current');
            const total = slide.querySelector('.pdf-page-total');
            const prev  = slide.querySelector('.pdf-btn-prev');
            const nxt   = slide.querySelector('.pdf-btn-next');
            if (cur)   cur.textContent   = state.page;
            if (total) total.textContent = info.numPages;
            if (prev)  prev.disabled     = state.page <= 1;
            if (nxt)   nxt.disabled      = state.page >= info.numPages;
        };

        const prevBtn = slide.querySelector('.pdf-btn-prev');
        const nextBtn = slide.querySelector('.pdf-btn-next');

        prevBtn?.addEventListener('click', async () => {
            if (state.page > 1) { state.page--; await _renderPage(renderId, url, state.page); _updateNav(); }
        });
        nextBtn?.addEventListener('click', async () => {
            if (state.page < info.numPages) { state.page++; await _renderPage(renderId, url, state.page); _updateNav(); }
        });

        _updateNav();
    }

    /* ──────────────────────────────────────────────────────────────────────────
       SUPABASE — Identidad y guardado
    ────────────────────────────────────────────────────────────────────────── */

    // Resuelve el UUID del estudiante desde su email (igual que slide-engine)
    async function _resolveStudentId(email) {
        await _configReady; // BUG-001: credenciales garantizadas
        if (_studentId) return _studentId;
        if (!email || !SUPABASE_URL) return null;
        try {
            const res = await fetch(
                `${SUPABASE_URL}/rest/v1/students?email=eq.${encodeURIComponent(email)}&select=id,name&limit=1`,
                { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
            );
            const rows = await res.json();
            if (rows && rows.length > 0) {
                _studentId   = rows[0].id;
                _studentName = rows[0].name || _studentName;
                localStorage.setItem('studentId',   _studentId);
                localStorage.setItem('studentName', _studentName);
                console.log('ReadingEngine: student_id resuelto →', _studentId);
                return _studentId;
            }
        } catch(e) {
            console.warn('ReadingEngine: _resolveStudentId falló:', e);
        }
        return null;
    }

    // Guarda un snapshot ligero de la acción del slide actual (en memoria)
    // Solo se persiste en DB al finalizar la lección — evita N inserts por slide.
    function _saveProgress(slideIndex, actionType, data) {
        // Registrar en memoria (snapshot de la lección)
        _slideResults.push({
            slide:  slideIndex,
            type:   actionType,
            ...(data || {}),
            ts:     new Date().toISOString()
        });
        // Log local para debug
        console.log(`📝 [slide ${slideIndex}] ${actionType}`, data || '');
    }

    // Inserta UNA fila en activity_logs al terminar la lección (igual que slide-engine)
    async function _persistLessonResult(score) {
        await _configReady; // BUG-001: garantizar credenciales antes de cualquier INSERT
        if (!SUPABASE_URL) return;

        // Asegurar student_id antes de insertar
        const email = localStorage.getItem('studentEmail');
        if (!_studentId && email) {
            await _resolveStudentId(email);
        }

        const durationSec = _startTime ? Math.round((Date.now() - _startTime) / 1000) : null;
        const errors      = _totalMistakes;
        const result      = `Score: ${score}% (Errors: ${errors})`;

        // 1. Insertar en activity_logs (vincula la lección al estudiante)
        const logRecord = {
            student_id: _studentId || null,
            activity:   _lessonName,
            result:     result
        };

        try {
            const r = await fetch(`${SUPABASE_URL}/rest/v1/activity_logs`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'apikey':         SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer':        'return=minimal'
                },
                body:        JSON.stringify(logRecord),
                credentials: 'omit'
            });
            if (r.ok) {
                console.log(`📡 activity_logs ← "${_lessonName}" ${result}`);
            } else {
                const t = await r.text();
                console.error('activity_logs error:', r.status, t);
            }
        } catch(e) {
            console.error('activity_logs fetch falló:', e);
        }

        // 2. Guardar snapshot compacto en reading_progress (UNA sola fila)
        // Contiene el resumen completo: score, errores, duración y acciones por slide
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/reading_progress`, {
                method:  'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'apikey':         SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer':        'return=minimal'
                },
                body: JSON.stringify({
                    // Columnas directas (post-migración) — permiten JOINs limpios
                    student_id:   _studentId   || null,
                    student_name: _studentName || 'Unknown',
                    lesson_name:  _lessonName,
                    slide_id:     -1,           // -1 = fila resumen, no un slide individual
                    score:        score,
                    total_errors: errors,
                    duration_sec: durationSec,
                    slides_total: _slides.length,
                    // JSON detallado por slide (para análisis pedagógico)
                    action_data:  {
                        type:          'lesson_summary',
                        slide_results: _slideResults
                    }
                }),
                credentials: 'omit'
            });
            console.log(`📡 reading_progress ← resumen de "${_lessonName}"`);
        } catch(e) {
            console.warn('reading_progress snapshot falló (no crítico):', e);
        }

        // 3. Guardar en localStorage (para my-progress.html)
        const entry = {
            module:    _lessonName,
            result,
            timestamp: new Date().toLocaleString()
        };
        const progress = JSON.parse(localStorage.getItem('course_progress') || '[]');
        const idx      = progress.findIndex(p => p.module === _lessonName);
        if (idx !== -1) progress[idx] = entry;
        else            progress.push(entry);
        localStorage.setItem('course_progress', JSON.stringify(progress));
    }

    function _calcScore() {
        // Score basado en errores, igual que slide-engine: -5% por error, mín 0
        return Math.max(0, 100 - (_totalMistakes * 5));
    }

    function _finishLesson() {
        const score = _calcScore();
        _persistLessonResult(score);

        // Mostrar pantalla de finalización
        const done = document.getElementById('readingDoneScreen');
        if (done) {
            // Inyectar score en la pantalla de finalización si tiene el placeholder
            const scoreEl = done.querySelector('#readingFinalScore');
            if (scoreEl) scoreEl.textContent = `${score}%`;
            _slides.forEach(s => s.classList.remove('active'));
            done.style.display = 'block';
        } else {
            alert(`🎉 Lesson complete! Score: ${score}%`);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────────
       PANEL DE AYUDA AI — Reading Coach
       Botón flotante persistente. Se inyecta una vez en init() y permanece
       visible durante toda la sesión de lectura sin afectar el layout de slides.
    ────────────────────────────────────────────────────────────────────────── */

    function _formatReadingText(text) {
        if (!text) return '';
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g,     '<em>$1</em>')
            .replace(/^#{1,3}\s+(.+)$/gm, '<strong>$1</strong>')
            .replace(/\n{2,}/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.+)$/, '<p>$1</p>');
    }

    function _mountReadingAIPanel() {
        // Evitar duplicados si init() se llama más de una vez
        if (document.getElementById('re-ai-panel')) return;

        // ── CSS del panel ───────────────────────────────────────────────────────
        const style = document.createElement('style');
        style.textContent = `
            #re-ai-toggle {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9000;
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 50px;
                padding: 10px 18px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 16px rgba(37,99,235,0.35);
                transition: background 0.2s, transform 0.15s;
            }
            #re-ai-toggle:hover { background: #1d4ed8; transform: translateY(-2px); }

            #re-ai-panel {
                position: fixed;
                bottom: 76px;
                right: 24px;
                z-index: 9000;
                width: 340px;
                max-width: calc(100vw - 48px);
                background: #fff;
                border-radius: 14px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.18);
                display: none;
                flex-direction: column;
                overflow: hidden;
                font-family: inherit;
            }
            #re-ai-panel.open { display: flex; }

            .re-ai-head {
                background: #2563eb;
                color: #fff;
                padding: 12px 16px;
                font-size: 14px;
                font-weight: 700;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .re-ai-head span { flex: 1; }
            .re-ai-close {
                background: none;
                border: none;
                color: #fff;
                font-size: 18px;
                cursor: pointer;
                line-height: 1;
                padding: 0 4px;
            }

            .re-ai-msgs {
                padding: 12px 14px;
                max-height: 240px;
                overflow-y: auto;
                font-size: 13px;
                color: #374151;
                line-height: 1.55;
                background: #f8fafc;
            }
            .re-ai-msgs p { margin: 0 0 8px; }
            .re-ai-hint {
                font-size: 12px;
                color: #6b7280;
                font-style: italic;
                margin-bottom: 4px;
            }
            .re-ai-loading {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #6b7280;
                font-size: 13px;
            }
            @keyframes re-ai-spin {
                to { transform: rotate(360deg); }
            }
            .re-ai-spinner {
                width: 14px; height: 14px;
                border: 2px solid #d1d5db;
                border-top-color: #2563eb;
                border-radius: 50%;
                animation: re-ai-spin 0.7s linear infinite;
                flex-shrink: 0;
            }

            .re-ai-foot {
                display: flex;
                gap: 8px;
                padding: 10px 12px;
                border-top: 1px solid #e5e7eb;
                background: #fff;
            }
            .re-ai-foot input {
                flex: 1;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                padding: 7px 10px;
                font-size: 13px;
                outline: none;
                transition: border-color 0.2s;
            }
            .re-ai-foot input:focus { border-color: #2563eb; }
            .re-ai-foot button {
                background: #2563eb;
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 7px 14px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                white-space: nowrap;
            }
            .re-ai-foot button:disabled { opacity: 0.5; cursor: not-allowed; }
        `;
        document.head.appendChild(style);

        // ── HTML del panel ──────────────────────────────────────────────────────
        const toggle = document.createElement('button');
        toggle.id          = 're-ai-toggle';
        toggle.textContent = '🤖 Reading Coach';

        const panel = document.createElement('div');
        panel.id        = 're-ai-panel';
        panel.innerHTML = `
            <div class="re-ai-head">
                <span>🤖 Reading Coach</span>
                <button class="re-ai-close" id="re-ai-close" title="Cerrar">✕</button>
            </div>
            <div class="re-ai-msgs" id="re-ai-msgs">
                <p class="re-ai-hint">Haz una pregunta sobre el texto o selecciona palabras del PDF para pedir ayuda.</p>
            </div>
            <div class="re-ai-foot">
                <input type="text" id="re-ai-input" placeholder="Escribe tu pregunta..." maxlength="400" />
                <button id="re-ai-send">Enviar</button>
            </div>
        `;

        document.body.appendChild(toggle);
        document.body.appendChild(panel);

        // ── Eventos ─────────────────────────────────────────────────────────────
        toggle.addEventListener('click', () => panel.classList.toggle('open'));
        document.getElementById('re-ai-close').addEventListener('click', () => panel.classList.remove('open'));

        const input   = document.getElementById('re-ai-input');
        const sendBtn = document.getElementById('re-ai-send');
        const msgs    = document.getElementById('re-ai-msgs');

        function _appendMsg(html, isUser) {
            const div = document.createElement('div');
            div.style.cssText = isUser
                ? 'background:#eff6ff;border-radius:8px;padding:8px 10px;margin-bottom:8px;font-size:13px;'
                : 'margin-bottom:8px;';
            div.innerHTML = html;
            msgs.appendChild(div);
            msgs.scrollTop = msgs.scrollHeight;
            return div;
        }

        async function _sendQuestion() {
            const question = input.value.trim();
            if (!question) return;

            sendBtn.disabled = true;
            input.value      = '';

            _appendMsg(`<strong>Tú:</strong> ${question}`, true);

            const loadingDiv = _appendMsg(
                `<div class="re-ai-loading"><div class="re-ai-spinner"></div> Analizando...</div>`,
                false
            );

            try {
                const studentId = localStorage.getItem('studentId') || null;

                const res = await fetch('/api/orchestrator', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agent:    'reading',
                        studentId,
                        task:     '',   // buildTask lo genera en el módulo
                        payload: {
                            lesson:      _lessonName,
                            currentPage: 1,   // el engine no expone la página actual globalmente
                            question,
                            slideType:   (_slides[_current] && _slides[_current].dataset.type) || null
                        },
                        outputFormat:      'short_answer',
                        needsHistoryDepth: 1
                    })
                });

                const data = await res.json();
                loadingDiv.remove();

                if (data.response) {
                    _appendMsg(
                        `<strong>Reading Coach:</strong><br>${_formatReadingText(data.response)}`,
                        false
                    );
                } else {
                    _appendMsg('<em style="color:#c0392b;">Error al conectar con el agente. Intenta de nuevo.</em>', false);
                }
            } catch (e) {
                loadingDiv.remove();
                _appendMsg('<em style="color:#c0392b;">Sin conexión con el servidor.</em>', false);
                console.error('ReadingEngine: AI panel error:', e);
            } finally {
                sendBtn.disabled = false;
                input.focus();
            }
        }

        sendBtn.addEventListener('click', _sendQuestion);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') _sendQuestion(); });
    }

    /* ──────────────────────────────────────────────────────────────────────────
       API PÚBLICA
    ────────────────────────────────────────────────────────────────────────── */
    return { init, next, _unlockNext, _appendNextBtn, _renderPage, _renderWithControls, _saveProgress,
             _getPdfDoc: _getPdf,
             get currentIndex() { return _current; },
             get studentName() { return _studentName; },
             addMistake() { _totalMistakes++; },
             get isAdmin() { return _isAdmin; },
             prev
    };

})();

/* ──────────────────────────────────────────────────────────────────────────
   SECCIÓN 1.1 — HELPERS PARA INSTRUCTOR (ReadingEngine)
────────────────────────────────────────────────────────────────────────── */
function _mountInstructorUI() {
    const style = document.createElement('style');
    style.textContent = `
        .instructor-controls {
            position: fixed; top: 10px; left: 50%; transform: translateX(-50%);
            background: rgba(15, 31, 56, 0.9); padding: 8px 16px; border-radius: 30px;
            display: flex; gap: 10px; z-index: 10001; align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1);
            color: white; font-family: sans-serif; font-size: 13px;
        }
        .inst-btn {
            background: #0891b2; color: white; border: none; padding: 5px 12px;
            border-radius: 15px; cursor: pointer; font-size: 12px; font-weight: 700;
            transition: background 0.2s;
        }
        .inst-btn:hover { background: #0e7490; }
        .inst-btn.back { background: #4a6080; }
        .btn-next-slide.inst-unlocked { display: block !important; opacity: 1 !important; visibility: visible !important; }
    `;
    document.head.appendChild(style);

    const div = document.createElement('div');
    div.className = 'instructor-controls';
    div.innerHTML = `
        <span style="font-weight:700; color:#fca5a5;">INSTRUCTOR</span>
        <button class="inst-btn back" id="inst-prev">← Back</button>
        <button class="inst-btn" id="inst-next">Next →</button>
        <button class="inst-btn" id="inst-helper" style="background:#059669;">Teacher Helper</button>
    `;
    document.body.appendChild(div);

    document.getElementById('inst-prev').onclick = () => ReadingEngine.prev();
    document.getElementById('inst-next').onclick = () => ReadingEngine.next();
    document.getElementById('inst-helper').onclick = _openHelper;
}

function _openHelper() {
    const w = 420, h = 600;
    const left = (screen.width/2)-(w/2);
    const top = (screen.height/2)-(h/2);

    const helperUrl = window.location.origin + '/teacher-helper.html';

    window._reHelperWindow = window.open(helperUrl, 'TeacherHelper', 
        `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no`);
    
    setTimeout(() => _notifyHelper(), 800);
}

function _notifyHelper() {
    if (!window._reHelperWindow || window._reHelperWindow.closed) return;

    const slides = Array.from(document.querySelectorAll('.reading-slide'));
    const current = slides[ReadingEngine.currentIndex];
    if (!current) return;

    const payload = {
        index: ReadingEngine.currentIndex,
        total: slides.length,
        slideType: current.dataset.type || 'CONTENT',
        title: current.querySelector('h2')?.textContent || '',
        answers: _collectAnswers(current)
    };

    window._reHelperWindow.postMessage({ type: 'UPDATE_HELPER', payload }, '*');
}

function _forceUnlockNext(index) {
    const slides = Array.from(document.querySelectorAll('.reading-slide'));
    const current = slides[index];
    if (current) {
        const btn = current.querySelector('.btn-next-slide');
        if (btn) btn.classList.add('inst-unlocked');
    }
}

function _collectAnswers(slide) {
    const answers = [];
    const type = (slide.dataset.type || '').toUpperCase();

    // QUIZ
    if (type === 'READING_QUIZ') {
        slide.querySelectorAll('[data-re-option]').forEach(opt => {
            if (opt.hasAttribute('data-re-correct')) {
                answers.push({ label: 'Correct Option', answer: opt.textContent.trim() });
            }
        });
    }

    // TFNG
    if (type === 'READING_TFNG') {
        slide.querySelectorAll('[data-re-tfng-item]').forEach((item, idx) => {
            answers.push({ 
                label: `Statement ${idx+1}`, 
                answer: item.dataset.reAnswer, 
                explanation: item.dataset.reExplain 
            });
        });
    }

    // FILL
    if (type === 'READING_FILL') {
        slide.querySelectorAll('[data-re-blank]').forEach((blank, idx) => {
            answers.push({ label: `Blank ${idx+1}`, answer: blank.dataset.reAnswer });
        });
    }

    // MATCH
    if (type === 'READING_MATCH') {
        const terms = Array.from(slide.querySelectorAll('[data-re-term]'));
        const defs = Array.from(slide.querySelectorAll('[data-re-def]'));
        terms.forEach(term => {
            const matchId = term.dataset.reId;
            const def = defs.find(d => d.dataset.reMatch === matchId);
            if (def) {
                answers.push({ label: term.textContent.trim(), answer: def.textContent.trim() });
            }
        });
    }


}


/* =============================================================================
   SECCIÓN 2 — TIPOS DE SLIDE
   Cada tipo es autocontenido: genera su HTML y adjunta su lógica.
   Todos los layouts de lectura siguen la estructura:
     .reading-layout → .pdf-main-view + .reading-sidebar
   ============================================================================= */

const ReadingTypes = {};

/* ─────────────────────────────────────────────────────────────────────────────
   HELPER: construye el skeleton HTML de layout PDF + sidebar.
   slide       → el elemento DOM .reading-slide
   sidebarHtml → HTML para el interior del .sidebar-body
   label       → título del sidebar header
   task        → descripción breve del reto (aparece en el header)
   showControls → si se muestran los controles de página
───────────────────────────────────────────────────────────────────────────── */
function _buildReadingLayout(slide, { sidebarHtml = '', label = 'Reading Task', task = '', showControls = true, nextLabel = 'Continue →' }) {
    const renderId = `re-render-${slide.dataset.reIndex || Math.random().toString(36).slice(2)}`;
    slide.dataset.reRenderId = renderId;

    slide.innerHTML = `
        <div class="reading-layout">
            <div class="pdf-main-view">
                <div id="${renderId}" class="pdf-render-zone">
                    <p style="color:#888; padding:24px; text-align:center;">Loading PDF…</p>
                </div>
                ${showControls ? `
                <div class="pdf-controls">
                    <button class="pdf-btn-prev" title="Previous page">&#8592;</button>
                    <span>Page <strong class="pdf-page-current">1</strong> of <strong class="pdf-page-total">?</strong></span>
                    <button class="pdf-btn-next" title="Next page">&#8594;</button>
                    <button class="pdf-fs-btn" title="Full screen (ESC to close)">&#x26F6;</button>
                </div>` : ''}
            </div>
            <div class="reading-sidebar">
                <div class="sidebar-header">
                    <h3>${label}</h3>
                    ${task ? `<p>${task}</p>` : ''}
                </div>
                <div class="sidebar-body">
                    ${sidebarHtml}
                </div>
                <button class="btn-next-slide">${nextLabel}</button>
            </div>
        </div>`;

    // Fullscreen button
    const fsBtn = slide.querySelector('.pdf-fs-btn');
    if (fsBtn) fsBtn.addEventListener('click', () => _openFullscreen(slide, renderId));

    return renderId;
}

/* ─────────────────────────────────────────────────────────────────────────────
   FULLSCREEN PDF OVERLAY
───────────────────────────────────────────────────────────────────────────── */
let _fsOverlay   = null;
let _fsDoc       = null;
let _fsPage      = 1;
let _fsRendering = false;

function _ensureOverlay() {
    if (_fsOverlay) return _fsOverlay;
    _fsOverlay = document.createElement('div');
    _fsOverlay.className = 'pdf-fs-overlay';
    _fsOverlay.innerHTML = `
        <div class="pdf-fs-topbar">
            <div class="pdf-fs-nav">
                <button class="pdf-fs-prev">&#8592;</button>
                <span>Page <strong class="pdf-fs-cur">1</strong> of <strong class="pdf-fs-total">?</strong></span>
                <button class="pdf-fs-next">&#8594;</button>
            </div>
            <span class="pdf-fs-title"></span>
            <button class="pdf-fs-close" title="Close (ESC)">&#x2715;</button>
        </div>
        <div class="pdf-fs-canvas-zone" id="pdf-fs-canvas-zone">
            <canvas id="pdf-fs-canvas"></canvas>
        </div>`;
    document.body.appendChild(_fsOverlay);

    _fsOverlay.querySelector('.pdf-fs-close').addEventListener('click', _closeFullscreen);
    _fsOverlay.querySelector('.pdf-fs-prev').addEventListener('click', async () => {
        if (_fsPage > 1) { _fsPage--; await _fsRender(); }
    });
    _fsOverlay.querySelector('.pdf-fs-next').addEventListener('click', async () => {
        if (_fsDoc && _fsPage < _fsDoc.numPages) { _fsPage++; await _fsRender(); }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && _fsOverlay.classList.contains('open')) _closeFullscreen();
    });
    return _fsOverlay;
}

async function _openFullscreen(slide, renderId) {
    const url = slide.dataset.rePdf;
    if (!url) return;
    _fsDoc  = await ReadingEngine._getPdfDoc(url);
    if (!_fsDoc) return;
    const curEl = slide.querySelector('.pdf-page-current');
    _fsPage = curEl ? (parseInt(curEl.textContent) || 1) : 1;
    const overlay = _ensureOverlay();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    await _fsRender();
}

function _closeFullscreen() {
    if (_fsOverlay) _fsOverlay.classList.remove('open');
    document.body.style.overflow = '';
}

async function _fsRender() {
    if (!_fsDoc || _fsRendering) return;
    _fsRendering = true;
    try {
        const page     = await _fsDoc.getPage(_fsPage);
        const zone     = document.getElementById('pdf-fs-canvas-zone');
        const canvas   = document.getElementById('pdf-fs-canvas');
        if (!zone || !canvas) return;
        const maxW     = Math.min(zone.clientWidth - 32, 900);
        const vp0      = page.getViewport({ scale: 1 });
        const scale    = maxW / vp0.width;
        const viewport = page.getViewport({ scale });
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        const overlay = _ensureOverlay();
        const c = overlay.querySelector('.pdf-fs-cur');
        const t = overlay.querySelector('.pdf-fs-total');
        const p = overlay.querySelector('.pdf-fs-prev');
        const n = overlay.querySelector('.pdf-fs-next');
        if (c) c.textContent = _fsPage;
        if (t) t.textContent = _fsDoc.numPages;
        if (p) p.disabled    = _fsPage <= 1;
        if (n) n.disabled    = _fsPage >= _fsDoc.numPages;
        if (zone) zone.scrollTop = 0;
    } finally {
        _fsRendering = false;
    }
}


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: VIDEO
   Mismo comportamiento que en slide-engine.
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.VIDEO = {
    mount(slide) {
        const iframe = slide.querySelector('iframe[data-re-src]');
        if (iframe) {
            iframe.src    = iframe.dataset.reSrc;
            iframe.width  = '100%';
            iframe.height = iframe.dataset.reHeight || '340';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('frameborder', '0');
            iframe.style.cssText = 'border-radius:8px; display:block;';
        }
        const btn = document.createElement('button');
        btn.className   = 'btn-next-slide';
        btn.textContent = 'Start Reading →';
        btn.style.cssText = `display:block; margin:20px auto 0; padding:13px 32px;
            background:var(--re-accent,#2c7be5); color:#fff; border:none; border-radius:10px;
            font-size:1rem; font-weight:700; cursor:pointer; width:100%; max-width:280px;`;
        btn.addEventListener('click', () => ReadingEngine.next());
        slide.appendChild(btn);
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: CONTENT
   Slide de texto sin PDF. Botón continuar inmediato.
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.CONTENT = {
    mount(slide) {
        const btn = document.createElement('button');
        btn.className   = 'btn-next-slide';
        btn.textContent = 'Continue →';
        btn.style.cssText = `display:block; margin:20px auto 0; padding:12px 28px;
            background:var(--re-accent,#2c7be5); color:#fff; border:none; border-radius:10px;
            font-size:0.95rem; font-weight:700; cursor:pointer; width:100%; max-width:240px;`;
        btn.addEventListener('click', () => ReadingEngine.next());
        slide.appendChild(btn);
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_FOCUS
   El estudiante lee el PDF. Para avanzar debe hacer scroll hasta el final
   de la página cargada (o el tiempo mínimo configurable).
   
   Atributos:
     data-re-pdf="url"
     data-re-page="1"
     data-re-task="Read the introduction carefully."
     data-re-min-time="20"   ← segundos mínimos en esta slide (default 15)
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_FOCUS = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url      = slide.dataset.rePdf   || '';
        const page     = parseInt(slide.dataset.rePage) || 1;
        const task     = slide.dataset.reTask  || 'Read the highlighted section carefully.';
        const label    = slide.dataset.reLabel || 'Focus Reading';
        const minTime  = parseInt(slide.dataset.reMinTime) || 15;

        const renderId = _buildReadingLayout(slide, {
            label,
            task,
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card" id="focus-card-${index}">
                    <div class="card-label">📖 Reading Task</div>
                    <p>${task}</p>
                </div>
                <div style="margin-top:12px;">
                    <div class="re-section-label">Time on task</div>
                    <div class="re-timer-track">
                        <div class="re-timer-fill" id="focus-timer-bar-${index}"></div>
                    </div>
                    <div id="focus-timer-label-${index}" style="font-size:0.8rem; color:var(--re-muted); margin-top:3px; text-align:right;">0 / ${minTime}s</div>
                </div>
                <div class="reading-feedback info" id="focus-fb-${index}" style="display:block; margin-top:12px;">
                    ⏳ Read for at least <strong>${minTime} seconds</strong> before continuing.
                </div>`
        });

        // Renderizar PDF
        if (url) {
            ReadingEngine._renderWithControls(slide, renderId, null, url, page);
        }

        // Timer de tiempo mínimo
        let elapsed = 0;
        const btn     = slide.querySelector('.btn-next-slide');
        const bar     = slide.querySelector(`#focus-timer-bar-${index}`);
        const lbl     = slide.querySelector(`#focus-timer-label-${index}`);
        const fb      = slide.querySelector(`#focus-fb-${index}`);

        const timer = setInterval(() => {
            // Solo contar si este slide está activo
            if (!slide.classList.contains('active')) return;
            elapsed++;
            const pct = Math.min((elapsed / minTime) * 100, 100);
            if (bar) bar.style.width = pct + '%';
            if (lbl) lbl.textContent = `${elapsed} / ${minTime}s`;

            if (elapsed >= minTime) {
                clearInterval(timer);
                if (fb) {
                    fb.className = 'reading-feedback success';
                    fb.innerHTML = '✅ Great! You can continue now.';
                    fb.style.display = 'block';
                }
                if (btn) btn.style.display = 'block';
                ReadingEngine._saveProgress(index, 'focus_read', { seconds: elapsed });
            }
        }, 1000);

        btn?.addEventListener('click', () => ReadingEngine.next());
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_HIGHLIGHT
   El estudiante debe seleccionar texto en el sidebar para desbloquear avance.
   (En canvas PDF.js no se puede seleccionar texto directamente; el subrayado
   se hace sobre un área de texto enriquecido en el sidebar que espeja el
   párrafo objetivo. Para un PDF real usarías un text layer, pero eso requiere
   PDF.js text layer completo — lo dejamos como v2. Esta versión usa un <p>
   copiable con selección nativa del browser.)

   Atributos:
     data-re-pdf="url"
     data-re-page="1"
     data-re-task="Highlight the thesis statement."
     data-re-target-text="[Texto exacto que debe estar en la selección]"
     data-re-excerpt="[Párrafo de referencia a mostrar en el sidebar]"
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_HIGHLIGHT = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url        = slide.dataset.rePdf      || '';
        const page       = parseInt(slide.dataset.rePage) || 1;
        const task       = slide.dataset.reTask     || 'Highlight the key sentence in the excerpt below.';
        const label      = slide.dataset.reLabel    || 'Highlight Task';
        const targetText = (slide.dataset.reTargetText || '').toLowerCase().trim();
        const excerpt    = slide.dataset.reExcerpt  || '';

        const renderId = _buildReadingLayout(slide, {
            label,
            task,
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card">
                    <div class="card-label">🖊 Task</div>
                    <p>${task}</p>
                </div>
                <div class="re-section-label" style="margin:12px 0 6px;">Excerpt — select the key passage:</div>
                <div id="hl-excerpt-${index}" style="background:#fffde7; border:1px solid #fdd835; border-radius:8px; padding:12px 14px; font-size:0.9rem; line-height:1.7; color:#2c3e50; user-select:text; cursor:text;">
                    ${excerpt || '<em style="color:#888">No excerpt provided. Select from the PDF.</em>'}
                </div>
                <div id="hl-selection-display-${index}" class="re-selection-display"></div>
                <div class="reading-feedback" id="hl-fb-${index}" style="margin-top:10px;"></div>`
        });

        if (url) {
            ReadingEngine._renderWithControls(slide, renderId, null, url, page);
        }

        const btn       = slide.querySelector('.btn-next-slide');
        const display   = slide.querySelector(`#hl-selection-display-${index}`);
        const fb        = slide.querySelector(`#hl-fb-${index}`);
        const excerptEl = slide.querySelector(`#hl-excerpt-${index}`);

        // Escuchar selección de texto en el excerpt o en el documento
        const checkSelection = () => {
            const sel     = window.getSelection();
            const selText = sel ? sel.toString().trim() : '';
            if (selText.length < 5) return;

            // Verificar que la selección es dentro de esta slide
            if (!slide.contains(sel.anchorNode)) return;

            if (display) display.textContent = `Selected: "${selText.substring(0, 80)}${selText.length > 80 ? '…' : ''}"`;

            // Si hay targetText, validar; si no, cualquier selección >5 chars desbloquea
            const matches = targetText
                ? selText.toLowerCase().includes(targetText) || targetText.includes(selText.toLowerCase())
                : selText.split(/\s+/).length >= 3;

            if (matches) {
                if (fb) { fb.className = 'reading-feedback success'; fb.innerHTML = '✅ Great selection! That\'s the key passage.'; fb.style.display = 'block'; }
                if (btn) btn.style.display = 'block';
                ReadingEngine._saveProgress(index, 'highlight', { text: selText });
            } else {
                if (fb) { fb.className = 'reading-feedback error'; fb.innerHTML = '❌ Keep looking — select the most relevant sentence.'; fb.style.display = 'block'; }
                ReadingEngine.addMistake();
            }
        };

        document.addEventListener('mouseup',  checkSelection);
        document.addEventListener('touchend', checkSelection);
        btn?.addEventListener('click', () => ReadingEngine.next());
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_COMMENT
   El estudiante escribe un comentario (mínimo N palabras) para avanzar.
   
   Atributos:
     data-re-pdf="url"
     data-re-page="1"
     data-re-task="What is the author's main argument?"
     data-re-min-words="15"
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_COMMENT = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url      = slide.dataset.rePdf      || '';
        const page     = parseInt(slide.dataset.rePage) || 1;
        const task     = slide.dataset.reTask     || 'Write your analysis of this section.';
        const label    = slide.dataset.reLabel    || 'Your Response';
        const minWords = parseInt(slide.dataset.reMinWords) || 15;

        const renderId = _buildReadingLayout(slide, {
            label,
            task,
            nextLabel: 'Submit & Continue →',
            sidebarHtml: `
                <div class="challenge-card">
                    <div class="card-label">💬 Comment Task</div>
                    <p>${task}</p>
                </div>
                <textarea class="sidebar-textarea" id="comment-ta-${index}" 
                    placeholder="Write at least ${minWords} words…" style="margin-top:10px;"></textarea>
                <div id="comment-wc-${index}" class="re-word-count">0 / ${minWords} words</div>
                <div class="reading-feedback" id="comment-fb-${index}"></div>`
        });

        if (url) {
            ReadingEngine._renderWithControls(slide, renderId, null, url, page);
        }

        const ta   = slide.querySelector(`#comment-ta-${index}`);
        const wc   = slide.querySelector(`#comment-wc-${index}`);
        const fb   = slide.querySelector(`#comment-fb-${index}`);
        const btn  = slide.querySelector('.btn-next-slide');

        ta?.addEventListener('input', () => {
            const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
            if (wc) wc.textContent = `${words} / ${minWords} words`;
            if (words >= minWords) {
                if (wc) wc.style.color = '#27ae60';
                if (fb) { fb.className = 'reading-feedback success'; fb.innerHTML = '✅ Good response! You can continue.'; fb.style.display = 'block'; }
                if (btn) btn.style.display = 'block';
            } else {
                if (wc) wc.style.color = '#6c757d';
                if (btn) btn.style.display = 'none';
            }
        });

        btn?.addEventListener('click', () => {
            ReadingEngine._saveProgress(index, 'comment', { text: ta?.value || '' });
            ReadingEngine.next();
        });
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_QUIZ
   Preguntas de opción múltiple en el sidebar. El PDF permanece visible.
   No es obligatorio acertar para continuar, pero los errores se registran.
   
   Atributos en la slide:
     data-re-pdf, data-re-page, data-re-task, data-re-label
   
   Atributos en las opciones:
     <div data-re-option>Texto opción</div>
     <div data-re-option data-re-correct>Texto correcto</div>
   
   Pregunta: el primer <p data-re-question> dentro del slide
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_QUIZ = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url      = slide.dataset.rePdf  || '';
        const page     = parseInt(slide.dataset.rePage) || 1;
        const label    = slide.dataset.reLabel || 'Comprehension Check';

        // Extraer pregunta y opciones del HTML original antes de reescribir
        const questionEl = slide.querySelector('[data-re-question]');
        const optionEls  = Array.from(slide.querySelectorAll('[data-re-option]'));
        const question   = questionEl ? questionEl.innerHTML : '';
        const options    = optionEls.map(el => ({
            text:      el.innerHTML,
            correct:   el.hasAttribute('data-re-correct')
        }));

        const optionsHtml = options.map((opt, i) =>
            `<button class="sidebar-quiz-option" data-re-opt-index="${i}" data-re-correct="${opt.correct}">
                ${opt.text}
             </button>`
        ).join('');

        const renderId = _buildReadingLayout(slide, {
            label,
            task: 'Answer based on your reading.',
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card">
                    <div class="card-label">❓ Question</div>
                    <p>${question}</p>
                </div>
                <div id="rq-options-${index}">${optionsHtml}</div>
                <div class="reading-feedback" id="rq-fb-${index}"></div>`
        });

        if (url) {
            ReadingEngine._renderWithControls(slide, renderId, null, url, page);
        }

        const fb  = slide.querySelector(`#rq-fb-${index}`);
        const btn = slide.querySelector('.btn-next-slide');

        slide.querySelectorAll('.sidebar-quiz-option').forEach(optBtn => {
            optBtn.addEventListener('click', () => {
                const isCorrect = optBtn.dataset.reCorrect === 'true';

                // Deshabilitar todas
                slide.querySelectorAll('.sidebar-quiz-option').forEach(b => b.disabled = true);

                optBtn.classList.add(isCorrect ? 'correct' : 'incorrect');

                if (isCorrect) {
                    if (fb) { fb.className = 'reading-feedback success'; fb.innerHTML = '✅ Correct! Well done.'; fb.style.display = 'block'; }
                } else {
                    if (fb) { fb.className = 'reading-feedback error'; fb.innerHTML = '❌ Not quite — but you can still continue.'; fb.style.display = 'block'; }
                    // Mostrar la correcta
                    slide.querySelectorAll('.sidebar-quiz-option').forEach(b => {
                        if (b.dataset.reCorrect === 'true') b.classList.add('correct');
                    });
                    ReadingEngine.addMistake();
                }

                ReadingEngine._saveProgress(index, 'quiz', { correct: isCorrect });
                if (btn) btn.style.display = 'block';
            });
        });

        btn?.addEventListener('click', () => ReadingEngine.next());
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_DRAGDROP
   Drag & drop en el sidebar. El PDF permanece visible a la izquierda.
   
   Mismo sistema de data-se-drag / data-se-drop que slide-engine, pero
   prefijado con data-re-drag / data-re-drop para no colisionar.
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_DRAGDROP = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url   = slide.dataset.rePdf  || '';
        const page  = parseInt(slide.dataset.rePage) || 1;
        const label = slide.dataset.reLabel || 'Organize It';
        const task  = slide.dataset.reTask  || 'Drag each item to the correct category.';

        // Capturar drags/drops del HTML original
        const drags = Array.from(slide.querySelectorAll('[data-re-drag]'));
        const drops = Array.from(slide.querySelectorAll('[data-re-drop]'));

        const dragsHtml = drags.map((el, i) =>
            `<div class="sd-drag-item" draggable="true" data-re-drag-type="${el.dataset.reDragType || i}" id="re-drag-${index}-${i}">
                ${el.innerHTML}
             </div>`
        ).join('');

        const dropsHtml = drops.map((el, i) =>
            `<div class="sd-drop-zone" data-re-drop-accepts="${el.dataset.reDropAccepts || i}" data-re-label="${el.dataset.reLabel || '?'}">
                ${el.dataset.reLabel || 'Drop here'}
             </div>`
        ).join('');

        const renderId = _buildReadingLayout(slide, {
            label, task,
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card"><div class="card-label">🎯 Task</div><p>${task}</p></div>
                <div class="re-section-label">Items:</div>
                <div id="re-drag-bank-${index}">${dragsHtml}</div>
                <div class="re-section-label" style="margin-top:8px;">Drop zones:</div>
                <div id="re-drop-zones-${index}">${dropsHtml}</div>
                <div class="reading-feedback" id="rdd-fb-${index}"></div>`
        });

        if (url) ReadingEngine._renderWithControls(slide, renderId, null, url, page);

        const btn = slide.querySelector('.btn-next-slide');
        const fb  = slide.querySelector(`#rdd-fb-${index}`);
        let filled = 0;
        const totalDrops = drops.length;

        // Attach drag listeners after DOM is built
        setTimeout(() => {
            const dragEls = slide.querySelectorAll('.sd-drag-item');
            const dropEls = slide.querySelectorAll('.sd-drop-zone');

            dragEls.forEach(el => {
                el.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', el.id);
                    e.dataTransfer.effectAllowed = 'move';
                });
            });

            dropEls.forEach(zone => {
                zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('over'); });
                zone.addEventListener('dragleave', () => zone.classList.remove('over'));
                zone.addEventListener('drop', e => {
                    e.preventDefault();
                    zone.classList.remove('over');
                    const id      = e.dataTransfer.getData('text/plain');
                    const dragged = document.getElementById(id);
                    if (!dragged) return;

                    const accepts = zone.dataset.reDropAccepts;
                    const dragType = dragged.dataset.reDragType;

                    if (dragType === accepts) {
                        zone.innerHTML = '';
                        zone.appendChild(dragged);
                        dragged.setAttribute('draggable', 'false');
                        dragged.style.cursor = 'default';
                        zone.classList.add('filled');
                        filled++;
                        if (fb) { fb.className = 'reading-feedback success'; fb.innerHTML = `✅ Correct! (${filled}/${totalDrops} placed)`; fb.style.display = 'block'; }
                        if (filled === totalDrops) {
                            if (fb) fb.innerHTML = '✅ All items placed correctly!';
                            if (btn) btn.style.display = 'block';
                            ReadingEngine._saveProgress(index, 'dragdrop', { completed: true });
                        }
                    } else {
                        if (fb) { fb.className = 'reading-feedback error'; fb.innerHTML = '❌ That doesn\'t fit here — try another zone.'; fb.style.display = 'block'; }
                        ReadingEngine.addMistake();
                    }
                });
            });
        }, 100);

        btn?.addEventListener('click', () => ReadingEngine.next());
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_FILL
   Fill in the blanks en el sidebar. El PDF permanece visible.
   
   USO:
   <div class="reading-slide" data-type="READING_FILL" data-re-pdf="..." data-re-page="2">
     <p data-re-question>Complete the summary:</p>
     <p data-re-sentence>
       A chain essay uses <span data-re-blank data-re-answer="three">___</span> body paragraphs.
     </p>
   </div>
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_FILL = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url   = slide.dataset.rePdf  || '';
        const page  = parseInt(slide.dataset.rePage) || 1;
        const label = slide.dataset.reLabel || 'Fill in the Blanks';

        // Capturar preguntas y sentences antes de reescribir
        const questionEl  = slide.querySelector('[data-re-question]');
        const sentenceEls = Array.from(slide.querySelectorAll('[data-re-sentence]'));
        const question    = questionEl ? questionEl.innerHTML : '';

        // Serializar sentences a HTML (los blanks se reconstruyen después del layout)
        const sentencesHtml = sentenceEls.map(el => `<p class="re-fill-sentence" data-re-source="${encodeURIComponent(el.innerHTML)}">${el.innerHTML}</p>`).join('');

        const renderId = _buildReadingLayout(slide, {
            label, task: question,
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card"><div class="card-label">✏️ Fill in</div><p>${question}</p></div>
                <div id="re-fill-body-${index}">${sentencesHtml}</div>
                <button class="btn-sidebar-action" id="re-fill-check-${index}">Check Answers</button>
                <div class="reading-feedback" id="re-fill-fb-${index}"></div>`
        });

        if (url) ReadingEngine._renderWithControls(slide, renderId, null, url, page);

        // Construir inputs para cada blank
        setTimeout(() => {
            const body = slide.querySelector(`#re-fill-body-${index}`);
            if (!body) return;

            body.querySelectorAll('[data-re-blank]').forEach((blank, bi) => {
                const answer = blank.dataset.reAnswer || '';
                const input  = document.createElement('input');
                input.type   = 'text';
                input.placeholder = '…';
                input.dataset.reAnswer = answer;
                input.className = 're-fill-input';
                input.style.width = Math.max(answer.length * 9, 60) + 'px';
                blank.replaceWith(input);
            });

            const checkBtn = slide.querySelector(`#re-fill-check-${index}`);
            const fb       = slide.querySelector(`#re-fill-fb-${index}`);
            const btn      = slide.querySelector('.btn-next-slide');

            checkBtn?.addEventListener('click', () => {
                const inputs = body.querySelectorAll('input[data-re-answer]');
                let correct = 0;
                inputs.forEach(inp => {
                    const ans  = (inp.dataset.reAnswer || '').toLowerCase().trim();
                    const val  = inp.value.toLowerCase().trim();
                    const ok   = val === ans || val.includes(ans) || ans.includes(val);
                    inp.style.borderBottomColor = ok ? '#27ae60' : '#e74c3c';
                    inp.style.background        = ok ? '#d5f5e3' : '#fde8e8';
                    if (ok) correct++;
                    else ReadingEngine.addMistake();
                });

                const total = inputs.length;
                if (fb) {
                    fb.className     = correct === total ? 'reading-feedback success' : 'reading-feedback error';
                    fb.innerHTML     = correct === total
                        ? '✅ Perfect! All blanks filled correctly.'
                        : `⚠️ ${correct}/${total} correct. Review and try again — then continue.`;
                    fb.style.display = 'block';
                }
                if (btn) btn.style.display = 'block';
                ReadingEngine._saveProgress(index, 'fill_blank', { correct, total });
            });

            btn?.addEventListener('click', () => ReadingEngine.next());
        }, 100);
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_TFNG — True / False / Not Given
   Cada ítem tiene tres botones. El estudiante elige uno.
   Todos los ítems deben responderse para desbloquear el botón next.

   USO EN HTML:
   <div class="reading-slide" data-type="READING_TFNG" data-re-pdf="..." data-re-page="3"
        data-re-label="True / False / Not Given">
     <div data-re-tfng-item data-re-answer="true"
          data-re-explain="The text states this directly in paragraph 2.">
       The chain essay is used for cause-and-effect arguments.
     </div>
     <div data-re-tfng-item data-re-answer="false"
          data-re-explain="The text says it requires three, not two, body paragraphs.">
       A chain essay only needs two body paragraphs.
     </div>
     <div data-re-tfng-item data-re-answer="not given"
          data-re-explain="The text never mentions the author's nationality.">
       The author is from China.
     </div>
   </div>
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_TFNG = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url     = slide.dataset.rePdf   || '';
        const page    = parseInt(slide.dataset.rePage) || 1;
        const label   = slide.dataset.reLabel || 'True / False / Not Given';
        const items   = Array.from(slide.querySelectorAll('[data-re-tfng-item]'));

        const itemsHtml = items.map((el, i) => {
            const answer  = (el.dataset.reAnswer  || 'true').toLowerCase().trim();
            const explain = el.dataset.reExplain  || '';
            const text    = el.innerHTML.trim();
            const id      = `tfng-${index}-${i}`;
            return `
                <div class="re-tfng-item" id="${id}" data-answer="${answer}">
                    <p class="re-tfng-statement">${text}</p>
                    <div class="re-tfng-btns" data-answer="${answer}" data-explain="${explain.replace(/"/g,'&quot;')}">
                        <button class="re-tfng-btn" data-val="true">True</button>
                        <button class="re-tfng-btn" data-val="false">False</button>
                        <button class="re-tfng-btn" data-val="not given">Not Given</button>
                    </div>
                    <div class="re-tfng-explain" id="${id}-fb"></div>
                </div>`;
        }).join('');

        const renderId = _buildReadingLayout(slide, {
            label,
            task: 'Decide if each statement is True, False, or Not Given in the text.',
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card">
                    <div class="card-label">📋 TFNG Task</div>
                    <p>Based on the article, decide if each statement is <strong>True</strong>, <strong>False</strong>, or <strong>Not Given</strong>.</p>
                </div>
                <div id="re-tfng-body-${index}">${itemsHtml}</div>
                <div class="reading-feedback" id="re-tfng-fb-${index}"></div>`
        });

        if (url) ReadingEngine._renderWithControls(slide, renderId, null, url, page);

        slide.dataset.reTfngTotal = items.length;
        slide.dataset.reTfngDone  = '0';

        setTimeout(() => ReadingTypes.READING_TFNG._attachListeners(slide, index), 100);
        slide.querySelector('.btn-next-slide')?.addEventListener('click', () => ReadingEngine.next());
    },

    _attachListeners(slide, index) {
        slide.querySelectorAll('.re-tfng-item').forEach(item => {
            const btnsEl  = item.querySelector('.re-tfng-btns');
            const correct = btnsEl ? btnsEl.dataset.answer : '';
            const explain = btnsEl ? (btnsEl.dataset.explain || '') : '';
            const fbEl    = item.querySelector('.re-tfng-explain');

            item.querySelectorAll('.re-tfng-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (item.dataset.done === 'true') return;
                    item.dataset.done = 'true';

                    const chosen    = btn.dataset.val;
                    const isCorrect = chosen === correct;

                    item.querySelectorAll('.re-tfng-btn').forEach(b => b.disabled = true);
                    btn.classList.add(isCorrect ? 're-tfng-correct' : 're-tfng-incorrect');

                    if (!isCorrect) {
                        item.querySelectorAll('.re-tfng-btn').forEach(b => {
                            if (b.dataset.val === correct) b.classList.add('re-tfng-correct');
                        });
                        ReadingEngine.addMistake();
                    }

                    if (fbEl) {
                        fbEl.textContent   = explain;
                        fbEl.className     = 're-tfng-explain ' + (isCorrect ? 'success' : 'error');
                        fbEl.style.display = 'block';
                    }

                    const done  = parseInt(slide.dataset.reTfngDone || '0') + 1;
                    slide.dataset.reTfngDone = done;
                    const total = parseInt(slide.dataset.reTfngTotal || '0');

                    if (done >= total) {
                        ReadingEngine._saveProgress(index, 'tfng', {});
                        const nextBtn = slide.querySelector('.btn-next-slide');
                        if (nextBtn) nextBtn.style.display = 'block';
                    }
                });
            });
        });
    }
};


/* ─────────────────────────────────────────────────────────────────────────────
   TIPO: READING_MATCH — Emparejar términos con definiciones
   El estudiante hace clic en un término (izquierda) y luego en su definición
   (derecha). Todos los pares deben completarse para avanzar.

   USO EN HTML:
   <div class="reading-slide" data-type="READING_MATCH" data-re-pdf="..." data-re-page="1"
        data-re-label="Match the Concepts">
     <div data-re-term data-re-id="a">Chain essay</div>
     <div data-re-term data-re-id="b">Causal chain</div>
     <div data-re-term data-re-id="c">Body paragraph</div>

     <div data-re-def data-re-match="a">An essay where each paragraph builds on the previous one</div>
     <div data-re-def data-re-match="b">A sequence where one effect becomes the next cause</div>
     <div data-re-def data-re-match="c">Picks up the outcome from the preceding paragraph</div>
   </div>
───────────────────────────────────────────────────────────────────────────── */
ReadingTypes.READING_MATCH = {
    mount(slide, index) {
        slide.dataset.reIndex = index;
        const url     = slide.dataset.rePdf   || '';
        const page    = parseInt(slide.dataset.rePage) || 1;
        const label   = slide.dataset.reLabel || 'Match the Concepts';
        const task    = slide.dataset.reTask  || 'Click a term, then click its matching definition.';

        const terms = Array.from(slide.querySelectorAll('[data-re-term]'));
        const defs  = Array.from(slide.querySelectorAll('[data-re-def]'));

        // Shuffle definitions (Fisher-Yates)
        for (let i = defs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [defs[i], defs[j]] = [defs[j], defs[i]];
        }

        const termsHtml = terms.map(el =>
            `<div class="re-match-term" data-id="${el.dataset.reId}">${el.innerHTML.trim()}</div>`
        ).join('');
        const defsHtml = defs.map(el =>
            `<div class="re-match-def" data-match="${el.dataset.reMatch}">${el.innerHTML.trim()}</div>`
        ).join('');

        const renderId = _buildReadingLayout(slide, {
            label, task,
            nextLabel: 'Continue →',
            sidebarHtml: `
                <div class="challenge-card"><div class="card-label">🔗 Match</div><p>${task}</p></div>
                <div class="re-match-grid">
                    <div class="re-match-col" id="re-match-terms-${index}">${termsHtml}</div>
                    <div class="re-match-col" id="re-match-defs-${index}">${defsHtml}</div>
                </div>
                <div class="reading-feedback" id="re-match-fb-${index}"></div>`
        });

        if (url) ReadingEngine._renderWithControls(slide, renderId, null, url, page);

        const btn = slide.querySelector('.btn-next-slide');
        const fb  = slide.querySelector(`#re-match-fb-${index}`);
        let selected    = null;
        let matchedCount = 0;
        const total     = terms.length;

        // Attach listeners after DOM is ready
        setTimeout(() => {
            slide.querySelectorAll('.re-match-term').forEach(term => {
                term.addEventListener('click', () => {
                    if (term.classList.contains('matched')) return;
                    slide.querySelectorAll('.re-match-term').forEach(t => t.classList.remove('selected'));
                    selected = term;
                    term.classList.add('selected');
                });
            });

            slide.querySelectorAll('.re-match-def').forEach(def => {
                def.addEventListener('click', () => {
                    if (!selected || def.classList.contains('matched')) return;
                    const isCorrect = selected.dataset.id === def.dataset.match;

                    if (isCorrect) {
                        selected.classList.remove('selected');
                        selected.classList.add('matched');
                        def.classList.add('matched');
                        matchedCount++;

                        if (fb) {
                            fb.className = 'reading-feedback success';
                            fb.innerHTML = matchedCount === total
                                ? '✅ All matched correctly! Excellent.'
                                : `✅ Correct! (${matchedCount}/${total} matched)`;
                            fb.style.display = 'block';
                        }
                        selected = null;

                        if (matchedCount === total) {
                            ReadingEngine._saveProgress(ReadingEngine.currentIndex, 'match', { completed: true });
                            if (btn) btn.style.display = 'block';
                        }
                    } else {
                        selected.classList.add('wrong');
                        def.classList.add('wrong');
                        if (fb) {
                            fb.className = 'reading-feedback error';
                            fb.innerHTML = "❌ That doesn't match — try another definition.";
                            fb.style.display = 'block';
                        }
                        ReadingEngine.addMistake();
                        const prevSel = selected;
                        selected = null;
                        setTimeout(() => {
                            prevSel.classList.remove('wrong', 'selected');
                            def.classList.remove('wrong');
                        }, 700);
                    }
                });
            });
        }, 100);

        btn?.addEventListener('click', () => ReadingEngine.next());
    }
};