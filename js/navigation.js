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
        if (typeof window.logActivity === 'function') {
            // Limpiamos el nombre de la URL para que el reporte se vea bonito
            const activityName = url.split('/').pop().replace('.html', '').replace(/-/g, ' ');
            window.logActivity(activityName, "Visited");
        }
    }

    // 4. UX MÓVIL: Cerrar sidebar tras hacer clic en una opción
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
        toggleSidebar();
    }
}