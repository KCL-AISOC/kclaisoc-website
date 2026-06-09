/* ==========================================================================
   KCL AISOC — main.js
   GSAP-powered animations + navigation + shared interactions
   GSAP & ScrollTrigger loaded via CDN before this file in each HTML page.
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Guard: if GSAP hasn't loaded, fall back to showing all content
     ------------------------------------------------------------------ */
  if (typeof gsap === 'undefined') {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    ['main', 'footer', '.hero-inner', '.hero-bg'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    initNav();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* On load, refresh ScrollTrigger to fix iOS Safari viewport calculations
     that shift when the browser URL bar shows or hides. */
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

  /* ------------------------------------------------------------------
     1. Scroll Progress Indicator
     ------------------------------------------------------------------ */
  function initScrollProgress() {
    var bar = document.getElementById('scroll-progress');
    if (!bar) return;

    gsap.to(bar, {
      width: '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.4,
      },
    });
  }

  /* ------------------------------------------------------------------
     2. Navigation — scroll state + active link + mobile overlay
     ------------------------------------------------------------------ */
  function initNav() {
    var nav    = document.getElementById('main-nav');
    var toggle = document.getElementById('nav-toggle');
    var menu   = document.querySelector('.nav-links');

    /* Scroll state */
    if (nav) {
      var ticking = false;
      function updateNav() {
        nav.classList.toggle('scrolled', window.scrollY > 40);
        ticking = false;
      }
      window.addEventListener('scroll', function () {
        if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
      }, { passive: true });
      updateNav();
    }

    /* Active page link */
    var page = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href   = link.getAttribute('href');
      var isHome = (page === '' || page === 'index.html') && (href === 'index.html' || href === './');
      if (isHome || href === page) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });

    if (!toggle || !menu) return;

    function openMenu() {
      toggle.classList.add('active');
      menu.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(menu.querySelectorAll('li'),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.05, delay: 0.1 });
      }
    }

    function closeMenu() {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      menu.classList.contains('open') ? closeMenu() : openMenu();
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') &&
          !menu.contains(e.target) &&
          !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  /* ------------------------------------------------------------------
     3. Page Transitions (fade out on leave, fade in on load)
     ------------------------------------------------------------------ */
  function initPageTransitions() {
    /* Fade in on load — desktop only; on mobile skipping this prevents
       GSAP from setting main to opacity:0 and leaving hero content invisible */
    if (window.innerWidth > 768) {
      gsap.from('main, footer', {
        opacity: 0,
        duration: 0.35,
        ease: 'power1.out',
        clearProps: 'opacity',
      });
    }

    /* Fade out on internal link click */
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href) return;

      var isInternal = !href.startsWith('http') &&
                       !href.startsWith('//') &&
                       !href.startsWith('#') &&
                       !href.startsWith('mailto') &&
                       !href.startsWith('tel') &&
                       !link.hasAttribute('target') &&
                       !link.hasAttribute('download');

      if (isInternal) {
        e.preventDefault();
        gsap.to('main, footer', {
          opacity: 0,
          duration: 0.2,
          ease: 'power1.in',
          onComplete: function () {
            window.location.href = href;
          },
        });
      }
    });
  }

  /* ------------------------------------------------------------------
     4. Scroll-Triggered Section Reveals (vertical + horizontal)
     ------------------------------------------------------------------ */
  function initScrollReveals() {
    /* Batch staggered grids */
    var staggerParents = [
      '.events-preview-grid',
      '.events-grid',
      '.asset-grid',
      '.committee-grid',
      '.insights-grid',
      '.resource-grid',
      '.pricing-grid',
      '.benefits-grid',
      '.join-benefits-list',
      '.calendar-grid',
      '.partner-stats-grid',
    ];

    staggerParents.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (parent) {
        var children = parent.querySelectorAll(
          '.event-card, .asset-tile, .committee-card, .insight-card, ' +
          '.resource-card, .pricing-card, .benefit-pillar, .join-benefit, ' +
          '.calendar-term, .partner-stat-item'
        );
        if (!children.length) return;

        gsap.to(children, {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.09,
          scrollTrigger: {
            trigger: parent,
            start: 'top 85%',
            once: true,
          },
        });
      });
    });

    /* Individual .reveal — vertical */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      if (el.closest(staggerParents.join(','))) return;
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 87%',
          once: true,
        },
      });
    });

    /* Horizontal reveals — left */
    gsap.utils.toArray('.reveal-left').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    /* Horizontal reveals — right */
    gsap.utils.toArray('.reveal-right').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        x: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    /* Page header: eyebrow + h1 + p sequence */
    var pageHeader = document.querySelector('.page-header-text');
    if (pageHeader) {
      var phEls = pageHeader.querySelectorAll('.eyebrow, h1, p');
      gsap.from(phEls, {
        opacity: 0,
        y: 28,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.12,
        delay: 0.2,
      });
      /* Numeral sweeps in from right */
      var numeral = document.querySelector('.page-header-numeral');
      if (numeral) {
        gsap.from(numeral, {
          opacity: 0,
          x: 40,
          duration: 1,
          ease: 'power3.out',
          delay: 0.1,
        });
      }
    }
  }

  /* ------------------------------------------------------------------
     5. Hero Entrance Sequence (index.html only)
     ------------------------------------------------------------------ */
  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    /* Centre lion before timeline starts (prevents transform conflict with scroll scale) */
    var lionEl = document.querySelector('.hero-lion');
    if (lionEl) gsap.set(lionEl, { xPercent: -50, yPercent: -50 });

    var tl = gsap.timeline({ delay: 0.05 });

    /* i) Background + lion fade in together */
    tl.from('.hero-bg', { opacity: 0, duration: 1, ease: 'power1.out' });
    tl.from('.hero-lion', { opacity: 0, scale: 0.94, duration: 1.6, ease: 'power2.out' }, 0);

    /* ii) Headline: word-by-word reveal */
    var headline = document.querySelector('.hero-headline');
    if (headline) {
      var rawHtml = headline.innerHTML;
      var lines = rawHtml.split(/<br\s*\/?>/i);
      var wrappedHtml = lines
        .map(function (line) {
          return line.trim().split(/\s+/).filter(Boolean)
            .map(function (word) {
              return '<span class="hero-word" style="display:inline-block">' + word + '</span>';
            })
            .join('&nbsp;');
        })
        .join('<br>');
      headline.innerHTML = wrappedHtml;

      tl.from('.hero-word', {
        opacity: 0, y: 28, duration: 0.6, stagger: 0.09, ease: 'power3.out',
      }, '-=0.3');
    }

    /* iv) CTAs */
    tl.from('.hero-actions .btn', {
      opacity: 0, y: 14, duration: 0.5, stagger: 0.12, ease: 'power2.out',
    }, '-=0.15');

    /* v) Scroll indicator */
    tl.from('.hero-scroll', { opacity: 0, duration: 0.45 }, '-=0.2');
  }

  /* ------------------------------------------------------------------
     6. Hero Parallax (index.html only)
     Lion zooms in as user scrolls; content fades and rises out.
     ------------------------------------------------------------------ */
  function initParallax() {
    if (!document.querySelector('.hero-bg')) return;

    /* Centre lion via GSAP so scale animation never fights a CSS translate */
    var lion = document.querySelector('.hero-lion');
    if (lion) gsap.set(lion, { xPercent: -50, yPercent: -50 });

    /* Subtle background parallax */
    gsap.to('.hero-bg', {
      y: 60, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    /* Lion zooms in on scroll-down, zooms out on scroll-up (bidirectional via scrub) */
    gsap.to('.hero-lion', {
      scale: 1.55, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.4 },
    });

    /* Ticker fades out as hero leaves view */
    var ticker = document.querySelector('.hero-ticker');
    if (ticker) {
      gsap.to(ticker, {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'center top', end: 'bottom top', scrub: 0.5 },
      });
    }

    /* Hero content fades and rises — cinematic exit */
    gsap.to('.hero-inner', {
      opacity: 0, y: -50, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '8% top', end: '55% top', scrub: 1 },
    });
  }

  /* ------------------------------------------------------------------
     7. Stat Counter — IntersectionObserver, fires once at 40% threshold
     ------------------------------------------------------------------ */
  function initStatCounters() {
    var statsBar = document.querySelector('.stats-bar');
    if (!statsBar) return;

    var fired = false;

    var observer = new IntersectionObserver(function (entries) {
      if (fired || !entries[0].isIntersecting) return;
      fired = true;
      observer.disconnect();

      /* Member count (live from Google Sheets via home.js, fallback 60) */
      var memberEl = document.getElementById('member-count');
      if (memberEl) {
        var target = parseInt(memberEl.getAttribute('data-count')) || 60;
        memberEl.textContent = '0+';
        var obj = { n: 0 };
        gsap.to(obj, {
          n: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            memberEl.textContent = Math.round(obj.n) + '+';
          },
        });
      }

      /* Instagram followers */
      var igEl = document.querySelector('[data-count="370"]');
      if (igEl) {
        igEl.textContent = '0+';
        var igObj = { n: 0 };
        gsap.to(igObj, {
          n: 370,
          duration: 2,
          ease: 'power2.out',
          onUpdate: function () {
            igEl.textContent = Math.round(igObj.n) + '+';
          },
        });
      }

      /* "April 2026" — fades in as a whole rather than counting */
      var foundedEl = statsBar.querySelector('.stat-number:not([data-count])');
      if (foundedEl) {
        gsap.from(foundedEl, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.2,
        });
      }
    }, { threshold: 0.4 });

    observer.observe(statsBar);
  }

  /* ------------------------------------------------------------------
     8. Asset Class Tile Hover (about.html)
     ------------------------------------------------------------------ */
  function initAssetTileHovers() {
    document.querySelectorAll('.asset-tile').forEach(function (tile) {
      var line = tile.querySelector('.asset-tile-hover-line');
      var title = tile.querySelector('h3');

      if (!line || !title) return;

      tile.addEventListener('mouseenter', function () {
        gsap.to(line,  { height: '100%', duration: 0.22, ease: 'power2.out' });
        gsap.to(title, { color: '#C9A961', duration: 0.22 });
        gsap.to(tile,  { backgroundColor: '#0d2755', duration: 0.22 });
      });

      tile.addEventListener('mouseleave', function () {
        gsap.to(line,  { height: '0%',    duration: 0.18, ease: 'power2.in' });
        gsap.to(title, { color: '#FFFFFF', duration: 0.18 });
        gsap.to(tile,  { backgroundColor: '#0A1F44', duration: 0.18 });
      });
    });
  }

  /* ------------------------------------------------------------------
     9. Committee Card Hover (committee.html)
     ------------------------------------------------------------------ */
  function initCommitteeCardHovers() {
    document.querySelectorAll('.committee-card').forEach(function (card) {
      var photo = card.querySelector('.committee-photo');
      var role  = card.querySelector('.committee-role');

      card.addEventListener('mouseenter', function () {
        gsap.to(card,  { y: -4, duration: 0.25, ease: 'power2.out' });
        if (photo) gsap.to(photo, { scale: 1.05, duration: 0.25, ease: 'power2.out' });
        if (role)  gsap.to(role,  { color: '#C9A961', duration: 0.2 });
      });

      card.addEventListener('mouseleave', function () {
        gsap.to(card,  { y: 0, duration: 0.25, ease: 'power2.inOut' });
        if (photo) gsap.to(photo, { scale: 1, duration: 0.25, ease: 'power2.inOut' });
        if (role)  gsap.to(role,  { color: '#C9A961', duration: 0.2 }); /* stays gold by design */
      });
    });
  }

  /* ------------------------------------------------------------------
     10. Sticky Section Headings (resources.html + insights.html)
     ------------------------------------------------------------------ */
  function initStickyHeadings() {
    var sections = document.querySelectorAll('.resource-section, .insights-category-section');
    sections.forEach(function (section) {
      var heading = section.querySelector('.resource-section-title, .insights-section-heading');
      if (!heading) return;

      ScrollTrigger.create({
        trigger: section,
        start: 'top top+=8px',
        end: 'bottom top+=120px',
        pin: heading,
        pinSpacing: false,
        invalidateOnRefresh: true,
      });
    });
  }

  /* ------------------------------------------------------------------
     10b. Scroll-driven video — about-preview section (index.html only)
     Scrubs video.currentTime directly from scroll position so the video
     is static until the user scrolls. Works best with a high-keyframe
     density MP4; ordinary MP4s may stutter slightly on fast seeks.
     ------------------------------------------------------------------ */
  function initScrollVideo() {
    var section = document.querySelector('.about-preview');
    var video   = section && section.querySelector('video');
    if (!section || !video) return;

    /* iOS will not decode/paint frames while seeking unless the video has
       played at least once. Prime it: muted play, then immediately pause,
       so the first frame renders and scroll scrubbing shows real frames. */
    video.muted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');

    var primed = false;
    function prime() {
      if (primed) return;
      primed = true;
      var p = video.play();
      if (p && typeof p.then === 'function') {
        p.then(function () { video.pause(); video.currentTime = 0; })
         .catch(function () { /* blocked; scrubbing may show first frame only */ });
      } else {
        try { video.pause(); } catch (e) {}
      }
    }

    var proxy = { t: 0 };

    function setTime() {
      if (video.duration) video.currentTime = proxy.t * video.duration;
    }

    /* Wait until metadata is loaded so duration is known */
    function setup() {
      prime();
      gsap.to(proxy, {
        t: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        onUpdate: setTime,
      });
    }

    if (video.readyState >= 1) {
      setup();
    } else {
      video.addEventListener('loadedmetadata', setup, { once: true });
      video.load();
    }
  }

  /* ------------------------------------------------------------------
     11. Mobile-safe matchMedia wrapper
     ------------------------------------------------------------------ */
  function initAnimations() {
    var mm = gsap.matchMedia();

    /* Full motion on every screen size — mobile gets the same hero word
       reveal, lion zoom, scroll-scrubbed video, counters and reveals as
       desktop. A safety net in init() force-shows anything that stalls. */
    mm.add('all', function () {
      initHero();
      initParallax();
      initScrollReveals();
      initStatCounters();
      initStickyHeadings();
      initScrollProgress();
      initScrollVideo();
    });

    /* Hover effects only make sense on real hover (pointer) devices */
    mm.add('(hover: hover) and (min-width: 769px)', function () {
      initAssetTileHovers();
      initCommitteeCardHovers();
    });
  }

  /* ------------------------------------------------------------------
     12. Init
     ------------------------------------------------------------------ */
  function init() {
    initNav();
    initPageTransitions();
    initAnimations();

    /* Global safety net: after 2.5 s, force-show anything a GSAP tween may
       have left at opacity 0 (hero words, CTAs, the founded date, reveals).
       Catches iOS scroll-position bugs and intermittent CDN failures so
       content is never left invisible. */
    setTimeout(function () {
      var selectors = '.reveal, .reveal-left, .reveal-right, .hero-word, ' +
        '.hero-actions .btn, .hero-scroll, .stat-number, .page-header-numeral, ' +
        '.page-header-text .eyebrow, .page-header-text h1, .page-header-text p';
      document.querySelectorAll(selectors).forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
      ['main', 'footer', '.hero-inner'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el && parseFloat(getComputedStyle(el).opacity) < 0.5) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
    }, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
