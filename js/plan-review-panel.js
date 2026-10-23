// Read-only panel that shows the student's Phase 1 plan inside the essay workspace.
// The slide engine blocks going back on the first attempt, so the plan is mirrored here.
// Usage: PlanReviewPanel.mount({ title, getEntries: () => [{ label, text }] })
const PlanReviewPanel = (() => {
    const PANEL_STYLE =
        'margin-bottom:12px; border:1px solid #dee2e6; border-radius:8px; overflow:hidden; background:#fff;';
    const TOGGLE_STYLE =
        'width:100%; display:flex; justify-content:space-between; align-items:center;' +
        'padding:10px 14px; background:#f8f9fa; border:none; cursor:pointer;' +
        'font-size:0.9rem; font-weight:600; color:#495057;';
    const BODY_STYLE = 'padding:10px 14px; font-size:0.86rem; line-height:1.6; color:#333;';
    const ENTRY_STYLE = 'margin:0 0 8px 0;';
    const LABEL_STYLE = 'font-weight:700; color:#2c3e50;';

    function mount({ title, getEntries }) {
        const essaySlide = document.getElementById('essaySlide');
        const essayInput = document.getElementById('essayInput');
        if (!essaySlide || !essayInput) return;

        const panel = document.createElement('div');
        panel.id = 'planReviewPanel';
        panel.style.cssText = PANEL_STYLE;

        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.style.cssText = TOGGLE_STYLE;
        const titleSpan = document.createElement('span');
        titleSpan.textContent = '\u{1F4DD} ' + title;
        const arrowSpan = document.createElement('span');
        arrowSpan.style.cssText = 'font-size:0.7rem; color:#adb5bd;';
        toggleButton.append(titleSpan, arrowSpan);

        const body = document.createElement('div');
        body.style.cssText = BODY_STYLE;

        panel.append(toggleButton, body);
        essayInput.parentNode.insertBefore(panel, essayInput);

        let isOpen = true;
        const applyOpenState = () => {
            body.style.display = isOpen ? 'block' : 'none';
            arrowSpan.textContent = isOpen ? '▲' : '▼';
        };

        const renderEntries = () => {
            body.textContent = '';
            getEntries().forEach(entry => {
                const entryRow = document.createElement('p');
                entryRow.style.cssText = ENTRY_STYLE;
                const labelSpan = document.createElement('span');
                labelSpan.style.cssText = LABEL_STYLE;
                labelSpan.textContent = entry.label + ' ';
                entryRow.append(labelSpan, document.createTextNode(entry.text || '(not provided)'));
                body.appendChild(entryRow);
            });
        };

        toggleButton.addEventListener('click', () => {
            isOpen = !isOpen;
            applyOpenState();
        });

        // The plan is written after the engine mounts the workspace, so refresh
        // every time the essay slide becomes the active one.
        new MutationObserver(() => {
            if (essaySlide.classList.contains('active')) renderEntries();
        }).observe(essaySlide, { attributes: true, attributeFilter: ['class'] });

        renderEntries();
        applyOpenState();
    }

    return { mount };
})();
