/**
 * js/lesson-access.js
 * Utility to manage and enforce lesson availability and deadlines.
 */

const LessonAccess = {
    _config: null,
    _rules: null,
    _lastFetch: 0,
    _cacheTTL: 5 * 60 * 1000, // 5 minutes cache

    async init() {
        if (this._config) return;
        try {
            const resp = await fetch('/api/config');
            this._config = await resp.json();
        } catch (e) {
            console.warn('LessonAccess: Failed to load config', e);
        }
    },

    async _fetchRules() {
        await this.init();
        const now = Date.now();
        if (this._rules && (now - this._lastFetch < this._cacheTTL)) {
            return this._rules;
        }

        if (!this._config?.supabaseUrl || !this._config?.supabaseKey) {
            console.error('LessonAccess: Missing Supabase credentials');
            return [];
        }

        try {
            const r = await fetch(`${this._config.supabaseUrl}/rest/v1/lesson_availability?select=*&is_active=eq.true`, {
                headers: {
                    'apikey': this._config.supabaseKey,
                    'Authorization': `Bearer ${this._config.supabaseKey}`
                }
            });
            if (!r.ok) throw new Error(`Supabase ${r.status}`);
            this._rules = await r.json();
            this._lastFetch = now;
            return this._rules;
        } catch (e) {
            console.warn('LessonAccess: Failed to fetch rules', e);
            return [];
        }
    },

    /**
     * Checks if a lesson is available for the current user.
     * Priority:
     * 1. Specific Student Override
     * 2. Course-wide Rule
     * 3. Global Rule
     */
    async check(lessonId) {
        const rules = await this._fetchRules();
        if (!rules || rules.length === 0) return { allowed: true };

        const studentId = localStorage.getItem('studentId');
        const courseId  = localStorage.getItem('studentCourseId') || localStorage.getItem('studentCourse');

        const lessonRules = rules.filter(r => r.lesson_id === lessonId);
        if (lessonRules.length === 0) return { allowed: true };

        let matchedRule = null;
        if (studentId) matchedRule = lessonRules.find(r => r.student_id === studentId) || null;
        if (!matchedRule && courseId) matchedRule = lessonRules.find(r => r.course_id === courseId) || null;
        if (!matchedRule) matchedRule = lessonRules.find(r => !r.course_id && !r.student_id) || null;
        if (!matchedRule) return { allowed: true };

        return this._evaluateRule(matchedRule, studentId);
    },

    async _countAttempts(activityKey, studentId) {
        if (!activityKey || !studentId || !this._config?.supabaseUrl) return 0;
        try {
            const r = await fetch(
                `${this._config.supabaseUrl}/rest/v1/essay_submissions` +
                `?activity=eq.${encodeURIComponent(activityKey)}&student_id=eq.${studentId}&select=id`,
                {
                    headers: {
                        'apikey':        this._config.supabaseKey,
                        'Authorization': `Bearer ${this._config.supabaseKey}`
                    }
                }
            );
            if (!r.ok) return 0;
            const rows = await r.json();
            return Array.isArray(rows) ? rows.length : 0;
        } catch (e) {
            console.warn('LessonAccess: _countAttempts failed', e);
            return 0;
        }
    },

    async _evaluateRule(rule, studentId) {
        const now   = new Date();
        const from  = rule.available_from  ? new Date(rule.available_from)  : null;
        const until = rule.available_until ? new Date(rule.available_until) : null;

        if (from && now < from) {
            return {
                allowed: false,
                reason:  'not_yet_available',
                availableDate: from,
                message: rule.message_override || `This lesson will be available on ${from.toLocaleDateString()}.`
            };
        }

        if (until && now > until) {
            return {
                allowed: false,
                reason:  'deadline_passed',
                deadlineDate: until,
                message: rule.message_override || `The deadline for this lesson passed on ${until.toLocaleDateString()}.`
            };
        }

        // Attempt limit check (only when activity_key + max_attempts are configured)
        const maxAttempts  = rule.max_attempts  ?? null;
        const isRepeatable = rule.is_repeatable ?? true;
        const activityKey  = rule.activity_key  ?? null;

        if (activityKey && studentId && (maxAttempts !== null || isRepeatable === false)) {
            const attemptsUsed = await this._countAttempts(activityKey, studentId);
            const effectiveMax = maxAttempts !== null ? maxAttempts : (isRepeatable ? Infinity : 1);

            if (attemptsUsed >= effectiveMax) {
                return {
                    allowed:      false,
                    reason:       'max_attempts_reached',
                    attemptsUsed,
                    maxAttempts:  effectiveMax,
                    message:      rule.message_override ||
                                  `You have already completed this test (${attemptsUsed}/${effectiveMax} attempt${effectiveMax !== 1 ? 's' : ''}). Contact your instructor to reactivate it.`
                };
            }

            return { allowed: true, isRepeatable, maxAttempts: effectiveMax, attemptsUsed };
        }

        return { allowed: true, isRepeatable, maxAttempts };
    }
};

// Export for usage in other scripts
window.LessonAccess = LessonAccess;
