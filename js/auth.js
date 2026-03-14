/* js/auth.js 
 * Versión 1.7: Corregido mapeo de columnas y lógica de limpieza
 */

document.addEventListener('DOMContentLoaded', () => checkStudentStatus());

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

    try {
        const response = await fetch('/api/validate-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        // Verificamos si la respuesta es exitosa antes de parsear
        if (!response.ok) {
            // Si el servidor responde 404 o 500, limpiamos para evitar bucles
            console.warn("Usuario no válido en la base de datos, limpiando sesión...");
            localStorage.clear(); 
            if (modal) modal.style.display = 'flex';
            return;
        }

        const serverResult = await response.json();

        // 2️⃣ Guardar/actualizar datos (USANDO name y major)
        localStorage.setItem('studentName',        serverResult.name || "Authorized User");
        localStorage.setItem('studentEmail',       serverResult.email);
        localStorage.setItem('studentCourse',      serverResult.course || "N/A");
        localStorage.setItem('studentMajor',       serverResult.major || "Student");
        localStorage.setItem('studentInstitution', "ULEAM");
        localStorage.setItem('lastLoginTimestamp', new Date().getTime());

        // 3️⃣ UI Update
        if (modal) modal.style.display = 'none';
        if (display) display.innerText = "Active: " + (serverResult.name || "Student");

        // Solo cargar si estamos en el index y el frame está vacío
        const frame = document.getElementById('contentFrame');
        if (frame && frame.src.includes('welcome-content.html')) {
            // Ya está cargado o se cargará por defecto
        }

    } catch (err) {
        console.error("Connection Error:", err);
        // No reseteamos aquí por si es un fallo temporal del WiFi
        if (modal) modal.style.display = 'none'; // Opcional: permitir ver contenido offline
    }
}

async function saveAndStart() {
    const emailInput = document.getElementById('inputEmail');
    const email = emailInput ? emailInput.value.trim() : "";
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

    try {
        showModalError("Verifying credentials...", "step2Error");

        const response = await fetch('/api/validate-student', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const serverResult = await response.json();

        if (!response.ok) {
            showModalError(serverResult.message || "User not found.", "step2Error");
            return;
        }

        // 3. AUTO-CARGA DE DATOS
        localStorage.setItem('studentName',        serverResult.name || "Authorized User");
        localStorage.setItem('studentEmail',       serverResult.email);
        localStorage.setItem('studentCourse',      serverResult.course || "N/A");
        localStorage.setItem('studentMajor',       serverResult.major || "Student");
        localStorage.setItem('studentInstitution', "ULEAM");
        
        // Datos específicos de la sesión
        localStorage.setItem('studentPracticeType', practiceType);
        localStorage.setItem('studentAcademicConsent', 'Yes');
        localStorage.setItem('studentResearchConsent', researchConsent ? 'Yes' : 'No');
        localStorage.setItem('lastLoginTimestamp', new Date().getTime());

        // 4. Entrar
        location.reload();

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