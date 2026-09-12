/* ==========================================================================
   KCL AISOC, main.js
   Shared navigation behaviour. No dependencies.
   ========================================================================== */

(function () {
  'use strict';

  function initNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu   = document.getElementById('nav-links');

    /* Current page link. Guide and article sub-pages highlight their parent
       section; aria-current keeps the state accessible. */
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var sectionMap = {
      'cv-guide.html': 'resources.html',
      'cover-letter-guide.html': 'resources.html',
      'application-questions.html': 'resources.html',
      'spring-weeks.html': 'resources.html',
      'organisations-to-join.html': 'resources.html',
      'where-to-look.html': 'resources.html',
      'cold-outreach.html': 'resources.html',
      'infrastructure-article.html': 'insights.html',
      'private-equity-article.html': 'insights.html',
      'endowment-article.html': 'insights.html',
      'hedge-fund-ai-article.html': 'insights.html',
      'pe-exit-crisis-article.html': 'insights.html',
      'situational-awareness-article.html': 'insights.html',
      'vc-concentration-article.html': 'insights.html',
    };
    var target = sectionMap[page] || page;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = (link.getAttribute('href') || '').toLowerCase();
      var isHome = target === 'index.html' && (href === 'index.html' || href === './');
      if (isHome || href === target) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    if (!toggle || !menu) return;

    /* Close button inside the overlay, since the overlay covers the toggle. */
    var closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
    menu.appendChild(closeBtn);

    function openMenu() {
      toggle.classList.add('active');
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var first = menu.querySelector('a');
      if (first) first.focus();
    }

    function closeMenu(returnFocus) {
      if (!menu.classList.contains('open')) return;
      toggle.classList.remove('active');
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      menu.classList.contains('open') ? closeMenu(true) : openMenu();
    });
    closeBtn.addEventListener('click', function () { closeMenu(true); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu(true);
    });

    /* If the viewport grows past the mobile breakpoint, reset the overlay. */
    var mq = window.matchMedia('(min-width: 769px)');
    var onChange = function (ev) { if (ev.matches) closeMenu(false); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})();
