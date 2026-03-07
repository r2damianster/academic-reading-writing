function loadPage(url) {
    // 1. MANTENER SEGURIDAD: Si no hay nombre, no pasa
    if (!localStorage.getItem('studentName')) {
        document.getElementById('welcomeModal').style.display = 'flex';
        return;
    }

    const frame = document.getElementById('contentFrame');
    if (frame) {
        console.log("Navigating to:", url);
        
        // 2. TRUCO DE CACHÉ: Solo aplicamos el timestamp aquí
        // Esto garantiza que el archivo sea siempre el más nuevo
        const versionedUrl = url + (url.includes('?') ? '&' : '?') + "v=" + Date.now();
        frame.src = versionedUrl;
    }

    // 3. UX MÓVIL: Cerrar sidebar tras clic
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
}