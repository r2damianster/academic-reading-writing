/* js/report.js
 * Generación de PDF y envío de datos a Google Sheets
 */

const SHEET_URL_REPORT = "https://script.google.com/macros/s/AKfycbwkGu5Guzmy7tEVR4YJ8hSrFgUe69tUsyzGthPzWivMxEpe6tFezWb60D_oWt0cAH14/exec";

/**
 * Envía los datos de progreso a Google Sheets con conversión forzada a String
 */
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

        // Buscamos la auditoría dentro de item.audit
        const a = item.audit || {};

        // CONSTRUCCIÓN MANUAL: Convertimos todo a String explícitamente
        const payload = {
            "Name":            String(name),
            "Email":           String(email),
            "Course":          String(course),
            "Role":            String(role),
            "Institution":     String(institution),
            "PracticeType":    String(practiceType),
            "DataConsent":     String(dataConsent),
            "ResearchConsent": String(researchConsent),
            "Activity":        String(item.module || ""),
            "Result":          String(item.result || ""),
            
            // MÉTRICAS FORZADAS A STRING PARA EVITAR VALORES NULOS
            "Words":           String(a.words || "0"),
            "Pastes":          String(a.pastes || "0"),
            "TabSwitches":     String(a.tabSwitches || "0"),
            "Keystrokes":      String(a.keystrokes || "0"),
            "Deletions":       String(a.deletions || "0"),
            "TimeToFirstKey":  String(a.timeToFirstKey || "0"),
            "WritingDuration": String(a.writingDuration || "0"),
            "CharsTypedRatio": String(a.charsTypedRatio || "0"),
            
            "Essay":           String(item.essay || ""),
            "isEssayUpdate":   "Yes" 
        };

        const params = new URLSearchParams();
        for (const key in payload) {
            params.append(key, payload[key]);
        }

        fetch(SHEET_URL_REPORT, {
            method: "POST",
            mode:   "no-cors", 
            body:   params
        }).catch(err => console.error("Falla de red en Sheet:", err));
    });
}

/**
 * Genera el reporte PDF y dispara el envío a Sheets
 */
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
        alert("You haven't completed any activities yet.");
        return;
    }

    // --- Diseño del Encabezado ---
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

    let y = 68;
    let count = 1;

    for (const item of progress) {
        if (!item.result || item.result === "Visited") continue;

        if (y > 250) { doc.addPage(); y = 20; }

        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${count}. ${item.module}`, 15, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        doc.text(`Result: ${item.result}`, 20, y + 7);
        y += 15;

        // Cuadro de Integridad
        const audit = item.audit || null;
        if (audit && (audit.words > 0 || audit.keystrokes > 0)) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(18, y - 4, 175, 22, 2, 2, 'F');
            doc.setTextColor(50);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text("INTEGRITY ANALYSIS", 23, y + 2);
            doc.setFont("helvetica", "normal");

            const row1 = `Words: ${audit.words || 0}  |  Pastes: ${audit.pastes || 0}  |  Tabs: ${audit.tabSwitches || 0}  |  Keys: ${audit.keystrokes || 0}  |  Dels: ${audit.deletions || 0}`;
            doc.text(row1, 23, y + 8);

            const t1 = audit.timeToFirstKey ? `${audit.timeToFirstKey}s` : "—";
            const tD = audit.writingDuration ? `${audit.writingDuration}s` : "—";
            const rA = audit.charsTypedRatio ? `${audit.charsTypedRatio}%` : "—";
            doc.text(`Time to first: ${t1}  |  Duration: ${tD}  |  Typed ratio: ${rA}`, 23, y + 14);
            y += 28;
        }

        // Texto del ensayo
        let essayText = item.essay || "";
        if (essayText.trim().length > 5) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Submitted Writing:", 20, y);
            y += 6;

            doc.setFont("helvetica", "italic");
            doc.setTextColor(40);
            const lines = doc.splitTextToSize(essayText.trim(), 165);
            for (const line of lines) {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.text(line, 20, y);
                y += 5;
            }
            y += 5;
        }

        doc.setDrawColor(220);
        doc.line(15, y, 195, y);
        y += 10;
        count++;
    }

    doc.save(`Report_${studentName.replace(/\s+/g, '_')}.pdf`);
    sendToSheet(progress);
}