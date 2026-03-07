/* js/module-logic.js */

let currentSlide = 1;
let mistakes = 0; 

// --- Navegación entre Slides ---
window.nextSlide = function(n) {
    const totalSlides = document.querySelectorAll('.slide').length;
    document.getElementById(`slide${currentSlide}`).classList.remove('active');
    currentSlide = n;
    document.getElementById(`slide${currentSlide}`).classList.add('active');
    
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentSlide - 1) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }
};

// --- Validación de Quizzes (Opción Múltiple) ---
window.checkAnswer = function(btn, isCorrect, feedbackId) {
    const feedback = document.getElementById(feedbackId);
    const parentSlide = btn.closest('.slide');
    const nextBtn = parentSlide.querySelector('.btn-next');

    if (feedback) feedback.style.display = "block";

    if (isCorrect) {
        // Estilos de Éxito (Recuperados de tu versión original)
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
        if (nextBtn) nextBtn.style.display = "block";
    } else {
        // Estilos de Error (Recuperados de tu versión original)
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
        mistakes++; 
    }
};

// --- Finalización de Lección ---
window.finishLesson = function(lessonName) {
    let score = 100 - (mistakes * 5); 
    if (score < 0) score = 0;

    const finalStatus = `Score: ${score}% (Errors: ${mistakes})`;
    
    // Con 'true' para que report.js lo acepte
    if (window.parent && window.parent.logActivity) {
        window.parent.logActivity(lessonName, finalStatus, true);
    }
    
    alert(`Congratulations!\nLesson: ${lessonName}\n${finalStatus}`);
    window.location.href = 'fundamentals-hub.html';
};

// --- Lógica de Drag & Drop ---
document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const zones = document.querySelectorAll('.drop-zone');

    draggables.forEach(drag => {
        drag.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', drag.id);
            drag.style.opacity = "0.5";
        });
        drag.addEventListener('dragend', () => {
            drag.style.opacity = "1";
        });
    });

    zones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('over');
            
            const id = e.dataTransfer.getData('text');
            const draggableElement = document.getElementById(id);
            const dropType = zone.getAttribute('data-accept');
            const dragType = draggableElement.getAttribute('data-type');
            const feedback = document.getElementById('s2f');

            if (dropType === dragType) {
                zone.innerHTML = ""; 
                zone.appendChild(draggableElement);
                draggableElement.setAttribute('draggable', 'false');
                draggableElement.style.cursor = 'default';
                draggableElement.style.borderColor = '#2ecc71';
                checkAllZones();
            } else {
                if(feedback) {
                    feedback.style.display = "block";
                    feedback.innerHTML = "❌ That fragment doesn't belong in that category. Try again!";
                    feedback.style.color = "#c0392b";
                    feedback.style.backgroundColor = "#fdf2f2";
                    feedback.style.padding = "10px";
                    feedback.style.borderRadius = "5px";
                    setTimeout(() => { feedback.style.display = "none"; }, 2000);
                }
                mistakes++;
            }
        });
    });

    function checkAllZones() {
        const filledZones = Array.from(zones).filter(z => z.children.length > 0);
        if (filledZones.length === 2) {
            const nextBtn = document.getElementById('next2');
            const feedback = document.getElementById('s2f');
            if(nextBtn) nextBtn.style.display = "block";
            if(feedback) {
                feedback.style.display = "block";
                feedback.innerHTML = "✅ Excellent! The sentence is complete and logically structured.";
                feedback.style.color = "#27ae60";
                feedback.style.backgroundColor = "#e8f8f0";
                feedback.style.padding = "10px";
                feedback.style.borderRadius = "5px";
            }
        }
    }
});