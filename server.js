require('dotenv').config();
const http = require('http');
const fs   = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const PORT = process.env.PORT || 3000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const MIME = {
    '.html': 'text/html',
    '.css':  'text/css',
    '.js':   'text/javascript',
    '.json': 'application/json',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
};

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);

    // ─── 1. CONFIG PÚBLICA — credenciales seguras para el browser ───────────────
    // Solo expone la anon key (diseñada para ser pública).
    // La service_role key NUNCA se expone aquí.
    if (req.method === 'GET' && req.url === '/api/config') {
        res.writeHead(200, {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600'
        });
        return res.end(JSON.stringify({
            supabaseUrl: process.env.SUPABASE_URL  || '',
            supabaseKey: process.env.SUPABASE_KEY  || ''
        }));
    }

    // ─── 2. ORQUESTADOR DE AGENTES ──────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/api/orchestrator') {
        const orchestrator = require('./api/orchestrator');
        orchestrator(req, res);
        return;
    }

    // ─── 2b. SYNC READING PROGRESS ──────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/api/sync-reading') {
        const syncReading = require('./api/sync-reading');
        syncReading(req, res);
        return;
    }

    // ─── 2c. CRON: COMPRESIÓN DE PERFILES (Memory Agent) ────────────────────────
    if ((req.method === 'GET' || req.method === 'POST') && req.url === '/api/cron/compress-profiles') {
        const compressProfiles = require('./api/cron/compress-profiles');
        compressProfiles(req, res);
        return;
    }

    // ─── 3. RUTA DE LA API ───────────────────────────────────────────────────────
    if (req.method === 'POST' && req.url === '/api/validate-student') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { email } = JSON.parse(body);

                if (!email) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Email is required' }));
                }

                const cleanEmail = email.toLowerCase().trim().replace('live.', '');
                console.log(`🔍 Buscando en DB: [${cleanEmail}]`);

                const { data, error } = await supabase
                    .from('students')
                    .select('*')
                    .ilike('email', cleanEmail)
                    .limit(1);

                if (error || !data || data.length === 0) {
                    console.log(`❌ Estudiante no encontrado: ${cleanEmail}`);
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Student not found in database.' }));
                }

                const student = data[0];
                console.log(`✅ Validado: ${student.name}`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(student));

            } catch (e) {
                console.error("🔥 Server Error:", e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
        return;
    }

    // ─── 4. SERVIDOR DE ARCHIVOS ESTÁTICOS ──────────────────────────────────────
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    urlPath = urlPath.split('?')[0];

    const filePath = path.join(__dirname, urlPath);
    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`⚠️ Archivo no encontrado: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404 — Not Found</h1>');
        }
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`----------------------------------------`);
});