/* js/auth.js
 * Maneja registro, validación y sesión del estudiante.
 * Campos: nombre completo, correo institucional, curso, carrera, institución.
 * Correo válido: cualquier dirección @live.uleam.edu.ec
 */

document.addEventListener('DOMContentLoaded', () => checkStudentStatus());

function checkStudentStatus() {
    const name           = localStorage.getItem('studentName');
    const loginTimestamp = localStorage.getItem('lastLoginTimestamp');
    const modal          = document.getElementById('welcomeModal');
    const display        = document.getElementById('studentDisplay');

    // Auto-limpieza (4 horas)
    const expirationTime = 4 * 60 * 60 * 1000;
    if (loginTimestamp && (new Date().getTime() - loginTimestamp > expirationTime)) {
        resetApp();
        return;
    }

    if (!name) {
        if (modal) modal.style.display = 'flex';
    } else {
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Student: " + name;
        loadPage('welcome-content.html');
    }
}

function saveAndStart() {
    const name        = document.getElementById('inputName').value.trim();
    const email       = document.getElementById('inputEmail').value.trim();
    const course      = document.getElementById('inputCourse').value.trim();
    const major       = document.getElementById('inputMajor').value.trim();
    const institution = document.getElementById('inputInstitution').value.trim();
    const consent     = document.getElementById('inputConsent').checked;

    // Validar campos vacíos
    if (!name || !email || !course || !major || !institution) {
        showModalError("Please complete all fields before continuing.");
        return;
    }

    // Validar formato de correo institucional
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(live\.)?uleam\.edu\.ec$/;
    if (!emailPattern.test(email)) {
        showModalError("Only institutional email addresses are accepted for authentication.");
        return;
    }

    // Validar consentimiento
    if (!consent) {
        showModalError("You must accept the data monitoring policy to continue.");
        return;
    }

    localStorage.setItem('studentName',        name);
    localStorage.setItem('studentEmail',       email);
    localStorage.setItem('studentCourse',      course);
    localStorage.setItem('studentMajor',       major);
    localStorage.setItem('studentInstitution', institution);
    localStorage.setItem('lastLoginTimestamp', new Date().getTime());

    location.reload();
}

function showModalError(msg) {
    let err = document.getElementById('modalError');
    if (!err) {
        err = document.createElement('p');
        err.id = 'modalError';
        err.style.cssText = 'color:#e74c3c;font-size:0.85rem;margin-top:8px;text-align:center;';
        document.querySelector('.modal-content').appendChild(err);
    }
    err.innerText = msg;
}

function resetApp() {
    localStorage.clear();
    location.reload();
}