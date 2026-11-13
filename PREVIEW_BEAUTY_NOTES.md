# Beauty page preview (branch `beauty-fix-makeup`)

Preview only. Do not merge to `main` or deploy to production until Arlene approves.

## Bug

`LALA_BEAUTY_MARK1.html` uses `<body data-store="beauty">`. `plaza-shop.js` only listed products whose `store` field matched that value.

On current main (`7468b56`):

- 20 items already have `store: "beauty"` (lashes, nails, wigs, hair accessories, makeup tools). Those already appeared on the Beauty page, so the page was not completely empty.
- 19 items are categorized `Beauty & Wellness` but filed as `store: "global-shop"`, so they appeared only in Global Shop.

The missing-items bug is the store / category mismatch, not a missing product file.

## Fix

`plaza-shop.js` now treats a product as belonging to the Beauty page if:

- `store` is `beauty` (or blank), or
- `store` is `global-shop` **and** `category` is `Beauty & Wellness`.

The 19 Beauty & Wellness items are **not** removed from Global Shop. After this change the Beauty page should show 39 existing accessories (20 + 19).

`plaza-shop.js` cache query was bumped to `v=20261113bf` on department pages.

## Other department pages

Checked the other `plaza-shop.js` department pages for the same empty-page bug:

| Page | `data-store` | Ready items with that store | Same empty-page bug? |
|---|---|---|---|
| Bags & Purses | `bags-purses` | 14 | No — page already has correctly filed items |
| Lingerie | `lingerie-boutique` | 69 | No |
| Party Shop | `party-shop` | 60 | No |
| Pet Paradise | `pet-paradise` | 61 | No |
| DIY Craft | `diy-craft` | 40 | No |
| Gym / Temple / Wonderland | `global-shop` + `data-store-group` | shelf-group prefix | No — already use the shelf-group pattern |
| Fashions / Costume / Cowgirl | coming-soon landings (no `plaza-shop.js` catalog) | — | Different page type, not this bug |

A few tote-style items sit in Global Shop under `Fashion Accessories`. That is not the same empty-page bug (the Bags page already lists 14 bags), so they were left unchanged.

## Makeup / skincare listing pack — not finished

No new lipstick, gloss, foundation, concealer, eyeshadow, mascara, eyeliner, blush, setting powder, or skincare items were added.

CJ Dropshipping is the preferred supplier and AliExpress is allowed, but from this computer both sites blocked product-page access:

- AliExpress search and item URLs returned a captcha / "punish" wall (or a 302 that could not be followed).
- CJ homepage and sitemaps loaded, including a lipstick category URL (`/list/wholesale-lipstick-l-B68DF53F-4DD5-4659-A530-66D414CF2147.html`), but CJ product and category pages required Cloudflare "Human verification."

Owner rule: every sourced item must have **free US shipping shown on its own product page**. Items without that proof were dropped, which in this pass means **zero new listings** — nothing was invented.

When a browser session can open those sites (or traffic is routed through Arlene's computer), source about 12–15 low-cost makeup/skincare items, confirm free US shipping on each item page, keep most retail prices under $15 with free shipping built in using the store formula, and add them on this preview branch only.

**Arlene must confirm each supplier's real shipping time and return policy before anything goes live.**

## What is not on this preview

- No push to `main` and no production deploy.
- No payment or billing changes.
- No new makeup listings in `products.json`.
- Checkout is not disabled in code; the yellow banner tells reviewers not to place real orders here.
