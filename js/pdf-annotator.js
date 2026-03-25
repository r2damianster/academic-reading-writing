/* =============================================================================
   pdf-annotator.js — Versión Corregida para ULEAM
   ============================================================================= */

class PDFAnnotator {
    constructor(containerId, pdfUrl) {
        this.containerId = containerId;
        this.pdfUrl = pdfUrl;
        this.pdfDoc = null;
        this.currentPage = 1;
    }

    async init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        try {
            const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            
            // Render inicial
            await this.renderPage(this.currentPage);
            
            // Escuchar la selección de texto
            this.setupSelectionListener();
            return true; // Para confirmar que terminó la carga
        } catch (error) {
            console.error("Error cargando PDF:", error);
            container.innerHTML = `<p style="color:red">Error: No se pudo cargar el PDF.</p>`;
        }
    }

    async renderPage(num) {
        const page = await this.pdfDoc.getPage(num);
        const container = document.getElementById(this.containerId);
        
        // Limpiamos el canvas anterior
        container.innerHTML = '';

        // CÁLCULO DE ESCALA DINÁMICA (Para que no se vea gigante)
        const containerWidth = container.clientWidth || 800;
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth / unscaledViewport.width) * 0.95; // 95% del ancho
        
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)"; // Un poco de estilo

        container.appendChild(canvas);

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        await page.render(renderContext).promise;
        this.updateUI();
    }

    // MÉTODOS DE NAVEGACIÓN
    async prevPage() {
        if (this.currentPage <= 1) return;
        this.currentPage--;
        await this.renderPage(this.currentPage);
    }

    async nextPage() {
        if (this.currentPage >= this.pdfDoc.numPages) return;
        this.currentPage++;
        await this.renderPage(this.currentPage);
    }

    updateUI() {
        // Buscamos los elementos de info de página en el slide actual
        const parent = document.getElementById(this.containerId).parentElement;
        const pageDisplay = parent.querySelector('.current-page');
        const totalDisplay = parent.querySelector('.total-pages');
        
        if (pageDisplay) pageDisplay.textContent = this.currentPage;
        if (totalDisplay) totalDisplay.textContent = this.pdfDoc.numPages;
    }

    setupSelectionListener() {
        document.addEventListener('mouseup', () => this.checkSelection());
        document.addEventListener('touchend', () => this.checkSelection());
    }

    checkSelection() {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.split(/\s+/).length > 3) {
            const currentSlide = document.querySelector('.slide.active');
            const slideIndex = Array.from(document.querySelectorAll('.slide')).indexOf(currentSlide);
            
            if (typeof validateReadingTask === 'function') {
                validateReadingTask(slideIndex, selectedText);
            }
        }
    }
}