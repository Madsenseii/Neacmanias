/* ============================ API CLIENT ============================
   All calls to the optional serverless backend (CONFIG.api) live here.
   Endpoints: POST /create-order, POST /verify, POST /recover, GET /ticket?t=TOKEN
   The site still works without a backend (direct checkout + local tickets). */
const API=(()=>{
  const JSON_HDR={"Content-Type":"application/json"};
  const post=(path,body)=>fetch(CONFIG.api+path,{method:"POST",headers:JSON_HDR,body:JSON.stringify(body)});

  /* Returns the order object, or null when no backend is available (direct checkout).
     Throws Error(message) when the backend rejects the request. */
  async function createOrder(items,buyer){
    try{
      const r=await post("/create-order",{items,buyer});
      if(r.ok)return await r.json();
      if(r.status!==404&&r.status!==405){
        const j=await r.json().catch(()=>({}));
        const e=new Error(j.error||"Could not start payment. Please retry.");e.fatal=true;throw e;
      }
    }catch(e){if(e.fatal)throw e}
    return null;
  }

  /* Verifies the Razorpay signature (up to 3 tries). Returns {ticket,token} or null. */
  async function verifyPayment(r){
    for(let a=0;a<3;a++){
      try{
        const v=await post("/verify",{razorpay_order_id:r.razorpay_order_id,razorpay_payment_id:r.razorpay_payment_id,razorpay_signature:r.razorpay_signature});
        const j=await v.json();
        if(v.ok&&j.ticket)return {ticket:j.ticket,token:j.token};
        if(v.status===400)return null;
      }catch(e){await new Promise(z=>setTimeout(z,1200))}
    }
    return null;
  }

  /* Recover a ticket by order_id or payment_id + phone. Throws Error("offline") with .offline=true when there is no backend. */
  async function recover(body){
  let r;try{r=await fetch(CONFIG.api+"/recover",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)})}catch(e){const x=new Error("offline");x.offline=true;throw x}
  if(r.status===404||r.status===405){const x=new Error("offline");x.offline=true;throw x}
  const j=await r.json().catch(()=>null);
  if(!j){const x=new Error("offline");x.offline=true;throw x}
  if(!r.ok||!j.ticket)throw new Error(j.error||"Could not find that payment.");
  return {...j.ticket,token:j.token,verified:true,vs:"ok"};
}

  /* Gate check. Returns {ok,data}; throws on network failure. */
  async function ticket(token){
    const r=await fetch(`${CONFIG.api}/ticket?t=${encodeURIComponent(token)}`);
    return {ok:r.ok,data:await r.json()};
  }

  return {createOrder,verifyPayment,recover,ticket};
})();
