---
owner: Arturo Rodríguez Zambrano
domain: frontend
last_updated: 2026-04-19
status: production
---

# Gestión de Reportes (report.js)

Este módulo maneja la generación de reportes de progreso en formato PDF utilizando `jspdf`. Los reportes están diseñados para dar transparencia sobre el avance académico y la integridad del estudiante.

## Ubicación y Acceso
- **Archivo**: `js/report.js`
- **Punto de Entrada**: `my-progress.html` (Header buttons)
- **Activación**: Botones "Daily Report" y "Full Report".

## Estructura del PDF
El reporte sigue una jerarquía visual premium:
1. **Encabezado (Branding)**: Datos del estudiante, curso, institución y metadatos de generación.
2. **Resumen de Actividades**: Tabla compacta con el nombre de la actividad, el último resultado obtenido y la fecha.
3. **Apéndice de Ensayos (Multi-intento)**:
   - Se lista **cada intento** de ensayo realizado.
   - Incluye metadatos de integridad (Score, palabras, pegados, tiempo de escritura).
   - Incluye el texto completo del ensayo con formato itálica para diferenciarlo.

## Modos de Generación

| Modo | Filtro | Uso Sugerido |
|---|---|---|
| **Daily Report** | Actividad de la fecha actual (local) | Seguimiento de sesión de clase diaria. |
| **Full Report** | Todo el historial del estudiante | Revisión de tutoría o fin de periodo. |

## Dependencias
- [jsPDF](https://github.com/parallax/jsPDF) (vía CDN): Necesaria para la generación dinámica.

## Mantenimiento
- Para modificar el umbral de integridad visual en el PDF (colores), editar la lógica de `bandColor` en `generateReport`.
- Los datos se obtienen de las tablas `activity_logs`, `essay_submissions` y `essay_compliance_results`.
