/* Firebase Web App settings are public IDs, not secret API credentials.
   To enable customer accounts, owner-only inventory, 1–5 star reviews and image uploads:
   1. In Firebase Console add a web app, copy its provided firebaseConfig.
   2. Enable Authentication > Email/Password, Firestore, and Storage as needed.
   3. Set OWNER_UID to owner's actual Firebase Auth user UID.
   4. Edit firestore.rules/storage.rules with matching UID and deploy rules.
   Never paste passwords, private API tokens or service-account credentials here. */
window.LALA_FIREBASE_CONFIG = null;
window.LALA_OWNER_UID = "";
window.LALA_PAYPAL_PAYMENT_LINK = ""; // Copy your genuine PayPal payment link when created.
