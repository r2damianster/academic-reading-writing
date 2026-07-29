/* js/dojo-client.js
 * Cliente Dojo — API calls + offline-first localStorage sync
 */

class DojoClient {
  constructor() {
    this.baseUrl = '/api/gamification';
    this.cachePrefix = 'dojo_';
    this.queuePrefix = 'dojo_queue_';
  }

  async init(explicitStudentId) {
    // Wait for config if available (in main window)
    if (typeof window.configReady !== 'undefined') {
      try {
        await window.configReady;
      } catch (e) {
        console.warn('⚠️ configReady failed:', e);
      }
    }

    // Try multiple sources for studentId:
    // 0. Explicit argument — the caller already resolved the student
    this.studentId = explicitStudentId || null;

    // 1. URL query param (for iframe context)
    if (!this.studentId) {
      const urlParams = new URLSearchParams(window.location.search);
      this.studentId = urlParams.get('studentId');
    }

    // 2. window.currentStudent (direct load)
    if (!this.studentId) {
      this.studentId = window.currentStudent?.id;
    }

    // 3. window.parent.currentStudent (iframe with access)
    if (!this.studentId) {
      try {
        this.studentId = window.parent?.currentStudent?.id;
      } catch (e) {
        // Cross-origin iframe, expected
      }
    }

    // 4. localStorage (set by the login flow), own window then parent
    if (!this.studentId) {
      this.studentId = localStorage.getItem('studentId');
    }
    if (!this.studentId) {
      try {
        this.studentId = window.parent?.localStorage?.getItem('studentId');
      } catch (e) {
        // Cross-origin iframe, expected
      }
    }

    if (!this.studentId) console.warn('⚠️ DojoClient: no studentId found');
    else console.log('✅ DojoClient initialized with studentId:', this.studentId);
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

  async getStreak() {
    return this._apiCall('get-streak', {});
  }

  async getBadges() {
    return this._apiCall('get-badges', {});
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

  // ─── LEADERBOARD GATE ──────────────────────────────────────────────────
  // The podium shows on entry at most once per interval, then stays out of the
  // way until the interval elapses again.

  async showLeaderboardIfEligible() {
    const lastShownKey = 'dojo_leaderboard_last_shown';
    const lastShown = localStorage.getItem(lastShownKey);
    const now = Date.now();

    if (!lastShown || (now - parseInt(lastShown)) > DojoClient.LEADERBOARD_INTERVAL_MS) {
      localStorage.setItem(lastShownKey, now.toString());
      const leaderboard = await this.getLeaderboard();
      return { show: true, data: leaderboard };
    }

    return { show: false };
  }

  // ─── STREAK ─────────────────────────────────────────────────────────────
  // The streak lives in Supabase (gamification_streaks) and is computed by the
  // server on submit. Use getStreak() to read it — never derive it locally.

  recordActivity() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    localStorage.setItem('dojo_last_activity_date', today.toISOString());
  }

  async updateStreakBadge() {
    try {
      const streakData = await this.getStreak();
      const badge = document.getElementById('dojoStreakBadge');
      if (badge && streakData?.currentStreak > 0) {
        badge.textContent = '⚡ ' + streakData.currentStreak + ' días';
        badge.style.display = 'flex';
      }
    } catch (e) {
      console.warn('⚠️ Streak badge update failed:', e.message);
    }
  }
}

// How often the leaderboard podium reappears on entry (4 hours).
DojoClient.LEADERBOARD_INTERVAL_MS = 4 * 60 * 60 * 1000;

window.dojoClient = new DojoClient();
