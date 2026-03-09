/* js/nav.js
 * Árbol de navegación del curso.
 * Para agregar una lección nueva: añade una línea { label, path } en el array children correspondiente.
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
      { label: '1. The One-Point Rule', path: 'modules/00-fundamentals/one-idea.html' },
      { label: '2. Topic Sentences',    path: 'modules/00-fundamentals/topic-sentences.html' },
      { label: '3. PEER',               path: 'modules/00-fundamentals/peer.html' }
    ]
  },
  {
    label: '01. Core Syllabus',
    path: 'modules/01-core-syllabus/core-hub.html',
    children: [
      {
        label: 'Unit 1: Essays',
        children: [
          { label: 'Unit 1 Hub',                 path: 'modules/01-core-syllabus/unit1-essays/unit1-essays.html' },
          { label: 'Types of Essays',            path: 'modules/01-core-syllabus/unit1-essays/types-essay.html' },
          { label: 'Essay Structure',            path: 'modules/01-core-syllabus/unit1-essays/essay-structure.html' },
          { label: 'Argumentative Essay',        path: 'modules/01-core-syllabus/unit1-essays/argumentative-essay.html' },
          { label: 'Summarizing & Paraphrasing', path: 'modules/01-core-syllabus/unit1-essays/summarizing-paraphrasing.html' }
        ]
      },
      {
        label: 'Unit 2: Research Papers',
        children: [
          { label: 'Unit 2 Hub', path: 'modules/01-core-syllabus/unit2-papers/unit2-papers.html' }
        ]
      },
      {
        label: 'APA & Integrity',
        children: [
          { label: 'APA & Integrity Hub',    path: 'modules/01-core-syllabus/apa-integrity/apa-integrity.html' },
          { label: 'APA Style 7th Ed.',      path: 'modules/01-core-syllabus/apa-integrity/apa-style-7.html' },
          { label: 'Citation & Referencing', path: 'modules/01-core-syllabus/apa-integrity/citation-referencing.html' }
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
        children: [
          { label: 'Passive Voice',      path: 'modules/02-toolbox/grammar/passive-voice.html' },
          { label: 'Although / Despite', path: 'modules/02-toolbox/grammar/although-despite.html' }
        ]
      },
      {
        label: 'Connectors',
        children: [
          { label: 'Transitions', path: 'modules/02-toolbox/connectors/transitions.html' }
        ]
      },
      {
        label: 'Vocabulary',
        children: [
          { label: 'Academic Vocab 1', path: 'modules/02-toolbox/vocabulary/vocabulary1.html' }
        ]
      }
    ]
  },
  {
    label: '03. Peer System',
    path: 'modules/03-peer-review/peer-review-hub.html',
    children: [
      { label: 'Review Checklist', path: 'modules/03-peer-review/checklist.html' }
    ]
  }
];

/* ── Generador del menú ─────────────────────────────────────── */
function buildMenu() {
  const ul = document.getElementById('navMenu');
  if (!ul) return;

  MENU.forEach(item => {
    const li = document.createElement('li');
    li.className = 'menu-item';

    if (!item.children) {
      // Ítem simple (Main)
      li.innerHTML = `<div class="section-header" onclick="loadPage('${item.path}')">${item.label}</div>`;
    } else {
      // Sección con hijos
      const headerClick = item.path ? `loadPage('${item.path}')` : '';
      li.innerHTML = `<div class="section-header" onclick="${headerClick}">${item.label} ▾</div>`;

      const subUl = document.createElement('ul');
      subUl.className = 'sub-menu';

      item.children.forEach(child => {
        const childLi = document.createElement('li');

        if (!child.children) {
          // Enlace directo
          childLi.innerHTML = `<a href="#" onclick="loadPage('${child.path}')">${child.label}</a>`;
        } else {
          // Nested (Grammar, Connectors, etc.)
          childLi.className = 'nested-item';
          childLi.innerHTML = `<span class="nested-header">${child.label}</span>`;

          const nestedUl = document.createElement('ul');
          nestedUl.className = 'nested-menu';

          child.children.forEach(leaf => {
            const leafLi = document.createElement('li');
            leafLi.innerHTML = `<a href="#" onclick="loadPage('${leaf.path}')">${leaf.label}</a>`;
            nestedUl.appendChild(leafLi);
          });

          childLi.appendChild(nestedUl);
        }

        subUl.appendChild(childLi);
      });

      li.appendChild(subUl);
    }

    ul.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', buildMenu);