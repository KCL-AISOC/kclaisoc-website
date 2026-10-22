/* ==========================================================================
   KCL AISOC, events.js
   Event filtering logic (vanilla JS, no dependencies)
   ========================================================================== */

/* Events themselves live in js/event-data.js and are rendered by
   js/event-listings.js, which loads before this file. Only upcoming cards
   carry data-category, so this filter never touches past events. */

(function () {
  'use strict';

  function initEventFilter() {
    var filterBtns = document.querySelectorAll('.filter-btn');
    var eventCards = document.querySelectorAll('.event-card[data-category]');

    if (!filterBtns.length || !eventCards.length) return;

    // Set all cards visible on load
    eventCards.forEach(function (card) {
      card.classList.add('visible');
      card.classList.remove('hidden');
    });

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filter = btn.getAttribute('data-filter');

        // Update active state
        filterBtns.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        // Filter cards
        eventCards.forEach(function (card) {
          var category = card.getAttribute('data-category');
          var show = filter === 'all' || category === filter;

          if (show) {
            // Unhide: first remove hidden, then trigger reflow, then add visible
            card.classList.remove('hidden');
            // Small delay so CSS transition fires properly
            requestAnimationFrame(function () {
              card.classList.add('visible');
            });
          } else {
            card.classList.remove('visible');
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventFilter);
  } else {
    initEventFilter();
  }
})();
