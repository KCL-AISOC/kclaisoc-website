/* ==========================================================================
   KCL AISOC, main.js
   GSAP-powered animations + navigation + shared interactions
   GSAP & ScrollTrigger loaded via CDN before this file in each HTML page.
   ========================================================================== */

(function () {
  'use strict';

  var docEl = document.documentElement;

  /* Show every reveal element and clear the armed hidden state. Used as a
     hard fallback and on back/forward cache restores so nothing stays hidden. */
  function showAllContent() {
    docEl.classList.remove('reveals-on');
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    ['main', 'footer', '.hero-inner', '.hero-bg'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
    /* The lion's design opacity is 0.09, so clear the inline value and let the
       stylesheet win rather than forcing it to 1. */
    ['.hero-lion', '.hero-lion img'].forEach(function (sel) {
      var el = document.querySelector(sel);
      if (el) { el.style.opacity = ''; }
    });
  }

  /* ------------------------------------------------------------------
     Guard: if GSAP hasn't loaded, fall back to showing all content
     ------------------------------------------------------------------ */
  if (typeof gsap === 'undefined') {
    showAllContent();
    initNav();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* Mark that the animation system is live so the inline failsafe does not
     unhide elements that GSAP is about to reveal on scroll. */
  docEl.classList.add('reveals-done');

  /* On load, refresh ScrollTrigger to fix iOS Safari viewport calculations
     that shift when the browser URL bar shows or hides. */
  window.addEventListener('load', function () {
    ScrollTrigger.refresh();
  });

  /* Back/forward cache: when a page is restored from history (browser Back),
     scripts do not re-run, so reveal elements can be left hidden and the page
     looks blank. Force everything visible and recompute triggers. */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      showAllContent();
      if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh(true);
    }
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
     2. Navigation, scroll state + active link + mobile overlay
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

    /* Active page link. Guide sub-pages highlight Resources, their parent
       section; aria-current keeps the state accessible to screen readers. */
    var page = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var sectionMap = {
      'cv-guide.html': 'resources.html',
      'cover-letter-guide.html': 'resources.html',
      'spring-weeks.html': 'resources.html',
      'organisations-to-join.html': 'resources.html',
      'where-to-look.html': 'resources.html',
    };
    var target = sectionMap[page] || page;
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href   = (link.getAttribute('href') || '').toLowerCase();
      var isHome = target === 'index.html' && (href === 'index.html' || href === './');
      if (isHome || href === target) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    if (!toggle || !menu) return;

    /* Inject a visible X close button into the overlay menu. The full screen
       overlay covers the hamburger toggle, so this gives the user a clear,
       always reachable way to dismiss the menu. */
    var closeBtn = menu.querySelector('.nav-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'nav-close';
      closeBtn.type = 'button';
      closeBtn.setAttribute('aria-label', 'Close menu');
      closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
      menu.appendChild(closeBtn);
    }
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeMenu();
    });

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

    /* Tapping the overlay anywhere that is not a navigation link closes the
       menu, so the user can dismiss it by tapping the page area beside it. */
    menu.addEventListener('click', function (e) {
      if (!e.target.closest('a')) closeMenu();
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
    /* Fade in on load, desktop only. On mobile skipping this prevents
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
     Elements already in the viewport on load animate in immediately so the
     page is never blank; elements below the fold animate as they scroll in.
     Cards reveal one after another (subtle stagger) on every page.
     ------------------------------------------------------------------ */
  function inViewOnLoad(el) {
    var r = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    /* Treat anything whose top sits within the viewport (plus a small margin)
       as on-screen at load so it reveals straight away. */
    return r.top < vh * 0.92 && r.bottom > 0;
  }

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

        var vars = {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.09,
        };

        if (inViewOnLoad(parent)) {
          /* Already on screen: stagger them in now, no scroll wait */
          gsap.to(children, vars);
        } else {
          vars.scrollTrigger = { trigger: parent, start: 'top 85%', once: true };
          gsap.to(children, vars);
        }
      });
    });

    /* Individual .reveal, vertical */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      if (el.closest(staggerParents.join(','))) return;
      var vars = { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' };
      if (inViewOnLoad(el)) {
        gsap.to(el, vars);
      } else {
        vars.scrollTrigger = { trigger: el, start: 'top 87%', once: true };
        gsap.to(el, vars);
      }
    });

    /* Horizontal reveals, left and right */
    ['.reveal-left', '.reveal-right'].forEach(function (sel) {
      gsap.utils.toArray(sel).forEach(function (el) {
        var vars = { opacity: 1, x: 0, duration: 0.85, ease: 'power3.out' };
        if (inViewOnLoad(el)) {
          gsap.to(el, vars);
        } else {
          vars.scrollTrigger = { trigger: el, start: 'top 85%', once: true };
          gsap.to(el, vars);
        }
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
    /* Entrance animates the img so it never fights the wrapper's
       scroll-scrub scale tween in initParallax (two tweens writing the same
       property on the same element is timing-dependent on iOS). */
    tl.from('.hero-lion img', { opacity: 0, scale: 0.94, duration: 1.6, ease: 'power2.out' }, 0);

    /* ii) Headline: line-by-line unmask — each line rises out of its
       clipped .hero-line row (spans are in the markup, not injected) */
    if (document.querySelector('.hero-line-inner')) {
      tl.from('.hero-line-inner', {
        yPercent: 110, duration: 0.95, stagger: 0.14, ease: 'power4.out',
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

    /* Hero content fades and rises - cinematic exit */
    gsap.to('.hero-inner', {
      opacity: 0, y: -50, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '8% top', end: '55% top', scrub: 1 },
    });
  }

  /* ------------------------------------------------------------------
     6b. Hero asset class ticker, GSAP driven so it loops reliably on
     every device (a CSS marquee can be frozen by reduced motion settings
     or a sticky tap state on touch screens). The track content is
     duplicated in the markup, so sliding it to minus 50 percent and
     repeating gives a seamless continuous loop.
     ------------------------------------------------------------------ */
  function initTicker() {
    var track = document.querySelector('.hero-ticker-track');
    if (!track) return;
    gsap.to(track, {
      xPercent: -50,
      ease: 'none',
      duration: 32,
      repeat: -1,
    });
  }

  /* ------------------------------------------------------------------
     7. Stat Counter, IntersectionObserver, fires once at 40% threshold
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
          onComplete: function () { memberEl.textContent = target + '+'; },
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
          onComplete: function () { igEl.textContent = '370+'; },
        });
      }

      /* The founded year ("April 2026") is plain text revealed with its stat
         item, so it is always visible and needs no separate animation here. */
    }, { threshold: 0.25 });

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
     10b. Scroll-driven video, about-preview section (index.html only)
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
     10c. Line masks — headings whose lines rise out of clipped rows.
     Splits .line-mask elements on <br> into .lm-line/.lm-inner pairs.
     ------------------------------------------------------------------ */
  function initLineMasks() {
    gsap.utils.toArray('.line-mask').forEach(function (el) {
      var lines = el.innerHTML.split(/<br\s*\/?>/i);
      el.innerHTML = lines.map(function (line) {
        return '<span class="lm-line"><span class="lm-inner">' + line.trim() + '</span></span>';
      }).join('');

      var inners = el.querySelectorAll('.lm-inner');
      var vars = { yPercent: 110, duration: 0.85, stagger: 0.12, ease: 'power4.out' };
      if (inViewOnLoad(el)) {
        gsap.from(inners, vars);
      } else {
        vars.scrollTrigger = { trigger: el, start: 'top 85%', once: true };
        gsap.from(inners, vars);
      }
    });
  }

  /* ------------------------------------------------------------------
     10d. Stats rule — a full-gold hairline ruled across the strip as it
     enters view (index.html only)
     ------------------------------------------------------------------ */
  function initStatsRule() {
    var rule = document.querySelector('.stats-rule');
    if (!rule) return;
    gsap.from(rule, {
      scaleX: 0,
      duration: 1.4,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: '.stats-bar', start: 'top 80%', once: true },
    });
  }

  /* ------------------------------------------------------------------
     10e. About-preview parallax — the video layer drifts against the
     text so the section reads as two planes (index.html only). The
     wrapper is overscanned by 50px in CSS to cover the travel.
     ------------------------------------------------------------------ */
  function initAboutParallax() {
    var layer = document.querySelector('.about-preview-video');
    if (!layer) return;
    gsap.fromTo(layer, { y: -50 }, {
      y: 50,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-preview',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  /* ------------------------------------------------------------------
     10f. The Vault — asset class index (index.html only).
     Entrance stagger via GSAP; the gold centre highlight is driven by
     IntersectionObserver with a narrow centre band rather than raw
     scroll position, so iOS momentum scrolling cannot make it jitter.
     ------------------------------------------------------------------ */
  function initVault() {
    var list = document.getElementById('vault-list');
    if (!list) return;
    var lines = gsap.utils.toArray(list.querySelectorAll('.vault-line'));
    if (!lines.length) return;

    list.closest('.vault').classList.add('vault-armed');

    gsap.from(lines, {
      opacity: 0,
      y: 36,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: list, start: 'top 85%', once: true },
    });

    if (!('IntersectionObserver' in window)) {
      lines[2].classList.add('vault-active');
      return;
    }

    /* A line becomes active when it enters the middle ~12% of the
       viewport; the last active line keeps its gold when none is in
       the band, so one line is always lit once scrolling begins. */
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        lines.forEach(function (l) { l.classList.remove('vault-active'); });
        entry.target.classList.add('vault-active');
      });
    }, { rootMargin: '-44% 0px -44% 0px', threshold: 0 });

    lines.forEach(function (l) { io.observe(l); });
  }

  /* ------------------------------------------------------------------
     10g. Magnetic button — the join CTA leans toward the cursor.
     Wired only on hover-capable pointer devices via matchMedia below.
     ------------------------------------------------------------------ */
  function initMagnetic() {
    document.querySelectorAll('.btn-magnetic').forEach(function (btn) {
      var strength = 16;
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        var y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        gsap.to(btn, { x: x * strength, y: y * strength * 0.6, duration: 0.4, ease: 'power3.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)' });
      });
    });
  }

  /* ------------------------------------------------------------------
     11. Mobile-safe matchMedia wrapper
     ------------------------------------------------------------------ */
  function initAnimations() {
    var mm = gsap.matchMedia();

    /* Reduced motion: a graceful static page. Everything visible, stat
       numbers keep their markup values, and the vault rests with one
       line lit instead of tracking the scroll. */
    mm.add('(prefers-reduced-motion: reduce)', function () {
      showAllContent();
      var vaultLines = document.querySelectorAll('.vault-line');
      if (vaultLines.length > 2) vaultLines[2].classList.add('vault-active');
    });

    /* Full motion on every screen size. Mobile gets the same hero line
       unmask, lion zoom, scroll-scrubbed video, vault highlight, counters
       and reveals as desktop. A safety net in init() force-shows anything
       that stalls. */
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      initHero();
      initParallax();
      initTicker();
      initLineMasks();
      initScrollReveals();
      initStatCounters();
      initStatsRule();
      initStickyHeadings();
      initScrollProgress();
      initScrollVideo();
      initAboutParallax();
      initVault();
    });

    /* Hover effects only make sense on real hover (pointer) devices */
    mm.add('(hover: hover) and (min-width: 769px) and (prefers-reduced-motion: no-preference)', function () {
      initAssetTileHovers();
      initCommitteeCardHovers();
      initMagnetic();
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
      var selectors = '.reveal, .reveal-left, .reveal-right, ' +
        '.hero-actions .btn, .hero-scroll, .stat-number, .page-header-numeral, ' +
        '.page-header-text .eyebrow, .page-header-text h1, .page-header-text p';
      document.querySelectorAll(selectors).forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        }
      });
      /* Masked lines hide via translateY inside a clipped row (opacity stays
         1), so check the transform rather than opacity for these. */
      document.querySelectorAll('.hero-line-inner, .lm-inner').forEach(function (el) {
        try {
          var t = getComputedStyle(el).transform;
          if (t && t !== 'none' && Math.abs(new DOMMatrixReadOnly(t).m42) > 2) {
            el.style.transform = 'none';
          }
        } catch (e) {
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
      /* Hero lion: its design opacity is 0.09, so don't force it to 1 - just
         clear a stuck inline 0 so the stylesheet value applies again. */
      ['.hero-lion', '.hero-lion img'].forEach(function (sel) {
        var el = document.querySelector(sel);
        if (el && parseFloat(getComputedStyle(el).opacity) < 0.05) {
          el.style.opacity = '';
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
