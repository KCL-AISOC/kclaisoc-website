/* ==========================================================================
   KCL AISOC — home.js
   Live member counter from Google Sheets
   ========================================================================== */

/* --------------------------------------------------------------------------
   HOW TO CONNECT THE LIVE MEMBER COUNTER
   --------------------------------------------------------------------------
   1. Create a Google Sheet to track sign-ups (one row per member, row 1 = headers).
   2. In Google Sheets: File → Share → Publish to web.
   3. In the dialog: choose "Entire Document" and format "CSV", then click Publish.
   4. Copy the URL that appears (it looks like:
         https://docs.google.com/spreadsheets/d/e/LONG_ID/pub?output=csv
   5. Paste that URL as the value of MEMBERS_SHEET_URL below.
   6. The script will fetch the CSV, count rows, subtract 1 for the header,
      and display the result. If the fetch fails, "60+" is shown as fallback.
   -------------------------------------------------------------------------- */

var MEMBERS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS7vrVQ1DIpFtBXDiYbL07P01n8BnrSaLp2khQplePJfkq_Y4Odw-AX7FDN45IkzTu-O_tmjg0c4h6X/pub?output=csv';

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

  async function fetchMemberCount() {
    if (!MEMBERS_SHEET_URL || MEMBERS_SHEET_URL.trim() === '') {
      updateMemberCount(FALLBACK_COUNT);
      return;
    }

    try {
      var response = await fetch(MEMBERS_SHEET_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('HTTP ' + response.status);

      var csv = await response.text();

      // Split into non-empty lines, subtract 1 for the header row
      var lines = csv.split('\n').filter(function (line) {
        return line.trim().length > 0;
      });

      var memberCount = Math.max(0, lines.length - 1);

      // Display as "N+" for a sense of live, growing membership
      if (memberCount > 0) {
        setCountTarget(memberCount);
        updateMemberCount(memberCount + '+');
      } else {
        updateMemberCount(FALLBACK_COUNT);
      }
    } catch (err) {
      // Network error, CORS issue, or sheet not published — use fallback
      updateMemberCount(FALLBACK_COUNT);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchMemberCount);
  } else {
    fetchMemberCount();
  }
})();
