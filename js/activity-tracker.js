/* js/activity-tracker.js
 * Trackea comportamiento general de la lección:
 * tiempo en página, tab switches, navegación entre slides.
 * No sabe nada del essay — eso es responsabilidad de essay-handler.js
 */

window.ActivityTracker = (function () {

    let _lessonName     = "";
    let _pageStart      = null;
    let _tabSwitches    = 0;
    let _slidesVisited  = 0;
    let _boundBlur      = null;

    function _onBlur() { _tabSwitches++; }

    function init(lessonName) {
        _lessonName    = lessonName;
        _pageStart     = Date.now();
        _tabSwitches   = 0;
        _slidesVisited = 1; // empieza en slide 1

        if (_boundBlur) window.removeEventListener('blur', _boundBlur);
        _boundBlur = _onBlur;
        window.addEventListener('blur', _boundBlur);

        console.log("📊 ActivityTracker initialized for:", _lessonName);
    }

    // Llamar desde nextSlide() si se quiere contar slides visitados
    function trackSlide() {
        _slidesVisited++;
    }

    function getActivityAudit() {
        const durationSec = _pageStart
            ? Math.round((Date.now() - _pageStart) / 1000)
            : null;

        return {
            lessonName:      _lessonName,
            tabSwitches:     _tabSwitches,
            slidesVisited:   _slidesVisited,
            durationSec:     durationSec
        };
    }

    return { init, trackSlide, getActivityAudit };

})();