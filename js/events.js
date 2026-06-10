/* ==========================================================================
   KCL AISOC, events.js
   Event filtering logic (vanilla JS, no dependencies)
   ========================================================================== */

/* --------------------------------------------------------------------------
   HOW TO ADD A REAL EVENT
   --------------------------------------------------------------------------
   1. Copy one of the .event-card divs in events.html.
   2. Set the data-category attribute to one of:
        workshops | speakers | competitions | networking
      Example: <article class="event-card visible" data-category="workshops">
   3. Fill in: event type tag, title, date, description, and re-enable the
      sign-up button by removing the disabled attribute and updating href.
   4. Remove the aria-disabled="true" attribute from the button.
   5. The filter logic below will automatically handle show/hide for the new card.
   -------------------------------------------------------------------------- */

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
