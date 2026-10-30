# LALA AYEN GLOBAL PLAZA — official logos, corrected

Owner-supplied assets (unchanged original pixels):
- `site/assets/LALA_AYEN_OFFICIAL_LOGO.png` — main LALA AYEN logo; header, homepage, footer, ALL six shop sidebars, browser favicon.
- `site/assets/LALA_AYEN_VIBE_OFFICIAL_LOGO.png` — LALA AYEN VIBE logo; VIBE area of homepage only.

The incorrect mockup/generic branding is **not** used. The old embedded sidebar logo and old logo assets have been replaced.

## Preview
Open `site/index.html` to check the homepage, then use the six shop links. On systems that require a local web server, run `python -m http.server 8000 -d site` in the extracted folder and go to `http://localhost:8000`.

## Deployment caution
No changes were made to live hosting or the domain. Firebase config points to `site/` but does not identify the active project. Verify the correct Firebase project and its current content before deploying or you risk overwriting the existing site. The static package is **NOT** a verified working live store: payment capture, fulfillment, customer authentication, reviews and private admin setup need testing/configuration. For now, safe affiliate links can redirect to third parties; unfinished stores must stay Coming Soon.

## Upload recommendation
Use Firebase Hosting only after checking the Firebase Project ID in the Firebase Console and backing up the current public site. Do not deploy an untested version to production.
