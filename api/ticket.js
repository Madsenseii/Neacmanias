/* GET /api/ticket?t=TOKEN  ->  { valid, ticket, paymentStatus }   (gate staff scan)
   The token is signed by this server; payment status is read live from Razorpay. */
const {send,rz,readToken,buildTicket,fail}=require("./_lib/util");

module.exports=async(req,res)=>{
  if(req.method!=="GET")return send(res,405,{error:"Method not allowed"});
  try{
    const tk=readToken(req.query&&req.query.t);
    if(!tk)return send(res,400,{valid:false,error:"This QR code is not a genuine NEAC ticket."});
    const payment=await rz(`/payments/${encodeURIComponent(tk.pid)}`);
    const order=payment.order_id?await rz(`/orders/${encodeURIComponent(payment.order_id)}`):null;
    send(res,200,{valid:true,ticket:buildTicket(payment,order),paymentStatus:payment.status});
  }catch(e){fail(res,e,"Ticket not found.")}
};
