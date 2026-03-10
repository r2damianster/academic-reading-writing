# ?? Academic Workspace: Research & Writing Monitor

Este entorno digital ha sido desarrollado por el **Dr. Arturo Rodríguez Zambrano** para monitorear el progreso académico de los estudiantes y mejorar los procesos de escritura académica, enfocado en la estructura de ensayos (**Essay Structure**). 

El sistema combina una interfaz de aprendizaje interactiva con un robusto sistema de auditoría de integridad para una población de 200 estudiantes en Manta.

## ?? Funcionalidades Principales

* **Entorno de Escritura Controlado:** Registro de métricas de escritura en tiempo real.
* **Integrity Audit:** Monitoreo activo de comportamientos de escritura:
    * Conteo de palabras y pulsaciones de teclas (**Keystrokes**).
    * Registro de pegado de texto (**Pastes**) y borrados (**Deletions**).
    * Detección de cambios de pestaña (**Tab Switches**).
    * Métricas de tiempo (Tiempo hasta la primera tecla y duración total).
* **Generación de Reportes:** Creación automática de PDFs con el progreso del estudiante.
* **Sincronización en la Nube:** Envío de datos a Google Sheets mediante Google Apps Script.

## ??? Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3 (Bootstrap), JavaScript (Vanilla).
* **PDF Generation:** jsPDF.
* **Backend:** Google Apps Script (Web App).
* **Validación:** Panel de expertos afiliados a la Universidad del País Vasco y universidades ecuatorianas.



---

## ?? Estado Actual y Pendientes (To-Do)

### ? Logros Recientes
* Unificación de la lógica de guardado en js/module-logic.js.
* Implementación de "Fuerza Bruta" en js/report.js (conversión a String).
* Estructuración del flujo no experimental de la investigación.

### ?? Pendiente Crítico (Bug de Sincronización)
Las columnas de auditoría llegan vacías a Google Sheets. El texto del ensayo sí se registra.

**Próximos pasos:**
1.  **Revisión de Google Apps Script:** Verificar e.parameter en el archivo .gs.
2.  **Debug de Payload:** Inspeccionar la consola de red para validar el envío de datos numéricos.
3.  **Consistencia de Nombres:** Asegurar que 'Words', 'Keystrokes', etc., coincidan entre JS y el Script de Google.

---

## ????? Autor
**Dr. Arturo Rodríguez Zambrano** Docente de Pedagogía de los Idiomas Nacionales y Extranjeros.
