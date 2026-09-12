/* The decorative film plays only when requested. The static poster is the
   default so the membership action has the opening screen's attention. */
(function () {
  'use strict';
  var video = document.getElementById('capital-film');
  var button = document.querySelector('.film-toggle');
  if (!video || !button) return;
  var requested = false;
  var inView = false;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function label() {
    button.innerHTML = video.paused ? 'Play film <span aria-hidden="true">▷</span>' : 'Pause film <span aria-hidden="true">Ⅱ</span>';
  }
  function pause() { video.pause(); label(); }
  async function play() {
    try { await video.play(); } catch (_) { requested = false; }
    if (!requested || document.hidden || !inView) pause();
    label();
  }
  button.hidden = false;
  button.addEventListener('click', function () {
    requested = video.paused;
    if (requested) { inView = true; play(); } else pause();
  });
  video.addEventListener('play', label);
  video.addEventListener('pause', label);
  video.addEventListener('ended', function () { requested = false; label(); });
  video.addEventListener('error', function () { button.hidden = true; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (!inView) pause();
      else if (requested && !document.hidden) play();
    }, { threshold:0.15 }).observe(video);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause();
    else if (requested && inView) play();
  });
  function reduce() { if (motion.matches) { requested = false; pause(); } }
  if (motion.addEventListener) motion.addEventListener('change', reduce);
  else motion.addListener(reduce);
})();
