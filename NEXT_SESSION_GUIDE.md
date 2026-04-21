# Plan de Trabajo y Verificación
 
Este documento detalla el estado de las funcionalidades y los próximos pasos estratégicos.

## ✅ Hitos Completados (Verificados)
1. **Modo Instructor Manual**: Activación y desactivación instantánea verificada.
2. **Teacher Helper Core**: Apertura de ventana y comunicación vía postMessage.
3. **Race Condition Supabase**: Singleton promise `_configReady` garantiza estabilidad.

## 🚀 Próxima Misión: Seguimiento Administrador/Instructor
El objetivo principal es permitir que el docente tenga una visión global y detallada del progreso de sus estudiantes.

### 1. Dashboard de Progreso (Admin View)
- Implementar una vista (puede ser `/admin/students.html`) que liste a todos los estudiantes registrados.
- Mostrar indicadores rápidos: última lección completada, promedio de integridad, y alertas de plagio.

### 2. Vista de Detalle por Estudiante
- Al pulsar sobre un estudiante, ver su historial completo de `activity_logs` y `essay_submissions`.
- Permitir la descarga de reportes consolidados por alumno.

---

> [!IMPORTANT]
> Los motores `slide-engine.js` y `reading-engine.js` ya están preparados para enviar telemetría detallada. El siguiente paso es puramente de visualización y gestión en el dashboard administrativo.
