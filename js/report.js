// js/report.js

let entryTime = Date.now(); 

window.logActivity = function(activityName, status, isQuiz = false) {
    // BLOQUEO TOTAL: Si no es un Quiz, ignoramos la instrucción por completo.
    if (isQuiz !== true) {
        console.warn(`Clic ignorado para: ${activityName}. Solo se guardan resultados reales.`);
        return; 
    }

    let progress = JSON.parse(localStorage.getItem('studentProgress')) || {};

    // CÁLCULO DE TIEMPO (Desde que entró a la página hasta que dio clic en guardar)
    let durationSeconds = Math.round((Date.now() - entryTime) / 1000);
    let durationText = durationSeconds < 60 
        ? `${durationSeconds}s` 
        : `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`;

    // GUARDADO ÚNICO: El nombre de la actividad actúa como ID (no se repite)
    progress[activityName] = {
        result: status,
        date: new Date().toLocaleString(),
        timeSpent: durationText
    };

    localStorage.setItem('studentProgress', JSON.stringify(progress));
    console.log(`✅ Resultado guardado: ${activityName}`);
};

async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const progress = JSON.parse(localStorage.getItem('studentProgress')) || {};
    
    // --- Cabecera del PDF ---
    doc.setFont("helvetica", "bold");
    doc.text("ACADEMIC WRITING HUB - PROGRESS REPORT", 20, 20);
    doc.line(20, 25, 190, 25);
    
    let y = 40;
    let count = 1;

    // Solo iteramos lo que logramos guardar
    for (const [name, data] of Object.entries(progress)) {
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${count}. ${name}`, 20, y);
        
        doc.setFont("helvetica", "normal");
        doc.text(`Result: ${data.result}`, 25, y + 7);
        
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Duration: ${data.timeSpent} | ${data.date}`, 25, y + 13);
        
        doc.setTextColor(0);
        y += 25;
        count++;

        if (y > 270) { doc.addPage(); y = 20; }
    }

    if (Object.keys(progress).length === 0) {
        alert("No se han registrado resultados de actividades todavía.");
        return;
    }

    doc.save("Final_Report.pdf");
}