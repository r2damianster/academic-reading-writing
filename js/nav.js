/* js/nav.js
 * Árbol de navegación del curso.
 */

const MENU = [
  {
    label: 'Main',
    path: 'welcome-content.html'
  },
  {
    label: '00. Fundamentals',
    path: 'modules/00-fundamentals/fundamentals-hub.html',
    children: [
      { label: '1. The One-Point Rule',        path: 'modules/00-fundamentals/one-idea.html' },
      { label: '2. Topic Sentences',           path: 'modules/00-fundamentals/topic-sentences.html' },
      { label: '3. PEER',                       path: 'modules/00-fundamentals/peer.html' },
      { label: '4. Supporting Sentences',      path: 'modules/00-fundamentals/supporting-sentences.html' },
      { label: '5. Paragraph Review',          path: 'modules/00-fundamentals/paragraph-review.html' },
      { label: '6. Organizational Patterns',   path: 'modules/00-fundamentals/organizational-patterns.html' },
      { label: '7. Body Paragraphs',           path: 'modules/00-fundamentals/body-paragraphs.html' },
      { label: '8. Conclusion Paragraphs',     path: 'modules/00-fundamentals/conclusion-paragraphs.html' },
      { label: '9. From Paragraphs to Essay',  path: 'modules/00-fundamentals/paragraphs-to-essay.html' }
    ]
  },
  {
    label: '01. Core Syllabus',
    path: 'modules/01-core-syllabus/core-hub.html',
    children: [
      {
        label: 'Unit 1: Essays',
        path: 'modules/01-core-syllabus/unit1-essays/unit1-essays-hub.html',
        children: [
          { label: 'Essay Structure',            path: 'modules/01-core-syllabus/unit1-essays/essay-structure.html' },
          { label: 'Block Pattern',              path: 'modules/01-core-syllabus/unit1-essays/block-pattern.html' },
          { label: 'Point-by-Point Pattern',     path: 'modules/01-core-syllabus/unit1-essays/point-by-point.html' },
          { label: 'Types of Essays',            path: 'modules/01-core-syllabus/unit1-essays/types-essay.html' },
          { label: 'Argumentative Essay',        path: 'modules/01-core-syllabus/unit1-essays/argumentative-essay.html' },
          { label: 'Summarizing & Paraphrasing', path: 'modules/01-core-syllabus/unit1-essays/summarizing-paraphrasing.html' }
        ]
      },
      {
        label: 'Unit 2: Research Papers',
        path: 'modules/01-core-syllabus/unit2-papers/unit2-papers-hub.html',
        children: [
          { label: 'From Essays to Research Papers', path: 'modules/01-core-syllabus/unit2-papers/essays-to-papers.html' },
          { label: 'The Logic of Research',          path: 'modules/01-core-syllabus/unit2-papers/logic-of-research.html' },
          { label: 'Sections of a Research Paper',   path: 'modules/01-core-syllabus/unit2-papers/sections-research-paper.html' },
          { label: 'Reading Chart for Research',     path: 'modules/01-core-syllabus/unit2-papers/reading-chart.html' },
          { label: 'Academic Presentation',          path: 'modules/01-core-syllabus/unit2-papers/academic-presentation.html' }
        ]
      },
      {
        label: 'APA & Integrity',
        path: 'modules/01-core-syllabus/apa-integrity/apa-integrity-hub.html',
        children: [
          { label: 'APA Style 7th Ed.',      path: 'modules/01-core-syllabus/apa-integrity/apa-style-7.html' },
          { label: 'Citation & Referencing', path: 'modules/01-core-syllabus/apa-integrity/citation-referencing.html' },
          { label: 'Research Ethics',        path: 'modules/01-core-syllabus/apa-integrity/research-ethics.html' }
        ]
      }
    ]
  },
  {
    label: '02. Toolbox',
    path: 'modules/02-toolbox/toolbox-hub.html',
    children: [
      {
        label: 'Grammar',
        path: 'modules/02-toolbox/grammar/grammar-hub.html',
        children: [
          { label: 'Passive Voice',           path: 'modules/02-toolbox/grammar/passive-voice.html' },
          { label: 'Although / Despite',      path: 'modules/02-toolbox/grammar/although-despite.html' },
          { label: 'Relative Clauses',        path: 'modules/02-toolbox/grammar/relative-clauses.html' },
          { label: 'Conditionals',            path: 'modules/02-toolbox/grammar/conditionals.html' },
          { label: 'Nominalization',          path: 'modules/02-toolbox/grammar/nominalization.html' },
          { label: 'Hedging Language',        path: 'modules/02-toolbox/grammar/hedging-language.html' }
        ]
      },
      {
        label: 'Connectors',
        path: 'modules/02-toolbox/connectors/connectors-hub.html',
        children: [
          { label: 'Transitions',             path: 'modules/02-toolbox/connectors/transitions.html' },
          { label: 'Logical Division',        path: 'modules/02-toolbox/connectors/logical-division-signals.html' },
          { label: 'Cause & Effect',          path: 'modules/02-toolbox/connectors/cause-effect-connectors.html' },
          { label: 'Contrast & Concession',   path: 'modules/02-toolbox/connectors/contrast-concession.html' },
          { label: 'Adding Information',      path: 'modules/02-toolbox/connectors/adding-information.html' }
        ]
      },
      {
        label: 'Vocabulary',
        path: 'modules/02-toolbox/vocabulary/vocabulary-hub.html',
        children: [
          { label: 'Academic Vocab 1',        path: 'modules/02-toolbox/vocabulary/vocabulary1.html' },
          { label: 'Academic Vocab 2',        path: 'modules/02-toolbox/vocabulary/vocabulary2.html' },
          { label: 'Reporting Verbs',         path: 'modules/02-toolbox/vocabulary/reporting-verbs.html' },
          { label: 'Hedging Vocabulary',      path: 'modules/02-toolbox/vocabulary/hedging-vocabulary.html' },
          { label: 'Discipline-Specific',     path: 'modules/02-toolbox/vocabulary/discipline-specific.html' }
        ]
      }
    ]
  },
  {
    label: '03. Peer System',
    path: 'modules/03-peer-review/peer-review-hub.html',
    children: [
      { label: 'Review Checklist',        path: 'modules/03-peer-review/checklist.html' },
      { label: 'How to Give Feedback',    path: 'modules/03-peer-review/how-to-give-feedback.html' },
      { label: 'How to Receive Feedback', path: 'modules/03-peer-review/how-to-receive-feedback.html' },
      { label: 'Peer Review Form',        path: 'modules/03-peer-review/peer-review-form.html' }
    ]
  },
  {
    label: '04. Tests',
    path: 'modules/04-tests/tests-hub.html',
    children: [
      { label: 'Test 1 — Fundamentals',    path: 'modules/04-tests/test1-fundamentals.html' },
      { label: 'Test 2 — Essays',          path: 'modules/04-tests/test2-essays.html' },
      { label: 'Test 3 — Research',        path: 'modules/04-tests/test3-research.html' },
      { label: 'Test 4 — Toolbox',         path: 'modules/04-tests/test4-toolbox.html' }
    ]
  }
];

/**
 * Generador del menú corregido para manejar rutas relativas 
 * y asegurar compatibilidad con iframe en GitHub Pages.
 */
function buildMenu() {
  const ul = document.getElementById('navMenu');
  if (!ul) return;
  ul.innerHTML = ""; // Limpiar antes de generar

  MENU.forEach(item => {
    const li = document.createElement('li');
    li.className = 'menu-item';

    // Formato para items principales (Main o secciones con hijos)
    const hasChildren = item.children && item.children.length > 0;
    const arrow = hasChildren ? ' ▾' : '';
    
    // Header de la sección
    const header = document.createElement('div');
    header.className = 'section-header';
    header.style.cursor = 'pointer';
    header.innerHTML = `${item.label}${arrow}`;
    
    // Al hacer clic, carga la página principal de la sección
    header.onclick = () => { if(item.path) loadPage(item.path); };
    li.appendChild(header);

    if (hasChildren) {
      const subUl = document.createElement('ul');
      subUl.className = 'sub-menu';

      item.children.forEach(child => {
        const childLi = document.createElement('li');
        
        // Si el hijo tiene nietos (como en Core Syllabus)
        if (child.children && child.children.length > 0) {
          childLi.className = 'nested-item';
          childLi.innerHTML = `<span class="nested-header" onclick="loadPage('${child.path}')">${child.label}</span>`;
          
          const nestedUl = document.createElement('ul');
          nestedUl.className = 'nested-menu';
          
          child.children.forEach(leaf => {
            const leafLi = document.createElement('li');
            leafLi.innerHTML = `<a href="#" onclick="loadPage('${leaf.path}'); return false;">${leaf.label}</a>`;
            nestedUl.appendChild(leafLi);
          });
          childLi.appendChild(nestedUl);
        } else {
          // Si es una lección directa
          childLi.innerHTML = `<a href="#" onclick="loadPage('${child.path}'); return false;">${child.label}</a>`;
        }
        subUl.appendChild(childLi);
      });
      li.appendChild(subUl);
    }
    ul.appendChild(li);
  });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('navMenu')) {
    buildMenu();
  }
});