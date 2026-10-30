# LALA AYEN GLOBAL PLAZA — Customer Ratings, Photos & Videos

This update adds a real review interface to **all six store departments**:
- Average 1–5 star rating and genuine review count on every listed item (empty products display “No reviews yet”).
- Customer Reviews & Comments beneath each product card; click to read comments and attachments or leave your own.
- Account holders can write a comment, select 1–5 stars and optionally upload **one photo OR one video** with their review.
- JPG / PNG / WEBP up to 8 MB; MP4 / WEBM / MOV up to 25 MB; limits enforced in web client **and** storage rules.
- Existing review is edited instead of creating multiple reviews from the same signed-in account for the same item.
- Only verified owner can remove review records; no automatic fake or sample ratings.

## Not live yet

The Firebase Web app config is deliberately blank. In `site/firebase-config.js`, supply the actual Firebase web config and OWNER_UID (Firebase Auth UID), and set this same UID in `firestore.rules` and `storage.rules`. In Firebase console enable Email/Password Auth, Firestore, and Storage. Deploy the **matching security rules** before publishing the updated HTML pages. Never add an admin password to HTML or use a secret service-account key on the frontend.

**Do not deploy this bundle over an existing production app without backing up and confirming the correct Hosting target and dependencies.** No deployment or live payment took place. Purchases and shipping are not automatic. Product ratings are not verified-purchase reviews: no completed-order link has been implemented. Customer video files may require storage and data-transfer charges. Uploaded videos are shown to anyone who can view the review, so customers should avoid private images, addresses, or faces without consent.

## Testing

1. Configure Firebase project and deploy both rules files in a safe test environment.
2. Sign in with a normal customer account and verify owner buttons stay hidden.
3. Publish an authentic product using the owner account, then sign in as a customer.
4. Click **Customer Reviews & Comments** under the product; select stars, type a comment, optionally choose a photo **or** video; post.
5. Reload from a second device, verify average stars, comment, and video/photo display. Try an invalid file type or oversize upload (should be rejected).
6. Confirm unsigned visitors can read reviews but cannot post; confirm customer cannot edit listings, rate an unpublished product or remove others' reviews.
7. Delete test-only reviews before public launch; do not portray tests as actual purchases.
