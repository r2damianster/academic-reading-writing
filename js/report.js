/* js/report.js
 * ÚNICA responsabilidad: generar el PDF.
 * Lee datos del estudiante y progreso desde Supabase.
 * localStorage se usa solo como fallback si Supabase no responde.
 */

const _REPORT_SUPABASE_URL = 'https://kuvyvyzmpfbndpkzbosb.supabase.co';
const _REPORT_ANON_KEY     = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1dnl2eXptcGZibmRwa3pib3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDEwMzksImV4cCI6MjA4OTAxNzAzOX0.E9ftrQR0DojGLRUkMj4w2LUBWFnumK6lRr5M1WXiRNc';

// ── Fetch helper ─────────────────────────────────────────────────────────────
async function _sbGet(path) {
    const res = await fetch(`${_REPORT_SUPABASE_URL}/rest/v1/${path}`, {
        headers: {
            'apikey':        _REPORT_ANON_KEY,
            'Authorization': `Bearer ${_REPORT_ANON_KEY}`
        },
        credentials: 'omit'
    });
    if (!res.ok) throw new Error(`Supabase error ${res.status} on ${path}`);
    return res.json();
}

// ── Cargar datos del estudiante y su progreso desde Supabase ─────────────────
async function _loadReportData() {
    const email = localStorage.getItem('studentEmail') || '';
    if (!email) return null;

    // 1. Perfil del estudiante
    const students = await _sbGet(
        `students?email=eq.${encodeURIComponent(email)}&select=id,name,email,course,major,period&limit=1`
    );
    if (!students || students.length === 0) return null;
    const student = students[0];

    // 2. Todas las actividades completadas (quiz scores)
    const logs = await _sbGet(
        `activity_logs?student_id=eq.${student.id}&select=activity,result,created_at&order=created_at.asc`
    );

    // 3. Todos los ensayos enviados
    const essays = await _sbGet(
        `essay_submissions?student_id=eq.${student.id}&select=activity,essay_text,words,pastes,tab_switches,keystrokes,deletions,time_to_first_key,writing_duration,chars_typed_ratio,integrity_score,created_at&order=created_at.asc`
    );

    // 4. Un Map para quedarnos con el ensayo más reciente por actividad
    const essayMap = {};
    for (const e of essays) {
        essayMap[e.activity] = e;
    }

    // 5. Unir actividades únicas de ambas fuentes
    const allActivities = [...new Set([
        ...logs.map(l => l.activity),
        ...essays.map(e => e.activity)
    ])];

    const progress = allActivities.map(activity => {
        const log   = logs.find(l => l.activity === activity);
        const essay = essayMap[activity] || null;
        return {
            activity,
            result: log ? log.result : 'Essay only',
            date:   log ? log.created_at : (essay ? essay.created_at : null),
            essay:  essay ? essay.essay_text : '',
            audit:  essay ? {
                words:           essay.words,
                pastes:          essay.pastes,
                tabSwitches:     essay.tab_switches,
                keystrokes:      essay.keystrokes,
                deletions:       essay.deletions,
                timeToFirstKey:  essay.time_to_first_key,
                writingDuration: essay.writing_duration,
                charsTypedRatio: essay.chars_typed_ratio,
                integrityScore:  essay.integrity_score
            } : null
        };
    });

    progress.sort((a, b) => new Date(a.date) - new Date(b.date));
    return { student, progress };
}

// ── Generación del PDF ────────────────────────────────────────────────────────
async function generateReport() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Feedback visual mientras carga
    const btn = document.querySelector('[onclick*="generateReport"]');
    const originalText = btn ? btn.innerText : '';
    if (btn) { btn.innerText = 'Loading from server…'; btn.disabled = true; }

    let student, progress;

    try {
        const data = await _loadReportData();
        if (data) {
            student  = data.student;
            progress = data.progress;
        } else {
            throw new Error('No Supabase data');
        }
    } catch (err) {
        console.warn('⚠️ Supabase falló, usando localStorage como fallback:', err);
        student = {
            name:   localStorage.getItem('studentName')   || 'Student',
            email:  localStorage.getItem('studentEmail')  || 'N/A',
            course: localStorage.getItem('studentCourse') || 'N/A',
            major:  localStorage.getItem('studentMajor')  || 'N/A',
            period: '—'
        };
        progress = (JSON.parse(localStorage.getItem('course_progress')) || []).map(item => ({
            activity: item.module,
            result:   item.result,
            essay:    item.essay || '',
            audit:    item.audit || null,
            date:     item.timestamp || null
        }));
    } finally {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
    }

    if (!progress || progress.length === 0) {
        alert("You haven't completed any activities yet.");
        return;
    }

    const studentName = student.name || 'Student';
    const institution = localStorage.getItem('studentInstitution') || 'ULEAM';

    // ── Encabezado ────────────────────────────────────────────────────────────
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 62, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("ACADEMIC WRITING COURSE — PROGRESS REPORT", 15, 16);
    doc.setFontSize(9);
    doc.text(`Student: ${studentName}   |   Email: ${student.email}`, 15, 26);
    doc.text(`Course: ${student.course}   |   Role: ${student.major}   |   Institution: ${institution}`, 15, 34);
    doc.text(`Period: ${student.period || '—'}`, 15, 42);
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 220);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 50);
    doc.setFontSize(7);
    doc.setTextColor(140, 170, 200);
    doc.text("Consultas, créditos y derechos reservados © arturo.rodriguez@uleam.edu.ec", 15, 57);

    let y = 72;
    let count = 1;

    for (const item of progress) {
        if (!item.result || item.result === 'Visited') continue;

        if (y > 250) { doc.addPage(); y = 20; }

        doc.setTextColor(0);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${count}. ${item.activity}`, 15, y);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        doc.text(`Result: ${item.result}`, 20, y + 7);
        y += 15;

        // ── Cuadro de integridad ──────────────────────────────────────────────
        const audit = item.audit;
        if (audit && (audit.words > 0 || audit.keystrokes > 0)) {
            if (y > 260) { doc.addPage(); y = 20; }

            const iScore    = (audit.integrityScore != null && !isNaN(Number(audit.integrityScore)))
                ? Number(audit.integrityScore)
                : _calcIntegrityFallback(audit);
            const label     = iScore >= 85 ? 'GOOD' : iScore >= 60 ? 'MODERATE' : 'LOW';
            const bandColor = iScore >= 85 ? [39, 174, 96] : iScore >= 60 ? [230, 126, 34] : [231, 76, 60];

            doc.setFillColor(...bandColor);
            doc.roundedRect(18, y - 4, 175, 30, 2, 2, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.setFont("helvetica", "bold");
            doc.text(`INTEGRITY ANALYSIS   |   Score: ${iScore}%  [${label}]`, 23, y + 2);

            doc.setFont("helvetica", "normal");
            doc.text(
                `Words: ${audit.words || 0}  |  Pastes: ${audit.pastes || 0}  |  Tabs: ${audit.tabSwitches || 0}  |  Keys: ${audit.keystrokes || 0}  |  Dels: ${audit.deletions || 0}`,
                23, y + 9
            );
            doc.text(
                `Time to first: ${audit.timeToFirstKey ?? '—'}s  |  Duration: ${audit.writingDuration ?? '—'}s  |  Typed ratio: ${audit.charsTypedRatio ?? '—'}%`,
                23, y + 16
            );

            doc.setTextColor(0);
            y += 36;
        }

        // ── Texto del ensayo ──────────────────────────────────────────────────
        if (item.essay && item.essay.trim().length > 5) {
            if (y > 260) { doc.addPage(); y = 20; }
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont("helvetica", "bold");
            doc.text("Submitted Writing:", 20, y);
            y += 6;

            doc.setFont("helvetica", "italic");
            doc.setTextColor(40);
            const lines = doc.splitTextToSize(item.essay.trim(), 165);
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

    doc.save(`Report_${studentName.replace(/\s+/g, '_')}_${student.period || 'period'}.pdf`);
}

// ── Fallback de cálculo de integridad ────────────────────────────────────────
function _calcIntegrityFallback(a) {
    let s = 100;
    const pastes = a.pastes || 0, keys = a.keystrokes || 0;
    const ratio  = a.charsTypedRatio != null ? a.charsTypedRatio : null;
    const tabs   = a.tabSwitches || 0, dels = a.deletions || 0;
    const dur    = a.writingDuration || 0, words = a.words || 0;

    if (pastes > 0 && ratio !== null) {
        const pp = Math.max(0, 100 - ratio);
        if      (pp >= 60) s -= 50;
        else if (pp >= 30) s -= 25;
        else if (pp >= 10) s -= 10;
        else               s -= 5;
    } else if (pastes > 0) { s -= 20; }

    if      (tabs >= 5) s -= Math.min(tabs * 4, 25);
    else if (tabs >= 2) s -= tabs * 3;
    if (words > 10 && dels > 0 && dels / Math.max(keys, 1) > 0.6) s -= 10;
    if (pastes === 0 && words > 30 && dur > 0 && dur < 30) s -= 15;

    return Math.max(0, s);
}