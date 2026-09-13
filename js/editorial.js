/* Shared motion enhancements. Content remains visible if JS or GSAP is unavailable. */
(function () {
  'use strict';
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeAnimations = new Set();
  var ease = 'cubic-bezier(.22, 1, .36, 1)';

  function animate(element, frames, options) {
    if (motion.matches || !element.animate) return null;
    var animation = element.animate(frames, options);
    activeAnimations.add(animation);
    animation.finished.catch(function () {}).finally(function () { activeAnimations.delete(animation); });
    return animation;
  }

  // The film autoplays muted, pauses offscreen, and remembers an explicit pause.
  var video = document.getElementById('capital-film');
  var button = document.querySelector('.film-toggle');
  if (video && button) {
    var requested = !motion.matches;
    var inView = false;
    video.muted = true;
    video.loop = true;
    button.hidden = false;
    function label() {
      button.innerHTML = video.paused ? 'Play film <span aria-hidden="true">▷</span>' : 'Pause film <span aria-hidden="true">Ⅱ</span>';
    }
    function pause() { video.pause(); label(); }
    async function play() {
      try { await video.play(); } catch (_) { /* Keep the poster and play control if autoplay is blocked. */ }
      if (!requested || document.hidden || !inView) pause();
      label();
    }
    button.addEventListener('click', function () {
      requested = video.paused;
      if (requested) { inView = true; play(); } else pause();
    });
    video.addEventListener('play', label);
    video.addEventListener('pause', label);
    video.addEventListener('error', function () { button.hidden = true; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) pause();
        else if (requested && !document.hidden) play();
      }, { threshold:0.15 }).observe(video);
    } else {
      inView = true;
      if (requested) play();
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) pause();
      else if (requested && inView) play();
    });
  }

  // Short staggered entrances connect the supporting sections without hiding
  // content in CSS or re-running entrances when scrolling back up.
  if ('IntersectionObserver' in window && !motion.matches) {
    var entrances = new IntersectionObserver(function (entries) {
      entries.filter(function (entry) { return entry.isIntersecting; }).forEach(function (entry, index) {
        entrances.unobserve(entry.target);
        animate(entry.target, [
          { opacity:0, transform:'translateY(18px)' },
          { opacity:1, transform:'translateY(0)' }
        ], { duration:650, delay:Math.min(index, 3) * 65, easing:ease, fill:'backwards' });
      });
    }, { threshold:0.08, rootMargin:'0px 0px -20px 0px' });
    document.querySelectorAll('.page-home .section-kicker, .market-heading, .market-row, .programme-row').forEach(function (element) {
      entrances.observe(element);
    });
  }

  // Animate disclosure height in both directions, including rapid reversals.
  // Native <details> remains the fallback and provides keyboard interaction.
  document.querySelectorAll('.market-row, .programme-row').forEach(function (details) {
    var summary = details.querySelector('summary');
    var animation = null;
    var targetOpen = details.open;
    function clear() {
      details.style.height = '';
      details.style.overflow = '';
    }
    summary.addEventListener('click', function (event) {
      if (motion.matches || !details.animate) return;
      event.preventDefault();
      var start = details.getBoundingClientRect().height;
      targetOpen = animation ? !targetOpen : !details.open;
      if (animation) animation.cancel();
      details.open = true;
      details.style.height = '';
      var border = parseFloat(getComputedStyle(details).borderTopWidth) + parseFloat(getComputedStyle(details).borderBottomWidth);
      var end = targetOpen ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + border;
      details.style.overflow = 'hidden';
      animation = animate(details, [{ height:start + 'px' }, { height:end + 'px' }], {
        duration:360, easing:ease
      });
      animation.onfinish = function () { details.open = targetOpen; animation = null; clear(); };
    });
    function settle() {
      if (!motion.matches || !animation) return;
      animation.cancel(); animation = null; details.open = targetOpen; clear();
    }
    if (motion.addEventListener) motion.addEventListener('change', settle);
    else motion.addListener(settle);
  });

  // A small amount of image depth; text and controls stay fixed and readable.
  if (video && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.matchMedia().add('(min-width: 961px) and (prefers-reduced-motion: no-preference)', function () {
      gsap.fromTo(video, { scale:1.025, y:0 }, {
        scale:1.085, y:12, ease:'none',
        scrollTrigger:{ trigger:'.opening-film', start:'top top', end:'bottom top', scrub:0.8 }
      });
    });
  }
  function motionChange() {
    if (!motion.matches) return;
    activeAnimations.forEach(function (animation) { animation.cancel(); });
    if (video && button) { requested = false; pause(); }
  }
  if (motion.addEventListener) motion.addEventListener('change', motionChange);
  else motion.addListener(motionChange);
})();
