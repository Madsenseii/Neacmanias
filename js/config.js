/* ============================ CONFIG ============================ */
const CONFIG={
  // PUBLIC Razorpay key id only. The key SECRET goes in Vercel environment variables, never here.
  razorpayKeyId:"rzp_live_TS3K7jm5IuYEXZ",
  businessName:"Mad Sensei Studios",
  eventName:"NEAC MANIA – Metro Tour 1",
  venue:"Kolkata",
  dateLabel:"5–6 Nov 2026",
  eventStart:"2026-11-05T10:00:00+05:30",
  organiserEmail:"teamneac@gmail.com",
  // "manual": esports squad entries are sent to the organiser, NOT charged through this checkout.
  // "razorpay": esports entries are added to the cart and paid here (only if your gateway permits it).
  esportsMode:"manual",
  earlyBirdUntil:"2026-10-31T23:59:59+05:30", // early-bird prices (the "eb" field of each item) end here
  siteUrl:"https://neacmanias.vercel.app",           // optional: public https URL of this page, used inside ticket QR codes (blank = current page URL)
  streamUrl:"",         // optional: paste the live-stream link here and Online View tickets will show a WATCH LIVE button
  api:"/api"            // optional serverless endpoints (create-order, verify, recover). The page works without them.
};
