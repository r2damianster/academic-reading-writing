/**
 * js/ui-tools.js
 * Herramientas de Tracking de actividad y generación de Reportes
 */

// Registra una actividad completada (se llama desde los iframes de las lecciones)
function logActivity(activityName, result) {
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    
    const newEntry = {
        timestamp: new Date().toLocaleString(),
        module: activityName,
        result: result
    };
    
    progress.push(newEntry);
    localStorage.setItem('course_progress', JSON.stringify(progress));
    console.log("Activity saved: " + activityName);
}

// Genera el reporte .txt para descargar
function generateReport() {
    const name = localStorage.getItem('studentName') || "N/A";
    const email = localStorage.getItem('studentEmail') || "N/A";
    const progress = JSON.parse(localStorage.getItem('course_progress')) || [];
    
    // Fecha y hora del momento exacto de la descarga
    const now = new Date();
    const dateTime = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

    if (progress.length === 0) {
        alert("You haven't completed any activities yet. Start learning to generate a report!");
        return;
    }

    // Construcción del documento de texto
    let reportContent = `--------------------------------------------------\n`;
    reportContent += `   ACADEMIC WRITING COURSE - PROGRESS REPORT\n`;
    reportContent += `--------------------------------------------------\n\n`;
    reportContent += `STUDENT: ${name}\n`;
    reportContent += `EMAIL:   ${email}\n`;
    reportContent += `REPORT GENERATED: ${dateTime}\n`; 
    reportContent += `\n==================================================\n`;
    reportContent += `             COMPLETED ACTIVITIES\n`;
    reportContent += `==================================================\n\n`;

    progress.forEach((item, index) => {
        reportContent += `${index + 1}. [${item.timestamp}]\n`;
        reportContent += `   Activity: ${item.module}\n`;
        reportContent += `   Result:   ${item.result}\n`;
        reportContent += `--------------------------------------------------\n`;
    });

    reportContent += `\nEnd of Report. Please send this file to your instructor.`;

    try {
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        const fileName = `Report_${name.replace(/\s+/g, '_')}.txt`;
        
        downloadLink.href = url;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating report:", error);
        alert("Could not generate report.");
    }
}