/* Server-side price list. Generated from js/data.js. If you change prices in js/data.js, update this too.
   The server never trusts prices sent by the browser. */
const EARLY_BIRD_UNTIL="2026-10-31T23:59:59+05:30"; // keep equal to CONFIG.earlyBirdUntil in js/config.js
const ITEMS=[
 {
  "id": "e1",
  "name": "Entry Pass",
  "cat": "entry",
  "type": null,
  "price": 99,
  "eb": 79,
  "slots": null
 },
 {
  "id": "e2",
  "name": "Squad Entry Pack",
  "cat": "entry",
  "type": null,
  "price": 349,
  "eb": 279,
  "slots": null
 },
 {
  "id": "e3",
  "name": "Couple / Duo Entry",
  "cat": "entry",
  "type": null,
  "price": 179,
  "eb": 149,
  "slots": null
 },
 {
  "id": "o1",
  "name": "Online View Pass",
  "cat": "online",
  "type": null,
  "price": 1,
  "eb": null,
  "slots": null
 },
 {
  "id": "b1",
  "name": "BGMI Tournament",
  "cat": "esports",
  "type": "esports",
  "price": 799,
  "eb": 699,
  "slots": 36
 },
 {
  "id": "f1",
  "name": "Free Fire Tournament",
  "cat": "esports",
  "type": "esports",
  "price": 799,
  "eb": 699,
  "slots": 36
 },
 {
  "id": "v1",
  "name": "Valorant Tournament",
  "cat": "esports",
  "type": "esports",
  "price": 999,
  "eb": 849,
  "slots": 16
 },
 {
  "id": "m1",
  "name": "Minecraft: Build + PvP",
  "cat": "esports",
  "type": "esports",
  "price": 399,
  "eb": 349,
  "slots": 50
 },
 {
  "id": "w1",
  "name": "Crowd Dubbing",
  "cat": "workshop",
  "type": null,
  "price": 149,
  "eb": 119,
  "slots": null
 },
 {
  "id": "w2",
  "name": "Animation Workshop",
  "cat": "workshop",
  "type": null,
  "price": 499,
  "eb": 399,
  "slots": null
 },
 {
  "id": "c1",
  "name": "Cosplay – Solo",
  "cat": "cosplay",
  "type": "cosplay",
  "price": 299,
  "eb": 249,
  "slots": null
 },
 {
  "id": "c2",
  "name": "Couple Cosplay",
  "cat": "cosplay",
  "type": "cosplay",
  "price": 549,
  "eb": 449,
  "slots": null
 },
 {
  "id": "c3",
  "name": "Group Cosplay (3–5)",
  "cat": "cosplay",
  "type": "cosplay",
  "price": 899,
  "eb": 749,
  "slots": null
 },
 {
  "id": "k1",
  "name": "Otaku Starter Combo",
  "cat": "combo",
  "type": null,
  "price": 229,
  "eb": 189,
  "slots": null
 },
 {
  "id": "k2",
  "name": "Cosplayer Combo",
  "cat": "combo",
  "type": "cosplay",
  "price": 349,
  "eb": 289,
  "slots": null
 },
 {
  "id": "k3",
  "name": "Ultimate Mania Pass",
  "cat": "combo",
  "type": "cosplay",
  "price": 599,
  "eb": 429,
  "slots": null
 }
];
const byId=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const byName=n=>ITEMS.find(i=>i.name===n);
const ebOn=()=>Date.now()<new Date(EARLY_BIRD_UNTIL).getTime();
const unitPrice=i=>ebOn()&&i.eb?i.eb:i.price;
const maxQty=i=>i.slots?Math.min(i.slots,10):20;
module.exports={ITEMS,byId,byName,unitPrice,maxQty,EARLY_BIRD_UNTIL};
