/* ==========================================================================
   KCL AISOC, home.js
   Live member counter from Google Sheets
   ========================================================================== */

/* --------------------------------------------------------------------------
   HOW TO CONNECT THE LIVE MEMBER COUNTER
   --------------------------------------------------------------------------
   For PRIVACY, do NOT publish the whole member sheet. Publish a count only:
   1. In the member spreadsheet, add a new tab named "Count".
   2. In its cell A1 put a formula that counts the member rows, e.g.
         =COUNTA('Form Responses 1'!A2:A)
      (replace 'Form Responses 1' with the exact name of your responses tab).
   3. File → Share → Publish to web → pick the "Count" tab (NOT Entire document)
      → CSV → Publish, and STOP publishing the entire document.
   4. Paste that count-only URL as MEMBERS_SHEET_URL below.

   The code reads the number, rounds it DOWN to the nearest 5, and shows "N+"
   (so 61 and 63 show "60+", 66 shows "65+"). It also still works if you point
   it at a full sheet (it counts rows minus the header). If the fetch fails,
   "60+" is shown as a fallback.
   -------------------------------------------------------------------------- */

var MEMBERS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7vrVQ1DIpFtBXDiYbL07P01n8BnrSaLp2khQplePJfkq_Y4Odw-AX7FDN45IkzTu-O_tmjg0c4h6X/pub?gid=1163297358&single=true&output=csv';

(function () {
  'use strict';

  var FALLBACK_COUNT = '60+';

  function updateMemberCount(count) {
    var el = document.getElementById('member-count');
    if (el) {
      el.textContent = count;
    }
  }

  // Feed the real number into the GSAP count-up animation in main.js, which
  // reads data-count as its target. Without this the animation overwrites the
  // fetched count with the hardcoded default when the stats bar scrolls in.
  function setCountTarget(n) {
    var el = document.getElementById('member-count');
    if (el) {
      el.setAttribute('data-count', n);
    }
  }

  // Round down to the nearest 5 (61 -> 60, 66 -> 65).
  function roundDownToFive(n) {
    return Math.floor(n / 5) * 5;
  }

  // Pull the member count from the CSV. Supports two shapes:
  //  - a count-only sheet: a cell that is just a number (with or without a
  //    title row above it, e.g. "Number of Members" then "61")
  //  - a full sheet: count the data rows (non-empty lines minus the header)
  function parseCount(csv) {
    var lines = csv.split('\n').map(function (l) {
      return l.trim();
    }).filter(function (l) {
      return l.length > 0;
    });

    // Count-only sheet: take the last line that is just a number (strip quotes).
    var numberOnly = null;
    lines.forEach(function (l) {
      var cell = l.replace(/^"|"$/g, '').trim();
      if (/^\d+$/.test(cell)) numberOnly = parseInt(cell, 10);
    });
    if (numberOnly !== null) return numberOnly;

    // Full sheet: data rows = non-empty lines minus the header row.
    return Math.max(0, lines.length - 1);
  }

  async function fetchMemberCount() {
    if (!MEMBERS_SHEET_URL || MEMBERS_SHEET_URL.trim() === '') {
      updateMemberCount(FALLBACK_COUNT);
      return;
    }

    try {
      var response = await fetch(MEMBERS_SHEET_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      var csv = await response.text();
      var rounded = roundDownToFive(parseCount(csv));

      // Display as "N+" for a sense of live, growing membership
      if (rounded > 0) {
        setCountTarget(rounded);
        updateMemberCount(rounded + '+');
      } else {
        updateMemberCount(FALLBACK_COUNT);
      }
    } catch (err) {
      // Network error, CORS issue, or sheet not published - use fallback
      updateMemberCount(FALLBACK_COUNT);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchMemberCount);
  } else {
    fetchMemberCount();
  }
})();
