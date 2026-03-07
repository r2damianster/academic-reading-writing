function loadPage(url) {
    if (!localStorage.getItem('studentName')) {
        document.getElementById('welcomeModal').style.display = 'flex';
        return;
    }
    const frame = document.getElementById('contentFrame');
    if (frame) {
        console.log("Navigating to:", url);
        frame.src = url;
    }
    // Cerrar sidebar en móviles tras clic
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar?.classList.contains('active')) {
        toggleSidebar();
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar')?.classList.toggle('active');
    document.getElementById('sidebarOverlay')?.classList.toggle('active');
}