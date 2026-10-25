/* POST /api/verify  { razorpay_order_id, razorpay_payment_id, razorpay_signature }  ->  { ticket, token } */
const {send,readBody,hmacHex,safeEq,rz,makeToken,ensureCaptured,paidOk,buildTicket,fail}=require("./_lib/util");

module.exports=async(req,res)=>{
  if(req.method!=="POST")return send(res,405,{error:"Method not allowed"});
  try{
    const b=readBody(req),oid=String(b.razorpay_order_id||""),pid=String(b.razorpay_payment_id||""),sig=String(b.razorpay_signature||"");
    if(!oid||!pid||!sig)return send(res,400,{error:"Missing payment details."});
    if(!process.env.RAZORPAY_KEY_SECRET)return fail(res,{config:true});
    if(!safeEq(hmacHex(process.env.RAZORPAY_KEY_SECRET,oid+"|"+pid),sig))return send(res,400,{error:"Signature mismatch."});
    let payment=await rz(`/payments/${encodeURIComponent(pid)}`);
    if(payment.order_id!==oid)return send(res,400,{error:"Payment does not belong to this order."});
    payment=await ensureCaptured(payment);
    if(!paidOk(payment))return send(res,400,{error:"Payment is not completed."});
    const order=await rz(`/orders/${encodeURIComponent(oid)}`);
    send(res,200,{ticket:buildTicket(payment,order),token:makeToken(pid,oid)});
  }catch(e){fail(res,e)}
};
