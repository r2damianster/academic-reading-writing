/* js/ui-tools.js
 * ÚNICA responsabilidad: logActivity() para registrar progreso en localStorage.
 * El envío al Sheet lo hace EXCLUSIVAMENTE module-logic.js (_sendToSheetBeacon).
 * sendOneToSheet() eliminado para evitar envíos duplicados.
 */

function logActivity(activityName, result, isQuiz = false, essayContent = "", auditData = null) {
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];

    const existingIndex = progress.findIndex(
        p => p.module === activityName && p.result && p.result.includes("Score")
    );

    const hasEssay = essayContent && essayContent.trim().length > 5;

    // Caso 1: llega un "Visited" pero ya hay Score → ignorar
    if (result === "Visited" && existingIndex !== -1) return;

    // Caso 2: Score ya existe → actualizar
    if (result.includes("Score") && existingIndex !== -1) {
        const existing = progress[existingIndex];
        const isEssayUpdate = hasEssay && existing.lessonCompleted;
        const isNewAttempt  = existing.isNewAttempt || (
            !isEssayUpdate &&
            auditData && existing.audit &&
            JSON.stringify(auditData) !== JSON.stringify(existing.audit)
        );

        const updated = {
            ...existing,
            essay:          hasEssay     ? essayContent.trim()
                          : isNewAttempt ? ""
                          : existing.essay || "",
            essayCompleted: hasEssay     ? true
                          : isNewAttempt ? false
                          : existing.essayCompleted || false,
        };

        if (!isEssayUpdate) {
            updated.timestamp       = new Date().toISOString();
            updated.isNewAttempt    = isNewAttempt || false;
            updated.audit           = auditData || existing.audit || null;
            updated.lessonCompleted = true;
        }

        progress[existingIndex] = updated;
        localStorage.setItem('course_progress', JSON.stringify(progress));
        console.log(`logActivity updated (${isEssayUpdate ? "essay" : "lesson"}): ${activityName}`);
        return;
    }

    // Caso 3: entrada nueva
    const newEntry = {
        timestamp:       new Date().toISOString(),
        module:          activityName,
        result:          result,
        essay:           hasEssay ? essayContent.trim() : "",
        audit:           auditData || null,
        lessonCompleted: true,
        essayCompleted:  hasEssay,
        isNewAttempt:    false
    };

    progress.push(newEntry);
    localStorage.setItem('course_progress', JSON.stringify(progress));
    console.log("logActivity saved:", activityName);
}
