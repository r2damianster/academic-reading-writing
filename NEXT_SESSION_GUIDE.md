# Plan de Trabajo y Verificación

Este documento detalla el estado de las funcionalidades y los próximos pasos estratégicos.

---

## ✅ Hitos Completados (Verificados)

1. **Modo Instructor Manual**: Activación y desactivación instantánea verificada.
2. **Teacher Helper Core**: Apertura de ventana y comunicación vía postMessage.
3. **Race Condition Supabase**: Singleton promise `_configReady` garantiza estabilidad.
4. **Student Progress Dashboard** (`admin-students.html`): tabla de estudiantes, badges de integridad, modal de detalle (Activity / Essays / Reading), export CSV individual y global.
5. **Endpoints admin** `api/admin-students.js` y `api/admin-student-detail.js`: usan `SUPABASE_SERVICE_KEY`, bypassan RLS. Funciones Vercel: **7 de 12**.

---

## 🔴 Bug Crítico Pendiente: Botón Admin no aparece en Sidebar

### Qué debería pasar
Al iniciar sesión como `arturo.rodriguez@uleam.edu.ec`, debe aparecer en la sidebar un botón ícono (escudo azul, `#adminMenuBtn`) que al pulsarse despliega un menú con 3 opciones: Instructor Mode, Student Progress, Instructor Panel.

### Estado actual
El botón **no aparece** en producción (Vercel). Tampoco con hard refresh ni re-login.

### Arquitectura actual del código (commit `63cd716`)

**HTML (`index.html`):**
```html
<!-- Hijo directo de .sidebar-footer, igual que los botones normales -->
<button id="adminMenuBtn" class="sf-btn" style="display:none; color:#3498db; border:1px solid #3498db77;"
        onclick="toggleAdminMenu()" title="Admin Options">
    <svg>...</svg>
</button>

<!-- Dropdown movido al body (fuera del sidebar) para evitar CSS conflict -->
<div id="adminMenu" style="display:none; position:fixed; z-index:3000; ...">
    <button>Instructor Mode</button>
    <button onclick="window.location.href='admin-students.html'">Student Progress</button>
    <button onclick="window.location.href='admin.html'">Instructor Panel</button>
</div>
```

**JS en `index.html`:**
```js
function checkAdminUI() {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const btn = document.getElementById('adminMenuBtn');
    if (btn) btn.style.display = isAdmin ? 'flex' : 'none';
}
window.addEventListener('load', checkAdminUI);
window.addEventListener('storage', checkAdminUI);

function toggleAdminMenu() {
    // Posiciona #adminMenu con getBoundingClientRect() y lo muestra/oculta
}
```

**`js/auth.js` (v1.7):**
```js
function _syncAdminUI() {
    const btn = document.getElementById('adminMenuBtn');
    if (!btn) return;
    btn.style.display = localStorage.getItem('isAdmin') === 'true' ? 'flex' : 'none';
}
// Se llama desde todos los caminos de checkStudentStatus() y saveAndStart()
```

**`localStorage` cuando el admin está logueado:**
- `isAdmin = 'true'`
- `studentRole = 'admin'`
- `studentEmail = 'arturo.rodriguez@uleam.edu.ec'`

### Lo que se ha descartado

| Causa | Por qué se descartó |
|---|---|
| `typeof checkAdminUI` fallando en auth.js | Reemplazado por `_syncAdminUI` autónoma en auth.js |
| Cache de auth.js en browser | Version bumped v1.4 → v1.7, hard refresh hecho |
| Div wrapper rompiendo flex container | Eliminado — `adminMenuBtn` es hijo directo de sidebar-footer |
| `.sidebar-footer a { display:none !important }` matando links | Los items del dropdown ahora son `<button>`, no `<a>` |
| `checkAdminUI` no llamado después del login | `_syncAdminUI` añadida en fast path, admin path y saveAndStart |
| isAdmin no guardado en localStorage | `saveAndStart()` lo setea explícitamente en línea 173 |

### Lo que NO se ha comprobado aún (próxima sesión)

1. **Verificar en la consola del browser (F12)** si `localStorage.getItem('isAdmin')` es realmente `'true'` después del login. Puede que la sesión no expire pero `isAdmin` no esté seteado por algún edge case en la ruta de auth.
2. **Verificar si `#adminMenuBtn` existe en el DOM** después del deploy: `document.getElementById('adminMenuBtn')` en consola.
3. **Comprobar si hay errores JS en consola** que estén cortando la ejecución de `_syncAdminUI`.
4. **Revisar si Vercel sirve el `index.html` cacheado** — el HTML no tiene query string de versión; puede que Vercel CDN sirva el HTML viejo. Solución: agregar un header `Cache-Control: no-store` en `vercel.json` para `index.html`.
5. **Explorar alternativa**: en lugar de JS que setea `display`, usar una clase CSS en `<body>` (e.g., `body.is-admin #adminMenuBtn { display: flex }`) y hacer que auth.js añada la clase al body. Más robusto que manipular inline styles.

### Próximo paso recomendado

Antes de tocar más código, **abrir F12 → Console en producción** y ejecutar:
```js
localStorage.getItem('isAdmin')          // debe ser 'true'
document.getElementById('adminMenuBtn')  // debe ser un elemento, no null
document.getElementById('adminMenuBtn').style.display  // debe ser 'flex'
```

Si `isAdmin` es `'true'` y el elemento existe pero `display` es `'none'`, algo lo está reseteando DESPUÉS de `_syncAdminUI`. Buscar con: `getEventListeners(document)` o añadir un `MutationObserver` al elemento.

---

## 🚀 Siguientes Features (después de resolver el bug)

### 3. Vista de Detalle por Estudiante (ya implementada en admin-students.html)
- Modal con tabs Activity / Essays / Reading ✅
- Export CSV por estudiante ✅
- Texto de ensayos expandible ✅

### 4. Mejoras futuras al dashboard
- Paginación para clases grandes (>50 estudiantes en tabla)
- Filtros por curso / alertas de integridad
- Gráfico de tendencia de integridad por semana

---

> [!IMPORTANT]
> Los motores `slide-engine.js` y `reading-engine.js` ya están preparados para enviar telemetría detallada. El siguiente paso es puramente de visualización y gestión en el dashboard administrativo.
