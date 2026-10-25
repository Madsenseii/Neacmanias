/* POST /api/create-order  { items:[{id,q}], buyer:{...} }  ->  { orderId, amount, key }
   Prices are calculated HERE from the server catalog, never from the browser. */
const {send,readBody,rz,fail}=require("./_lib/util");
const {byId,unitPrice,maxQty}=require("./_lib/catalog");
const cut=(s,n)=>String(s==null?"":s).trim().slice(0,n);

module.exports=async(req,res)=>{
  if(req.method!=="POST")return send(res,405,{error:"Method not allowed"});
  try{
    const b=readBody(req),buyer=b.buyer||{},list=Array.isArray(b.items)?b.items:[];
    const name=cut(buyer.name,80),email=cut(buyer.email,120),phone=cut(buyer.phone,10);
    if(name.length<2)return send(res,400,{error:"Enter your name."});
    if(!/^\S+@\S+\.\S+$/.test(email))return send(res,400,{error:"Enter a valid email."});
    if(!/^[6-9]\d{9}$/.test(phone))return send(res,400,{error:"Enter a valid 10-digit Indian mobile number."});
    if(!list.length||list.length>12)return send(res,400,{error:"Cart is empty."});
    let amount=0;const seen=new Set(),lines=[];
    for(const l of list){
      const it=byId[l&&l.id],q=Number(l&&l.q);
      if(!it||seen.has(it.id))return send(res,400,{error:"Unknown item in cart."});
      if(!Number.isInteger(q)||q<1||q>maxQty(it))return send(res,400,{error:`Invalid quantity for ${it.name}.`});
      seen.add(it.id);const a=unitPrice(it)*q;amount+=a;lines.push(`${it.id}:${q}:${a}`);
    }
    if(amount<1)return send(res,400,{error:"Invalid amount."});
    const order=await rz("/orders",{method:"POST",body:{amount:amount*100,currency:"INR",receipt:("neac_"+Date.now()).slice(0,40),
      notes:{name,email,phone,team:cut(buyer.team,100),ign:cut(buyer.ign,200),character:cut(buyer.character,100),items:lines.join(";").slice(0,250)}}});
    send(res,200,{orderId:order.id,amount:order.amount,key:process.env.RAZORPAY_KEY_ID});
  }catch(e){fail(res,e,"Could not start payment. Please retry.")}
};
