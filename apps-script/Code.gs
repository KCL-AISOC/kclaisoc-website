/* ==========================================================================
   KCL AISOC — Google Apps Script
   Receives join-form submissions and appends one row per member to the sheet.

   This file is NOT part of the deployed website. It is pasted into the
   Apps Script editor that is bound to the Google Sheet. See SETUP.md.

   IMPORTANT: rows are written by COLUMN POSITION, not by header name. The order
   in ROW below must match the sheet's columns left-to-right. The sheet is the
   one fed by the existing Google Form, so the order below mirrors that form.
   If you ever reorder the Form's questions, update ROW to match.
   ========================================================================== */

// Header row, written only if the sheet is completely empty. Mirrors the
// existing Google Form's columns (Timestamp first, set by the script).
var HEADERS = [
  'Timestamp',
  'Email address',
  'First name',
  'Last Name',
  'KCL Email Address',
  'Student ID',
  'University',
  'Level of Study',
  'Degree Name',
  'Year of graduation',
  'Are you an International Student?',
  'Gender',
  'How do you identify your ethnicity?',
  'Are you interested in joining the committee?',
  'Area of interest within alternatives',
  'How did you hear about us?',
  'Please share your LinkedIn profile URL'
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

    var p = e.parameter;          // single-value fields
    var all = e.parameters;       // repeated fields arrive as arrays

    // Honeypot: real users leave this hidden field empty; bots often fill it.
    if (p.company_website) {
      return json({ result: 'success' });
    }

    // "Area of interest" is a group of checkboxes named interest[].
    var interests = all['interest[]'] ? all['interest[]'].join(', ') : '';

    // Order MUST match the sheet's columns (see note at top).
    var ROW = [
      new Date(),                         // Timestamp
      safe(p.email_address),              // Email address
      safe(p.first_name),                 // First name
      safe(p.last_name),                  // Last Name
      safe(p.kcl_email),                  // KCL Email Address
      safe(p.student_id),                 // Student ID
      safe(p.university),                 // University
      safe(p.level_of_study),             // Level of Study
      safe(p.degree_name),                // Degree Name
      safe(p.year_of_graduation),         // Year of graduation
      safe(p.international_student),      // Are you an International Student?
      safe(p.gender),                     // Gender
      safe(p.ethnicity),                  // How do you identify your ethnicity?
      safe(p.join_committee),             // Are you interested in joining the committee?
      safe(interests),                    // Area of interest within alternatives
      safe(p.heard_via),                  // How did you hear about us?
      safe(p.linkedin_url)                // Please share your LinkedIn profile URL
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
  return json({ result: 'ok', message: 'KCL AISOC join endpoint is live.' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
