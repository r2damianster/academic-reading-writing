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
    let _slides       = [];
    let _current      = 0;
    let _lessonName   = '';
    let _pdfCache     = {};      // url → pdfDoc  (PDF.js cargado)
    let _currentPdfUrl = null;   // última URL activa
    let _sessionId    = null;    // UUID de reading_sessions (Supabase)
    let _studentName  = null;
    let _totalMistakes = 0;

    const SUPABASE_URL = (() => {
        // Reutilizar la constante del slide-engine si ya existe en el scope global
        // Esto evita duplicar la key en dos archivos.
        if (typeof SlideEngine !== 'undefined') {
            // Acceso indirecto: slide-engine expone la URL en window si existe
        }
        // Fallback: leer del meta tag <meta name="supabase-url" content="...">
        const meta = document.querySelector('meta[name="supabase-url"]');
        return meta ? meta.content : '';
    })();

    const SUPABASE_KEY = (() => {
        const meta = document.querySelector('meta[name="supabase-key"]');
        return meta ? meta.content : '';
    })();

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

        // Nombre de estudiante: pedir si no está en localStorage
        _studentName = localStorage.getItem('readingStudentName');
        if (!_studentName) {
            _studentName = prompt('Enter your name to begin the lesson:') || 'Anonymous';
            localStorage.setItem('readingStudentName', _studentName.trim());
        }

        // Crear sesión en Supabase (no bloqueante)
        _initSession();

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
            }
        });

        _showSlide(0);
        _updateProgress();
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
    }

    function next() {
        if (_current < _slides.length - 1) {
            _saveProgress(_current, 'completed');
            _showSlide(_current + 1);
        } else {
            _finishLesson();
        }
    }

    function _updateProgress() {
        const bar = document.getElementById('readingProgressBar');
        if (bar && _slides.length > 1) {
            bar.style.width = `${(_current / (_slides.length - 1)) * 100}%`;
        }
        const counter = document.getElementById('readingSlideCounter');
        if (counter) counter.textContent = `${_current + 1} / ${_slides.length}`;
    }

    /* ──────────────────────────────────────────────────────────────────────────
       BOTÓN "SIGUIENTE" — helpers
    ────────────────────────────────────────────────────────────────────────── */
    // Busca el btn-next-slide dentro de una slide y lo muestra
    function _unlockNext(slide) {
        const btn = slide.querySelector('.btn-next-slide');
        if (btn) btn.style.display = 'block';
    }

    // Crea y appends el botón next al final de la slide (o del sidebar si existe)
    function _appendNextBtn(slide, label) {
        const btn = document.createElement('button');
        btn.className   = 'btn-next-slide';
        btn.textContent = label || 'Continue →';
        btn.addEventListener('click', () => next());

        // Si hay sidebar, ponerlo al final del sidebar; si no, al final del slide
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
       SUPABASE — Guardar progreso
    ────────────────────────────────────────────────────────────────────────── */
    async function _initSession() {
        if (!SUPABASE_URL) return;
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/reading_sessions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    lesson_url:  window.location.pathname,
                    is_live:     false
                })
            });
            if (res.ok) {
                const rows = await res.json();
                _sessionId = rows[0]?.id || null;
                console.log('📡 Reading session creada:', _sessionId);
            }
        } catch(e) {
            console.warn('ReadingEngine: no se pudo crear sesión Supabase (offline?)');
        }
    }

    async function _saveProgress(slideIndex, actionType, data) {
        if (!SUPABASE_URL || !_sessionId) return;
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/reading_progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    session_id:   _sessionId,
                    student_name: _studentName,
                    slide_id:     slideIndex,
                    action_data:  { type: actionType, ...(data || {}) }
                })
            });
        } catch(e) {
            console.warn('ReadingEngine: saveProgress falló (offline?)');
        }
    }

    function _finishLesson() {
        _saveProgress(_current, 'lesson_complete', {
            total_mistakes: _totalMistakes,
            student: _studentName
        });

        // Mostrar pantalla de finalización
        const done = document.getElementById('readingDoneScreen');
        if (done) {
            _slides.forEach(s => s.classList.remove('active'));
            done.style.display = 'block';
        } else {
            alert(`🎉 Lesson complete! Great work, ${_studentName}.`);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────────
       API PÚBLICA
    ────────────────────────────────────────────────────────────────────────── */
    return { init, next, _unlockNext, _appendNextBtn, _renderPage, _renderWithControls, _saveProgress,
             _getPdfDoc: _getPdf,
             get currentIndex() { return _current; },
             get studentName() { return _studentName; },
             addMistake() { _totalMistakes++; }
    };

})();


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