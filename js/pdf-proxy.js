// api/pdf-proxy.js
// ─────────────────────────────────────────────────────────────────────────────
// Proxy para cargar PDFs externos sin problemas de CORS.
// PDF.js no puede fetch() recursos de dominios externos si el servidor
// no incluye el header Access-Control-Allow-Origin.
// Este endpoint hace el fetch desde Node (sin restricción CORS) y reenvía
// el PDF al browser con los headers correctos.
//
// USO:
//   /api/pdf-proxy?url=https%3A%2F%2Fdominio.com%2Farchivo.pdf
//
// SEGURIDAD:
//   - Solo se permiten URLs con extensión .pdf
//   - Tamaño máximo de respuesta: 15 MB
//   - Whitelist de dominios configurada en ALLOWED_DOMAINS
// ─────────────────────────────────────────────────────────────────────────────

// Dominios permitidos (añade los que necesites)
const ALLOWED_DOMAINS = [
    'tesolunion.org',
    'www.tesolunion.org',
    'kuvyvyzmpfbndpkzbosb.supabase.co',   // tu Supabase Storage
    'storage.googleapis.com',
    'drive.google.com',
    'docs.google.com',
];

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export default async function handler(req, res) {
    // Solo GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { url } = req.query;

    // 1. Validar que viene la URL
    if (!url) {
        return res.status(400).json({ error: 'Missing ?url= parameter' });
    }

    // 2. Decodificar y parsear
    let parsedUrl;
    try {
        parsedUrl = new URL(decodeURIComponent(url));
    } catch {
        return res.status(400).json({ error: 'Invalid URL format' });
    }

    // 3. Solo HTTPS
    if (parsedUrl.protocol !== 'https:') {
        return res.status(400).json({ error: 'Only HTTPS URLs are allowed' });
    }

    // 4. Validar dominio en whitelist
    const hostname = parsedUrl.hostname.replace(/^www\./, '');
    const allowed  = ALLOWED_DOMAINS.some(d => d.replace(/^www\./, '') === hostname);
    if (!allowed) {
        return res.status(403).json({ error: `Domain not allowed: ${parsedUrl.hostname}` });
    }

    // 5. Fetch del PDF desde el servidor
    let response;
    try {
        response = await fetch(parsedUrl.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ULEAM-PDF-Proxy/1.0)',
                'Accept':     'application/pdf,*/*',
            },
            // Timeout de 15 segundos
            signal: AbortSignal.timeout(15000),
        });
    } catch (err) {
        console.error('[pdf-proxy] Fetch error:', err.message);
        return res.status(502).json({ error: `Could not reach PDF server: ${err.message}` });
    }

    if (!response.ok) {
        return res.status(response.status).json({ error: `Remote server returned ${response.status}` });
    }

    // 6. Verificar Content-Type (debe ser PDF)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        // Algunas URLs devuelven el PDF como octet-stream, permitirlo también
        // Pero rechazar HTML (posible página de error o login)
        if (contentType.includes('html')) {
            return res.status(415).json({ error: 'Remote URL returned HTML, not a PDF' });
        }
    }

    // 7. Limitar tamaño
    const contentLength = parseInt(response.headers.get('content-length') || '0');
    if (contentLength > MAX_SIZE_BYTES) {
        return res.status(413).json({ error: `PDF too large (${Math.round(contentLength / 1024 / 1024)} MB, max 15 MB)` });
    }

    // 8. Leer el buffer
    let buffer;
    try {
        const arrayBuffer = await response.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } catch (err) {
        console.error('[pdf-proxy] Buffer error:', err.message);
        return res.status(500).json({ error: 'Error reading PDF stream' });
    }

    // Verificar tamaño real (por si no vino Content-Length)
    if (buffer.length > MAX_SIZE_BYTES) {
        return res.status(413).json({ error: 'PDF too large' });
    }

    // 9. Enviar con headers correctos para que PDF.js lo procese
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache 1 hora
    res.setHeader('X-Content-Type-Options', 'nosniff');

    console.log(`[pdf-proxy] ✅ Served ${Math.round(buffer.length / 1024)} KB → ${parsedUrl.hostname}`);
    return res.status(200).send(buffer);
}