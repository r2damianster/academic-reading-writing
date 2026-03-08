/**
 * js/ui-tools.js
 * Solo tracking de actividad — la generación del reporte está en report.js
 */

function logActivity(activityName, result, isQuiz = false, essayContent = "", auditData = null) {
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];

    const existingIndex = progress.findIndex(
        p => p.module === activityName && p.result && p.result.includes("Score")
    );

    // Caso 1: llega un "Visited" pero ya hay Score → ignorar
    if (result === "Visited" && existingIndex !== -1) return;

    // Caso 2: llega un Score y ya existe una entrada con Score → actualizar en lugar de agregar
    if (result.includes("Score") && existingIndex !== -1) {
        const existing = progress[existingIndex];
        progress[existingIndex] = {
            ...existing,
            timestamp: new Date().toLocaleString(),
            essay: (essayContent && essayContent.trim().length > 5)
                ? essayContent.trim()
                : existing.essay || "",
            audit: auditData || existing.audit || null
        };
        localStorage.setItem('course_progress', JSON.stringify(progress));
        console.log("Activity updated: " + activityName);
        return;
    }

    // Caso 3: entrada nueva (primera vez o Visited sin Score previo)
    const newEntry = {
        timestamp: new Date().toLocaleString(),
        module:    activityName,
        result:    result,
        essay:     (essayContent && essayContent.trim().length > 5) ? essayContent.trim() : "",
        audit:     auditData || null
    };

    progress.push(newEntry);
    localStorage.setItem('course_progress', JSON.stringify(progress));
    console.log("Activity saved: " + activityName);
}