/* js/auth.js */

function saveAndStart() {
    // 1. Captura de datos básicos
    const name            = document.getElementById('inputName').value.trim();
    const email           = document.getElementById('inputEmail').value.trim();
    const course          = document.getElementById('inputCourse').value.trim();
    const major           = document.getElementById('inputMajor').value.trim();
    const institution     = document.getElementById('inputInstitution').value.trim();
    const practiceType    = document.getElementById('inputPracticeType').value.trim();
    
    // 2. Captura de estados de los checkboxes
    const academicConsent = document.getElementById('inputConsent').checked;
    const researchConsent = document.getElementById('inputResearchConsent').checked;

    // 3. Validaciones de campos vacíos y correo
    if (!name || !email || !course || !major || !institution || !practiceType) {
        showModalError("Please complete all fields before continuing.");
        return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@(live\.)?uleam\.edu\.ec$/;
    if (!emailPattern.test(email)) {
        showModalError("Only institutional emails (@uleam.edu.ec or @live.uleam.edu.ec) are accepted.");
        return;
    }

    // 4. Validación de consentimiento de integridad (Bloqueante)
    if (!academicConsent) {
        showModalError("You must accept the data monitoring policy to use this platform.");
        return;
    }

    // 5. Guardado en LocalStorage de toda la información
    localStorage.setItem('studentName',         name);
    localStorage.setItem('studentEmail',        email);
    localStorage.setItem('studentCourse',       course);
    localStorage.setItem('studentMajor',        major);
    localStorage.setItem('studentInstitution',  institution);
    localStorage.setItem('studentPracticeType', practiceType);
    
    // Guardamos los consentimientos como "Yes" o "No"
    localStorage.setItem('studentAcademicConsent', academicConsent ? 'Yes' : 'No');
    localStorage.setItem('studentResearchConsent', researchConsent ? 'Yes' : 'No');
    
    localStorage.setItem('lastLoginTimestamp',  new Date().getTime());

    // 6. Reiniciar para entrar a la App
    location.reload();
}
