/* js/module-logic.js */

let currentSlide = 1;
let mistakes     = 0;

// Proxy global: permite que lecciones custom hagan window.mistakes++
Object.defineProperty(window, 'mistakes', {
    get: ()    => mistakes,
    set: (val) => { mistakes = val; },
    configurable: true
});

// Resetear errores al cargar — por si ActivityTracker.init() ya corrió antes
mistakes = 0;

// --- Navegación entre Slides ---
window.nextSlide = function(n) {
    const totalSlides = document.querySelectorAll('.slide').length;
    const currentEl   = document.getElementById(`slide${currentSlide}`);
    if (currentEl) currentEl.classList.remove('active');

    currentSlide = n;
    const nextEl = document.getElementById(`slide${currentSlide}`);
    if (nextEl) nextEl.classList.add('active');

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentSlide - 1) / (totalSlides - 1)) * 100;
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

// --- GUARDAR SCORE (sin essay, sin redirect) ---
window.finishLesson = function(lessonName) {
    let score = 100 - (mistakes * 5);
    if (score < 0) score = 0;
    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;
    console.log("finishLesson →", finalStatus);

    const logger = window.parent.logActivity || window.logActivity;
    if (logger) logger(lessonName, finalStatus, true, "", null);

    const totalSlides = document.querySelectorAll('.slide').length;
    nextSlide(totalSlides);
};

// --- GUARDAR ESSAY Y CERRAR ---
window.finishLessonWithEssay = function(lessonName, essay, audit, redirectUrl) {
    const logger = window.parent.logActivity || window.logActivity;

    const progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    const existing = [...progress].reverse().find(
        p => p.module === lessonName && p.result && p.result.includes("Score")
    );
    const status = existing ? existing.result : `Score: ${100 - (mistakes * 5)}% (Errors: ${mistakes})`;

    if (logger) logger(lessonName, status, true, essay, audit);

    alert("Progress saved!");
    // Detectar automáticamente el hub más cercano según la ruta actual
    const path = window.location.pathname;
    let dest = 'index.html';
    if (path.includes('/00-fundamentals/'))  dest = 'fundamentals-hub.html';
    if (path.includes('/unit1-essays/'))     dest = 'unit1-essays.html';
    if (path.includes('/unit2-papers/'))     dest = 'unit2-papers.html';
    if (path.includes('/apa-integrity/'))    dest = 'apa-integrity.html';
    if (path.includes('/toolbox/'))          dest = '../toolbox-hub.html';
    if (path.includes('/03-peer-review/'))   dest = 'peer-review-hub.html';
    if (redirectUrl) dest = redirectUrl;
    window.location.href = dest;
};