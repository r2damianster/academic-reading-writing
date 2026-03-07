/**
 * js/report.js
 * EL ARCHIVADOR DE PROGRESO
 */
window.logActivity = function(activityName, status) {
    let progress = JSON.parse(localStorage.getItem('studentProgress')) || {};
    
    // Guardamos la actividad con su score y errores
    progress[activityName] = {
        status: status,
        date: new Date().toLocaleString()
    };
    
    localStorage.setItem('studentProgress', JSON.stringify(progress));
};

function generateReport() {
    const name = localStorage.getItem('studentName');
    const email = localStorage.getItem('studentEmail');
    const progress = JSON.parse(localStorage.getItem('studentProgress'));

    if (!progress) {
        alert("No activities yet!");
        return;
    }

    let report = `PROGRESS REPORT\nStudent: ${name}\nEmail: ${email}\n\n`;
    
    for (const [lesson, data] of Object.entries(progress)) {
        // Esto escribirá: - Topic Sentences: Score 80% (Errors: 2) (7/3/2026...)
        report += `- ${lesson}: ${data.status} (${data.date})\n`;
    }

    const blob = new Blob([report], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `Report_${name}.txt`;
    a.click();
}