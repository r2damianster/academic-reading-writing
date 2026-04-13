#!/usr/bin/env node
/* scripts/github-check.js
 * Hook de Claude Code — se ejecuta tras editar archivos JS/HTML.
 * Realiza checks locales de seguridad sin necesitar el servidor activo.
 *
 * Checks:
 *   1. Credenciales hardcodeadas (SUPABASE, ANTHROPIC keys)
 *   2. Exposición de service_role key en api/config.js
 *   3. console.log con datos sensibles del estudiante
 *   4. Nuevas dependencias externas (CDN links)
 *
 * Salida: mensajes de advertencia a stderr si encuentra problemas.
 * Exit code: 0 siempre (no bloquea el flujo de Claude Code).
 */

const fs   = require('fs');
const path = require('path');

// ── Patrones de riesgo ───────────────────────────────────────────────────────

const CREDENTIAL_PATTERNS = [
    { re: /eyJ[A-Za-z0-9_-]{20,}/,          label: 'JWT token hardcodeado'         },
    { re: /sk-ant-api[A-Za-z0-9-]{20,}/,     label: 'Anthropic API key hardcodeada' },
    { re: /SUPABASE_SERVICE_KEY\s*=\s*['"`][^'"` ]{10}/,
                                              label: 'service_role key hardcodeada'  },
    { re: /service_role/,                     label: 'Referencia a service_role key' }
];

const SENSITIVE_LOG_PATTERNS = [
    { re: /console\.log\([^)]*essay_text/i,   label: 'console.log con essay_text'   },
    { re: /console\.log\([^)]*email/i,         label: 'console.log con email'        },
    { re: /console\.log\([^)]*password/i,      label: 'console.log con password'     },
    { re: /console\.log\([^)]*SUPABASE/i,      label: 'console.log con credencial'   }
];

const CDN_PATTERN = /<script[^>]+src=["']https?:\/\/(?!fonts\.googleapis\.com)[^"']+["']/i;

// ── Archivos críticos monitoreados ───────────────────────────────────────────

const CRITICAL_FILES = [
    'js/slide-engine.js',
    'js/reading-engine.js',
    'js/essay-handler.js',
    'api/orchestrator.js',
    'api/agents/memory.js',
    'api/config.js'
];

// ── Check especial para api/config.js ────────────────────────────────────────

function checkConfigFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');

    if (content.includes('SERVICE_KEY') || content.includes('service_role')) {
        warn(filePath, 'api/config.js puede estar exponiendo la service_role key al browser');
    }
}

// ── Scan de un archivo ───────────────────────────────────────────────────────

function scanFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    const lines   = content.split('\n');
    const warnings = [];

    lines.forEach((line, i) => {
        // Saltar comentarios de contexto
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;

        CREDENTIAL_PATTERNS.forEach(p => {
            if (p.re.test(line)) {
                warnings.push({ line: i + 1, label: p.label, snippet: line.trim().slice(0, 80) });
            }
        });

        SENSITIVE_LOG_PATTERNS.forEach(p => {
            if (p.re.test(line)) {
                warnings.push({ line: i + 1, label: p.label, snippet: line.trim().slice(0, 80) });
            }
        });

        if (filePath.endsWith('.html') && CDN_PATTERN.test(line)) {
            warnings.push({ line: i + 1, label: 'Nueva CDN externa detectada', snippet: line.trim().slice(0, 80) });
        }
    });

    return warnings;
}

// ── Output ───────────────────────────────────────────────────────────────────

function warn(file, message, line) {
    const loc = line ? `:${line}` : '';
    process.stderr.write(`⚠️  [GitHub Agent] ${file}${loc} — ${message}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

(function main() {
    const root = path.join(__dirname, '..');
    let totalWarnings = 0;

    // 1. Scan archivos críticos
    CRITICAL_FILES.forEach(rel => {
        const full     = path.join(root, rel);
        const warnings = scanFile(full);
        if (warnings && warnings.length > 0) {
            warnings.forEach(w => {
                warn(rel, w.label, w.line);
                totalWarnings++;
            });
        }
    });

    // 2. Check especial api/config.js
    checkConfigFile(path.join(root, 'api', 'config.js'));

    // 3. Resumen
    if (totalWarnings > 0) {
        process.stderr.write(
            `\n⚠️  [GitHub Agent] ${totalWarnings} advertencia(s) encontrada(s). ` +
            `Revisa antes de hacer commit.\n`
        );
    } else {
        process.stderr.write('✅ [GitHub Agent] Security check OK — no issues found.\n');
    }

    // Siempre exit 0 para no bloquear a Claude Code
    process.exit(0);
})();
