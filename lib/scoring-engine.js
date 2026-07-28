/* lib/scoring-engine.js
 * Scoring engine — transparent, student-facing calculations
 */

function getStreakMultiplier(streakDays) {
  if (streakDays >= 15) return 1.2;
  if (streakDays >= 8) return 1.1;
  return 1.0;
}

function getTimeMultiplier(timeMs, timeLimitMs) {
  if (timeMs <= timeLimitMs * 0.5) return 1.2;
  if (timeMs <= timeLimitMs) return 1.0;
  return 0.8;
}

function calcExercisePoints(difficulty, streakDays, timeMs, timeLimitMs) {
  const baseMap = { easy: 10, medium: 25, hard: 50 };
  const base = baseMap[difficulty] || 10;
  const streakMult = getStreakMultiplier(streakDays);
  const timeMult = getTimeMultiplier(timeMs, timeLimitMs);
  return Math.round(base * streakMult * timeMult);
}

function calcQuickThinkPoints(correctCount, totalQuestions) {
  return correctCount * 5;
}

function getStreakStatus(lastActivityDate) {
  if (!lastActivityDate) return { current: 0, broken: false };

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const last = new Date(lastActivityDate);
  last.setUTCHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return { current: 1, broken: false, continuesToday: true };
  if (daysDiff === 1) return { current: 1, broken: false, resetsToday: false };
  return { current: 0, broken: true, daysSinceBreak: daysDiff };
}

function checkBadgeUnlock(studentProgress, allBadges) {
  const { total_series_points, topics_completed, current_streak, longest_streak } = studentProgress;
  const results = [];

  const badges = [
    { id: 'consistency', name: 'Consistency', condition: () => longest_streak >= 7 },
    { id: 'essay-master', name: 'Essay Master', condition: () => (studentProgress.dojo_exercise_count || 0) >= 10 },
    { id: 'speed-demon', name: 'Speed Demon', condition: () => (studentProgress.speed_bonus_count || 0) >= 10 },
    { id: 'quick-thinker', name: 'Quick Thinker', condition: () => (studentProgress.qt_correct_count || 0) >= 50 },
    { id: 'writing-legend', name: 'Writing Legend', condition: () => (studentProgress.total_exercise_count || 0) >= 100 }
  ];

  badges.forEach(badge => {
    if (badge.condition()) {
      results.push(badge);
    }
  });

  return results;
}

function getLeagueRankInfo(studentPoints, allStudentsInLeague) {
  const sorted = [...allStudentsInLeague].sort((a, b) => b.weekly_points - a.weekly_points);
  const rank = sorted.findIndex(s => s.student_id === studentPoints.student_id) + 1;
  const top3 = sorted.slice(0, 3);

  return { rank, total: sorted.length, topStudents: top3 };
}

function calcLeaguePointsFromActivities(activities) {
  return activities.reduce((sum, a) => sum + (a.points || 0), 0);
}

function getLeagueTier(weeklyPoints) {
  if (weeklyPoints >= 5000) return 'platinum';
  if (weeklyPoints >= 3000) return 'gold';
  if (weeklyPoints >= 1000) return 'silver';
  return 'bronze';
}

module.exports = {
  getStreakMultiplier,
  getTimeMultiplier,
  calcExercisePoints,
  calcQuickThinkPoints,
  getStreakStatus,
  checkBadgeUnlock,
  getLeagueRankInfo,
  calcLeaguePointsFromActivities,
  getLeagueTier
};
