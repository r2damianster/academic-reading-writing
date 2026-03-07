document.addEventListener('DOMContentLoaded', () => checkStudentStatus());

function checkStudentStatus() {
    const name = localStorage.getItem('studentName');
    const loginTimestamp = localStorage.getItem('lastLoginTimestamp');
    const modal = document.getElementById('welcomeModal');
    const display = document.getElementById('studentDisplay');

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
    const name = document.getElementById('inputName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    if (!name || !email) {
        alert("Please enter both details.");
        return;
    }
    localStorage.setItem('studentName', name);
    localStorage.setItem('studentEmail', email);
    localStorage.setItem('lastLoginTimestamp', new Date().getTime());
    location.reload();
}

function resetApp() {
    localStorage.clear();
    location.reload();
}