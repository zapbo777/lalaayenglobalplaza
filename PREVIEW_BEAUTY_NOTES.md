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

## Makeup listings added on this preview (Nov 13)

Arlene approved adding beauty items on Nov 13 ("keep adding into the beauty"), with free supplier shipping only.

Five makeup listings were added to `products.json` with `store: "beauty"` so they appear on `LALA_BEAUTY_MARK1.html`, in addition to the 39 existing accessories (Beauty page should now show 44 items). Public `merchantUrl` is left blank; supplier URLs and costs are only in `/workspace/lala-private/makeup_1113_supplier_map.csv`.

Photos are the official AliExpress `imagePathList` galleries (6 photos each), downloaded and visually checked on Nov 13. Copy is taken from each listing title / on-page packaging text and gallery labels only — no invented reviews, stock counts, or guarantees.

| Store title | Price | Photo | Colors recorded from the page/gallery |
|---|---|---|---|
| Velvet Matte Lipstick (AVIERLL) | $8.99 | OK | 6 shades as pictured (no printed names) |
| Matte Liquid Lipstick, Waterproof (QIBEST) | $6.99 | OK | 01#–24# printed on gallery charts |
| 2-in-1 Matte Lip Liner and Lip Gloss | $7.99 | OK | #01–#24 printed on gallery swatch (brand HANDAIYAN on the product) |
| 9-Shade Smoky Eyeshadow Palette | $9.99 | OK | One smoky palette as pictured |
| Plumping Liquid Lip Gloss 5-pack | $14.99 | OK | 5-pack / five shades as pictured (brand O'CHEAL on the tubes) |

Shipping line on each card: free shipping, with the typical delivery time from the Nov 12 item-page check (1-2 weeks for the first three, about 12 days for the palette, ships from the US about 5-7 days for the 5-pack).

**Arlene must confirm each supplier's real shipping time and return policy, and say OK, before anything goes live.**

## What is not on this preview

- No push to `main` and no production deploy.
- No payment or billing changes.
- Checkout is not disabled in code; the yellow banner tells reviewers not to place real orders here.
