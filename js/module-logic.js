/* js/module-logic.js */

let currentSlide = 0;
let mistakes     = 0;

// Proxy global
Object.defineProperty(window, 'mistakes', {
    get: ()    => mistakes,
    set: (val) => { mistakes = val; },
    configurable: true
});

mistakes = 0;

// --- Navegación Universal Corregida ---
window.nextSlide = function(target = null) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const currentEl = document.querySelector('.slide.active');
    
    // 1. Determinar cuál es la siguiente diapositiva
    let nextEl;

    if (target === null || target === undefined) {
        // MODO AUTOMÁTICO: Ir a la siguiente en el orden del HTML
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
            nextEl = slides[currentSlide];
        }
    } else if (typeof target === 'number') {
        // MODO POR ÍNDICE: (Comportamiento antiguo)
        currentSlide = target;
        nextEl = document.getElementById(`slide${target}`);
    } else {
        // MODO POR ID: (Para ir a 'essaySlide' o 'preEssaySlide')
        nextEl = document.getElementById(target);
        const index = Array.from(slides).indexOf(nextEl);
        if (index !== -1) currentSlide = index;
    }

    // 2. Ejecutar el cambio visual
    if (nextEl) {
        if (currentEl) currentEl.classList.remove('active');
        nextEl.classList.add('active');
        window.scrollTo(0, 0);

        // 3. Actualizar barra de progreso
        const progressBar = document.getElementById('progressBar');
        if (progressBar && totalSlides > 1) {
            const progress = (currentSlide / (totalSlides - 1)) * 100;
            progressBar.style.width = `${progress}%`;
        }
    } else {
        console.error("No se encontró la siguiente slide:", target);
    }
};

// --- Validación de Quizzes ---
window.checkAnswer = function(btn, isCorrect, feedbackId) {
    const feedback    = document.getElementById(feedbackId);
    const parentSlide = btn.closest('.slide');
    const nextBtn     = parentSlide.querySelector('.btn-next');

    if (feedback) feedback.style.display = "block";

    if (isCorrect) {
        btn.style.backgroundColor = "#2ecc71";
        btn.style.color = "white";
        if (feedback) {
            feedback.innerHTML = "✅ Correct! Well done.";
            feedback.style.color = "#27ae60";
        }
        if (nextBtn) nextBtn.style.display = "block";
    } else {
        btn.style.backgroundColor = "#e74c3c";
        btn.style.color = "white";
        if (feedback) {
            feedback.innerHTML = "❌ Not quite. Try again!";
            feedback.style.color = "#c0392b";
        }
        mistakes++;
    }
};

// --- GUARDAR SCORE Y SALTAR AL PRE-ESSAY ---
window.finishLesson = function(lessonName) {
    let score = 100 - (mistakes * 5);
    if (score < 0) score = 0;
    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;

    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    let existingIndex = progress.findIndex(p => p.module === lessonName);

    const entry = {
        module:    lessonName,
        result:    finalStatus,
        timestamp: new Date().toLocaleString()
    };

    if (existingIndex !== -1) progress[existingIndex] = entry;
    else progress.push(entry);

    localStorage.setItem('course_progress', JSON.stringify(progress));

    // ✅ ENVÍO DE LECCIÓN (isEssayUpdate: "No") — registra score en el sheet
    window._sendLessonToSheet(lessonName, entry, null);

    nextSlide('preEssaySlide');
};

// --- ENVÍO DE LECCIÓN — crea o actualiza la fila de lección ---
// essay es opcional: solo se usa cuando no hubo quiz previo y se envía todo junto
window._sendLessonToSheet = function(lessonName, lessonEntry, audit, essay) {
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec";

    const name            = localStorage.getItem('studentName')            || "";
    const email           = localStorage.getItem('studentEmail')           || "";
    const course          = localStorage.getItem('studentCourse')          || "";
    const role            = localStorage.getItem('studentMajor')           || "";
    const institution     = localStorage.getItem('studentInstitution')     || "";
    const practiceType    = localStorage.getItem('studentPracticeType')    || "";
    const dataConsent     = localStorage.getItem('studentAcademicConsent') || "Yes";
    const researchConsent = localStorage.getItem('studentResearchConsent') || "Yes";

    const a           = audit || {};
    const essayText   = essay || "";

    const payload = {
        timestamp:        new Date().toLocaleString(),
        name:             name,
        email:            email,
        course:           course,
        role:             role,
        institution:      institution,
        practiceType:     practiceType,
        dataConsent:      dataConsent,
        researchConsent:  researchConsent,
        activity:         String(lessonEntry.module || lessonName),
        result:           String(lessonEntry.result || ""),
        words:            String(a.words           || "0"),
        pastes:           String(a.pastes          || "0"),
        tabSwitches:      String(a.tabSwitches     || "0"),
        keystrokes:       String(a.keystrokes      || "0"),
        deletions:        String(a.deletions       || "0"),
        timeToFirstKey:   String(a.timeToFirstKey  || "0"),
        writingDuration:  String(a.writingDuration || "0"),
        charsTypedRatio:  String(a.charsTypedRatio || "0"),
        essay:            essayText,
        isEssayUpdate:    "No"   // ← LECCIÓN: siempre "No"
    };

    const params = new URLSearchParams();
    for (const key in payload) params.append(key, payload[key]);

    const sent = navigator.sendBeacon(SHEET_URL, params);
    console.log(`📡 sendBeacon LESSON "${lessonName}":`, sent ? "encolado ✅" : "falló ❌");

    if (!sent) {
        fetch(SHEET_URL, { method: "POST", mode: "no-cors", body: params })
            .catch(err => console.error("Fetch fallback falló:", err));
    }
};

// --- ENVÍO DE ESSAY — actualiza SOLO las columnas de essay en la fila existente ---
window._sendEssayToSheet = function(lessonName, essay, audit) {
    const SHEET_URL = "https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec";

    const email    = localStorage.getItem('studentEmail') || "";
    const a        = audit || {};

    const payload = {
        timestamp:        new Date().toLocaleString(),
        email:            email,
        activity:         String(lessonName),
        words:            String(a.words           || "0"),
        pastes:           String(a.pastes          || "0"),
        tabSwitches:      String(a.tabSwitches     || "0"),
        keystrokes:       String(a.keystrokes      || "0"),
        deletions:        String(a.deletions       || "0"),
        timeToFirstKey:   String(a.timeToFirstKey  || "0"),
        writingDuration:  String(a.writingDuration || "0"),
        charsTypedRatio:  String(a.charsTypedRatio || "0"),
        essay:            String(essay || ""),
        isEssayUpdate:    "Yes"  // ← ESSAY: siempre "Yes"
    };

    const params = new URLSearchParams();
    for (const key in payload) params.append(key, payload[key]);

    const sent = navigator.sendBeacon(SHEET_URL, params);
    console.log(`📡 sendBeacon ESSAY "${lessonName}":`, sent ? "encolado ✅" : "falló ❌");

    if (!sent) {
        fetch(SHEET_URL, { method: "POST", mode: "no-cors", body: params })
            .catch(err => console.error("Fetch fallback falló:", err));
    }
};

// --- MANTENER _sendToSheetBeacon por compatibilidad con ui-tools.js ---
// Solo se usa desde logActivity() en ui-tools.js para quices sin essay
window._sendToSheetBeacon = function(progress) {
    // Enviar solo la última entrada, no todo el array
    const lastEntry = [...progress].reverse().find(item => item.result && item.result !== "Visited");
    if (!lastEntry) return;
    window._sendLessonToSheet(lastEntry.module, lastEntry, lastEntry.audit || null);
};

// --- GUARDAR ENSAYO Y REDIRIGIR AL HUB ---
window.finishLessonWithEssay = function(lessonName, essay, audit, redirectUrl) {
    // 1. Obtener el progreso actual
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];

    // 2. Determinar si ya existe fila de lección en localStorage
    //    (proxy de si ya existe fila en el sheet)
    let foundIndex = progress.findIndex(item => item.module === lessonName);
    const lessonAlreadyRegistered = foundIndex !== -1;

    // 3. Inyectar ensayo y auditoría en la entrada existente, o crear una nueva
    if (lessonAlreadyRegistered) {
        progress[foundIndex].essay     = essay || "";
        progress[foundIndex].audit     = audit || {};
        progress[foundIndex].timestamp = new Date().toLocaleString();
    } else {
        progress.push({
            module:    lessonName,
            result:    `Completed (No Quiz)`,
            essay:     essay || "",
            audit:     audit || {},
            timestamp: new Date().toLocaleString()
        });
    }

    // 4. Persistencia en LocalStorage
    localStorage.setItem('course_progress', JSON.stringify(progress));

    // 5. ✅ UN SOLO ENVÍO — la lógica decide la rama correcta:
    //    - Si ya había fila registrada → isEssayUpdate:"Yes" (solo actualiza columnas de essay)
    //    - Si NO había fila → isEssayUpdate:"No" (crea la fila completa con essay incluido)
    if (lessonAlreadyRegistered) {
        window._sendEssayToSheet(lessonName, essay, audit);
    } else {
        const entry = progress[progress.length - 1];
        window._sendLessonToSheet(lessonName, entry, audit, essay);
    }

    alert("Academic progress and Integrity Audit saved!");

    // 5. Lógica de redirección
    const path = window.location.pathname;
    let dest = 'index.html';
    if (path.includes('/00-fundamentals/'))  dest = 'fundamentals-hub.html';
    if (path.includes('/unit1-essays/'))     dest = 'unit1-essays.html';
    if (path.includes('/unit2-papers/'))     dest = 'unit2-papers.html';
    if (path.includes('/apa-integrity/'))    dest = 'apa-integrity.html';

    if (redirectUrl) dest = redirectUrl;

    setTimeout(() => {
        window.location.href = dest;
    }, 1500);
};