let currentSlide = 1;
let mistakes = 0; 

window.nextSlide = function(n) {
    const totalSlides = document.querySelectorAll('.slide').length;
    document.getElementById(`slide${currentSlide}`).classList.remove('active');
    currentSlide = n;
    document.getElementById(`slide${currentSlide}`).classList.add('active');
    
    // Actualizar barra de progreso
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentSlide - 1) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }
};

window.checkAnswer = function(btn, isCorrect, feedbackId) {
    const feedback = document.getElementById(feedbackId);
    const parentSlide = btn.closest('.slide');
    const nextBtn = parentSlide.querySelector('.btn-next');

    // Hacer visible el div de feedback
    if (feedback) {
        feedback.style.display = "block";
    }

    if (isCorrect) {
        // Estilo éxito
        btn.style.backgroundColor = "#2ecc71";
        btn.style.color = "white";
        btn.style.borderColor = "#27ae60";
        
        if (feedback) {
            feedback.innerHTML = "✅ Correct! Well done.";
            feedback.style.color = "#27ae60";
            feedback.style.backgroundColor = "#e8f8f0";
            feedback.style.padding = "10px";
            feedback.style.borderRadius = "5px";
            feedback.style.marginTop = "10px";
        }
        
        // Mostrar botón para avanzar
        if (nextBtn) nextBtn.style.display = "block";
    } else {
        // Estilo error
        btn.style.backgroundColor = "#e74c3c";
        btn.style.color = "white";
        btn.style.borderColor = "#c0392b";
        
        if (feedback) {
            feedback.innerHTML = "❌ Not quite. Review the rule and try again!";
            feedback.style.color = "#c0392b";
            feedback.style.backgroundColor = "#fdf2f2";
            feedback.style.padding = "10px";
            feedback.style.borderRadius = "5px";
            feedback.style.marginTop = "10px";
        }
        
        mistakes++; // Sumar al reporte
    }
};

window.finishLesson = function(lessonName) {
    let score = 100 - (mistakes * 5); 
    if (score < 0) score = 0;

    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;
    
    // 1. Guardar en el reporte (Parent)
    if (window.parent && window.parent.logActivity) {
        window.parent.logActivity(lessonName, finalStatus);
    }
    
    // 2. Avisar al usuario
    alert(`Congratulations!\nLesson: ${lessonName}\n${finalStatus}`);

    // 3. REGRESAR AL HUB AUTOMÁTICAMENTE
    // Esto detecta si estamos en el 00-fundamentals y vuelve a su hub
    window.location.href = 'fundamentals-hub.html';
};