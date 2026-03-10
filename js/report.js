/* js/report.js
 * Generación de PDF y envío de datos a Google Sheets
 */

const SHEET_URL_REPORT = "https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec";

function sendToSheet(entries) {
    const name            = localStorage.getItem('studentName')            || "";
    const email           = localStorage.getItem('studentEmail')           || "";
    const course          = localStorage.getItem('studentCourse')          || "";
    const role            = localStorage.getItem('studentMajor')           || "";
    const institution     = localStorage.getItem('studentInstitution')     || "";
    const practiceType    = localStorage.getItem('studentPracticeType')    || "";
    const dataConsent     = localStorage.getItem('studentAcademicConsent') || "Yes";
    const researchConsent = localStorage.getItem('studentResearchConsent') || "Yes";

    entries.forEach(item => {
        if (!item.result || item.result === "Visited") return;

        const audit = item.audit || {};

        const payload = {
            timestamp:       item.timestamp        || new Date().toLocaleString(),
            name:            name,
            email:           email,
            course:          course,
            role:            role,
            institution:     institution,
            practiceType:    practiceType,
            dataConsent:     dataConsent,
            researchConsent: researchConsent,
            activity:        item.module            || "",
            result:          item.result            || "",
            words:           audit.words            || "",
            pastes:          audit.pastes           || "",
            tabSwitches:     audit.tabSwitches      || "",
            keystrokes:      audit.actualKeystrokes || "",
            deletions:       audit.deletions        || "",
            timeToFirstKey:  audit.timeToFirstKeySec  != null ? audit.timeToFirstKeySec  : "",
            writingDuration: audit.writingDurationSec != null ? audit.writingDurationSec : "",
            charsTypedRatio: audit.charsTypedRatio  != null ? audit.charsTypedRatio      : "",
            essay:              item.essay             || "",
            reportGeneratedAt:  new Date().toLocaleString(),
            lessonCompleted:    item.lessonCompleted ? "Yes" : "",
            essayCompleted:     item.essayCompleted  ? "Yes" : ""
        };

        const params = new URLSearchParams();
        Object.entries(payload).forEach(([k, v]) => params.append(k, v));

        fetch(SHEET_URL_REPORT, {
            method: "POST",
            mode:   "no-cors",
            body:   params
        }).catch(err => console.warn("Sheet sync failed:", err));
    });
}

async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName  = localStorage.getItem('studentName')        || "Student";
    const studentEmail = localStorage.getItem('studentEmail')       || "N/A";
    const course       = localStorage.getItem('studentCourse')      || "N/A";
    const role         = localStorage.getItem('studentMajor')       || "N/A";
    const institution  = localStorage.getItem('studentInstitution') || "N/A";
    const progress     = JSON.parse(localStorage.getItem('course_progress')) || [];

    if (progress.length === 0) {
        alert("You haven't completed any activities yet. Start learning to generate a report!");
        return;
    }

    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 58, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("ACADEMIC WRITING COURSE — PROGRESS REPORT", 15, 16);
    doc.setFontSize(9);
    doc.text(`Student: ${studentName}   |   Email: ${studentEmail}`, 15, 26);
    doc.text(`Course: ${course}   |   Role: ${role}   |   Institution: ${institution}`, 15, 34);
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 220);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 42);
    doc.setFontSize(7);
    doc.setTextColor(140, 170, 200);
    doc.text("Consultas, créditos y derechos reservados © arturo.rodriguez@uleam.edu.ec", 15, 52);

    let y     = 68;
    let count = 1;

    for (const item of progress) {
        if (!item.result) continue;
        if (item.result === "Visited") continue;

        if (y > 250) { doc.addPage(); y = 20; }

        doc.setTextColor(0);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${count}. ${item.module}`, 15, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        doc.text(`Result: ${item.result}`, 20, y + 7);
        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text(`Date: ${item.timestamp}`, 20, y + 13);
        y += 20;

        const audit = item.audit || null;
        if (audit && audit.words > 0) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFillColor(240, 240, 240);
            doc.roundedRect(20, y - 3, 170, 22, 2, 2, 'F');
            doc.setTextColor(50);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("INTEGRITY ANALYSIS", 23, y + 3);
            doc.setFont("helvetica", "normal");

            const row1 = `Words: ${audit.words}  |  Pastes: ${audit.pastes}  |  Tab switches: ${audit.tabSwitches ?? audit.tabEscapes ?? "—"}  |  Keystrokes: ${audit.actualKeystrokes}  |  Deletions: ${audit.deletions ?? "—"}`;
            doc.text(row1, 23, y + 9);

            const timeFirst = audit.timeToFirstKeySec   != null ? `${audit.timeToFirstKeySec}s`  : "—";
            const timeDur   = audit.writingDurationSec  != null ? `${audit.writingDurationSec}s` : "—";
            const ratio     = audit.charsTypedRatio     != null ? `${audit.charsTypedRatio}%`    : "—";
            doc.text(`Time to first key: ${timeFirst}  |  Writing duration: ${timeDur}  |  Chars typed ratio: ${ratio}`, 23, y + 15);
            y += 26;
        }

        let essayText = "";
        if (item.result && item.result.includes("Score")) {
            essayText = item.essay || "";
            if ((!essayText || essayText.trim().length < 5) && typeof window.getEssay === 'function') {
                essayText = window.getEssay(item.module) || "";
            }
        }

        if (essayText && essayText.trim().length > 5) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setTextColor(0);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            doc.text("Submitted Writing:", 20, y);
            y += 7;

            doc.setFont("helvetica", "italic");
            doc.setTextColor(40);
            const lines = doc.splitTextToSize(essayText.trim(), 165);
            for (const line of lines) {
                if (y > 282) { doc.addPage(); y = 20; }
                doc.text(line, 20, y);
                y += 5;
            }
            y += 8;
        }

        if (y > 282) { doc.addPage(); y = 20; }
        doc.setDrawColor(200);
        doc.line(15, y, 195, y);
        y += 12;

        count++;
    }

    doc.save(`Report_${studentName.replace(/\s+/g, '_')}.pdf`);
    sendToSheet(progress);
}