/**
 * js/ui-tools.js
 * Solo tracking de actividad — la generación del reporte está en report.js
 */

const SHEET_URL_UITOOLS = "https://script.google.com/macros/s/AKfycbxyTGsa79RwK7F09CSIfOnUDhur5e8391gDo8aguA_pxvhY_GyCv-8Gh0Hsb45XPzwC/exec";

function sendOneToSheet(entry) {
    const audit = entry.audit || {};

    const payload = {
        timestamp:        entry.timestamp              || new Date().toLocaleString(),
        name:             localStorage.getItem('studentName')            || "",
        email:            localStorage.getItem('studentEmail')           || "",
        course:           localStorage.getItem('studentCourse')          || "",
        role:             localStorage.getItem('studentMajor')           || "",
        institution:      localStorage.getItem('studentInstitution')     || "",
        practiceType:     localStorage.getItem('studentPracticeType')    || "",
        dataConsent:      localStorage.getItem('studentAcademicConsent') || "Yes",
        researchConsent:  localStorage.getItem('studentResearchConsent') || "Yes",
        activity:         entry.module                 || "",
        result:           entry.result                 || "",
        words:            audit.words                  || "",
        pastes:           audit.pastes                 || "",
        tabSwitches:      audit.tabSwitches            || "",
        keystrokes:       audit.actualKeystrokes       || "",
        deletions:        audit.deletions              || "",
        timeToFirstKey:   audit.timeToFirstKeySec  != null ? audit.timeToFirstKeySec  : "",
        writingDuration:  audit.writingDurationSec != null ? audit.writingDurationSec : "",
        charsTypedRatio:  audit.charsTypedRatio    != null ? audit.charsTypedRatio    : "",
        essay:            entry.essay                  || "",
        isNewAttempt:     entry.isNewAttempt ? "Yes" : "",
        reportGeneratedAt: ""   // vacío — no es descarga de reporte
    };

    const params = new URLSearchParams();
    Object.entries(payload).forEach(([k, v]) => params.append(k, v));

    fetch(SHEET_URL_UITOOLS, {
        method: "POST",
        mode:   "no-cors",
        body:   params
    }).catch(err => console.warn("Sheet sync failed:", err));
}

function logActivity(activityName, result, isQuiz = false, essayContent = "", auditData = null) {
    let progress = JSON.parse(localStorage.getItem('course_progress')) || [];

    const existingIndex = progress.findIndex(
        p => p.module === activityName && p.result && p.result.includes("Score")
    );

    // Caso 1: llega un "Visited" pero ya hay Score → ignorar
    if (result === "Visited" && existingIndex !== -1) return;

    // Caso 2: llega un Score y ya existe una entrada con Score → actualizar
    if (result.includes("Score") && existingIndex !== -1) {
        const existing = progress[existingIndex];
        // Si el audit es diferente es un intento nuevo → limpiar ensayo anterior
        const isNewAttempt = auditData && existing.audit &&
            JSON.stringify(auditData) !== JSON.stringify(existing.audit);
        progress[existingIndex] = {
            ...existing,
            timestamp:    new Date().toISOString(),
            isNewAttempt: isNewAttempt || false,
            essay: (essayContent && essayContent.trim().length > 5)
                ? essayContent.trim()
                : isNewAttempt ? "" : existing.essay || "",
            audit: auditData || existing.audit || null
        };
        localStorage.setItem('course_progress', JSON.stringify(progress));
        console.log("Activity updated: " + activityName);
        sendOneToSheet(progress[existingIndex]);  // ✅ enviar al Sheet al actualizar
        return;
    }

    // Caso 3: entrada nueva con Score → guardar y enviar
    const newEntry = {
        timestamp: new Date().toISOString(),
        module:    activityName,
        result:    result,
        essay:     (essayContent && essayContent.trim().length > 5) ? essayContent.trim() : "",
        audit:     auditData || null
    };

    progress.push(newEntry);
    localStorage.setItem('course_progress', JSON.stringify(progress));
    console.log("Activity saved: " + activityName);

    if (result.includes("Score")) {
        sendOneToSheet(newEntry);  // ✅ enviar al Sheet solo si tiene Score
    }
}