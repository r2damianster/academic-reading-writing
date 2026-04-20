# Lesson Access & Config Race Condition (BUG-001)

## Context
During the implementation of Lesson Availability Controls, a race condition was identified in the `SlideEngine` and `ReadingEngine`. Additionally, a standardized `status` object was introduced to handle multi-layered access checks.

## Issues Identified

### 1. Supabase Config Race Condition (BUG-001)
**Problem**: The engines frequently attempted to call Supabase (to resolve `student_id` or check availability) before the `/api/config` fetch had completed. This resulted in undefined `SUPABASE_URL` or `SUPABASE_KEY` values, causing silent failures in access enforcement.

**Solution**:
Implemented a singleton promise `_configReady` in both engines.
```javascript
const _configReady = fetch('/api/config')
    .then(r => r.json())
    .then(cfg => {
        SUPABASE_URL = cfg.supabaseUrl;
        SUPABASE_KEY = cfg.supabaseKey;
    });

// Any sensitive operation now awaits this:
async function init() {
    await _configReady;
    // ... logic using Supabase
}
```

### 2. Status Object in Verification
**Problem**: Access logic was fragmented and hard to display in the UI. Students needed to know *why* a lesson was locked (e.g., "Available in 3 days" vs. "Deadline passed").

**Solution**:
The `LessonAccess.check(lessonId)` method returns a standardized **Status Object**:
```javascript
{
    allowed: boolean,
    reason: 'not_yet_available' | 'deadline_passed' | 'no_active_login' | null,
    message: string (user-friendly explanation),
    availableDate: Date | null,
    deadlineDate: Date | null
}
```
Both the Sidebar (`index.html`) and the Engines (`slide-engine.js`, `reading-engine.js`) use this object to:
1. Apply visual classes (`.locked`).
2. Show alerts with helpful date information.
3. Trigger a full-screen "Locked" overlay if the student attempts direct URL access.

## Best Practices
- **Always await `_configReady`**: If adding new Supabase-dependent features to the engines, ensure the config is loaded.
- **Unified Logic**: Always use `LessonAccess.check()` rather than querying the `lesson_availability` table directly from individual components to ensure consistency across the app.
