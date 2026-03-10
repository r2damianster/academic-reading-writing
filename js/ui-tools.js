/**
 * js/ui-tools.js
 * Solo tracking de actividad — la generación del reporte está en report.js
 */

const SHEET_URL_UITOOLS = "https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec";

function sendOneToSheet(entry, isEssayUpdate = false) {
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
        reportGeneratedAt: "",
        lessonCompleted:  entry.lessonCompleted ? "Yes" : "",
        essayCompleted:   entry.essayCompleted  ? "Yes" : "",
        isEssayUpdate:    isEssayUpdate ? "Yes" : ""
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

    const hasEssay = essayContent && essayContent.trim().length > 5;

    // Caso 1: llega un "Visited" pero ya hay Score → ignorar
    if (result === "Visited" && existingIndex !== -1) return;

    // Caso 2: llega un Score y ya existe una entrada con Score → actualizar
    if (result.includes("Score") && existingIndex !== -1) {
        const existing = progress[existingIndex];

        const isEssayUpdate = hasEssay && existing.lessonCompleted;

        const isNewAttempt = existing.isNewAttempt || (
            !isEssayUpdate &&
            auditData && existing.audit &&
            JSON.stringify(auditData) !== JSON.stringify(existing.audit)
        );

        const updated = {
            ...existing,
            // ✅ FIX: si es nuevo intento sin essay, limpiar essay anterior
            essay:          hasEssay ? essayContent.trim()
                          : isNewAttempt ? ""
                          : existing.essay || "",
            essayCompleted: hasEssay ? true
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
        console.log(`Activity ${isEssayUpdate ? "essay updated" : "updated"}: ` + activityName);
        sendOneToSheet(progress[existingIndex], isEssayUpdate);
        return;
    }

    // Caso 3: entrada nueva con Score → guardar y enviar
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
    console.log("Activity saved: " + activityName);

    if (result.includes("Score")) {
        sendOneToSheet(newEntry, false);
    }
}