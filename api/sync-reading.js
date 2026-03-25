// api/sync-reading.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, slide_id, action_data, session_id } = req.body;

  try {
    // 1. Primero buscamos el UUID del estudiante usando su email
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .single();

    if (studentError || !student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // 2. Insertamos el progreso en la tabla reading_progress
    const { data, error } = await supabase
      .from('reading_progress')
      .insert([
        {
          student_id: student.id, // Usamos el UUID real de tu tabla students
          slide_id: parseInt(slide_id),
          action_data: action_data,
          session_id: session_id || null 
        }
      ]);

    if (error) throw error;

    return res.status(200).json({ success: true, message: 'Progress saved' });
  } catch (error) {
    console.error('Error saving reading progress:', error);
    return res.status(500).json({ error: error.message });
  }
}