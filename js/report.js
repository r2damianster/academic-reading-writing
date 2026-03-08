/* js/report.js
 * Solo generación de PDF — el tracking está en ui-tools.js
 */

async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const studentName  = localStorage.getItem('studentName') || "Student";
    const studentEmail = localStorage.getItem('studentEmail') || "N/A";
    const progress     = JSON.parse(localStorage.getItem('course_progress')) || [];

    if (progress.length === 0) {
        alert("You haven't completed any activities yet. Start learning to generate a report!");
        return;
    }

    // --- CABECERA ---
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("ACADEMIC WRITING COURSE - PROGRESS REPORT", 15, 18);
    doc.setFontSize(10);
    doc.text(`Student: ${studentName}   |   Email: ${studentEmail}`, 15, 30);

    let y     = 55;
    let count = 1;

    for (const item of progress) {
        if (!item.result) continue;

        // Nueva página preventiva si queda poco espacio
        if (y > 250) { doc.addPage(); y = 20; }

        // --- Título de actividad ---
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

        // --- Bloque de Auditoría ---
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
            const row2 = `Time to first key: ${timeFirst}  |  Writing duration: ${timeDur}  |  Chars typed ratio: ${ratio}`;
            doc.text(row2, 23, y + 15);

            y += 26;
        }

        // --- Essay (solo en entradas con Score) ---
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

            // Imprimir línea a línea con salto de página automático
            for (const line of lines) {
                if (y > 282) { doc.addPage(); y = 20; }
                doc.text(line, 20, y);
                y += 5;
            }
            y += 8;
        }

        // --- Separador ---
        if (y > 282) { doc.addPage(); y = 20; }
        doc.setDrawColor(200);
        doc.line(15, y, 195, y);
        y += 12;

        count++;
    }

    doc.save(`Report_${studentName.replace(/\s+/g, '_')}.pdf`);
}