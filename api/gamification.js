/* api/gamification.js
 * Orquestador de acciones del Dojo Académico
 * Lee contenido desde JSON, escribe resultados a Supabase con RLS
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { calcExercisePoints, calcQuickThinkPoints, getStreakStatus, checkBadgeUnlock, getLeagueRankInfo } = require('../lib/scoring-engine');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

let DOJO_CACHE = { series: null, topics: null, exercises: null, quickThink: null };

function loadDojoContent() {
  try {
    if (!DOJO_CACHE.series) {
      DOJO_CACHE.series = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/dojo/series.json'), 'utf8'));
      DOJO_CACHE.topics = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/dojo/topics.json'), 'utf8'));
      DOJO_CACHE.exercises = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/dojo/exercises.json'), 'utf8'));
      DOJO_CACHE.quickThink = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/dojo/quick-think.json'), 'utf8'));
    }
    return DOJO_CACHE;
  } catch (e) {
    console.warn('⚠️ Dojo content load failed:', e.message);
    return { series: [], topics: [], exercises: [], quickThink: [] };
  }
}

async function getStudentDojoProgress(studentId) {
  const { data, error } = await supabase
    .from('gamification_student_dojo_progress')
    .select('*')
    .eq('student_id', studentId)
    .maybeSingle();

  if (error) {
    console.warn('⚠️ Progress fetch failed:', error.message);
    return null;
  }
  return data;
}

async function handleDojoSeries(studentId, res) {
  const { series } = loadDojoContent();

  const progress = await getStudentDojoProgress(studentId);
  const completed = progress?.topics_completed || [];

  const seriesWithProgress = series.map(s => ({
    ...s,
    topicsCount: 0,
    topicsCompleted: 0
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    series: seriesWithProgress,
    studentProgress: progress ? {
      totalPoints: progress.total_series_points || 0,
      topicsCompleted: completed.length,
      currentStreak: progress.current_streak || 0
    } : null
  }));
}

async function handleDojoTopic(studentId, seriesId, res) {
  const { topics, exercises } = loadDojoContent();

  const topicsInSeries = topics.filter(t => t.series_id === seriesId);
  const exercisesMap = {};

  exercises.forEach(ex => {
    if (!exercisesMap[ex.topic_id]) exercisesMap[ex.topic_id] = [];
    exercisesMap[ex.topic_id].push(ex);
  });

  const topicsWithExercises = topicsInSeries.map(t => ({
    ...t,
    exercises: (exercisesMap[t.topic_id] || []).map(ex => ({
      exercise_id: ex.exercise_id,
      title: ex.title,
      difficulty: ex.difficulty,
      points_base: ex.points_base,
      time_limit_seconds: ex.time_limit_seconds
    }))
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    topics: topicsWithExercises,
    scoringFormula: {
      base: '10/25/50 pts by difficulty',
      streak: '1.0x (1-7d) → 1.1x (8-14d) → 1.2x (15+d)',
      time: '1.2x (<50%) | 1.0x (50-100%) | 0.8x (>100%)'
    }
  }));
}

async function handleSubmitExercise(studentId, exerciseId, body, res) {
  const { exercises } = loadDojoContent();
  const exercise = exercises.find(e => e.exercise_id === exerciseId);

  if (!exercise) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Exercise not found' }));
  }

  const { answer, timeMs } = body;
  if (!answer) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Answer required' }));
  }

  const progress = await getStudentDojoProgress(studentId);
  const streakDays = progress?.current_streak || 0;
  const points = calcExercisePoints(exercise.difficulty, streakDays, timeMs || exercise.time_limit_seconds, exercise.time_limit_seconds);

  try {
    const { error } = await supabase
      .from('gamification_student_dojo_progress')
      .update({
        total_series_points: (progress?.total_series_points || 0) + points,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId);

    if (error) throw error;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'submitted',
      points,
      totalPoints: (progress?.total_series_points || 0) + points,
      exercise: exercise.title
    }));
  } catch (e) {
    console.warn('⚠️ Submit exercise failed:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to submit exercise' }));
  }
}

async function handleQuickThinkSets(studentId, res) {
  const { quickThink } = loadDojoContent();

  const setsMetadata = quickThink.map(set => ({
    set_id: set.set_id,
    name: set.name,
    name_es: set.name_es,
    description: set.description,
    difficulty: set.difficulty,
    time_limit_per_q: set.time_limit_per_q,
    total_questions: set.total_questions,
    max_score: set.max_score
  }));

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    sets: setsMetadata,
    note: 'Each correct answer = 5 points'
  }));
}

async function handleSubmitQuickThink(studentId, setId, body, res) {
  const { quickThink } = loadDojoContent();
  const set = quickThink.find(s => s.set_id === setId);

  if (!set) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'QuickThink set not found' }));
  }

  const { answers, timeSpentSeconds } = body;
  if (!answers || !Array.isArray(answers)) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Answers array required' }));
  }

  let correctCount = 0;
  answers.forEach((answerIdx, qIdx) => {
    const question = set.questions[qIdx];
    if (question && answerIdx === question.correct_index) correctCount++;
  });

  const points = calcQuickThinkPoints(correctCount, set.total_questions);

  try {
    const sessionId = `qt-${studentId}-${Date.now()}`;
    const { error: insertError } = await supabase
      .from('gamification_student_quick_think_session')
      .insert([
        {
          session_id: sessionId,
          student_id: studentId,
          set_id: setId,
          answers: JSON.stringify(answers),
          score: points,
          total_questions: set.total_questions,
          correct_count: correctCount,
          time_spent_seconds: timeSpentSeconds,
          completed_at: new Date().toISOString()
        }
      ]);

    if (insertError) throw insertError;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'completed',
      correctCount,
      totalQuestions: set.total_questions,
      points,
      score: Math.round((correctCount / set.total_questions) * 100)
    }));
  } catch (e) {
    console.warn('⚠️ Submit QuickThink failed:', e.message);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to submit QuickThink' }));
  }
}

async function handleGetLeaderboard(studentId, res) {
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('course_id')
    .eq('id', studentId)
    .single();

  if (studentError || !student?.course_id) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Student course not found' }));
  }

  const courseId = student.course_id;
  const { data: courseStudents, error: courseError } = await supabase
    .from('students')
    .select('id')
    .eq('course_id', courseId);

  if (courseError || !courseStudents) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Failed to fetch course students' }));
  }

  const studentIds = courseStudents.map(s => s.id);
  const { data: progressList, error: progressError } = await supabase
    .from('gamification_student_dojo_progress')
    .select('student_id, total_series_points, current_streak')
    .in('student_id', studentIds);

  if (progressError) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'Failed to fetch progress' }));
  }

  const sorted = (progressList || []).sort((a, b) => b.total_series_points - a.total_series_points);
  const studentRank = sorted.findIndex(p => p.student_id === studentId) + 1;
  const top5 = sorted.slice(0, 5);

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ok',
    studentRank,
    topStudents: top5,
    totalInCourse: sorted.length
  }));
}

module.exports = async (req, res) => {
  try {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsedBody = body ? JSON.parse(body) : {};
        const { action, studentId, seriesId, topicId, exerciseId, setId } = parsedBody;

        if (!studentId) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'studentId required' }));
        }

        switch (action) {
          case 'dojo-series':
            return handleDojoSeries(studentId, res);
          case 'dojo-topic':
            return handleDojoTopic(studentId, seriesId, res);
          case 'submit-exercise':
            return handleSubmitExercise(studentId, exerciseId, parsedBody, res);
          case 'quick-think-sets':
            return handleQuickThinkSets(studentId, res);
          case 'submit-qt':
            return handleSubmitQuickThink(studentId, setId, parsedBody, res);
          case 'leaderboard':
            return handleGetLeaderboard(studentId, res);
          default:
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unknown action' }));
        }
      } catch (e) {
        console.error('🔥 Gamification error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
      }
    });
  } catch (e) {
    console.error('🔥 Gamification critical error:', e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Server error' }));
  }
};
