const crypto=require("crypto");

const send=(res,status,obj)=>{res.statusCode=status;res.setHeader("Content-Type","application/json");res.setHeader("Cache-Control","no-store");res.end(JSON.stringify(obj))};
const readBody=req=>{let b=req.body;if(typeof b==="string"){try{b=JSON.parse(b)}catch(e){b={}}}return b&&typeof b==="object"?b:{}};

const hmacHex=(secret,msg)=>crypto.createHmac("sha256",secret).update(msg).digest("hex");
const safeEq=(a,b)=>{const x=Buffer.from(String(a)),y=Buffer.from(String(b));return x.length===y.length&&crypto.timingSafeEqual(x,y)};
const signingSecret=()=>process.env.TICKET_SIGNING_SECRET||process.env.RAZORPAY_KEY_SECRET||"";

/* ---- Razorpay REST client (secret stays on the server) ---- */
async function rz(path,{method="GET",body}={}){
  const id=process.env.RAZORPAY_KEY_ID,sec=process.env.RAZORPAY_KEY_SECRET;
  if(!id||!sec){const e=new Error("Server is not configured");e.config=true;throw e}
  const r=await fetch("https://api.razorpay.com/v1"+path,{method,
    headers:{Authorization:"Basic "+Buffer.from(id+":"+sec).toString("base64"),"Content-Type":"application/json"},
    body:body?JSON.stringify(body):undefined});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){const e=new Error((j.error&&j.error.description)||"Razorpay error");e.rz=true;e.status=r.status;throw e}
  return j;
}

/* ---- ticket id + signed token (QR code carries the token) ---- */
const tidFor=pid=>"NEAC-"+crypto.createHash("sha256").update(pid).digest("hex").slice(0,8).toUpperCase();
const makeToken=(pid,oid)=>{const p=Buffer.from(pid+"|"+(oid||"")).toString("base64url");return p+"."+hmacHex(signingSecret(),"t:"+p).slice(0,24)};
function readToken(t){
  const [p,s]=String(t||"").split(".");if(!p||!s)return null;
  if(!safeEq(hmacHex(signingSecret(),"t:"+p).slice(0,24),s))return null;
  const [pid,oid]=Buffer.from(p,"base64url").toString().split("|");return pid?{pid,oid:oid||""}:null;
}

/* ---- payment helpers ---- */
// Make sure a paid payment is captured (covers accounts where auto-capture is off).
async function ensureCaptured(payment){
  if(payment.status==="authorized"){payment=await rz(`/payments/${payment.id}/capture`,{method:"POST",body:{amount:payment.amount,currency:payment.currency||"INR"}})}
  return payment;
}
const paidOk=p=>p.status==="captured";

function buildTicket(payment,order,phoneHint){
  const total=payment.amount/100,notes=(order&&order.notes)||{};
  let items=[];
  const {byId,byName,unitPrice}=require("./catalog");
  if(order&&notes.items){ // "id:q:amt;id:q:amt" written by create-order
    items=notes.items.split(";").map(s=>{const [id,q,a]=s.split(":");const it=byId[id];return it?{n:it.name,q:+q,a:+a,c:it.cat}:null}).filter(Boolean);
  }else{ // direct checkout (donation / online pass): names come from the browser's payment notes, "Name xQ, Name xQ"
    const raw=(payment.notes&&payment.notes.items)||"";
    const parts=raw.split(", ").filter(Boolean).map(s=>{const m=s.match(/^(.*) x(\d+)$/);return m?{name:m[1],q:+m[2]}:{name:s,q:1}});
    const cat=n=>{const f=byName(n);return f?f.cat:(/donat/i.test(n)?"donation":"entry")};
    if(parts.length===1)items=[{n:parts[0].name,q:parts[0].q,a:total,c:cat(parts[0].name)}];
    else if(parts.length>1){
      const cand=parts.map(p=>{const f=byName(p.name);return f?{n:p.name,q:p.q,a:unitPrice(f)*p.q,c:f.cat}:null});
      if(cand.every(Boolean)&&cand.reduce((s,i)=>s+i.a,0)===total)items=cand;
    }
  }
  if(!items.length)items=[{n:"NEAC MANIA Pass",q:1,a:total,c:"entry"}];
  const pn=payment.notes||{};
  return {tid:tidFor(payment.id),pid:payment.id,oid:payment.order_id||"",
    n:notes.name||pn.name||"Guest",ph:notes.phone||phoneHint||String(payment.contact||"").replace(/\D/g,"").slice(-10),e:notes.email||payment.email||"",
    items,total,ts:(payment.created_at||Date.now()/1000)*1000,ch:notes.character||pn.character||"",tm:notes.team||pn.team||""};
}

function fail(res,e,msg){
  if(e&&e.config)return send(res,500,{error:"Server is not configured. Add the Razorpay keys in Vercel environment variables."});
  if(e&&e.rz&&e.status>=400&&e.status<500)return send(res,400,{error:msg||"Could not find that payment."});
  console.error(e);return send(res,500,{error:"Server error. Please try again."});
}
module.exports={send,readBody,hmacHex,safeEq,rz,tidFor,makeToken,readToken,ensureCaptured,paidOk,buildTicket,fail};
