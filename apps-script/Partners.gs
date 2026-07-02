/* ==========================================================================
   KCL AISOC — Partnerships "Get in Touch" — Google Apps Script
   Receives partnership-enquiry submissions and appends one row per enquiry.

   This file is NOT part of the deployed website. It is pasted into the
   Apps Script editor that is bound to the PARTNERSHIPS Google Sheet
   (a different sheet from the member join sheet). See SETUP.md.

   IMPORTANT: rows are written by COLUMN POSITION, not by header name. The order
   in ROW below must match the sheet's columns left-to-right.
   ========================================================================== */

// Header row, written only if the sheet is completely empty.
var HEADERS = [
  'Timestamp',
  'First name',
  'Last name',
  'Job title / team',
  'Company name',
  'Work email',
  'Phone number (optional, lets you follow up fast)',
  "What's your interest in KCL AISOC?",
  "Anything you'd like us to know?"
];

// Prevent spreadsheet formula/CSV injection: prefix risky leading chars so the
// cell is treated as literal text, not an executable formula.
function safe(v) {
  v = (v == null) ? '' : String(v);
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
}

function doPost(e) {
  // Lock so two people submitting at the same instant don't clobber each other.
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // First-ever submission on an empty sheet: lay down the header row.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    var p = e.parameter;  // single-value fields

    // Honeypot: real users leave this hidden field empty; bots often fill it.
    if (p.company_website) {
      return json({ result: 'success' });
    }

    // Order MUST match the sheet's columns (see note at top).
    var ROW = [
      new Date(),               // Timestamp
      safe(p.first_name),       // First name
      safe(p.last_name),        // Last name
      safe(p.job_title),        // Job title / team
      safe(p.company_name),     // Company name
      safe(p.work_email),       // Work email
      safe(p.phone),            // Phone number (optional)
      safe(p.interest),         // What's your interest in KCL AISOC?
      safe(p.message)           // Anything you'd like us to know?
    ];

    sheet.appendRow(ROW);

    return json({ result: 'success' });
  } catch (err) {
    console.error(err);
    return json({ result: 'error' });
  } finally {
    lock.releaseLock();
  }
}

// Lets you confirm the deployment is live by opening the URL in a browser.
function doGet() {
  return json({ result: 'ok', message: 'KCL AISOC partnerships endpoint is live.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
