/* js/auth.js
 * Versión 1.8: Sesión de 24h, re-login solo pide email (no repite consents)
 */

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkStudentStatus);
} else {
    checkStudentStatus();
}

async function checkStudentStatus() {
    const email          = localStorage.getItem('studentEmail');
    const modal          = document.getElementById('welcomeModal');
    const display        = document.getElementById('studentDisplay');
    const loginTimestamp = localStorage.getItem('lastLoginTimestamp');

    // Sesión de 24 horas
    const expirationTime = 24 * 60 * 60 * 1000;
    if (loginTimestamp && (new Date().getTime() - loginTimestamp > expirationTime)) {
        // Solo borrar el timestamp — conservar email y datos del estudiante
        // para que el modal muestre el email pre-llenado y salte step 2
        localStorage.removeItem('lastLoginTimestamp');
        if (!email) {
            localStorage.clear();
        }
        if (modal) modal.style.display = 'flex';
        _prefillReturningUser();
        return;
    }

    if (!email) {
        if (modal) modal.style.display = 'flex';
        return;
    }

    // Vía rápida: login reciente (< 2 min), cerrar modal sin llamada al servidor
    if (loginTimestamp && (new Date().getTime() - loginTimestamp < 120000)) {
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (localStorage.getItem('studentName') || "Student");
        return;
    }

    // Admin autenticado con contraseña — no re-validar (el endpoint exige contraseña)
    if (localStorage.getItem('isAdmin') === 'true') {
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (localStorage.getItem('studentName') || "Admin");
        return;
    }

    // Si es la cuenta admin pero NO está marcada como isAdmin=true, 
    // forzar login manual para evitar 401 en el fondo.
    if (email === 'arturo.rodriguez@uleam.edu.ec') {
        if (modal) modal.style.display = 'flex';
        return;
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

        localStorage.setItem('studentName', serverResult.name || "Authorized User");
        localStorage.setItem('studentEmail', serverResult.email);
        localStorage.setItem('studentCourse', serverResult.course || "N/A");
        localStorage.setItem('studentMajor', serverResult.major || "Student");
        localStorage.setItem('studentInstitution', "ULEAM");
        localStorage.setItem('lastLoginTimestamp', new Date().getTime());

        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (serverResult.name || "Student");

    } catch (err) {
        console.error("Connection Error:", err);
        // Error de red pero hay sesión activa — dejar usar la app offline
        if (email && modal) modal.style.display = 'none';
    }
}

// Pre-llena el email en el modal cuando el estudiante regresa tras expiración
// y salta automáticamente al step 2 si ya tiene consents guardados
function _prefillReturningUser() {
    var storedEmail = localStorage.getItem('studentEmail');
    var hasConsent  = localStorage.getItem('studentAcademicConsent');
    if (!storedEmail) return;

    var emailInput = document.getElementById('inputEmail');
    if (emailInput) emailInput.value = storedEmail;

    // Si ya tiene consents guardados, saltar directo al step 2
    if (hasConsent) {
        var s1 = document.getElementById('step1');
        var s2 = document.getElementById('step2');
        if (s1) s1.style.display = 'none';
        if (s2) s2.style.display = 'block';
    }
}

async function saveAndStart() {
    const emailInput = document.getElementById('inputEmail');
    const email = emailInput ? emailInput.value.trim().toLowerCase() : "";

    // Leer consents del DOM; si no están visibles, usar los valores guardados
    const consentEl   = document.getElementById('inputConsent');
    const researchEl  = document.getElementById('inputResearchConsent');
    const practiceEl  = document.getElementById('inputPracticeType');
    const academicConsent = consentEl   ? consentEl.checked   : (localStorage.getItem('studentAcademicConsent') === 'Yes');
    const researchConsent = researchEl  ? researchEl.checked  : (localStorage.getItem('studentResearchConsent')  === 'Yes');
    const practiceType    = practiceEl  ? practiceEl.value    : (localStorage.getItem('studentPracticeType') || 'In-class practice');

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