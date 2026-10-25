/* ============================ HELPERS ============================ */
const $=id=>document.getElementById(id),inr=n=>"₹"+n.toLocaleString("en-IN");
const ALL=CATS.flatMap(c=>c.items.map(i=>({...i,cat:c.id})));
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function toast(m){const t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2600)}
const isManualEsp=i=>i.type==="esports"&&CONFIG.esportsMode==="manual";

/* ============================ RENDER STATIC ============================ */
$("mq").innerHTML=Array(2).fill(["COSPLAY","ESPORTS","TRIO SCREENING","VOICE ACTING","ANIME PITCHING","CONCERT NIGHT","MINECRAFT BUILD","PVP","KOLKATA 5–6 NOV"].map(t=>`<span>${t}</span><i>/</i>`).join("")).join("");
$("xp").innerHTML=EXPS.map((e,i)=>`<div class="xcard rev"><span class="ic disp">${String(i+1).padStart(2,"0")}</span><span class="tg ${e[1]}">${e[0]}</span><h3 class="disp">${e[3]}</h3><p>${e[4]}</p><div class="wh">${e[5]}</div></div>`).join("");
$("tls").innerHTML=SCHED.map((d,k)=>`<div class="tl ${k?"":"on"}" id="tl${k}">${d.map(r=>`<div class="ti ${r[2]?"hl":""}"><time>${r[0]}</time><p>${r[1]}</p></div>`).join("")}</div>`).join("");
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".tl").forEach((x,i)=>x.classList.toggle("on",i==b.dataset.t))});
const ebUntil=()=>new Date(CONFIG.earlyBirdUntil).getTime();
const ebOn=()=>Date.now()<ebUntil();
const unitPrice=i=>ebOn()&&i.eb?i.eb:i.price;
const item=id=>ALL.find(x=>x.id===id);
function renderCatalog(){
$("catalog").innerHTML=CATS.map(c=>`<div class="cat rev in"><h3 class="disp">${c.title}</h3><p class="cd2">${c.desc}</p><div class="grid">${c.items.map(i=>{const eb=ebOn()&&i.eb;return`
<div class="tk" id="tk_${i.id}">${eb?`<span class="ribbon">EARLY BIRD</span>`:""}<span class="tt">${(i.type||c.id).toUpperCase()}</span><h4>${i.name}</h4><p>${i.d}</p>${i.slots?`<span class="sl">${i.slots} SLOTS ONLY</span>`:""}
<div class="pr"><div>${eb?`<s>${inr(i.price)}</s>`:""}<b>${inr(unitPrice(i))}</b><small>per ${i.unit}${eb?` · save ${inr(i.price-i.eb)}`:""}</small></div>${isManualEsp(i)?`<button class="btn sm" onclick="openEsp('${i.id}')">REGISTER</button>`:`<div class="qty"><button aria-label="Remove one" onclick="chg('${i.id}',-1)">−</button><span id="q_${i.id}">0</span><button aria-label="Add one" onclick="chg('${i.id}',1)">+</button></div>`}</div></div>`}).join("")}</div></div>`).join("");
$("catalog").insertAdjacentHTML("beforeend",donHTML());
renderOffers();
}
function renderOffers(){
  const p=id=>unitPrice(item(id)),O=[];
  if(ebOn()){const mx=Math.max(...ALL.filter(i=>i.eb).map(i=>i.price-i.eb));O.push(["EARLY BIRD","Up to "+inr(mx)+" off every pass",`Early-bird prices on entry, workshops, cosplay, combos and esports until ${new Date(CONFIG.earlyBirdUntil).toLocaleDateString("en-IN",{day:"numeric",month:"long"})}, 11:59 PM.`])}
  const s1=4*p("e1")-p("e2");if(s1>0)O.push(["SQUAD UP","4 people from "+inr(Math.round(p("e2")/4))+" each",`Squad Entry Pack ${inr(p("e2"))} vs ${inr(4*p("e1"))} for four single passes. Save ${inr(s1)}.`]);
  const s2=2*p("c1")-p("c2");if(s2>0)O.push(["COUPLE COSPLAY","Duo on stage, save "+inr(s2),`${inr(p("c2"))} for a couple vs ${inr(2*p("c1"))} for two solo entries.`]);
  const s3=p("e1")+p("c1")-p("k2");if(s3>0)O.push(["COSPLAYER COMBO","Entry + Solo Cosplay, save "+inr(s3),`${inr(p("k2"))} vs ${inr(p("e1")+p("c1"))} bought separately.`]);
  const s4=p("e1")+p("w1")-p("k1");if(s4>0)O.push(["OTAKU STARTER","Entry + Crowd Dubbing, save "+inr(s4),`${inr(p("k1"))} vs ${inr(p("e1")+p("w1"))} bought separately.`]);
  $("offers").innerHTML=O.slice(0,4).map((o,k)=>`<div class="offer o${k}"><small>${o[0]}</small><b class="disp">${o[1]}</b><p>${o[2]}</p></div>`).join("");
  const eb=ebOn();document.body.classList.toggle("eb",eb);
}
renderCatalog();

/* ============================ CART ============================ */
let cart={};try{cart=JSON.parse(sessionStorage.getItem("neac_cart")||"{}")}catch(e){}
function lines(){const L=ALL.filter(i=>cart[i.id]>0&&!isManualEsp(i)).map(i=>({...i,q:cart[i.id],price:unitPrice(i),base:i.price,amt:unitPrice(i)*cart[i.id]}));if(cart.don>0)L.push({id:"don",cat:"donation",name:"Donation – Support NEAC",unit:"contribution",q:1,price:cart.don,base:cart.don,amt:cart.don});return L}
const total=()=>lines().reduce((a,l)=>a+l.amt,0);
function chg(id,d){const i=ALL.find(x=>x.id===id);let q=(cart[id]||0)+d;if(q<0)q=0;const max=i.slots?Math.min(i.slots,10):20;if(q>max)q=max;cart[id]=q;sync()}
function sync(){
  try{sessionStorage.setItem("neac_cart",JSON.stringify(cart))}catch(e){}
  ALL.forEach(i=>{const s=$("q_"+i.id);if(s){s.textContent=cart[i.id]||0;$("tk_"+i.id).classList.toggle("sel",cart[i.id]>0)}});
  const L=lines(),n=L.reduce((a,l)=>a+l.q,0),t=total();
  $("pill").classList.toggle("show",n>0&&!document.querySelector(".ov.on"));$("pC").textContent=n+(n==1?" ITEM":" ITEMS");$("pT").textContent=inr(t);
  const c=$("cN");c.style.display=n?"flex":"none";c.textContent=n;
  if($("ovCart").classList.contains("on"))renderCart();
}
function renderCart(){
  const L=lines();
  $("lines").innerHTML=L.length?L.map(l=>`<div class="ln"><div><b>${l.name}</b><small>${inr(l.price)} / ${l.unit}</small></div><div style="display:flex;align-items:center;gap:12px">${l.id==="don"?`<button class="mini-x" onclick="setDon(0)" aria-label="Remove donation">Remove</button>`:`<span class="mini-q"><button onclick="chg('${l.id}',-1)" aria-label="less">−</button><b>${l.q}</b><button onclick="chg('${l.id}',1)" aria-label="more">+</button></span>`}<b style="min-width:62px;text-align:right">${inr(l.amt)}</b></div></div>`).join("")+(L.some(l=>l.base>l.price)?`<div class="ln" style="color:#1a9b3c;font-weight:700"><span>Early-bird savings</span><span>−${inr(L.reduce((a,l)=>a+(l.base-l.price)*l.q,0))}</span></div>`:"")+`<div class="tot"><span>TOTAL</span><span>${inr(total())}</span></div>`:`<p style="padding:20px 0;color:#6a4fa8">Your cart is empty. Pick some passes first!</p>`;
  $("boxChar").style.display=L.some(l=>l.type==="cosplay")?"block":"none";
  $("boxTeam").style.display=L.some(l=>l.type==="esports")?"block":"none";
  $("payBtn").disabled=!L.length;
}
function openOv(id){$(id).classList.add("on");document.body.style.overflow="hidden";sync()}
function closeOv(){document.querySelectorAll(".ov.on").forEach(o=>o.classList.remove("on"));document.body.style.overflow="";sync()}
document.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeOv);
document.querySelectorAll(".ov").forEach(o=>o.addEventListener("mousedown",e=>{if(e.target===o)closeOv()}));
addEventListener("keydown",e=>{if(e.key==="Escape")closeOv()});
function openCart(){renderCart();openOv("ovCart")}
$("cartBtn").onclick=openCart;$("pGo").onclick=openCart;

/* ============================ ESPORTS (manual mode) ============================ */
let espItem=null;
function openEsp(id){espItem=ALL.find(x=>x.id===id);$("eTitle").textContent=espItem.name.toUpperCase();$("eInfo").textContent=`${inr(unitPrice(espItem))} per ${espItem.unit} · ${espItem.d}`;$("eErr").textContent="";openOv("ovEsp")}
$("eSend").onclick=()=>{
  const g=id=>$(id).value.trim(),er=m=>{$("eErr").textContent=m};
  if(g("eTeam").length<2)return er("Enter your team / squad name.");
  if(g("eCap").length<2)return er("Enter the captain's name.");
  if(!/^[6-9]\d{9}$/.test(g("ePhone")))return er("Enter a valid 10-digit Indian mobile number.");
  if(!/^\S+@\S+\.\S+$/.test(g("eMail")))return er("Enter a valid email.");
  if(g("eIgn").length<3)return er("Add in-game names / IDs.");
  const body=`Esports registration – ${CONFIG.eventName}\n\nTournament: ${espItem.name}\nEntry: ${inr(unitPrice(espItem))} per ${espItem.unit}\nTeam: ${g("eTeam")}\nCaptain: ${g("eCap")}\nPhone: ${g("ePhone")}\nEmail: ${g("eMail")}\nIn-game names / IDs:\n${g("eIgn")}`;
  location.href=`mailto:${CONFIG.organiserEmail}?subject=${encodeURIComponent("Esports registration – "+espItem.name+" – "+g("eTeam"))}&body=${encodeURIComponent(body)}`;
  toast("Opening your email app…");
  try{navigator.clipboard&&navigator.clipboard.writeText(body)}catch(e){}
};

/* ============================ PAYMENT ============================ */
let paying=false;
function resetPay(){paying=false;$("payBtn").textContent="PAY SECURELY ▶";$("payBtn").disabled=false}
const logoSrc=()=>{const i=document.querySelector(".nv .brand img");return i?i.src:""};
const mkTid=pid=>"NEAC-"+hash(pid).slice(0,8).toUpperCase();
$("payBtn").onclick=async()=>{
  if(paying)return;
  const g=id=>$(id).value.trim(),L=lines(),er=m=>{$("err").textContent=m;return false};
  const b={name:g("fName"),email:g("fEmail"),phone:g("fPhone"),team:g("fTeam"),ign:g("fIgn"),character:g("fChar")};
  if(!L.length)return er("Cart is empty.");
  if(b.name.length<2)return er("Enter your name.");
  if(!/^\S+@\S+\.\S+$/.test(b.email))return er("Enter a valid email.");
  if(!/^[6-9]\d{9}$/.test(b.phone))return er("Enter a valid 10-digit Indian mobile number.");
  if(L.some(l=>l.type==="esports")&&!b.team)return er("Enter your team / squad name.");
  if(!$("fAgree").checked)return er("Please accept the terms to continue.");
  if(typeof Razorpay==="undefined")return er("Payment library failed to load. Check your internet and retry.");
  $("err").textContent="";paying=true;$("payBtn").textContent="PREPARING…";$("payBtn").disabled=true;
  const items=L.map(l=>({id:l.id,q:l.q}));let order=null;
  const localOnly=L.some(l=>l.id==="don"||l.cat==="online"); // these are not in a server catalog, so use direct checkout
  if(!localOnly){
    try{order=await API.createOrder(items,b)}
    catch(e){resetPay();return er(e.message)}
  }
  const amount=order?order.amount:total()*100;
  const rec=L.map(l=>({n:l.name,q:l.q,a:l.amt,c:l.cat}));
  // remember the purchase so a ticket can still be claimed if the browser loses the payment callback (UPI app switch, reload, etc.)
  try{localStorage.setItem("neac_pend2",JSON.stringify({ts:Date.now(),b:{name:b.name,email:b.email,phone:b.phone,team:b.team,character:b.character},items:rec,total:total()}))}catch(e){}
  const opt={key:order?order.key:CONFIG.razorpayKeyId,amount,currency:"INR",name:CONFIG.businessName+" · NEAC",description:CONFIG.eventName,
    prefill:{name:b.name,email:b.email,contact:"+91"+b.phone},theme:{color:"#4B00B0"},retry:{enabled:true},
    notes:{items:L.map(l=>l.name+" x"+l.q).join(", ").slice(0,250),team:b.team,ign:b.ign.slice(0,200),character:b.character},
    modal:{ondismiss:()=>{resetPay()}},
    handler:r=>onPaid(r,b,rec,order)};
  if(order){opt.order_id=order.orderId;try{localStorage.setItem("neac_pending",JSON.stringify({oid:order.orderId,ts:Date.now()}))}catch(e){}}
  const rz=new Razorpay(opt);
  rz.on("payment.failed",r=>{er("Payment failed: "+((r.error&&r.error.description)||"please try again"));resetPay()});
  rz.open();
};
async function onPaid(r,b,rec,order){
  $("payBtn").textContent="ISSUING TICKET…";
  let t=null;
  if(order){
    const v=await API.verifyPayment(r);
    if(v)t={...v.ticket,token:v.token,verified:true,vs:"ok"};
  }
  if(!t){
    const pid=r.razorpay_payment_id;
    t={tid:mkTid(pid),pid,oid:r.razorpay_order_id||"",n:b.name,ph:b.phone,e:b.email,items:rec,total:rec.reduce((a,l)=>a+l.a,0),ts:Date.now(),token:null,verified:false,vs:"paid",ch:b.character,tm:b.team};
  }
  saveTicket(t);
  try{localStorage.removeItem("neac_pending");localStorage.removeItem("neac_pend2")}catch(e){}
  cart={};sync();redoDon();checkClaim();resetPay();closeOv();showTickets([t],true);
}
function hash(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return (4294967296*(2097151&h2)+(h1>>>0)).toString(16).padStart(14,"0")+(h1>>>0).toString(16).padStart(8,"0")}
function saveTicket(t){let a=getTickets();a=a.filter(x=>x.tid!==t.tid);a.unshift(t);try{localStorage.setItem("neac_tickets",JSON.stringify(a.slice(0,20)))}catch(e){}}
function getTickets(){try{return JSON.parse(localStorage.getItem("neac_tickets")||"[]")}catch(e){return[]}}

/* ============================ DONATION ============================ */
function donHTML(){let d=0;try{d=cart.don||0}catch(e){}
  const P=[10,50,100,500];
  return `<div class="cat rev in" id="donBox"><h3 class="disp">SUPPORT NEAC ♥</h3><p class="cd2">Want to back the con? Chip in any amount. Donations are voluntary and non-refundable, and you get a Supporter ticket right after paying.</p>
  <div class="don"><div class="dpre">${P.map(v=>`<button class="${d===v?"on":""}" onclick="setDon(${v})">${inr(v)}</button>`).join("")}</div>
  <div class="dcus"><input id="donIn" inputmode="numeric" maxlength="5" placeholder="Other amount (₹)" value="${d&&!P.includes(d)?d:""}"><button class="btn sm" onclick="donCustom()">ADD ♥</button></div>
  <p class="dst">${d?"Added "+inr(d)+" to your cart. Pick another amount to change it, or remove it in the cart.":"Pick an amount, then open your cart to pay."}</p></div></div>`}
function redoDon(){const b=$("donBox");if(b)b.outerHTML=donHTML()}
function setDon(v){cart.don=v;sync();redoDon();if(v)toast(inr(v)+" donation added to cart")}
function donCustom(){const v=parseInt(($("donIn").value||"").replace(/\D/g,""),10);if(!(v>=1&&v<=50000))return toast("Enter an amount between ₹1 and ₹50,000");setDon(v)}

/* ============================ TICKET ============================ */
function prng(seed){let s=parseInt(hash(seed).slice(0,8),16)||1;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)%100000)/100000}}
function guilloche(seed){
  const r=prng(seed),W=900,H=420;let p="";
  for(let k=0;k<16;k++){const a=6+r()*40,f=.004+r()*.012,ph=r()*6.28,y0=r()*H;let d="";for(let x=0;x<=W;x+=10)d+=(x?"L":"M")+x+" "+(y0+Math.sin(x*f+ph)*a+Math.cos(x*f*2.3+ph)*a*.4).toFixed(1);
    p+=`<path d="${d}" fill="none" stroke="hsl(${Math.round(250+r()*110)},90%,${Math.round(65+r()*20)}%)" stroke-width="${(.6+r()*.9).toFixed(2)}" opacity="${(.25+r()*.5).toFixed(2)}"/>`}
  for(let k=0;k<3;k++){const cx=r()*W,cy=r()*H;for(let j=1;j<9;j++)p+=`<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${j*(10+k*4)}" fill="none" stroke="#fff" stroke-width=".5" opacity="${(.05+r()*.12).toFixed(2)}"/>`}
  return `<svg class="gl" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${p}</svg>`;
}
/* ============================ TICKET LOOK (per category) ============================ */
const ICON={entry:"M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z M14 7v10",
 esports:"M7 8h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 8z M8 11v4 M6 13h4 M16 12h.01 M18 14h.01",
 workshop:"M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3",
 cosplay:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z",
 combo:"M12 3l9 5-9 5-9-5z M3 13l9 5 9-5",
 online:"M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z M10 9l5 3-5 3z",
 donation:"M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"};
const TH={
 entry:{k:"E",l:"ENTRY PASS",tag:"ADMIT ENTRY",c:["#1d0545","#3a0a8a","#6a1fd0"],ac:"#FFB000",qr:"#2a0b6b",qt:"SCAN AT THE GATE"},
 esports:{k:"S",l:"ESPORTS ARENA",tag:"TOURNAMENT ENTRY",c:["#021a2e","#04446b","#0a7bb8"],ac:"#35e0ff",qr:"#04334f",qt:"SCAN AT THE ARENA"},
 workshop:{k:"W",l:"WORKSHOP PASS",tag:"STAGE & WORKSHOP",c:["#012a2a","#05605a","#0f9d8a"],ac:"#b6ff2a",qr:"#054a45",qt:"SCAN AT THE WORKSHOP"},
 cosplay:{k:"C",l:"COSPLAY PASS",tag:"STAGE ENTRY",c:["#3a0630","#86104f","#e02b7d"],ac:"#ffd34d",qr:"#6d0b3e",qt:"SCAN AT COSPLAY DESK"},
 combo:{k:"K",l:"COMBO PASS",tag:"BEST VALUE BUNDLE",c:["#3b2200","#8a4a00","#ff8a00"],ac:"#fff0a8",qr:"#6a3600",qt:"SCAN AT THE GATE"},
 online:{k:"O",l:"ONLINE VIEW PASS",tag:"WATCH FROM HOME",c:["#04122e","#0b3a8a","#2f6fe0"],ac:"#7ef3ff",qr:"#0b2f78",qt:"ONLINE ACCESS PASS"},
 donation:{k:"D",l:"SUPPORTER",tag:"THANK YOU ♥",c:["#062b17","#0b6b3a","#1fb561"],ac:"#ffe27a",qr:"#0a4d2a",qt:"SUPPORTER RECEIPT"}};
const VS={ok:["SIGNED & VERIFIED","ok","VERIFIED<br>ORIGINAL"],paid:["PAID · ID ON FILE","ok","PAID"],claim:["CLAIMED · GATE CHECK","no","CLAIM"]};
const PARTNERS=[["Asifa India","#fff"],["Vaibhavi Studios","#fff"],["Red Bull","#0b1d4d"],["Avvatar Sports Nutrition","#fff"],["RGX","#000"],["Too Yumm","#000"],["Hortizi","#000"],["Arthashakti","#fff"]];
function partnerImgs(){return PARTNERS.map(([a,bg])=>{const i=document.querySelector('img[alt="'+a+'"]');return i&&i.src?{a,bg,src:i.src}:null}).filter(Boolean)}
function catOf(i){if(i.c&&TH[i.c])return i.c;const f=ALL.find(x=>x.name===i.n);if(f)return f.cat;return /donat/i.test(i.n||"")?"donation":"entry"}
function expand(t){
  const g={};(t.items||[]).forEach(i=>{const c=catOf(i);(g[c]=g[c]||[]).push(i)});
  const ks=Object.keys(g);if(!ks.length){ks.push("entry");g.entry=[]}
  return ks.map(c=>({...t,base:t.tid,tid:ks.length>1?t.tid+"-"+TH[c].k:t.tid,cat:c,items:g[c],total:g[c].length?g[c].reduce((a,i)=>a+i.a,0):t.total}));
}
const maskPh=p=>p&&p.length>=10?p.slice(0,2)+"••••"+p.slice(-4):(p||"");

/* ============================ QR ============================ */
function rr(x,px,py,w,h,r){x.beginPath();x.moveTo(px+r,py);x.arcTo(px+w,py,px+w,py+h,r);x.arcTo(px+w,py+h,px,py+h,r);x.arcTo(px,py+h,px,py,r);x.arcTo(px,py,px+w,py,r);x.closePath()}
function drawQR(canvas,text,size,col){
  const q=qrFor(text),x=canvas.getContext("2d");canvas.width=canvas.height=size;x.fillStyle="#fff";x.fillRect(0,0,size,size);
  if(!q){x.fillStyle="#14012e";x.font="12px monospace";x.fillText("QR unavailable",10,size/2);return}
  const n=q.getModuleCount(),m=size/(n+4),o=m*2,eye=col||"#2a0b6b";
  const inEye=(r,c)=>(r<7&&c<7)||(r<7&&c>=n-7)||(r>=n-7&&c<7);
  x.fillStyle="#14012e";
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!inEye(r,c)&&q.isDark(r,c)){rr(x,o+c*m-.2,o+r*m-.2,m+.4,m+.4,m*.32);x.fill()}
  [[0,0],[0,n-7],[n-7,0]].forEach(([r0,c0])=>{const px=o+c0*m,py=o+r0*m;
    x.fillStyle=eye;rr(x,px,py,7*m,7*m,2.2*m);x.fill();
    x.fillStyle="#fff";rr(x,px+m,py+m,5*m,5*m,1.5*m);x.fill();
    x.fillStyle=eye;rr(x,px+2*m,py+2*m,3*m,3*m,m);x.fill()});
}
function qrFor(text){
  if(typeof qrcode==="undefined")return null;
  const q=qrcode(0,"M");q.addData(text);q.make();return q;
}
const siteUrl=()=>CONFIG.siteUrl||location.href.split(/[?#]/)[0];
const ck=(t)=>hash(`${t.tid}|${t.pid}|${t.cat}|${t.total}|neac26`).slice(0,6);
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,"+").replace(/_/g,"/"))));
const tUrl=t=>t.token?`${siteUrl()}?t=${t.token}`:`${siteUrl()}?v=${b64u([t.tid,t.pid,t.cat||"entry",t.total,(t.n||"").slice(0,24),ck(t)].join("|"))}`;

/* ============================ TICKET (screen) ============================ */
function ticketEl(t,idx){
  const th=TH[t.cat]||TH.entry,vs=VS[t.vs||(t.verified?"ok":"paid")],el=document.createElement("div");
  el.className="ticket";el.dataset.i=idx;el.style.cssText=`--t1:${th.c[0]};--t2:${th.c[1]};--t3:${th.c[2]};--ac:${th.ac}`;
  const items=(t.items||[]).map(i=>`<div><span>${esc(i.n)} × ${i.q}</span><span>${inr(i.a)}</span></div>`).join("");
  const gate=!(t.cat==="online"||t.cat==="donation");
  let F=[["NAME",t.n],["PHONE",maskPh(t.ph)]];
  if(gate)F.push(["DATE","5–6 Nov 2026 · Thu + Fri"],["VENUE",CONFIG.venue],["GATES","10:00 both days"]);
  else if(t.cat==="online")F.push(["ACCESS","Online · Live View"],["LINK",CONFIG.streamUrl?"On this ticket":"Shared on NEAC channels"]);
  else F.push(["CONTRIBUTION","Received with thanks"],["EVENT","NEAC MANIA · Metro Tour 1"]);
  F.push(["ISSUED",new Date(t.ts).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"})]);
  if(t.tm&&t.cat==="esports")F.push(["TEAM",t.tm]);if(t.ch&&(t.cat==="cosplay"||t.cat==="combo"))F.push(["CHARACTER",t.ch]);
  const ps=partnerImgs().map(p=>`<span style="background:${p.bg}"><img src="${p.src}" alt="${esc(p.a)}"></span>`).join("");
  el.innerHTML=guilloche(t.token||t.pid||t.tid)+`<div class="main">
   <div class="tkh"><img src="${logoSrc()}" alt=""><div><small>MAD SENSEI STUDIOS PRESENTS</small><b>NEAC MANIA · METRO TOUR 1</b></div></div>
   <div class="holo-w"><div class="holo"><i></i></div><b>${vs[2]}</b></div>
   <div class="catband"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[t.cat]||ICON.entry}"/></svg><b>${th.l}</b><em>${th.tag}</em></div>
   <div class="tid">${esc(t.tid)}</div>
   <div class="tgrid">${F.map(f=>`<div><small>${f[0]}</small><span>${esc(f[1])}</span></div>`).join("")}</div>
   <div class="titems">${items}<div style="border-top:2px dashed rgba(255,255,255,.35);margin-top:6px;padding-top:6px;font-weight:800"><span>TOTAL PAID</span><span>${inr(t.total)}</span></div></div>
   <div style="font-size:11px;color:#e0d3ff;margin-top:8px;word-break:break-all">Payment ID: ${esc(t.pid)}</div>
   ${CONFIG.streamUrl&&t.cat==="online"?`<a class="btn sm" style="margin-top:10px" href="${esc(CONFIG.streamUrl)}" target="_blank" rel="noopener">WATCH LIVE ▶</a>`:""}
   <div class="pstrip"><small>ORGANISED BY MAD SENSEI STUDIOS · WITH OUR PARTNERS</small><div>${ps}</div></div></div>
   <div class="micro">${(esc(t.tid)+" · NEAC MANIA · ").repeat(14)}</div>
   <div class="side"><span class="vbadge ${vs[1]}">${vs[0]}</span><div class="qrbox"><canvas></canvas></div><small>${th.qt}<br>One ticket · Non-transferable</small><small style="letter-spacing:1px;color:#14012e">${esc(t.tid)}</small></div>`;
  setTimeout(()=>drawQR(el.querySelector("canvas"),tUrl(t),360,th.qr),0);
  return el;
}
let shown=[];
function showTickets(arr,fresh){
  shown=arr.flatMap(expand);$("tkList").innerHTML="";shown.forEach((t,i)=>$("tkList").appendChild(ticketEl(t,i)));
  $("okTitle").textContent=fresh?"PAYMENT SUCCESS!":"MY TICKETS";
  $("okSub").textContent=fresh?(shown.length>1?`Your ${shown.length} tickets are ready, one for each category. Screenshot or download them and show the QR at the gate.`:"Your ticket is ready. Screenshot it, download it or print it and show the QR at the gate."):"Tickets saved on this device.";
  const st=arr.map(t=>t.vs||(t.verified?"ok":"paid"));
  $("tInfo").innerHTML=st.includes("claim")?`This ticket was issued from your Razorpay Payment ID and will be matched with the organiser's payment records at the gate. Keep your Razorpay email, and write to <a href="mailto:${CONFIG.organiserEmail}" style="color:#ffb000">${CONFIG.organiserEmail}</a> if anything looks wrong.`
    :st.includes("paid")?"Payment received. Your ticket is tied to your Razorpay Payment ID, which gate staff check against payment records. Keep your Razorpay email as proof of purchase and please do not share the QR publicly.":"This ticket is signed against your payment. Please do not share the QR publicly; the gate scanner flags tickets that have already been used.";
  $("tview").classList.add("on");document.body.style.overflow="hidden";$("tview").scrollTop=0;
}
$("tCl").onclick=()=>{$("tview").classList.remove("on");document.body.style.overflow=""};
$("tPr").onclick=()=>window.print();
$("myT").onclick=e=>{e.preventDefault();const a=getTickets();$("menu").classList.remove("open");a.length?showTickets(a,false):openFind()};

/* ============================ TICKET (PNG download) ============================ */
$("tDl").onclick=async()=>{for(const t of shown){await downloadPNG(t);await new Promise(z=>setTimeout(z,350))}};
async function loadImg(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src})}
async function downloadPNG(t){
  const th=TH[t.cat]||TH.entry,vs=VS[t.vs||(t.verified?"ok":"paid")],W=1600,H=780,PW=520,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  try{await document.fonts.load("40px 'Lilita One'");await document.fonts.load("600 20px Poppins")}catch(e){}
  const g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,th.c[0]);g.addColorStop(.6,th.c[1]);g.addColorStop(1,th.c[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  const r=prng(t.token||t.pid||t.tid);x.lineWidth=1.4;
  for(let k=0;k<18;k++){const a=10+r()*60,f=.003+r()*.012,ph=r()*6.28,y0=r()*H;x.beginPath();for(let px=0;px<=W;px+=8){const py=y0+Math.sin(px*f+ph)*a+Math.cos(px*f*2.3+ph)*a*.4;px?x.lineTo(px,py):x.moveTo(px,py)}x.strokeStyle=`hsla(${250+r()*110},90%,${65+r()*20}%,${.18+r()*.35})`;x.stroke()}
  const logo=await loadImg(logoSrc());if(logo)x.drawImage(logo,50,40,110,110);
  x.fillStyle="#e0d3ff";x.font="700 18px Rajdhani,sans-serif";x.fillText("MAD SENSEI STUDIOS PRESENTS",180,80);
  x.fillStyle="#fff";x.font="48px 'Lilita One',sans-serif";x.fillText("NEAC MANIA · METRO TOUR 1",180,134);
  // category band
  x.fillStyle=th.ac;rr(x,50,172,W-PW-100,66,14);x.fill();
  x.save();x.translate(68,187);x.scale(1.5,1.5);x.strokeStyle="#14012e";x.lineWidth=2;x.lineCap="round";x.lineJoin="round";x.stroke(new Path2D(ICON[t.cat]||ICON.entry));x.restore();
  x.fillStyle="#14012e";x.font="34px 'Lilita One',sans-serif";x.fillText(th.l,122,218);
  x.font="700 15px Poppins,sans-serif";x.textAlign="right";x.fillText(th.tag,W-PW-70,212);x.textAlign="left";
  x.fillStyle=th.ac;x.font="70px 'Lilita One',sans-serif";x.fillText(t.tid,50,320);
  const fld=(l,v,px,py)=>{x.fillStyle="#e0d3ff";x.font="700 14px Poppins,sans-serif";x.fillText(l,px,py);x.fillStyle="#fff";x.font="600 22px Poppins,sans-serif";x.fillText(String(v).slice(0,28),px,py+28)};
  const gate=!(t.cat==="online"||t.cat==="donation");
  fld("NAME",t.n,50,372);fld("PHONE",maskPh(t.ph),440,372);
  if(gate){fld("DATE","5–6 Nov 2026 · Thu + Fri",50,444);fld("VENUE",CONFIG.venue+" · Gates 10:00",440,444)}
  else if(t.cat==="online"){fld("ACCESS","Online · Live View",50,444);fld("LINK",CONFIG.streamUrl?"On the online ticket":"Shared on NEAC channels",440,444)}
  else{fld("CONTRIBUTION","Received with thanks",50,444);fld("EVENT","NEAC MANIA · Metro Tour 1",440,444)}
  fld("TOTAL PAID",inr(t.total),50,516);fld("ISSUED",new Date(t.ts).toLocaleString("en-IN",{dateStyle:"medium",timeStyle:"short"}),440,516);
  x.fillStyle="#fff";x.font="600 18px Poppins,sans-serif";let y=590;(t.items||[]).slice(0,3).forEach(i=>{x.fillText(`${i.n} × ${i.q}`.slice(0,44)+"   "+inr(i.a),50,y);y+=26});
  x.fillStyle="rgba(255,255,255,.65)";x.font="600 13px Poppins,sans-serif";x.fillText("Payment ID: "+t.pid,50,y+8);
  // partner strip
  const sy=H-96,sw=W-PW-100;x.fillStyle="#fff";rr(x,50,sy,sw,70,12);x.fill();
  x.fillStyle="#6a4fa8";x.font="700 10px Poppins,sans-serif";x.fillText("ORGANISED BY MAD SENSEI STUDIOS · WITH OUR PARTNERS",64,sy+16);
  let px=64;for(const p of partnerImgs()){const im=await loadImg(p.src);if(!im)continue;const h=34,w=Math.min(110,h*im.width/im.height);if(px+w+20>50+sw)break;x.fillStyle=p.bg;rr(x,px,sy+24,w+16,40,6);x.fill();x.strokeStyle="#e3dbf5";x.lineWidth=1;x.stroke();x.drawImage(im,px+8,sy+27,w,34);px+=w+26}
  // side panel
  x.fillStyle="#fff";x.fillRect(W-PW,0,PW,H);x.setLineDash([12,10]);x.strokeStyle="#14012e";x.lineWidth=4;x.beginPath();x.moveTo(W-PW,0);x.lineTo(W-PW,H);x.stroke();x.setLineDash([]);
  const q=document.createElement("canvas");drawQR(q,tUrl(t),440,th.qr);x.drawImage(q,W-PW+40,50,440,440);
  x.strokeStyle=th.qr;x.lineWidth=5;rr(x,W-PW+36,46,448,448,16);x.stroke();
  x.fillStyle=vs[1]==="ok"?"#b6ff2a":"#ffd0d0";rr(x,W-PW+70,520,380,46,8);x.fill();x.strokeStyle="#14012e";x.lineWidth=3;x.stroke();
  x.fillStyle="#14012e";x.font="800 18px Poppins,sans-serif";x.textAlign="center";x.fillText(vs[0],W-PW/2,550);
  x.font="600 15px Poppins,sans-serif";x.fillStyle="#6a4fa8";x.fillText(th.qt,W-PW/2,600);x.fillText("One ticket · Non-transferable",W-PW/2,624);
  x.fillStyle="#14012e";x.font="700 16px Poppins,sans-serif";x.fillText(t.tid,W-PW/2,660);x.textAlign="left";
  const a=document.createElement("a");a.download=t.tid+".png";a.href=c.toDataURL("image/png");a.click();
}

/* ============================ RECOVERY / CLAIM ============================ */
async function checkPending(){
  let p=null;try{p=JSON.parse(localStorage.getItem("neac_pending")||"null")}catch(e){}
  if(!p)return;if(Date.now()-p.ts>864e5){localStorage.removeItem("neac_pending");return}
  try{const t=await API.recover({order_id:p.oid});saveTicket(t);localStorage.removeItem("neac_pending");cart={};sync();closeOv();showTickets([t],true);toast("Payment confirmed – your ticket is ready.")}catch(e){}
}
function pend2(){try{const p=JSON.parse(localStorage.getItem("neac_pend2")||"null");if(p&&Date.now()-p.ts<864e5&&!p.x)return p}catch(e){}return null}
function checkClaim(){const p=pend2();$("claimBar").classList.toggle("on",!!p&&!paying&&Date.now()-p.ts>15000)}
$("claimNo").onclick=e=>{e.stopPropagation();const p=pend2();if(p){p.x=1;try{localStorage.setItem("neac_pend2",JSON.stringify(p))}catch(e){}}checkClaim()};
function fillItemSel(){$("rItem").innerHTML=`<option value="auto">Not sure – work it out from the amount</option>`+ALL.map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join("")+`<option value="don">Donation</option>`}
function openFind(){
  const p=pend2();fillItemSel();
  if(p){$("rPh").value=p.b.phone||"";$("rNm").value=p.b.name||"";$("rAmt").value=p.total||""}
  $("rErr").textContent="";openOv("ovFind");
}
function inferItems(amt,sel){
  if(sel==="don")return[{n:"Donation – Support NEAC",q:1,a:amt,c:"donation"}];
  const mk=(i,q)=>({n:i.name,q,a:amt,c:i.cat});
  if(sel&&sel!=="auto"){const i=item(sel);if(i){for(const p of [unitPrice(i),i.price,i.eb].filter(Boolean))if(amt%p===0&&amt/p<=20)return[mk(i,amt/p)];return[mk(i,1)]}}
  for(const i of ALL)if([unitPrice(i),i.price,i.eb].includes(amt))return[mk(i,1)];
  for(let q=2;q<=10;q++)for(const i of ALL)if(!i.slots&&[unitPrice(i),i.price,i.eb].includes(amt/q)&&Number.isInteger(amt/q))return[mk(i,q)];
  return[{n:"NEAC MANIA Pass",q:1,a:amt,c:"entry"}];
}
$("rGo").onclick=async()=>{const er=m=>{$("rErr").textContent=m};er("");
  const pid=$("rPid").value.trim(),ph=$("rPh").value.trim(),nm=$("rNm").value.trim(),amt=parseInt($("rAmt").value,10)||0;
  if(!/^pay_\w+$/.test(pid))return er("Enter the Payment ID (starts with pay_).");
  if(!/^[6-9]\d{9}$/.test(ph))return er("Enter the 10-digit phone number you used.");
  $("rGo").disabled=true;$("rGo").textContent="SEARCHING…";
  const done=()=>{$("rGo").disabled=false;$("rGo").textContent="FIND MY TICKET"};
  let t=null,offline=false;
  try{t=await API.recover({payment_id:pid,phone:ph})}catch(e){if(e.offline)offline=true;else{done();return er(e.message)}}
  if(offline){
    if(!(amt>=1)){done();return er("Enter the amount you paid (it is in your Razorpay email).")}
    const p=pend2();const items=(p&&p.total===amt&&p.b.phone===ph)?p.items:inferItems(amt,$("rItem").value);
    t={tid:mkTid(pid),pid,oid:"",n:nm||(p&&p.b.name)||"Guest",ph,e:"",items,total:amt,ts:Date.now(),token:null,verified:false,vs:"claim",ch:p&&p.b.character,tm:p&&p.b.team};
  }
  saveTicket(t);try{localStorage.removeItem("neac_pend2")}catch(e){}checkClaim();done();closeOv();showTickets([t],true);
};
document.addEventListener("click",e=>{const a=e.target.closest("[data-find]");if(!a)return;e.preventDefault();document.querySelectorAll(".ov.on").forEach(o=>o.classList.remove("on"));openFind()});
$("claimGo").onclick=()=>openFind();
addEventListener("visibilitychange",()=>{if(!document.hidden){checkPending();checkClaim()}});
checkPending();redoDon();checkClaim();setTimeout(checkClaim,16000);

/* ============================ GATE VERIFY (?t=TOKEN) ============================ */
async function verifyMode(token){
  $("vview").classList.add("on");document.body.style.overflow="hidden";const card=$("vcard");card.className="vcard";card.innerHTML=`<div class="big">CHECKING…</div>`;
  try{const {ok:rok,data:j}=await API.ticket(token);
    if(!rok||!j.valid){card.className="vcard bad";card.innerHTML=`<div class="big">INVALID</div><p style="margin-top:10px">${esc(j.error||"This ticket could not be verified.")}</p>`;return}
    const t=j.ticket;let scans={};try{scans=JSON.parse(localStorage.getItem("neac_scans")||"{}")}catch(e){}
    const dup=scans[t.tid],paid=j.paymentStatus==="captured";
    card.className="vcard "+(paid?(dup?"warn":"good"):"bad");
    card.innerHTML=`<div class="big">${!paid?"NOT PAID":dup?"ALREADY SCANNED":"VALID"}</div><p class="hand" style="font-size:26px;margin-top:6px">${esc(t.tid)}</p>
    <table><tr><td>Name</td><td>${esc(t.n)}</td></tr>${(t.items||[]).map(i=>`<tr><td>${esc(i.n)}</td><td>× ${i.q}</td></tr>`).join("")}<tr><td>Total</td><td>${inr(t.total)}</td></tr><tr><td>Payment</td><td>${esc(j.paymentStatus)}</td></tr>${dup?`<tr><td>First scanned</td><td>${new Date(dup).toLocaleString("en-IN")}</td></tr>`:""}</table>
    ${paid&&!dup?`<button class="btn" id="mk" style="margin-top:18px">MARK AS ENTERED</button>`:""}`;
    const mk=$("mk");if(mk)mk.onclick=()=>{scans[t.tid]=Date.now();localStorage.setItem("neac_scans",JSON.stringify(scans));verifyMode(token)};
  }catch(e){card.className="vcard bad";card.innerHTML=`<div class="big">NO CONNECTION</div><p style="margin-top:10px">Could not reach the verification server.</p>`}
}


function verifyLocal(v){
  $("vview").classList.add("on");document.body.style.overflow="hidden";const card=$("vcard");
  let p;try{p=unb64u(v).split("|")}catch(e){p=null}
  const bad=m=>{card.className="vcard bad";card.innerHTML=`<div class="big">INVALID</div><p style="margin-top:10px">${esc(m)}</p>`};
  if(!p||p.length<6)return bad("This QR code could not be read.");
  const [tid,pid,cat,total,nm,sig]=p,t={tid,pid,cat,total:+total};
  if(ck(t)!==sig)return bad("Checksum mismatch. This ticket looks altered.");
  let scans={};try{scans=JSON.parse(localStorage.getItem("neac_scans")||"{}")}catch(e){}
  const dup=scans[tid],th=TH[cat]||TH.entry,gate=!(cat==="online"||cat==="donation");
  card.className="vcard "+(dup?"warn":(gate?"good":"warn"));
  card.innerHTML=`<div class="big">${dup?"ALREADY SCANNED":gate?"TICKET OK":th.l}</div><p class="hand" style="font-size:26px;margin-top:6px">${esc(tid)}</p>
  <table><tr><td>Category</td><td>${th.l}</td></tr><tr><td>Name</td><td>${esc(nm)}</td></tr><tr><td>Amount</td><td>${inr(+total)}</td></tr><tr><td>Payment ID</td><td style="word-break:break-all">${esc(pid)}</td></tr>${dup?`<tr><td>First scanned</td><td>${new Date(dup).toLocaleString("en-IN")}</td></tr>`:""}</table>
  <p style="font-size:12px;color:#6a4fa8;margin-top:12px">${gate?"Gate staff: confirm this Payment ID shows as Captured in the Razorpay Dashboard before letting the guest in.":"This is an online or supporter ticket and is not used for gate entry."}</p>
  ${gate&&!dup?`<button class="btn" id="mk" style="margin-top:14px">MARK AS ENTERED</button>`:""}`;
  const mk=$("mk");if(mk)mk.onclick=()=>{scans[tid]=Date.now();localStorage.setItem("neac_scans",JSON.stringify(scans));verifyLocal(v)};
}

/* ============================ LEGAL ============================ */
const LEGAL={
 terms:["TERMS & CONDITIONS",`<p>These terms apply to tickets and registrations for NEAC MANIA – Metro Tour 1, organised by Mad Sensei Studios (“we”, “us”).</p><ul><li>Tickets are personal and non-transferable. Each ticket carries a unique ID and QR code and is valid for one entry per ticket per the pass purchased.</li><li>An Entry Pass covers entry only. Competitions, workshops and cosplay entries are separate unless included in a combo.</li><li>Programme, timings, game titles, prizes, guests and venue details are planning drafts and may change; we will announce changes on NEAC channels.</li><li>Organisers may refuse entry or remove anyone who breaks venue rules, safety rules or the cosplay-is-not-consent policy.</li><li>Competition rules, eligibility and judging are shared at registration; the organisers' decision is final.</li><li>By attending you consent to photography and video recording for event promotion.</li></ul>`],
 privacy:["PRIVACY POLICY",`<p>We collect the details you enter at checkout (name, email, phone, cosplay character and, where relevant, team details) to issue your ticket, run the event and contact you about it.</p><ul><li>Payments are processed by Razorpay. We do not see or store your card, UPI or bank details.</li><li>Your ticket is also stored in your own browser (local storage) so you can reopen it on this device.</li><li>We do not sell your data. We may share it only with payment and event-operations providers needed to deliver your ticket.</li><li>To access or delete your data, write to teamneac@gmail.com.</li></ul>`],
 refund:["CANCELLATION & REFUND POLICY",`<p>Please read before you buy.</p><ul><li>Tickets and registrations are non-refundable once purchased, except as set out below.</li><li>If the event is cancelled by the organisers, you will receive a full refund of the amount paid, to the original payment method, within 7–10 working days.</li><li>If a ticket is charged twice or a payment succeeds without a ticket being issued, write to teamneac@gmail.com with your payment ID and we will resolve it or refund it.</li><li>Changes to programme or timings are not grounds for refund.</li></ul>`],
 contact:["CONTACT US",`<p><b>Mad Sensei Studios</b> – organiser of NEAC (Northeast Anime Con)</p><p style="margin-top:10px">Email: <a href="mailto:teamneac@gmail.com" style="color:var(--purple);font-weight:700">teamneac@gmail.com</a></p><p style="margin-top:10px">Event: NEAC MANIA – Metro Tour 1 · 5–6 November 2026 · Kolkata</p><p style="margin-top:10px">For sponsorship or stall enquiries, mention “Metro Tour 1” in your subject line.</p>`]
};
document.addEventListener("click",e=>{const a=e.target.closest("[data-legal]");if(!a)return;e.preventDefault();const [h,b]=LEGAL[a.dataset.legal];$("legalBody").innerHTML=`<h3>${h}</h3><div style="margin-top:12px;font-size:14px;color:#3a2a63;line-height:1.7">${b}</div>`;document.querySelectorAll(".ov.on").forEach(o=>o.classList.remove("on"));openOv("ovLegal")});

/* ============================ ANIMATION ============================ */
// nav + burger
addEventListener("scroll",()=>$("nav").classList.toggle("sc",scrollY>40),{passive:true});
$("burger").onclick=()=>$("menu").classList.toggle("open");$("menu").addEventListener("click",e=>{if(e.target.tagName==="A")$("menu").classList.remove("open")});
// countdown
(function cd(){const t=new Date(CONFIG.eventStart)-Date.now();const p=n=>String(Math.max(0,n)).padStart(2,"0");
  if(t<=0){$("cd").innerHTML=`<div style="min-width:0;padding:8px 22px"><b style="font-size:24px">LIVE NOW</b></div>`;return}
  $("d1").textContent=p(Math.floor(t/864e5));$("d2").textContent=p(Math.floor(t/36e5)%24);$("d3").textContent=p(Math.floor(t/6e4)%60);$("d4").textContent=p(Math.floor(t/1e3)%60);setTimeout(cd,1000)})();
// early bird ticking
(function ebt(){const left=ebUntil()-Date.now();
  if(left<=0){if(document.body.classList.contains("eb")){renderCatalog();sync()}else if(!ebt.d){ebt.d=1;renderOffers()}return}
  const p=n=>String(n).padStart(2,"0"),d=Math.floor(left/864e5),h=Math.floor(left/36e5)%24,m=Math.floor(left/6e4)%60,s=Math.floor(left/1e3)%60;
  $("e1").textContent=p(d);$("e2").textContent=p(h);$("e3").textContent=p(m);$("e4").textContent=p(s);
  $("ebLeft").textContent=(d?d+"d ":"")+p(h)+"h "+p(m)+"m "+p(s)+"s";
  $("ebDate").textContent=new Date(CONFIG.earlyBirdUntil).toLocaleDateString("en-IN",{day:"numeric",month:"short"})+", 11:59 PM";
  setTimeout(ebt,1000)})();
// reveal + counters
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");e.target.querySelectorAll("[data-n]").forEach(c=>{const n=+c.dataset.n;let v=0;const iv=setInterval(()=>{v++;c.textContent=v;if(v>=n)clearInterval(iv)},70)});io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll(".rev").forEach((e,i)=>{e.style.transitionDelay=(i%4)*70+"ms";io.observe(e)});
// card tilt
document.querySelectorAll(".xcard").forEach(c=>{c.addEventListener("pointermove",e=>{if(e.pointerType!=="mouse")return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform=`perspective(700px) rotateY(${x*9}deg) rotateX(${-y*9}deg) translateY(-4px)`});c.addEventListener("pointerleave",()=>c.style.transform="")});
// hero parallax
const crew=$("crew"),ttl=$("ttl");addEventListener("pointermove",e=>{if(scrollY>700)return;const x=e.clientX/innerWidth-.5,y=e.clientY/innerHeight-.5;crew.style.transform=`translate(${x*-14}px,${y*-8}px)`;ttl.style.transform=`rotate(-2deg) translate(${x*10}px,${y*6}px)`},{passive:true});
// particles: petals + embers
(function(){const c=$("fx"),x=c.getContext("2d");if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;let W,H,P=[];
  function rs(){W=c.width=innerWidth;H=c.height=innerHeight}rs();addEventListener("resize",rs);
  const N=innerWidth<700?22:46;
  const mk=(top)=>({x:Math.random()*W,y:top?-20:Math.random()*H,s:3+Math.random()*7,vy:.4+Math.random()*1.1,vx:-.3+Math.random()*.8,r:Math.random()*6.28,vr:(Math.random()-.5)*.05,k:Math.random()<.7?0:1,o:.3+Math.random()*.5,sw:Math.random()*6.28});
  for(let i=0;i<N;i++)P.push(mk());
  (function loop(){x.clearRect(0,0,W,H);for(const p of P){p.y+=p.vy;p.sw+=.02;p.x+=p.vx+Math.sin(p.sw)*.6;p.r+=p.vr;if(p.y>H+20||p.x>W+30||p.x<-30)Object.assign(p,mk(true));
    x.save();x.translate(p.x,p.y);x.rotate(p.r);x.globalAlpha=p.o;
    if(p.k===0){x.fillStyle="#ffb7d5";x.beginPath();x.ellipse(0,0,p.s,p.s*.55,0,0,6.28);x.fill()}else{x.fillStyle="#ffb000";x.shadowColor="#ff6200";x.shadowBlur=8;x.beginPath();x.arc(0,0,p.s*.28,0,6.28);x.fill()}
    x.restore()}requestAnimationFrame(loop)})()})();
// preloader
(function(){const p=$("pre");let seen=false;try{seen=sessionStorage.getItem("neac_seen")}catch(e){}
  const go=()=>{p.classList.add("out");setTimeout(()=>p.remove(),1300);try{sessionStorage.setItem("neac_seen","1")}catch(e){}};
  if(seen){p.remove()}else setTimeout(go,2300);})();

sync();
const qs=new URLSearchParams(location.search),tok=qs.get("t"),vv=qs.get("v");if(tok)verifyMode(tok);else if(vv)verifyLocal(vv);
