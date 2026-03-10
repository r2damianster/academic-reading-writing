/* js/module-logic.js */

let currentSlide = 0;
let mistakes     = 0;

// Proxy global: permite que lecciones custom hagan window.mistakes++
Object.defineProperty(window, 'mistakes', {
    get: ()    => mistakes,
    set: (val) => { mistakes = val; },
    configurable: true
});

mistakes = 0;

// --- Navegación Universal entre Slides ---
window.nextSlide = function(target) {
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    // 1. Quitar 'active' de la diapositiva que esté visible ahora
    const currentEl = document.querySelector('.slide.active');
    if (currentEl) currentEl.classList.remove('active');

    // 2. Determinar el elemento destino (por número o por ID de texto)
    let nextEl;
    if (typeof target === 'number') {
        currentSlide = target;
        nextEl = document.getElementById(`slide${target}`);
    } else {
        // Si target es un string como 'essaySlide'
        nextEl = document.getElementById(target);
        // Intentamos encontrar el índice para la barra de progreso
        const index = Array.from(slides).indexOf(nextEl);
        if (index !== -1) currentSlide = index;
    }

    // 3. Activar la siguiente y subir el scroll
    if (nextEl) {
        nextEl.classList.add('active');
        window.scrollTo(0, 0);
    }

    // 4. Barra de progreso dinámica
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
    
    // Obtener auditData del ActivityTracker
    const auditData = (typeof ActivityTracker !== 'undefined' && ActivityTracker.getActivityAudit)
        ? ActivityTracker.getActivityAudit()
        : { timestamp: Date.now(), mistakes: mistakes };

    const logger = window.parent.logActivity || window.logActivity;
    if (logger) logger(lessonName, finalStatus, true, "", auditData);

    // En lugar de ir a un número fijo, vamos al ID genérico del ensayo
    nextSlide('essaySlide');
};

// --- GUARDAR ENSAYO Y REDIRIGIR AL HUB ---
window.finishLessonWithEssay = function(lessonName, essay, audit, redirectUrl) {
    const logger = window.parent.logActivity || window.logActivity;

    const progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    const existing = [...progress].reverse().find(
        p => p.module === lessonName && p.result && p.result.includes("Score")
    );
    const status = existing ? existing.result : `Score: ${100 - (mistakes * 5)}% (Errors: ${mistakes})`;

    if (logger) logger(lessonName, status, true, essay, audit);

    alert("Academic progress saved successfully!");

    // Lógica de redirección inteligente
    const path = window.location.pathname;
    let dest = 'index.html';
    if (path.includes('/00-fundamentals/'))  dest = 'fundamentals-hub.html';
    if (path.includes('/unit1-essays/'))     dest = 'unit1-essays.html';
    if (path.includes('/unit2-papers/'))     dest = 'unit2-papers.html';
    if (path.includes('/apa-integrity/'))    dest = 'apa-integrity.html';
    
    if (redirectUrl) dest = redirectUrl;
    window.location.href = dest;
};