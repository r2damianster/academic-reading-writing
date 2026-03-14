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
    // Log para ver qué está pidiendo el navegador
    console.log(`${req.method} ${req.url}`);

    // ─── 1. RUTA DE LA API (VALIDACIÓN DE ESTUDIANTE) ───
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

                // Consulta flexible a Supabase
                // .ilike permite ignorar mayúsculas/minúsculas
                const { data, error } = await supabase
                    .from('students')
                    .select('*')
                    .ilike('email', email.trim()) 
                    .limit(1);

                // Si hay error de Supabase o el array llega vacío
                if (error || !data || data.length === 0) {
                    console.log(`❌ Estudiante no encontrado: ${email}`);
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ message: 'Student not found in database.' }));
                }

                // Éxito: Extraemos el primer (y único) estudiante del array
                const student = data[0];
                console.log(`✅ Estudiante validado: ${student.name}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(student));

            } catch (e) {
                console.error("🔥 Server Error parsing JSON:", e);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Internal Server Error' }));
            }
        });
        return; 
    }

    // ─── 2. SERVIDOR DE ARCHIVOS ESTÁTICOS ───
    let urlPath = req.url === '/' ? '/index.html' : req.url;
    urlPath = urlPath.split('?')[0];

    const filePath = path.join(__dirname, urlPath);
    const ext      = path.extname(filePath).toLowerCase();
    const mimeType = MIME[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.log(`⚠️ File not found: ${filePath}`);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 — Not Found</h1>');
            return;
        }
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`----------------------------------------`);
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`----------------------------------------`);
});