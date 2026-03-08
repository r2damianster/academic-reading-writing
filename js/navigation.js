/**
 * js/navigation.js
 * Control de navegación, seguridad y registro de actividad
 */

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
}

function loadPage(url) {
    // 1. SEGURIDAD: Si no hay datos del estudiante, forzar el registro
    if (!localStorage.getItem('studentName')) {
        const modal = document.getElementById('welcomeModal');
        if (modal) modal.style.display = 'flex';
        return;
    }

    const frame = document.getElementById('contentFrame');

    if (frame) {
        console.log("Navigating to:", url);

        // 2. TRUCO DE CACHÉ: v=Timestamp asegura que cargue el archivo más reciente de GitHub
        const versionedUrl = url + (url.includes('?') ? '&' : '?') + "v=" + Date.now();
        frame.src = versionedUrl;

        // 3. REGISTRO AUTOMÁTICO: Si existe la función en report.js, guarda el progreso
        // En js/navigation.js
        if (typeof window.logActivity === 'function') {
            const activityName = url.split('/').pop().replace('.html', '').replace(/-/g, ' ');
            // Enviamos false en el tercer parámetro para indicar que es solo una visita
            window.logActivity(activityName, "Visited", false); 
        }
    }

    // 4. UX MÓVIL: Cerrar sidebar tras hacer clic en una opción
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
        toggleSidebar();
    }
}