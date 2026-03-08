/* js/module-logic.js */

let currentSlide = 1;
let mistakes     = 0;

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
    const feedback   = document.getElementById(feedbackId);
    const parentSlide = btn.closest('.slide');
    const nextBtn    = parentSlide.querySelector('.btn-next');

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
// Llamar desde el último quiz. Guarda el Score inmediatamente.
window.finishLesson = function(lessonName, isQuiz = true, essay = "", audit = null) {
    let score = 100 - (mistakes * 5);
    if (score < 0) score = 0;
    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;

    const logger = window.parent.logActivity || window.logActivity;
    if (logger) {
        logger(lessonName, finalStatus, isQuiz, essay, audit);
    }

    // Score guardado — ahora avanzar al slide del essay
    const totalSlides = document.querySelectorAll('.slide').length;
    nextSlide(totalSlides); // El essay siempre es el último slide
};

// --- GUARDAR ESSAY Y CERRAR ---
// Llamado por EssayTracker.submit() después de que el estudiante escribe.
// Actualiza la entrada existente agregando el essay al Score ya guardado.
window.finishLessonWithEssay = function(lessonName, essay, audit) {
    const logger = window.parent.logActivity || window.logActivity;

    // Recuperar el Score ya guardado para no sobreescribirlo
    const progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    const existing = [...progress].reverse().find(
        p => p.module === lessonName && p.result && p.result.includes("Score")
    );
    const status = existing ? existing.result : `Score: ${100 - (mistakes * 5)}%`;

    if (logger) {
        logger(lessonName, status, true, essay, audit);
    }

    alert("Progress saved!");
    window.location.href = 'fundamentals-hub.html';
};