/* POST /api/recover  { order_id }  or  { payment_id, phone }  ->  { ticket, token }
   Used when the browser lost the payment callback (UPI app switch, reload...). */
const {send,readBody,rz,makeToken,ensureCaptured,paidOk,buildTicket,fail}=require("./_lib/util");

module.exports=async(req,res)=>{
  if(req.method!=="POST")return send(res,405,{error:"Method not allowed"});
  try{
    const b=readBody(req);let payment=null,phone="";
    if(b.order_id){
      const oid=String(b.order_id);
      const list=await rz(`/orders/${encodeURIComponent(oid)}/payments`);
      payment=(list.items||[]).find(p=>p.status==="captured"||p.status==="authorized");
      if(!payment)return send(res,402,{error:"Payment not completed yet."});
    }else{
      const pid=String(b.payment_id||"");phone=String(b.phone||"").trim();
      if(!/^pay_\w+$/.test(pid))return send(res,400,{error:"Enter the Payment ID (starts with pay_)."});
      if(!/^[6-9]\d{9}$/.test(phone))return send(res,400,{error:"Enter the 10-digit phone number you used."});
      payment=await rz(`/payments/${pid}`);
    }
    let order=null;
    if(payment.order_id)order=await rz(`/orders/${payment.order_id}`);
    if(!b.order_id){ // payment id + phone: the phone must match what was used at checkout
      const known=[order&&order.notes&&order.notes.phone,String(payment.contact||"").replace(/\D/g,"").slice(-10)];
      if(!known.includes(phone))return send(res,400,{error:"That phone number does not match this payment."});
    }
    payment=await ensureCaptured(payment);
    if(!paidOk(payment))return send(res,402,{error:"This payment was not completed."});
    send(res,200,{ticket:buildTicket(payment,order,phone),token:makeToken(payment.id,payment.order_id||"")});
  }catch(e){fail(res,e)}
};
