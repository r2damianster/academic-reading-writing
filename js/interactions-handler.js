/* js/interactions-handler.js
 * Maneja interacciones UI reutilizables para cualquier lección.
 * Cada tipo de interacción vive como un módulo interno.
 *
 * Uso actual:
 *   Interactions.DragDrop.init()         ← actividad de arrastrar y soltar
 *
 * Uso futuro (ejemplos):
 *   Interactions.Matching.init()         ← relacionar columnas
 *   Interactions.Sorting.init()          ← ordenar elementos
 *   Interactions.FillBlank.init()        ← completar espacios
 *
 * Requisitos en el HTML para DragDrop:
 *   - Elementos arrastrables:  class="draggable"   data-type="TIPO"
 *   - Zonas de destino:        class="drop-zone"    data-accept="TIPO"
 *   - Feedback:                id="s2f"             (mensaje de éxito)
 *   - Botón siguiente:         id="next2"           (se muestra al completar)
 */

window.Interactions = (function () {

    // --- DRAG & DROP ---
    const DragDrop = (function () {

        let _initialized = false;
        let _onComplete  = null;

        function init(onComplete = null) {
            if (_initialized) return;
            _initialized = true;
            _onComplete  = onComplete;

            document.querySelectorAll('.draggable').forEach(el => {
                el.setAttribute('draggable', 'true');

                el.addEventListener('dragstart', e => {
                    e.dataTransfer.setData('text/plain', el.id);
                    e.dataTransfer.effectAllowed = 'move';
                });
            });

            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.addEventListener('dragenter', e => {
                    e.preventDefault();
                    zone.style.background = '#eaf6ff';
                });

                zone.addEventListener('dragleave', () => {
                    zone.style.background = '';
                });

                zone.addEventListener('dragover', e => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });

                zone.addEventListener('drop', e => {
                    e.preventDefault();
                    zone.style.background = '';

                    const id      = e.dataTransfer.getData('text/plain');
                    const frag    = document.getElementById(id);
                    const accepts = zone.dataset.accept;

                    if (frag && frag.dataset.type === accepts) {
                        zone.innerHTML = '';
                        zone.appendChild(frag);
                        frag.setAttribute('draggable', 'false');
                        zone.style.borderColor = '#2ecc71';
                        _checkCompletion();
                    } else {
                        zone.style.borderColor = '#e74c3c';
                        setTimeout(() => zone.style.borderColor = '', 800);
                    }
                });
            });

            console.log("🖱️ Interactions.DragDrop initialized");
        }

        function _checkCompletion() {
            const zones  = document.querySelectorAll('.drop-zone');
            const filled = [...zones].every(z => z.querySelector('.draggable'));

            if (filled) {
                const feedback = document.getElementById('s2f');
                if (feedback) {
                    feedback.innerHTML     = '✅ Correct! Well done.';
                    feedback.style.color   = '#27ae60';
                    feedback.style.display = 'block';
                }
                const nextBtn = document.getElementById('next2');
                if (nextBtn) nextBtn.style.display = 'block';

                if (typeof _onComplete === 'function') _onComplete();
            }
        }

        return { init };

    })();

    // --- FUTURAS INTERACCIONES ---
    // const Matching = (function() { ... })();
    // const Sorting  = (function() { ... })();

    return { DragDrop };

})();