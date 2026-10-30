LALA AYEN GLOBAL PLAZA — READY-TO-CONNECT WEBSITE PACKAGE

STATUS: Website pages assembled. NOT DEPLOYED. Requires owner setup for accounts, uploads and reviews.

WHAT IS PRESENT
- Echo mini-site Music, Portraits, Videos, Books, Contact with chat guides.
- Six working shop pages with categories, product cards, price, photos, stock and 1–5 star review interface.
- Original user-supplied Facebook (two pages) and TikTok links; About section.
- Real customer authentication using Firebase Email/Password, including create account, sign-in, sign-out, reset password when configured.
- Owner-only Add/Edit/Delete Product UI, photos to Firebase Storage, online product inventory in Firestore, JSON download backup.
- Customer 1–5 star review submission for signed-in customers. No demo products or fake reviews.
- Each real product offers Request to buy (opens email draft) or merchant checkout URL for affiliate offers.
- Square link for AGREED quote only, not automated product cart checkout. No PayPal link supplied yet.
- Home and shop guides are self-service FAQs, not live AI or actual messages sent automatically.

SETUP REQUIRED BEFORE REAL PRODUCT MANAGEMENT / ACCOUNTS / REVIEWS
1. Firebase console: use an existing authorized project or create one with owner approval.
2. In Firebase Authentication enable Email/Password. In Firestore create database; enable Firebase Storage if available on your plan. Check billing before enabling paid features.
3. Create Firebase Web App. Copy its firebaseConfig object (public app identifiers) into site/firebase-config.js by replacing null with the actual settings. Do NOT paste any secret service account keys.
4. Sign up YOUR account through the site, then obtain its user UID in Firebase Authentication. Set site/firebase-config.js LALA_OWNER_UID to this UID. This UID must be identical to UID in BOTH firestore.rules and storage.rules.
5. Replace all occurrences of REPLACE_WITH_OWNER_UID in those rules with the real UID. Deploy Firestore and Storage rules using Firebase CLI or console. DO NOT use these rules with placeholder value or insecure open test rules.
6. Confirm Firestore reads/writes, owner-only inventory, public visibility of only published products and authenticated reviews. Confirm photo upload only if Storage is configured and enabled. Set merchant links only to verified merchants.
7. Deploy only with the owner's authorization. For classic Firebase Hosting from the folder containing firebase.json: firebase deploy --only hosting --project YOUR_ACTUAL_PROJECT_ID
8. Enter Add Product after signing in as owner. Upload photo, enter real item name, price, stock, category, condition, description. Choose Published. Customers can click Request to buy; manually confirm their total, shipping, taxes and availability before sending approved payment link.
9. Test sign-in / password reset, listings, reviews, mobile view and outgoing email on real hosting.

IMPORTANT SALES LIMITATION
This package is NOT an automated ecommerce checkout. Request to buy opens the customer's email application; nothing is sent automatically, stock is not automatically reserved, taxes/shipping are not calculated, and completed payments are not automatically tracked. Square is for quoted totals only. Auto-fulfillment, automated checkout and a live AI chatbot require additional integration and testing. There are NO invented customer reviews or sample sale items.

OTHER NOTES
Changing static files on a public website is not sufficient to protect an admin panel: Firebase rules enforce access by owner UID. Owner buttons are hidden from visitors. Review stars can be left by signed-in users (one review per user and product). Do not claim purchase verification.
