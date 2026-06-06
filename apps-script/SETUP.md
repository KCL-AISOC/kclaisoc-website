# Join form → Google Sheets — setup

This connects the **Join** form to a Google Sheet so every sign-up appends a row,
and powers the live member counter on the home page. No backend server needed.

Do all of this in **the president's (or society's) Google account** — it owns the member data.

## 1. Use the existing sign-up sheet

You already have the Google Sheet that the **Google Form** feeds (the one whose columns
start with `Timestamp`, `Email address`, `First name`, …). Use that same sheet — the website
form appends rows to it in the **same column order**, so Form sign-ups and website sign-ups
land side by side.

> **Column order matters.** The script writes by column *position*, not by header name
> (see the note at the top of `Code.gs`). The order in `Code.gs` mirrors your current Form.
> If you ever reorder the Form's questions, update the `ROW` array in `Code.gs` to match.

> **Two ways in.** The Google Form stays live and independent — people can still sign up
> through it. The website is just a second door into the same sheet. If you'd rather have one
> source of truth, retire the Form once the website is live.

## 2. Add the script

1. In the sheet: **Extensions → Apps Script**.
2. Delete whatever is in the editor.
3. Open [`Code.gs`](./Code.gs) from this repo, copy **all** of it, and paste it in.
4. Click the **Save** icon.

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" → choose **Web app**.
3. Set:
   - **Description:** `KCL AISOC join endpoint`
   - **Execute as:** **Me** (your account)
   - **Who has access:** **Anyone**   ← required so the public website can POST to it
4. Click **Deploy**, then **Authorize access** and approve the permissions prompt
   (it will warn it's unverified — that's normal for your own script; continue).
5. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/XXXXXXXXXXXX/exec`

> Sanity check: paste that URL into a browser. You should see
> `{"result":"ok","message":"KCL AISOC join endpoint is live."}`.

## 4. Plug the URL into the website

Open [`join.html`](../join.html), find this line near the bottom and paste the URL:

```js
var JOIN_ENDPOINT = 'PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

## 5. (Optional) Live member counter on the home page

The counter on the home page reads the sheet's published CSV and counts the rows.

1. In the sheet: **File → Share → Publish to web**.
2. Choose **Entire document**, format **Comma-separated values (.csv)**, click **Publish**.
3. Copy the URL (ends in `output=csv`).
4. Open [`js/home.js`](../js/home.js) and paste it into:
   ```js
   var MEMBERS_SHEET_URL = '';
   ```

## Re-deploying after editing the script

If you ever change `Code.gs`, the URL only updates if you **Deploy → Manage deployments
→ edit (pencil) → Version: New version → Deploy**. Creating a brand-new deployment gives a
new URL you'd have to paste again, so prefer editing the existing one.
