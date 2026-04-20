# Guía de Verificación Manual (Próxima Sesión)

Este documento detalla las pruebas manuales que debes realizar para confirmar que el nuevo **Modo Instructor Manual** funciona correctamente en producción.

## Pasos de Verificación

### 1. Inicio de Sesión Limpio
- Abre la web en una ventana de **Incógnito**.
- Logueate con tu cuenta: `arturo.rodriguez@uleam.edu.ec`.
- **Verificación**: Confirma que aparece el botón de **Modo Instructor** (icono de capas) en la parte inferior de la barra lateral izquierda.

### 2. Comportamiento por Defecto (Student View)
- Abre cualquier lección (ej: *Why Write?*).
- **Verificación**: Asegúrate de que **NO** aparece la barra de admin en la parte superior. La lección debe pedirte que respondas preguntas para continuar, igual que a un alumno.

### 3. Activación Manual (Instante)
- Con la lección abierta, pulsa el botón **Modo Instructor** en la sidebar de la izquierda.
- Pulsa "Aceptar" en el aviso de confirmación.
- **Verificación**: La barra oscura de administración (`ADMIN MODE | BACK | NEXT | TEACHER HELPER`) debe aparecer **de inmediato** en la parte superior de la lección, sin recargar la página.

### 4. Desactivación (Instante)
- Pulsa de nuevo el botón **Modo Instructor** en la sidebar.
- **Verificación**: La barra de administración debe desaparecer al instante y la lección volver a su estado de estudiante.

### 5. Acceso al Dashboard
- Pulsa el mismo botón o navega a `/admin.html`.
- **Verificación**: Confirma que puedes acceder al generador de lecciones y a la consola de IA sin que te pida el código `instructor2025` de nuevo (ya que estás logueado como admin).

---

> [!IMPORTANT]
> Si algo no funciona como se describe, por favor realiza un **Ctrl + F5** dentro de la lección para limpiar la caché de los motores JavaScript (`slide-engine.js` / `reading-engine.js`).
