/* ==========================================================================
   KCL AISOC, event-data.js
   The single list of society events. The home page "Upcoming events" list,
   the Events page and each event's own page all read from here, so an event
   only ever needs to be entered once.
   ========================================================================== */

/* --------------------------------------------------------------------------
   HOW TO ADD AN EVENT
   --------------------------------------------------------------------------
   1. Copy the example object below into AISOC_EVENTS and fill it in.
   2. start / end are ISO date-times WITH the London offset:
        +01:00 from late March to late October (BST)
        +00:00 for the rest of the year (GMT)
   3. That is all. While the end time is in the future the event shows as
      upcoming (with its sign-up link). Once the end time passes it moves
      to "Past events" on its own and the sign-up link disappears. Nothing
      else needs editing when an event finishes.

   Fields
     id         Short unique slug, e.g. 'spring-week-panel'. An event page
                links itself to this entry with <body data-event-id="...">.
     title      Event name.
     category   workshops | speakers | competitions | networking
                (drives the Events page filter and the card tag).
     start/end  ISO date-times, see above.
     when       Human date and time, e.g. 'Wednesday 7 October 2026 · 6.30pm to 8pm'.
     where      Venue, e.g. 'Bush House, Strand Campus'.
     summary    Present or future tense copy, shown while upcoming.
     recap      Past tense copy, shown once the event has ended.
                Optional: falls back to summary.
     signupUrl  Optional. Shown only while the event is upcoming.
     page       Optional. The event's own page, e.g. 'spring-week-panel.html'.

   To preview the site as of another date, add ?preview-date=2026-10-01 to
   any page URL.
   -------------------------------------------------------------------------- */

window.AISOC_EVENTS = [
  {
    id: 'spring-week-panel',
    title: 'Spring Week Panel',
    category: 'speakers',
    start: '2026-10-07T18:30:00+01:00',
    end: '2026-10-07T20:00:00+01:00',
    when: 'Wednesday 7 October 2026 · 6.30pm to 8pm',
    where: 'Bush House, Strand Campus',
    summary: 'Six KCL students who have completed spring weeks talk through what the week looks like day to day, what doing well involves, and how they approached networking. Open to KCL students, run with KCL Capital Markets Society, KREPS and KCL Green Finance Society.',
    recap: 'Six KCL students who have completed spring weeks talked through what the week looks like day to day, what doing well involves, and how they approached networking. Run with KCL Capital Markets Society, KREPS and KCL Green Finance Society.',
    signupUrl: 'https://forms.gle/qQHoRtk6SXhtvFoa8',
    page: 'spring-week-panel.html'
  }
];
