/* js/auth.js 
 * Versión 1.7: Corregido mapeo de columnas y lógica de limpieza
 */

// Borra la primera línea y pega esto al FINAL de tu js/auth.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkStudentStatus);
} else {
    checkStudentStatus();
}
async function checkStudentStatus() {
    const email = localStorage.getItem('studentEmail');
    const modal = document.getElementById('welcomeModal');
    const display = document.getElementById('studentDisplay');
    const loginTimestamp = localStorage.getItem('lastLoginTimestamp');

    // Sesión de 4 horas
    const expirationTime = 4 * 60 * 60 * 1000;
    if (loginTimestamp && (new Date().getTime() - loginTimestamp > expirationTime)) {
        console.log("Sesión expirada");
        resetApp();
        return;
    }

    if (!email) {
        if (modal) modal.style.display = 'flex';
        return;
    }

    // --- VÍA RÁPIDA: Si el login fue hace menos de 2 minutos, cerramos el modal ya ---
    if (email && loginTimestamp && (new Date().getTime() - loginTimestamp < 120000)) {
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (localStorage.getItem('studentName') || "Student");
    }

    try {
        const response = await fetch('/api/validate-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        if (!response.ok) {
            console.warn("Usuario no válido en la base de datos, limpiando sesión...");
            localStorage.clear(); 
            if (modal) modal.style.display = 'flex';
            return;
        }

        const serverResult = await response.json();

        // Actualizar datos con lo más reciente del servidor
        localStorage.setItem('studentName', serverResult.name || "Authorized User");
        localStorage.setItem('studentEmail', serverResult.email);
        localStorage.setItem('studentCourse', serverResult.course || "N/A");
        localStorage.setItem('studentMajor', serverResult.major || "Student");
        localStorage.setItem('studentInstitution', "ULEAM");
        localStorage.setItem('lastLoginTimestamp', new Date().getTime());

        // UI Update final
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (serverResult.name || "Student");

        const frame = document.getElementById('contentFrame');
        if (frame && frame.src.includes('welcome-content.html')) {
            // Ya cargado
        }

    } catch (err) {
        console.error("Connection Error:", err);
        // Si hay error de red pero ya teníamos sesión, dejamos que use la app offline
        if (email && modal) modal.style.display = 'none';
    }
}

async function saveAndStart() {
    const emailInput = document.getElementById('inputEmail');
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
    const practiceType = document.getElementById('inputPracticeType').value;
    const academicConsent = document.getElementById('inputConsent').checked;
    const researchConsent = document.getElementById('inputResearchConsent').checked;

    if (!email) {
        showModalError("Email is required.", "step1Error");
        return;
    }

    if (!academicConsent) {
        showModalError("Please accept the monitoring policy.", "step2Error");
        return;
    }

    // Si es la cuenta de administrador, incluir la contraseña en la petición
    const adminPwdField = document.getElementById('inputAdminPassword');
    const adminPassword = adminPwdField ? adminPwdField.value : '';

    try {
        showModalError("Verifying credentials...", "step2Error");

        const body = { email };
        if (adminPassword) body.password = adminPassword;

        const response = await fetch('/api/validate-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const serverResult = await response.json();

        if (!response.ok) {
            showModalError(serverResult.message || "User not found.", "step2Error");
            return;
        }

        // 3. GUARDAR DATOS EN STORAGE
        localStorage.setItem('studentName', serverResult.name || "Authorized User");
        localStorage.setItem('studentEmail', serverResult.email);
        localStorage.setItem('studentCourse', serverResult.course || "N/A");
        localStorage.setItem('studentMajor', serverResult.major || "Student");
        localStorage.setItem('studentInstitution', "ULEAM");
        localStorage.setItem('studentRole', serverResult.role || 'student');
        localStorage.setItem('isAdmin', serverResult.role === 'admin' ? 'true' : 'false');

        localStorage.setItem('studentPracticeType', practiceType);
        localStorage.setItem('studentAcademicConsent', 'Yes');
        localStorage.setItem('studentResearchConsent', researchConsent ? 'Yes' : 'No');
        localStorage.setItem('lastLoginTimestamp', new Date().getTime());

        // 4. CAMBIO CLAVE: Ejecutamos el check inmediatamente en lugar de recargar
        // Esto cerrará el modal y actualizará el texto "Active: User" automáticamente
        await checkStudentStatus();

    } catch (err) {
        console.error("Connection Error:", err);
        showModalError("Server connection failed.", "step2Error");
    }
}

function showModalError(msg, targetId) {
    const errDisplay = document.getElementById(targetId);
    if (errDisplay) {
        errDisplay.innerText = msg;
        errDisplay.style.color = "#e74c3c";
    }
}

function resetApp() {
    localStorage.clear();
    location.reload();
}