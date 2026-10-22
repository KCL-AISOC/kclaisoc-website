/* ==========================================================================
   KCL AISOC, event-listings.js
   Renders event lists from js/event-data.js and decides, from each event's
   end time, whether it is upcoming or past. Load it after event-data.js and
   BEFORE main.js, so the scroll reveal system sees the rendered cards.

   Hooks (all optional, a page uses whichever it needs):
     <div data-event-list="upcoming|past" data-event-layout="programme|card">
         Filled with events. Optional attributes on the same element:
           data-event-limit="3"       show at most this many
           data-event-fallback="past" if nothing is upcoming, show past events
     [data-event-heading="Text"]   inside the same <section> as a list with a
         fallback: its text becomes "Text" when the fallback is used.
     [data-event-filter]           hidden when the upcoming list is empty.
     [data-event-hide-empty]       hidden when the list inside it is empty.
     <body data-event-id="slug">   an event's own page. Then:
         [data-event-status]       gets "Upcoming Event" or "Past Event"
         [data-event-when="upcoming|past"] shown only in that state
   ========================================================================== */

(function () {
  'use strict';

  var CATEGORY_LABELS = {
    workshops: 'Workshop',
    speakers: 'Speaker Event',
    competitions: 'Competition',
    networking: 'Networking'
  };

  var events = Array.isArray(window.AISOC_EVENTS) ? window.AISOC_EVENTS : [];

  /* ?preview-date=YYYY-MM-DD lets anyone check how the site will look on
     another day. Ignored if it does not parse. */
  function getNow() {
    var param = new URLSearchParams(window.location.search).get('preview-date');
    var preview = param ? new Date(param) : null;
    return preview && !isNaN(preview) ? preview : new Date();
  }

  var now = getNow();

  function isPast(ev) {
    return new Date(ev.end) <= now;
  }

  function isLive(ev) {
    return new Date(ev.start) <= now && !isPast(ev);
  }

  function byStart(a, b) {
    return new Date(a.start) - new Date(b.start);
  }

  var upcoming = events.filter(function (ev) { return !isPast(ev); }).sort(byStart);
  var past = events.filter(isPast).sort(function (a, b) { return byStart(b, a); });

  /* ---- small DOM helpers (textContent only, never innerHTML) ---- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function link(href, className, text, external) {
    var a = el('a', className, text);
    a.href = href;
    if (external) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }

  function dateLine(ev) {
    return [ev.when, ev.where].filter(Boolean).join(' · ');
  }

  function copyFor(ev) {
    return isPast(ev) ? (ev.recap || ev.summary) : ev.summary;
  }

  function statusFor(ev) {
    if (isPast(ev)) return 'Past event';
    if (isLive(ev)) return 'Happening now';
    return ev.signupUrl ? 'Sign ups open' : 'Coming soon';
  }

  /* ---- layouts ---- */

  /* Home page: an expandable row per event. */
  function programmeRow(ev) {
    var row = el('details', 'programme-row');
    var summary = el('summary');
    summary.appendChild(el('h3', null, ev.title));
    summary.appendChild(el('span', 'event-status', statusFor(ev)));
    var plus = el('span', 'programme-plus', '+');
    plus.setAttribute('aria-hidden', 'true');
    summary.appendChild(plus);
    row.appendChild(summary);

    var detail = el('div', 'programme-detail');
    detail.appendChild(el('p', 'event-card-date', dateLine(ev)));
    detail.appendChild(el('p', null, copyFor(ev)));

    var actions = el('div', 'programme-actions');
    if (!isPast(ev) && ev.signupUrl) actions.appendChild(textAction(ev.signupUrl, 'Sign up', true));
    if (ev.page) actions.appendChild(textAction(ev.page, isPast(ev) ? 'See how it went' : 'View event details'));
    if (actions.children.length) detail.appendChild(actions);

    row.appendChild(detail);
    return row;
  }

  function textAction(href, label, external) {
    var a = link(href, 'text-action', label + ' ', external);
    var arrow = el('span', null, '↗');
    arrow.setAttribute('aria-hidden', 'true');
    a.appendChild(arrow);
    return a;
  }

  /* Events page: a card per event. Only upcoming cards carry
     data-category, so the filter bar (js/events.js) acts on those alone. */
  function card(ev, wide) {
    var article = el('article', 'event-card reveal' + (wide ? ' event-card--wide' : ''));
    if (!isPast(ev)) article.setAttribute('data-category', ev.category);

    article.appendChild(el('span', 'event-card-tag', CATEGORY_LABELS[ev.category] || 'Event'));
    article.appendChild(el('h3', null, ev.title));
    article.appendChild(el('p', 'event-card-date', dateLine(ev)));
    article.appendChild(el('p', null, copyFor(ev)));

    var actions = el('div', 'event-card-actions');
    if (!isPast(ev) && ev.signupUrl) actions.appendChild(link(ev.signupUrl, 'btn btn-primary', 'Sign up', true));
    if (ev.page) actions.appendChild(link(ev.page, 'btn btn-outline', isPast(ev) ? 'View recap' : 'View details'));
    if (actions.children.length) article.appendChild(actions);

    return article;
  }

  function emptyState(container, layout) {
    var box = el('div', 'events-empty' + (layout === 'card' ? ' events-empty--card' : ''));
    box.appendChild(el('p', 'events-empty-title', 'No upcoming events right now.'));
    var p = el('p', null, 'New dates are announced on ');
    p.appendChild(link('https://www.instagram.com/kclaisoc', null, 'Instagram', true));
    p.appendChild(document.createTextNode(' and to members first. '));
    p.appendChild(link('join.html', null, 'Join the society'));
    p.appendChild(document.createTextNode(' to hear about them.'));
    box.appendChild(p);
    container.appendChild(box);
  }

  /* ---- render every list on the page ---- */
  function renderLists() {
    document.querySelectorAll('[data-event-list]').forEach(function (container) {
      var which = container.getAttribute('data-event-list');
      var layout = container.getAttribute('data-event-layout') || 'card';
      var limit = parseInt(container.getAttribute('data-event-limit'), 10) || Infinity;
      var list = which === 'past' ? past : upcoming;

      if (!list.length && container.getAttribute('data-event-fallback') === 'past' && past.length) {
        list = past;
        var section = container.closest('section');
        var heading = section && section.querySelector('[data-event-heading]');
        if (heading) heading.textContent = heading.getAttribute('data-event-heading');
      }

      list = list.slice(0, limit);
      container.textContent = '';

      if (!list.length) {
        var wrapper = container.closest('[data-event-hide-empty]');
        if (wrapper) wrapper.hidden = true;
        else if (which === 'upcoming') emptyState(container, layout);
        return;
      }

      list.forEach(function (ev) {
        container.appendChild(layout === 'programme' ? programmeRow(ev) : card(ev, list.length === 1));
      });
    });

    if (!upcoming.length) {
      document.querySelectorAll('[data-event-filter]').forEach(function (bar) { bar.hidden = true; });
    }
  }

  /* ---- an event's own page ---- */
  function applyPageState() {
    var id = document.body.getAttribute('data-event-id');
    if (!id) return;
    var ev = events.filter(function (e) { return e.id === id; })[0];
    if (!ev) return;
    var state = isPast(ev) ? 'past' : 'upcoming';

    document.querySelectorAll('[data-event-status]').forEach(function (node) {
      node.textContent = state === 'past' ? 'Past Event' : 'Upcoming Event';
    });
    document.querySelectorAll('[data-event-when]').forEach(function (node) {
      node.hidden = node.getAttribute('data-event-when') !== state;
    });
  }

  function init() {
    renderLists();
    applyPageState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
