# NEAC MANIA – Metro Tour 1

Static site + Vercel serverless API.

```
index.html  css/  js/        the website
api/                         serverless backend (Vercel)
  create-order.js            prices the cart on the server, creates the Razorpay order
  verify.js                  checks the payment signature, captures if needed, issues the ticket
  recover.js                 recovers a ticket by order id, or payment id + phone
  ticket.js                  gate scan: checks the QR token and reads live payment status
  _lib/                      shared helpers + server price list
```

## Deploy
1. Push this folder to GitHub (`git init`, `git add .`, `git commit`, push) and import it in Vercel, or run `vercel --prod`.
2. In Vercel: Project, Settings, Environment Variables, add:
   - `RAZORPAY_KEY_ID`  (your `rzp_live_...` key id)
   - `RAZORPAY_KEY_SECRET`  (from Razorpay Dashboard, Live Mode, Account & Settings, API Keys)
   - `TICKET_SIGNING_SECRET`  (any long random string)
3. Redeploy so the variables take effect.
4. In `js/config.js` set `siteUrl` to your final URL and, if you have one, `streamUrl`.
5. Test with a real ₹1 payment (Online View Pass is a direct checkout; a Squad/Entry pass tests the full API flow) and confirm it shows **Captured** in the Razorpay Dashboard.

## Keep in sync
Prices live in `js/data.js` (shown on the page) and `api/_lib/catalog.js` (used for charging).
Change both, plus the early-bird date in `js/config.js` and `api/_lib/catalog.js`.

Never put the Key Secret in any file in this repo.
