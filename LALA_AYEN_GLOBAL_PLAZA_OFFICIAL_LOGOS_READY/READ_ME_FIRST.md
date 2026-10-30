**OFFICIAL LOGO CORRECTION (Oct 22, 2026):** Original owner-supplied LALA AYEN logo is used throughout the homepage/shop sidebars; owner-supplied VIBE logo is used only in the VIBE section. See `OFFICIAL_LOGO_AND_DEPLOYMENT_NOTES.md`.

# LALA AYEN GLOBAL PLAZA — Social + Self-Service Guides Preview

This bundle updates the existing Echo mini-site copy. It has **not been published** to Firebase, the current domain, or any other service.

## Owner-provided social links
- Facebook Lala Ayen LLC: https://www.facebook.com/LalaayenLLC/
- Facebook Zapbo Tivi: https://www.facebook.com/zapbo.tivi
- TikTok music artist: https://www.tiktok.com/@lalaayenmusicartist

All three links are displayed near the top of the Home page, in the Social Media section, in Contact, and in the footer. An About section is included.

## Guides and what they do
There are self-service FAQ panels for Music, Portraits, Videos, Books, and Contact, plus a fixed Ask Plaza Guide button. These are local preset-response guides, **not** connected conversational AI, live chat, or message sending. The Contact form only prepares an email draft. They do not collect, send, or store chat messages.

## Limits before accepting real sales
- This is the original static Echo mini-site, not the complete shop. Customer registration/sign-in/reset, private admin, persistent customer reviews, shop inventory, cart checkout, tax and shipping, and automatic order fulfillment are **not implemented**. Do not pretend to sell products using demo pages.
- The owner-provided Square enter-amount link is served only to signed-in customers by the account Worker (`GET /api/pay-link`, Worker var `PAY_AGREED_URL`). It remains for **confirmed** written quotes, not an automatic checkout.
- Do not publish the local Thrift Store Mark 1 demo as a live shop; its demo products and checkout are not real.
- No changes to the user's old Google project, Cloud Run, domain, or live website have been made.

## Local review
Open `site/index.html` in a browser. For a local test server: from this directory run `python -m http.server 8000 -d site` then open `http://localhost:8000`.

## Deployment requires owner approval
This file includes Firebase Hosting configuration from Echo's mini-site. A successful secure public site requires an explicitly chosen Firebase project, verified domain configuration, and owner authorization. Do not overwrite the full production app/backend with this mini-site. The project name used before was `nth-observer-512011-i0`; avoid deploying to it unintentionally.


## Lemon8 social profile placeholder
Lemon8 is shown at Home, Social, Contact, and Footer. No link was supplied; it remains deliberately unclickable until the owner supplies her exact public Lemon8 profile URL. Nothing published or deployed.
