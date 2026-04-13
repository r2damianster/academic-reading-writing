const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const ADMIN_EMAIL    = 'arturo.rodriguez@uleam.edu.ec';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Solo limpiar espacios y pasar a minúsculas, sin tocar el dominio
    const cleanEmail = email.toLowerCase().trim();
    console.log(`🔍 Buscando: [${cleanEmail}]`);

    // ── Cuenta de administrador: requiere contraseña ─────────────────────────
    if (cleanEmail === ADMIN_EMAIL) {
      if (!password) {
        return res.status(401).json({ message: 'Administrator password is required.' });
      }
      if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) {
        console.log(`⛔ Admin login failed: wrong password`);
        return res.status(401).json({ message: 'Invalid administrator credentials.' });
      }
      // Contraseña correcta — no necesita estar en la tabla students
      console.log(`✅ Admin autenticado: ${cleanEmail}`);
      return res.status(200).json({
        email:  cleanEmail,
        name:   'Dr. Arturo Rodríguez',
        course: 'N/A',
        major:  'Instructor',
        role:   'admin'
      });
    }

    // ── Estudiante normal ────────────────────────────────────────────────────
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .ilike('email', cleanEmail)
      .limit(1);

    if (error || !data || data.length === 0) {
      console.log(`❌ No encontrado: ${cleanEmail}`);
      return res.status(404).json({ message: 'Student not found in database.' });
    }

    console.log(`✅ Validado: ${data[0].name}`);
    return res.status(200).json({ ...data[0], role: 'student' });

  } catch (e) {
    console.error('🔥 Error:', e);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
