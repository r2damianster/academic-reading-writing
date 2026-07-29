/* js/dojo-client.js
 * Cliente Dojo — API calls + offline-first localStorage sync
 */

class DojoClient {
  constructor() {
    this.baseUrl = '/api/gamification';
    this.cachePrefix = 'dojo_';
    this.queuePrefix = 'dojo_queue_';
  }

  async init() {
    // Wait for config if available (in main window)
    if (typeof window.configReady !== 'undefined') {
      try {
        await window.configReady;
      } catch (e) {
        console.warn('⚠️ configReady failed:', e);
      }
    }

    // Get student from parent or self
    this.studentId = window.currentStudent?.id || window.parent?.currentStudent?.id;
    if (!this.studentId) console.warn('⚠️ DojoClient: no studentId');
  }

  // ─── API CALLS ──────────────────────────────────────────────────────────

  async getDojoSeries() {
    return this._apiCall('dojo-series', {});
  }

  async getDojoTopic(seriesId) {
    return this._apiCall('dojo-topic', { seriesId });
  }

  async getExercise(exerciseId) {
    const cached = this._getCache(`exercise_${exerciseId}`);
    if (cached) return cached;

    const dojo = await this.getDojoSeries();
    return dojo.series || null;
  }

  async submitExercise(exerciseId, answer, timeMs) {
    const result = await this._apiCall('submit-exercise', {
      exerciseId,
      answer,
      timeMs
    });

    if (result?.status === 'submitted') {
      this._addToQueue('exercise', { exerciseId, answer, timeMs, points: result.points });
    }

    return result;
  }

  async getQuickThinkSets() {
    return this._apiCall('quick-think-sets', {});
  }

  async submitQuickThink(setId, answers, timeSpentSeconds) {
    const result = await this._apiCall('submit-qt', {
      setId,
      answers,
      timeSpentSeconds
    });

    if (result?.status === 'completed') {
      this._addToQueue('quick-think', { setId, answers, timeSpentSeconds, points: result.points });
    }

    return result;
  }

  async getLeaderboard() {
    return this._apiCall('leaderboard', {});
  }

  // ─── OFFLINE-FIRST + SYNC ───────────────────────────────────────────────

  _apiCall(action, body) {
    const payload = {
      action,
      studentId: this.studentId,
      ...body
    };
    console.log(`📡 DojoClient.${action}() call:`, payload);

    return fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(r => {
        console.log(`📡 Response status ${r.status} for ${action}`);
        return r.json();
      })
      .then(data => {
        console.log(`📡 Response data for ${action}:`, data);
        return data;
      })
      .catch(e => {
        console.warn(`⚠️ DojoClient ${action} error:`, e.message);
        return { error: 'offline', action, errorDetails: e.message };
      });
  }

  _addToQueue(type, data) {
    const queue = JSON.parse(localStorage.getItem(this.queuePrefix + type) || '[]');
    queue.push({ ...data, timestamp: Date.now() });
    localStorage.setItem(this.queuePrefix + type, JSON.stringify(queue));
  }

  getPendingQueue() {
    const types = ['exercise', 'quick-think'];
    const allPending = {};

    types.forEach(type => {
      allPending[type] = JSON.parse(localStorage.getItem(this.queuePrefix + type) || '[]');
    });

    return allPending;
  }

  clearQueue(type) {
    localStorage.removeItem(this.queuePrefix + type);
  }

  // ─── CACHE ───────────────────────────────────────────────────────────────

  _setCache(key, data, ttlMs = 3600000) {
    const obj = {
      data,
      expires: Date.now() + ttlMs
    };
    localStorage.setItem(this.cachePrefix + key, JSON.stringify(obj));
  }

  _getCache(key) {
    const cached = localStorage.getItem(this.cachePrefix + key);
    if (!cached) return null;

    const obj = JSON.parse(cached);
    if (Date.now() > obj.expires) {
      localStorage.removeItem(this.cachePrefix + key);
      return null;
    }

    return obj.data;
  }

  clearAllCache() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.cachePrefix))
      .forEach(k => localStorage.removeItem(k));
  }

  // ─── LEADERBOARD 24H LOGIC ─────────────────────────────────────────────

  async showLeaderboardIfEligible() {
    const lastShownKey = 'dojo_leaderboard_last_shown';
    const lastShown = localStorage.getItem(lastShownKey);
    const now = Date.now();

    if (!lastShown || (now - parseInt(lastShown)) > 86400000) {
      localStorage.setItem(lastShownKey, now.toString());
      const leaderboard = await this.getLeaderboard();
      return { show: true, data: leaderboard };
    }

    return { show: false };
  }

  // ─── STREAK ─────────────────────────────────────────────────────────────

  getLocalStreak() {
    const lastActivityKey = 'dojo_last_activity_date';
    const currentStreakKey = 'dojo_current_streak';

    const lastDate = localStorage.getItem(lastActivityKey);
    const currentStreak = parseInt(localStorage.getItem(currentStreakKey) || '0');

    if (!lastDate) return { current: 0, longest: 0 };

    const last = new Date(lastDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    last.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      return { current: currentStreak, longest: currentStreak };
    }

    if (daysDiff === 1) {
      const newStreak = currentStreak + 1;
      localStorage.setItem(currentStreakKey, newStreak.toString());
      localStorage.setItem(lastActivityKey, today.toISOString());
      return { current: newStreak, longest: newStreak };
    }

    localStorage.setItem(currentStreakKey, '1');
    localStorage.setItem(lastActivityKey, today.toISOString());
    return { current: 1, longest: currentStreak };
  }

  recordActivity() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    localStorage.setItem('dojo_last_activity_date', today.toISOString());
  }
}

window.dojoClient = new DojoClient();
