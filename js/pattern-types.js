/* =============================================================================
   js/pattern-types.js — Tipos de slide para la categoría "05. Writing Patterns"
   Se carga DESPUÉS de slide-engine.js (mismo patrón que build-up.js).
   El motor monta estos tipos mediante el `default` del switch de init().

   TIPOS
   ─────────────────────────────────────────────────────────────────────────
   MOVE_TAG     El estudiante asigna a cada segmento el "move" retórico que
                cumple (Point, Evidence, Claim, Warrant...). Feedback al validar.
   WAVE         El estudiante ubica cada oración en la onda semántica
                (abstracta ↔ concreta). Modo "show" solo dibuja la onda.
   PHRASE_BANK  Frases plantilla por move; el estudiante las guarda en su
                cuaderno personal (localStorage).

   USO EN HTML
   ─────────────────────────────────────────────────────────────────────────
   <div class="slide" data-type="MOVE_TAG"
        data-pt-moves="Point|Evidence|Explanation|Link">
     <h2>Take it apart</h2>
     <p data-se-instruction>Label each sentence with its move.</p>
     <div data-pt-segment data-pt-answer="Point" data-pt-why="Why (opcional)">Sentence…</div>
   </div>

   <div class="slide" data-type="WAVE" data-pt-mode="place|show">
     <div data-pt-wave-item data-pt-level="3|2|1" data-pt-why="…">Sentence…</div>
   </div>

   <div class="slide" data-type="PHRASE_BANK" data-pt-pattern="peel">
     <div data-pt-phrase-group data-pt-label="Point — announce the idea">
       <span data-pt-phrase>One important factor in [topic] is…</span>
     </div>
   </div>
----------------------------------------------------------------------------- */

/* ── Cuaderno personal de frases (compartido con phrase-bank.html) ────────── */
const PatternNotebook = {
    STORAGE_KEY: 'pw_phrase_notebook',

    load() {
        try {
            const stored = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
            return Array.isArray(stored) ? stored : [];
        } catch (error) {
            return [];
        }
    },

    _persist(entries) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
        } catch (error) {
            console.warn('PatternNotebook: no se pudo guardar', error.message);
        }
    },

    has(phraseText) {
        return this.load().some(entry => entry.phrase === phraseText);
    },

    add(phraseText, groupLabel, patternKey) {
        const entries = this.load();
        if (entries.some(entry => entry.phrase === phraseText)) return false;
        entries.push({
            phrase:  phraseText,
            group:   groupLabel || '',
            pattern: patternKey || '',
            savedAt: new Date().toISOString()
        });
        this._persist(entries);
        return true;
    },

    remove(phraseText) {
        this._persist(this.load().filter(entry => entry.phrase !== phraseText));
    },

    count() {
        return this.load().length;
    }
};

/* ── Colores de moves: fijos para que Point sea siempre del mismo color ───── */
const PATTERN_MOVE_COLORS = {
    // idea / afirmación
    'point': '#2563eb', 'claim': '#2563eb', 'main idea': '#2563eb', 'topic sentence': '#2563eb',
    'topic': '#2563eb', 'general': '#2563eb', 'territory': '#2563eb', 'situation': '#2563eb',
    'they say': '#0e7490', 'introduce': '#0e7490', 'introduction': '#0e7490',
    // evidencia
    'evidence': '#16a34a', 'grounds': '#16a34a', 'cite': '#16a34a', 'results': '#16a34a',
    'illustration': '#16a34a', 'specific': '#16a34a', 'methods': '#15803d',
    // interpretación
    'explanation': '#ea580c', 'reasoning': '#ea580c', 'warrant': '#ea580c', 'analysis': '#ea580c',
    'explain': '#ea580c', 'evaluation': '#ea580c', 'discussion': '#ea580c', 'restriction': '#ea580c',
    // conexión / problema
    'link': '#7c3aed', 'i say': '#7c3aed', 'occupy the niche': '#7c3aed', 'response': '#7c3aed',
    'problem': '#dc2626', 'niche': '#dc2626', 'establish a niche': '#dc2626',
    'concession': '#be185d', 'counterargument': '#9333ea', 'reaffirmation': '#7c3aed',
    'qualifier': '#ca8a04', 'rebuttal': '#dc2626', 'backing': '#0d9488',
    'hedge': '#ca8a04', 'booster': '#0891b2', 'no marker': '#64748b',
    // dado / nuevo
    'given': '#0e7490', 'new': '#ea580c', 'bridge': '#64748b', 'intermediate': '#ca8a04',
    // debate, concesión, comparación
    'counter-voice': '#9333ea', 'reply': '#0e7490', 'acknowledged limitation': '#be185d',
    'frame': '#2563eb', 'a (productive skills)': '#16a34a', 'b (receptive skills)': '#ea580c', 'synthesis': '#7c3aed',
    // causa-efecto, clasificación, proceso
    'effect': '#dc2626', 'signal': '#64748b', 'cause': '#2563eb', 'classifier': '#2563eb', 'category': '#16a34a',
    'step 1': '#2563eb', 'step 2': '#16a34a', 'step 3': '#ea580c', 'step 4': '#7c3aed',
    // CARS y ruptura de patrón
    'establish a territory': '#2563eb', 'litotes (distancing)': '#ca8a04', 'given finding': '#16a34a', 'link (disguised)': '#7c3aed'
};
const PATTERN_FALLBACK_COLORS = ['#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#dc2626', '#0d9488', '#ca8a04', '#be185d'];

function _patternMoveColor(moveLabel, fallbackIndex) {
    const normalized = String(moveLabel || '').toLowerCase().trim();
    return PATTERN_MOVE_COLORS[normalized]
        || PATTERN_FALLBACK_COLORS[fallbackIndex % PATTERN_FALLBACK_COLORS.length];
}

function _patternEscapeHtml(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

if (typeof SlideTypes !== 'undefined') {

    /* ─────────────────────────────────────────────────────────────────────
       MOVE_TAG
    ───────────────────────────────────────────────────────────────────── */
    SlideTypes.MOVE_TAG = {
        mount(slide, index) {
            const moveLabels = String(slide.dataset.ptMoves || '')
                .split('|').map(label => label.trim()).filter(Boolean);
            const segmentElements = Array.from(slide.querySelectorAll('[data-pt-segment]'));
            if (!moveLabels.length || !segmentElements.length) return;

            const legend = document.createElement('div');
            legend.className = 'pt-legend';
            moveLabels.forEach((moveLabel, moveIndex) => {
                const legendItem = document.createElement('span');
                legendItem.className = 'pt-legend-item';
                legendItem.style.setProperty('--pt-color', _patternMoveColor(moveLabel, moveIndex));
                legendItem.textContent = moveLabel;
                legend.appendChild(legendItem);
            });
            segmentElements[0].parentNode.insertBefore(legend, segmentElements[0]);

            const segments = segmentElements.map((segmentElement, segmentIndex) => {
                const answer = segmentElement.dataset.ptAnswer;
                const whyText = segmentElement.dataset.ptWhy || '';
                const sentenceText = segmentElement.innerHTML;

                segmentElement.classList.add('pt-segment');
                segmentElement.innerHTML = `
                    <div class="pt-segment-text"><span class="pt-segment-number">${segmentIndex + 1}</span>${sentenceText}</div>
                    <div class="pt-chip-row"></div>
                    <div class="pt-segment-result" style="display:none;"></div>`;

                const chipRow = segmentElement.querySelector('.pt-chip-row');
                const state = { element: segmentElement, answer, whyText, chosenMove: null };

                moveLabels.forEach((moveLabel, moveIndex) => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'pt-chip';
                    chip.textContent = moveLabel;
                    chip.style.setProperty('--pt-color', _patternMoveColor(moveLabel, moveIndex));
                    chip.addEventListener('click', () => {
                        if (slide.dataset.seLocked === 'true') return;
                        state.chosenMove = moveLabel;
                        chipRow.querySelectorAll('.pt-chip').forEach(otherChip => {
                            otherChip.classList.toggle('pt-chip-selected', otherChip === chip);
                        });
                        refreshCheckButton();
                    });
                    chipRow.appendChild(chip);
                });
                return state;
            });

            const checkButton = document.createElement('button');
            checkButton.type = 'button';
            checkButton.className = 'pt-check-button';
            checkButton.textContent = 'Check my labels';
            checkButton.style.display = 'none';
            slide.appendChild(checkButton);

            const feedback = document.createElement('div');
            feedback.className = 'pt-feedback';
            feedback.id = `pt-tag-feedback-${index}`;
            feedback.style.display = 'none';
            slide.appendChild(feedback);

            function refreshCheckButton() {
                const allLabeled = segments.every(segment => segment.chosenMove);
                checkButton.style.display = allLabeled && slide.dataset.seLocked !== 'true' ? 'inline-block' : 'none';
            }

            checkButton.addEventListener('click', () => {
                if (slide.dataset.seLocked === 'true') return;
                slide.dataset.seLocked = 'true';
                checkButton.style.display = 'none';

                let wrongCount = 0;
                segments.forEach(segment => {
                    const isCorrect = segment.chosenMove.toLowerCase() === String(segment.answer).toLowerCase();
                    const resultBox = segment.element.querySelector('.pt-segment-result');
                    segment.element.classList.add(isCorrect ? 'pt-segment-correct' : 'pt-segment-wrong');
                    segment.element.querySelectorAll('.pt-chip').forEach(chip => { chip.disabled = true; });

                    const whyHtml = segment.whyText ? ` <span class="pt-why">${segment.whyText}</span>` : '';
                    resultBox.innerHTML = isCorrect
                        ? `&#x2705; <strong>${_patternEscapeHtml(segment.answer)}</strong>.${whyHtml}`
                        : `&#x274C; You chose <em>${_patternEscapeHtml(segment.chosenMove)}</em>. This is the <strong>${_patternEscapeHtml(segment.answer)}</strong> move.${whyHtml}`;
                    resultBox.style.display = 'block';
                    if (!isCorrect) wrongCount++;
                });

                if (wrongCount > 0) window.mistakes = (window.mistakes || 0) + 1;
                feedback.innerHTML = wrongCount === 0
                    ? '&#x2705; All moves identified. Notice how each move prepares the next.'
                    : `&#x26A0;&#xFE0F; ${segments.length - wrongCount} of ${segments.length} correct. Read the notes above, then continue.`;
                feedback.style.color = wrongCount === 0 ? '#27ae60' : '#c0392b';
                feedback.style.display = 'block';

                const nextButton = slide.querySelector('.btn-next');
                if (nextButton) nextButton.style.display = 'block';
            });

            _appendNextButton(slide, { hidden: true });
        }
    };

    /* ─────────────────────────────────────────────────────────────────────
       WAVE
    ───────────────────────────────────────────────────────────────────── */
    SlideTypes.WAVE = {
        LEVEL_LABELS: { 3: 'Abstract idea', 2: 'In between', 1: 'Concrete detail' },

        // Dibuja la onda como SVG. studentLevels es opcional (línea punteada).
        _drawWave(correctLevels, studentLevels) {
            const width = 600, height = 190, paddingX = 40;
            const levelToY = level => ({ 3: 30, 2: 95, 1: 160 }[level] || 95);
            const stepX = correctLevels.length > 1 ? (width - paddingX * 2) / (correctLevels.length - 1) : 0;
            const pointsOf = levels => levels.map((level, pointIndex) => ({
                x: paddingX + stepX * pointIndex, y: levelToY(level)
            }));
            const smoothPath = points => {
                if (points.length < 2) return '';
                let path = `M ${points[0].x} ${points[0].y}`;
                for (let pointIndex = 1; pointIndex < points.length; pointIndex++) {
                    const previous = points[pointIndex - 1], current = points[pointIndex];
                    const controlX = (previous.x + current.x) / 2;
                    path += ` C ${controlX} ${previous.y}, ${controlX} ${current.y}, ${current.x} ${current.y}`;
                }
                return path;
            };

            const correctPoints = pointsOf(correctLevels);
            const studentLayer = studentLevels
                ? `<path d="${smoothPath(pointsOf(studentLevels))}" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6 5"/>`
                : '';
            const circles = correctPoints.map((point, pointIndex) => `
                <circle cx="${point.x}" cy="${point.y}" r="13" fill="#1a2a6c"/>
                <text x="${point.x}" y="${point.y + 4.5}" text-anchor="middle" fill="#fff" font-size="13" font-weight="700">${pointIndex + 1}</text>`).join('');

            return `<svg viewBox="0 0 ${width} ${height}" class="pt-wave-svg" role="img" aria-label="Semantic wave of the paragraph">
                <line x1="${paddingX - 20}" y1="30"  x2="${width - 10}" y2="30"  stroke="#e2e8f0" stroke-dasharray="3 4"/>
                <line x1="${paddingX - 20}" y1="160" x2="${width - 10}" y2="160" stroke="#e2e8f0" stroke-dasharray="3 4"/>
                <text x="4" y="22" font-size="11" fill="#64748b">abstract</text>
                <text x="4" y="182" font-size="11" fill="#64748b">concrete</text>
                ${studentLayer}
                <path d="${smoothPath(correctPoints)}" fill="none" stroke="#3498db" stroke-width="3.5"/>
                ${circles}
            </svg>`;
        },

        mount(slide, index) {
            const itemElements = Array.from(slide.querySelectorAll('[data-pt-wave-item]'));
            if (!itemElements.length) return;
            const isShowMode = (slide.dataset.ptMode || 'place').toLowerCase() === 'show';

            const items = itemElements.map((itemElement, itemIndex) => {
                const correctLevel = parseInt(itemElement.dataset.ptLevel, 10) || 2;
                const whyText = itemElement.dataset.ptWhy || '';
                const sentenceText = itemElement.innerHTML;
                itemElement.classList.add('pt-wave-item');
                itemElement.innerHTML = `
                    <div class="pt-segment-text"><span class="pt-segment-number">${itemIndex + 1}</span>${sentenceText}</div>
                    <div class="pt-chip-row"></div>
                    <div class="pt-segment-result" style="display:none;"></div>`;
                return { element: itemElement, correctLevel, whyText, chosenLevel: null };
            });

            const waveContainer = document.createElement('div');
            waveContainer.className = 'pt-wave-container';
            slide.appendChild(waveContainer);

            if (isShowMode) {
                items.forEach(item => {
                    item.element.querySelector('.pt-chip-row').remove();
                    if (item.whyText) {
                        const resultBox = item.element.querySelector('.pt-segment-result');
                        resultBox.innerHTML = `<span class="pt-why">${item.whyText}</span>`;
                        resultBox.style.display = 'block';
                    }
                });
                waveContainer.innerHTML = this._drawWave(items.map(item => item.correctLevel), null);
                _appendNextButton(slide, { hidden: false });
                return;
            }

            const checkButton = document.createElement('button');
            checkButton.type = 'button';
            checkButton.className = 'pt-check-button';
            checkButton.textContent = 'Draw the wave';
            checkButton.style.display = 'none';
            slide.appendChild(checkButton);

            const feedback = document.createElement('div');
            feedback.className = 'pt-feedback';
            feedback.id = `pt-wave-feedback-${index}`;
            feedback.style.display = 'none';
            slide.appendChild(feedback);

            const refreshCheckButton = () => {
                const allPlaced = items.every(item => item.chosenLevel);
                checkButton.style.display = allPlaced && slide.dataset.seLocked !== 'true' ? 'inline-block' : 'none';
            };

            items.forEach(item => {
                const chipRow = item.element.querySelector('.pt-chip-row');
                [3, 2, 1].forEach(level => {
                    const chip = document.createElement('button');
                    chip.type = 'button';
                    chip.className = 'pt-chip';
                    chip.textContent = this.LEVEL_LABELS[level];
                    chip.style.setProperty('--pt-color', { 3: '#7c3aed', 2: '#ca8a04', 1: '#16a34a' }[level]);
                    chip.addEventListener('click', () => {
                        if (slide.dataset.seLocked === 'true') return;
                        item.chosenLevel = level;
                        chipRow.querySelectorAll('.pt-chip').forEach(otherChip => {
                            otherChip.classList.toggle('pt-chip-selected', otherChip === chip);
                        });
                        refreshCheckButton();
                    });
                    chipRow.appendChild(chip);
                });
            });

            checkButton.addEventListener('click', () => {
                if (slide.dataset.seLocked === 'true') return;
                slide.dataset.seLocked = 'true';
                checkButton.style.display = 'none';

                let wrongCount = 0;
                items.forEach(item => {
                    const isCorrect = item.chosenLevel === item.correctLevel;
                    const resultBox = item.element.querySelector('.pt-segment-result');
                    item.element.classList.add(isCorrect ? 'pt-segment-correct' : 'pt-segment-wrong');
                    item.element.querySelectorAll('.pt-chip').forEach(chip => { chip.disabled = true; });
                    const whyHtml = item.whyText ? ` <span class="pt-why">${item.whyText}</span>` : '';
                    resultBox.innerHTML = isCorrect
                        ? `&#x2705; ${this.LEVEL_LABELS[item.correctLevel]}.${whyHtml}`
                        : `&#x274C; This one sits at <strong>${this.LEVEL_LABELS[item.correctLevel]}</strong>.${whyHtml}`;
                    resultBox.style.display = 'block';
                    if (!isCorrect) wrongCount++;
                });

                if (wrongCount > 0) window.mistakes = (window.mistakes || 0) + 1;
                waveContainer.innerHTML = this._drawWave(
                    items.map(item => item.correctLevel),
                    items.map(item => item.chosenLevel)
                );
                feedback.innerHTML = wrongCount === 0
                    ? '&#x2705; Your wave matches. Solid line = the real wave.'
                    : '&#x26A0;&#xFE0F; Solid blue line = the real wave. Dashed grey = your placement.';
                feedback.style.color = wrongCount === 0 ? '#27ae60' : '#c0392b';
                feedback.style.display = 'block';

                const nextButton = slide.querySelector('.btn-next');
                if (nextButton) nextButton.style.display = 'block';
            });

            _appendNextButton(slide, { hidden: true });
        }
    };

    /* ─────────────────────────────────────────────────────────────────────
       PHRASE_BANK
    ───────────────────────────────────────────────────────────────────── */
    SlideTypes.PHRASE_BANK = {
        mount(slide, index) {
            const patternKey = slide.dataset.ptPattern || '';
            const groupElements = Array.from(slide.querySelectorAll('[data-pt-phrase-group]'));
            if (!groupElements.length) return;

            const counter = document.createElement('div');
            counter.className = 'pt-notebook-counter';
            const refreshCounter = () => {
                counter.innerHTML = `&#x1F4D2; Phrases in your notebook: <strong>${PatternNotebook.count()}</strong>
                    &nbsp;&middot;&nbsp; <a href="phrase-bank.html#notebook" target="_blank" rel="noopener">Open my notebook</a>`;
            };
            refreshCounter();
            groupElements[0].parentNode.insertBefore(counter, groupElements[0]);

            groupElements.forEach((groupElement, groupIndex) => {
                const groupLabel = groupElement.dataset.ptLabel || '';
                const phrases = Array.from(groupElement.querySelectorAll('[data-pt-phrase]'))
                    .map(phraseElement => phraseElement.textContent.trim());
                groupElement.innerHTML = '';
                groupElement.classList.add('pt-phrase-group');
                groupElement.style.setProperty('--pt-color', _patternMoveColor(groupLabel.split(/[—-]/)[0], groupIndex));

                const heading = document.createElement('div');
                heading.className = 'pt-phrase-heading';
                heading.textContent = groupLabel;
                groupElement.appendChild(heading);

                phrases.forEach(phraseText => {
                    const row = document.createElement('div');
                    row.className = 'pt-phrase-row';
                    const textSpan = document.createElement('span');
                    textSpan.className = 'pt-phrase-text';
                    textSpan.textContent = phraseText;
                    const saveButton = document.createElement('button');
                    saveButton.type = 'button';
                    saveButton.className = 'pt-save-button';

                    const paintButton = () => {
                        const isSaved = PatternNotebook.has(phraseText);
                        saveButton.textContent = isSaved ? '✓ Saved' : '+ Save';
                        saveButton.classList.toggle('pt-save-button-done', isSaved);
                    };
                    paintButton();
                    saveButton.addEventListener('click', () => {
                        if (PatternNotebook.has(phraseText)) PatternNotebook.remove(phraseText);
                        else PatternNotebook.add(phraseText, groupLabel, patternKey);
                        paintButton();
                        refreshCounter();
                    });

                    row.appendChild(textSpan);
                    row.appendChild(saveButton);
                    groupElement.appendChild(row);
                });
            });

            _appendNextButton(slide, { hidden: false });
        }
    };
}
