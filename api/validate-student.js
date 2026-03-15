const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim().replace('live.', '');
    console.log(`🔍 Buscando: [${cleanEmail}]`);

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
    return res.status(200).json(data[0]);

  } catch (e) {
    console.error('🔥 Error:', e);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};