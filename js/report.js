/* js/report.js
 * Genera el PDF de progreso del estudiante.
 * Lee de Supabase: perfil, activity_logs, essay_submissions, essay_requirements.
 * Estructura: Resumen de puntajes primero, luego todos los ensayos al final.
 */

let _REPORT_SUPABASE_URL = '';
let _REPORT_ANON_KEY     = '';
fetch('/api/config').then(r=>r.json()).then(cfg=>{
    _REPORT_SUPABASE_URL = cfg.supabaseUrl || '';
    _REPORT_ANON_KEY     = cfg.supabaseKey || '';
}).catch(()=>{});

async function _sbGet(path) {
    const res = await fetch(`${_REPORT_SUPABASE_URL}/rest/v1/${path}`, {
        headers: { 'apikey': _REPORT_ANON_KEY, 'Authorization': `Bearer ${_REPORT_ANON_KEY}` },
        credentials: 'omit'
    });
    if (!res.ok) throw new Error(`Supabase ${res.status}`);
    return res.json();
}

async function _loadReportData(opts = {}) {
    const email = localStorage.getItem('studentEmail') || '';
    if (!email) return null;

    const students = await _sbGet(
        `students?email=eq.${encodeURIComponent(email)}&select=id,name,email,course,major,period&limit=1`
    );
    if (!students || !students.length) return null;
    const student = students[0];

    // Cargar datos
    let [logs, essays, complianceRows] = await Promise.all([
        _sbGet(`activity_logs?student_id=eq.${student.id}&select=activity,result,created_at&order=created_at.asc`),
        _sbGet(`essay_submissions?student_id=eq.${student.id}&select=id,activity,essay_text,words,pastes,tab_switches,keystrokes,deletions,time_to_first_key,writing_duration,chars_typed_ratio,integrity_score,created_at&order=created_at.desc`),
        _sbGet(`essay_compliance_results?student_id=eq.${student.id}&select=submission_id,activity,criteria_met,criteria_total,compliance_pct,snapshot&order=created_at.desc`)
    ]);

    // Filtrar por hoy si es necesario (Considerando zona horaria local)
    if (opts.todayOnly) {
        const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
        logs = logs.filter(l => {
            const localDate = new Date(l.created_at).toLocaleDateString('en-CA');
            return localDate === today;
        });
        essays = essays.filter(e => {
            const localDate = new Date(e.created_at).toLocaleDateString('en-CA');
            return localDate === today;
        });
    }

    // Mapear compliance
    const compMap = {}; // submission_id -> compliance
    for (const c of complianceRows) compMap[c.submission_id] = c;

    // Resumen: Último resultado por actividad
    const summaryMap = {};
    for (const l of logs) summaryMap[l.activity] = l;
    // Si hay ensayos pero no logs (raro pero posible), asegurar que aparezcan
    for (const e of essays) {
        if (!summaryMap[e.activity]) {
            summaryMap[e.activity] = { activity: e.activity, result: 'Submitted', created_at: e.created_at };
        }
    }

    const summaryList = Object.values(summaryMap).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));

    // Ensayos procesados
    const essaysProcessed = essays.map(e => {
        const compRaw = compMap[e.id] || null;
        let compliance = null;
        if (compRaw && compRaw.snapshot) {
            compliance = {
                passed: compRaw.criteria_met,
                total:  compRaw.criteria_total,
                pct:    compRaw.compliance_pct,
                checks: compRaw.snapshot.checks || []
            };
        }
        return {
            activity: e.activity,
            date: e.created_at,
            text: e.essay_text,
            audit: {
                words: e.words, pastes: e.pastes,
                tabSwitches: e.tab_switches, keystrokes: e.keystrokes,
                deletions: e.deletions, timeToFirstKey: e.time_to_first_key,
                writingDuration: e.writing_duration, charsTypedRatio: e.chars_typed_ratio,
                integrityScore: e.integrity_score
            },
            compliance
        };
    }).sort((a,b) => new Date(a.date) - new Date(b.date));

    return { student, summaryList, essaysProcessed };
}

async function generateReport(opts = {}) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Feedback visual si existe el botón original
    const btn = document.querySelector('[onclick*="generateReport"]');
    const originalText = btn ? btn.innerText : '';
    if (btn) { btn.innerText = 'Loading…'; btn.disabled = true; }

    try {
        const data = await _loadReportData(opts);
        if (!data || (data.summaryList.length === 0 && data.essaysProcessed.length === 0)) {
            alert(opts.todayOnly ? "No activities recorded today." : "No activities recorded yet.");
            return;
        }

        const { student, summaryList, essaysProcessed } = data;
        const studentName = student.name || 'Student';
        const institution = localStorage.getItem('studentInstitution') || 'ULEAM';
        const reportTitle = opts.todayOnly ? "DAILY PROGRESS REPORT" : "GENERAL PROGRESS REPORT";

        // ── 1. Encabezado (Pág 1) ────────────────────────────────────────────────
        _drawHeader(doc, student, reportTitle, institution);

        let y = 72;
        
        // ── 2. Tabla de Resumen ──────────────────────────────────────────────────
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(44, 62, 80);
        doc.text("ACTIVITY SUMMARY", 15, y);
        y += 8;

        // Header tabla
        doc.setFillColor(240);
        doc.rect(15, y, 180, 8, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Activity Name", 18, y + 5.5);
        doc.text("Result", 120, y + 5.5);
        doc.text("Date", 170, y + 5.5);
        y += 8;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(60);
        for (const item of summaryList) {
            if (y > 275) { doc.addPage(); y = 20; }
            doc.setFontSize(8);
            doc.text(item.activity, 18, y + 5);
            doc.text(item.result || '—', 120, y + 5);
            doc.text((item.created_at || '').slice(0, 10), 170, y + 5);
            doc.setDrawColor(245);
            doc.line(15, y + 8, 195, y + 8);
            y += 8;
        }

        // ── 3. Ensayos (Nueva Página) ───────────────────────────────────────────
        if (essaysProcessed.length > 0) {
            doc.addPage();
            y = 20;
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(44, 62, 80);
            doc.text("SUBMITTED ESSAYS & INTEGRITY DATA", 15, y);
            y += 12;

            for (const ess of essaysProcessed) {
                if (y > 250) { doc.addPage(); y = 20; }
                
                doc.setDrawColor(220);
                doc.line(15, y, 195, y);
                y += 10;

                // Título de Actividad
                doc.setFontSize(11);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(0);
                doc.text(ess.activity, 15, y);
                doc.setFontSize(8);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(150);
                doc.text(`Attempt Date: ${new Date(ess.date).toLocaleString()}`, 15, y + 5);
                y += 12;

                // Integrity Box
                const audit = ess.audit;
                const iScore = (audit.integrityScore != null && !isNaN(Number(audit.integrityScore)))
                    ? Number(audit.integrityScore) : 0;
                const bandColor = iScore >= 85 ? [39, 174, 96] : iScore >= 60 ? [230, 126, 34] : [231, 76, 60];
                
                doc.setFillColor(...bandColor);
                doc.roundedRect(18, y - 4, 174, 18, 1, 1, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(8);
                doc.setFont("helvetica", "bold");
                doc.text(`INTEGRITY SCORE: ${iScore}%`, 23, y + 2);
                doc.setFont("helvetica", "normal");
                doc.setFontSize(7);
                doc.text(`Words: ${audit.words || 0} | Pastes: ${audit.pastes || 0} | Tabs: ${audit.tabSwitches || 0} | Keys: ${audit.keystrokes || 0} | Duration: ${audit.writingDuration || 0}s`, 23, y + 8);
                y += 20;

                // Essay Text
                if (ess.text && ess.text.trim().length > 0) {
                    doc.setTextColor(50);
                    doc.setFontSize(9);
                    doc.setFont("helvetica", "italic");
                    const lines = doc.splitTextToSize(ess.text.trim(), 170);
                    for (const line of lines) {
                        if (y > 280) { doc.addPage(); y = 20; }
                        doc.text(line, 20, y);
                        y += 5;
                    }
                    y += 5;
                }
            }
        }

        const dateSuffix = opts.todayOnly ? 'Daily_' : 'Full_';
        doc.save(`Report_${dateSuffix}${studentName.replace(/\s+/g, '_')}.pdf`);

    } catch (err) {
        console.error('Error generating report:', err);
        alert("Error generating report. Please check your connection.");
    } finally {
        if (btn) { btn.innerText = originalText; btn.disabled = false; }
    }
}

function _drawHeader(doc, student, title, institution) {
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 62, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(title, 15, 16);
    doc.setFontSize(9);
    doc.text(`Student: ${student.name}   |   Email: ${student.email}`, 15, 26);
    doc.text(`Course: ${student.course}   |   Institution: ${institution}`, 15, 34);
    doc.text(`Period: ${student.period || '—'}`, 15, 42);
    doc.setFontSize(8);
    doc.setTextColor(180, 200, 220);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 50);
    doc.setFontSize(7);
    doc.setTextColor(140, 170, 200);
    doc.text("Consultas, créditos y derechos reservados © arturo.rodriguez@uleam.edu.ec", 15, 57);
}