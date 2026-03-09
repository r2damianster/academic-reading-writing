/* js/auth.js 
 * Versión corregida para 2 consentimientos
 */

document.addEventListener('DOMContentLoaded', () => checkStudentStatus());

function checkStudentStatus() {
    const name           = localStorage.getItem('studentName');
    const loginTimestamp = localStorage.getItem('lastLoginTimestamp');
    const modal          = document.getElementById('welcomeModal');
    const display        = document.getElementById('studentDisplay');

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
        // Solo intentamos cargar la página si existe la función loadPage
        if (typeof loadPage === 'function') {
            loadPage('welcome-content.html');
        }
    }
}

function saveAndStart() {
    // 1. Obtener valores de texto
    const name            = document.getElementById('inputName').value.trim();
    const email           = document.getElementById('inputEmail').value.trim();
    const course          = document.getElementById('inputCourse').value.trim();
    const major           = document.getElementById('inputMajor').value.trim();
    const institution     = document.getElementById('inputInstitution').value.trim();
    const practiceType    = document.getElementById('inputPracticeType').value.trim();
    
    // 2. Obtener valores de los 2 checkboxes actuales
    const academicConsent = document.getElementById('inputConsent').checked;
    const researchConsent = document.getElementById('inputResearchConsent').checked;

    // 3. Validar campos vacíos
    if (!name || !email || !course || !major || !institution || !practiceType) {
        showModalError("Please complete all fields before continuing.");
        return;
    }

    // 4. Validar formato de correo institucional
    const emailPattern = /^[a-zA-Z0-9._%+-]+@(live\.)?uleam\.edu\.ec$/;
    if (!emailPattern.test(email)) {
        showModalError("Only institutional emails (@uleam.edu.ec or @live.uleam.edu.ec) are accepted.");
        return;
    }

    // 5. Validar consentimiento obligatorio (El de integridad académica)
    if (!academicConsent) {
        showModalError("You must accept the data monitoring policy to continue.");
        return;
    }

    // 6. Guardar en LocalStorage
    localStorage.setItem('studentName',         name);
    localStorage.setItem('studentEmail',        email);
    localStorage.setItem('studentCourse',       course);
    localStorage.setItem('studentMajor',        major);
    localStorage.setItem('studentInstitution',  institution);
    localStorage.setItem('studentPracticeType', practiceType);
    
    // Guardamos los estados de los 2 consentimientos
    localStorage.setItem('studentAcademicConsent', academicConsent ? 'Yes' : 'No');
    localStorage.setItem('studentResearchConsent', researchConsent ? 'Yes' : 'No');
    
    localStorage.setItem('lastLoginTimestamp',  new Date().getTime());

    // 7. Reiniciar para aplicar cambios y entrar
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
