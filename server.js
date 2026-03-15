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

    // ─── 1. RUTA DE LA API ───
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

                // Normalización extrema: minúsculas, sin espacios y sin "live."
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
                    // IMPORTANTE: Aquí enviamos JSON para que auth.js no explote
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
        return; // Detiene el flujo para que no intente cargar archivos estáticos
    }

    // ─── 2. SERVIDOR DE ARCHIVOS ESTÁTICOS ───
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