/* js/config-loader.js
 * Singleton de configuración — resuelve BUG-001 / DT-001.
 *
 * Problema: cada archivo hacía su propio fetch('/api/config') sin await,
 * causando race conditions cuando Supabase se usaba antes de tener credenciales.
 *
 * Solución: una sola promesa compartida via window.configReady.
 * Cualquier archivo que necesite credenciales de Supabase simplemente hace:
 *
 *   await window.configReady;
 *   // SUPABASE_URL y SUPABASE_ANON_KEY ya están en window
 *
 * Uso: incluir este script ANTES que slide-engine.js, reading-engine.js, etc.
 *   <script src="/js/config-loader.js"></script>
 */

(function () {
    'use strict';

    // Si ya fue inicializado (p. ej. múltiples scripts en la misma página), no duplicar.
    if (window.configReady) return;

    window.configReady = fetch('/api/config')
        .then(function (res) {
            if (!res.ok) throw new Error('config endpoint returned ' + res.status);
            return res.json();
        })
        .then(function (cfg) {
            window.SUPABASE_URL      = cfg.supabaseUrl      || cfg.SUPABASE_URL      || '';
            window.SUPABASE_ANON_KEY = cfg.supabaseAnonKey  || cfg.SUPABASE_ANON_KEY || '';
            return cfg;
        })
        .catch(function (err) {
            console.warn('[config-loader] Could not load config:', err.message);
            // Devuelve objeto vacío para que los await no se rompan,
            // pero los módulos individuales manejarán el caso de credenciales vacías.
            return {};
        });
}());
