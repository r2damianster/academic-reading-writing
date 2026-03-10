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

// --- Navegación Universal ---
window.nextSlide = function(target) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;
    const currentEl = document.querySelector('.slide.active');
    if (currentEl) currentEl.classList.remove('active');

    let nextEl;
    if (typeof target === 'number') {
        currentSlide = target;
        nextEl = document.getElementById(`slide${target}`);
    } else {
        nextEl = document.getElementById(target);
        const index = Array.from(slides).indexOf(nextEl);
        if (index !== -1) currentSlide = index;
    }

    if (nextEl) {
        nextEl.classList.add('active');
        window.scrollTo(0, 0);
    }

    const progressBar = document.getElementById('progressBar');
    if (progressBar && totalSlides > 1) {
        const progress = (currentSlide / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progress}%`;
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

// --- GUARDAR SCORE Y SALTAR AL ENSAYO ---
window.finishLesson = function(lessonName) {
    let score = 100 - (mistakes * 5);
    if (score < 0) score = 0;
    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;
    
    // Guardar temporalmente el score en el progreso para que el ensayo lo herede
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    let existingIndex = progress.findIndex(p => p.module === lessonName);
    
    const entry = {
        module: lessonName,
        result: finalStatus,
        timestamp: new Date().toLocaleString()
    };

    if (existingIndex !== -1) progress[existingIndex] = entry;
    else progress.push(entry);
    
    localStorage.setItem('course_progress', JSON.stringify(progress));

    nextSlide('essaySlide');
};

// --- GUARDAR ENSAYO Y REDIRIGIR AL HUB (CORRECCIÓN CRÍTICA) ---
window.finishLessonWithEssay = function(lessonName, essay, audit, redirectUrl) {
    // 1. Obtener el progreso actual
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    
    // 2. Buscar la entrada de esta lección para inyectar el ensayo y la auditoría
    let found = false;
    for (let item of progress) {
        if (item.module === lessonName) {
            item.essay = essay || "";
            item.audit = audit || {}; // <--- AQUÍ SE GUARDAN LAS MÉTRICAS (Words, Keys, etc.)
            item.timestamp = new Date().toLocaleString();
            found = true;
            break;
        }
    }

    // Si no existía (ej. lección sin quiz previo), la creamos
    if (!found) {
        progress.push({
            module: lessonName,
            result: `Completed (No Quiz)`,
            essay: essay || "",
            audit: audit || {},
            timestamp: new Date().toLocaleString()
        });
    }

    // 3. Persistencia en LocalStorage
    localStorage.setItem('course_progress', JSON.stringify(progress));

    // 4. ENVÍO INMEDIATO A GOOGLE SHEETS (Sincronización forzada)
    if (typeof sendToSheet === 'function') {
        sendToSheet(progress);
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
    
    // Pequeño delay para asegurar que el fetch de sendToSheet se inicie
    setTimeout(() => {
        window.location.href = dest;
    }, 500);
};