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
      console.log('📚 Loading Dojo content from JSON files...');
      console.log('  __dirname:', __dirname);

      // Try two paths: relative and absolute from project root
      const relPaths = {
        series: path.join(__dirname, '../data/dojo/series.json'),
        topics: path.join(__dirname, '../data/dojo/topics.json'),
        exercises: path.join(__dirname, '../data/dojo/exercises.json'),
        quickThink: path.join(__dirname, '../data/dojo/quick-think.json')
      };

      // Try absolute path if relative fails
      const absBasePath = path.join(__dirname, '..');
      const absPaths = {
        series: path.join(absBasePath, 'data/dojo/series.json'),
        topics: path.join(absBasePath, 'data/dojo/topics.json'),
        exercises: path.join(absBasePath, 'data/dojo/exercises.json'),
        quickThink: path.join(absBasePath, 'data/dojo/quick-think.json')
      };

      let seriesPath, topicsPath, exercisesPath, qtPath;

      // Use relative path if files exist, else try absolute
      if (fs.existsSync(relPaths.series)) {
        seriesPath = relPaths.series;
        topicsPath = relPaths.topics;
        exercisesPath = relPaths.exercises;
        qtPath = relPaths.quickThink;
        console.log('  ✓ Using relative paths');
      } else if (fs.existsSync(absPaths.series)) {
        seriesPath = absPaths.series;
        topicsPath = absPaths.topics;
        exercisesPath = absPaths.exercises;
        qtPath = absPaths.quickThink;
        console.log('  ✓ Using absolute paths');
      } else {
        throw new Error('Dojo JSON files not found at: ' + relPaths.series + ' or ' + absPaths.series);
      }

      console.log('  Reading:', seriesPath);
      DOJO_CACHE.series = JSON.parse(fs.readFileSync(seriesPath, 'utf8'));
      DOJO_CACHE.topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
      DOJO_CACHE.exercises = JSON.parse(fs.readFileSync(exercisesPath, 'utf8'));
      DOJO_CACHE.quickThink = JSON.parse(fs.readFileSync(qtPath, 'utf8'));

      console.log('✅ Dojo content loaded: ' +
        DOJO_CACHE.series.length + ' series, ' +
        DOJO_CACHE.topics.length + ' topics, ' +
        DOJO_CACHE.exercises.length + ' exercises, ' +
        DOJO_CACHE.quickThink.length + ' QT sets');
    }
    return DOJO_CACHE;
  } catch (e) {
    console.error('❌ Dojo content load FAILED:', e.message);
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

async function checkAndUnlockBadges(studentId) {
  try {
    const progress = await getStudentDojoProgress(studentId);
    if (!progress) return;

    const badges = [
      { id: 'consistency', condition: progress.longest_streak >= 7 },
      { id: 'speed-demon', condition: (progress.speed_bonus_count || 0) >= 10 },
      { id: 'quick-thinker', condition: (progress.qt_correct_count || 0) >= 50 },
      { id: 'writing-legend', condition: (progress.total_exercise_count || 0) >= 100 }
    ];

    for (const badge of badges) {
      if (!badge.condition) continue;

      const { data: existing } = await supabase
        .from('gamification_student_badges')
        .select('id')
        .eq('student_id', studentId)
        .eq('badge_id', badge.id)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase
          .from('gamification_student_badges')
          .insert({
            student_id: studentId,
            badge_id: badge.id,
            unlocked_at: new Date().toISOString()
          });
        console.log(`✅ Badge unlocked: ${badge.id} for ${studentId}`);
      }
    }
  } catch (e) {
    console.warn('⚠️ Badge check failed:', e.message);
  }
}

async function updateStreak(studentId) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayDate = today.toISOString().split('T')[0];

    const { data: streak, error: fetchError } = await supabase
      .from('gamification_streaks')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (fetchError) {
      console.warn('⚠️ Streak fetch failed:', fetchError.message);
      return;
    }

    if (!streak) {
      // First activity: create streak record
      await supabase
        .from('gamification_streaks')
        .insert({
          student_id: studentId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: todayDate,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      console.log(`✅ Streak initialized: 1 day for ${studentId}`);
      return;
    }

    // Calculate streak
    let newStreak = streak.current_streak || 0;
    let longestStreak = streak.longest_streak || 0;
    const lastDate = streak.last_activity_date ? new Date(streak.last_activity_date) : null;
    lastDate?.setUTCHours(0, 0, 0, 0);

    if (lastDate && lastDate.toISOString().split('T')[0] === todayDate) {
      // Same day: no change
      return;
    }

    if (lastDate) {
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        // Consecutive day: increment
        newStreak = (newStreak || 0) + 1;
      } else if (daysDiff > 1) {
        // Streak broken: reset
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    longestStreak = Math.max(longestStreak || 0, newStreak);

    const { error: updateError } = await supabase
      .from('gamification_streaks')
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: todayDate,
        updated_at: new Date().toISOString()
      })
      .eq('student_id', studentId);

    if (updateError) throw updateError;
    console.log(`✅ Streak updated: ${newStreak} days for ${studentId}`);
  } catch (e) {
    console.error('❌ Streak update failed:', e.message);
  }
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
  const isSpeedBonus = timeMs <= (exercise.time_limit_seconds * 1000 * 0.5);

  try {
    const totalPoints = (progress?.total_series_points || 0) + points;
    const speedBonusCount = (progress?.speed_bonus_count || 0) + (isSpeedBonus ? 1 : 0);
    const exerciseCount = (progress?.total_exercise_count || 0) + 1;

    if (!progress) {
      // Create new progress record if doesn't exist
      const { error: insertError } = await supabase
        .from('gamification_student_dojo_progress')
        .insert({
          student_id: studentId,
          total_series_points: totalPoints,
          speed_bonus_count: speedBonusCount,
          total_exercise_count: exerciseCount,
          current_streak: 0,
          longest_streak: 0,
          qt_correct_count: 0,
          updated_at: new Date().toISOString()
        });
      if (insertError) throw insertError;
    } else {
      // Update existing record
      const { error: updateError } = await supabase
        .from('gamification_student_dojo_progress')
        .update({
          total_series_points: totalPoints,
          speed_bonus_count: speedBonusCount,
          total_exercise_count: exerciseCount,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);
      if (updateError) throw updateError;
    }

    // Check badges and update streak after update
    await checkAndUnlockBadges(studentId);
    await updateStreak(studentId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'submitted',
      points,
      totalPoints,
      exercise: exercise.title,
      speedBonus: isSpeedBonus
    }));
  } catch (e) {
    console.error('❌ Submit exercise ERROR:', e.message, e.code, e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to submit exercise', details: e.message }));
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

    // Update student progress for badge checking
    const progress = await getStudentDojoProgress(studentId);
    const qtCorrectCount = (progress?.qt_correct_count || 0) + correctCount;

    if (!progress) {
      // Create new progress record if doesn't exist
      await supabase
        .from('gamification_student_dojo_progress')
        .insert({
          student_id: studentId,
          total_series_points: 0,
          speed_bonus_count: 0,
          total_exercise_count: 0,
          current_streak: 0,
          longest_streak: 0,
          qt_correct_count: qtCorrectCount,
          updated_at: new Date().toISOString()
        });
    } else {
      // Update existing record
      await supabase
        .from('gamification_student_dojo_progress')
        .update({
          qt_correct_count: qtCorrectCount,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);
    }

    // Check badges and update streak
    await checkAndUnlockBadges(studentId);
    await updateStreak(studentId);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'completed',
      correctCount,
      totalQuestions: set.total_questions,
      points,
      score: Math.round((correctCount / set.total_questions) * 100)
    }));
  } catch (e) {
    console.error('❌ Submit QuickThink ERROR:', e.message, e.code, e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Failed to submit QuickThink', details: e.message }));
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
