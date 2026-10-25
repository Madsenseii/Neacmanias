/* Minimal QR encoder (byte mode, ECC level M, versions 1-40) – exposes qrcode(0,'M') like qrcode-generator */
(function(g){
var ECC=[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],
    BLK=[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
function raw(v){var r=(16*v+128)*v+64;if(v>=2){var n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r}
function dataCw(v){return Math.floor(raw(v)/8)-ECC[v]*BLK[v]}
function rsDiv(deg){var r=[],i,j;for(i=0;i<deg-1;i++)r.push(0);r.push(1);var root=1;
  for(i=0;i<deg;i++){for(j=0;j<r.length;j++){r[j]=mul(r[j],root);if(j+1<r.length)r[j]^=r[j+1]}root=mul(root,2)}return r}
function mul(x,y){var z=0;for(var i=7;i>=0;i--){z=(z<<1)^((z>>>7)*0x11D);z^=((y>>>i)&1)*x}return z&255}
function rsRem(data,div){var r=div.map(function(){return 0});data.forEach(function(b){var f=b^r.shift();r.push(0);div.forEach(function(c,i){r[i]^=mul(c,f)})});return r}
function bit(x,i){return((x>>>i)&1)!==0}
function Q(text){
  var bytes=unescape(encodeURIComponent(text)).split("").map(function(c){return c.charCodeAt(0)});
  var v=1;for(;v<=40;v++){var cc=v<10?8:16;if(4+cc+bytes.length*8<=dataCw(v)*8)break}
  if(v>40)throw new Error("too long");
  var bits=[];function put(val,n){for(var i=n-1;i>=0;i--)bits.push((val>>>i)&1)}
  put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(function(b){put(b,8)});
  var cap=dataCw(v)*8;put(0,Math.min(4,cap-bits.length));put(0,(8-bits.length%8)%8);
  for(var pad=0xEC;bits.length<cap;pad^=0xEC^0x11)put(pad,8);
  var data=[];for(var i=0;i<bits.length;i+=8){var b=0;for(var k=0;k<8;k++)b=(b<<1)|bits[i+k];data.push(b)}
  var nb=BLK[v],el=ECC[v],rc=Math.floor(raw(v)/8),ns=nb-rc%nb,sl=Math.floor(rc/nb),div=rsDiv(el),blocks=[],off=0;
  for(i=0;i<nb;i++){var len=sl-el+(i<ns?0:1),d=data.slice(off,off+len);off+=len;var e=rsRem(d,div);if(i<ns)d.push(0);blocks.push(d.concat(e))}
  var all=[];for(i=0;i<blocks[0].length;i++)blocks.forEach(function(b,j){if(i!==sl-el||j>=ns)all.push(b[i])});
  var size=v*4+17,mod=[],fn=[];for(i=0;i<size;i++){mod.push(new Array(size).fill(false));fn.push(new Array(size).fill(false))}
  function set(x,y,d){mod[y][x]=d;fn[y][x]=true}
  for(i=0;i<size;i++){set(6,i,i%2===0);set(i,6,i%2===0)}
  function finder(cx,cy){for(var dy=-4;dy<=4;dy++)for(var dx=-4;dx<=4;dx++){var d=Math.max(Math.abs(dx),Math.abs(dy)),x=cx+dx,y=cy+dy;if(x>=0&&x<size&&y>=0&&y<size)set(x,y,d!==2&&d!==4)}}
  finder(3,3);finder(size-4,3);finder(3,size-4);
  var ap=[];if(v>1){var na=Math.floor(v/7)+2,st=v===32?26:Math.ceil((v*4+4)/(na*2-2))*2;ap=[6];for(var p=size-7;ap.length<na;p-=st)ap.splice(1,0,p)}
  ap.forEach(function(ax,i1){ap.forEach(function(ay,j1){if((i1===0&&j1===0)||(i1===0&&j1===ap.length-1)||(i1===ap.length-1&&j1===0))return;
    for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++)set(ax+dx,ay+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)})});
  function fmt(mask){var d=(0<<3)|mask; /* ECC M = 0 */ var r=d;for(var i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);var bs=((d<<10)|r)^0x5412;
    for(i=0;i<=5;i++)set(8,i,bit(bs,i));set(8,7,bit(bs,6));set(8,8,bit(bs,7));set(7,8,bit(bs,8));for(i=9;i<15;i++)set(14-i,8,bit(bs,i));
    for(i=0;i<8;i++)set(size-1-i,8,bit(bs,i));for(i=8;i<15;i++)set(8,size-15+i,bit(bs,i));set(8,size-8,true)}
  fmt(0);
  if(v>=7){var r2=v;for(i=0;i<12;i++)r2=(r2<<1)^((r2>>>11)*0x1F25);var vb=(v<<12)|r2;
    for(i=0;i<18;i++){var c=bit(vb,i),a=size-11+i%3,b2=Math.floor(i/3);set(a,b2,c);set(b2,a,c)}}
  var k2=0;for(var right=size-1;right>=1;right-=2){if(right===6)right=5;
    for(var vert=0;vert<size;vert++)for(var j=0;j<2;j++){var x=right-j,up=((right+1)&2)===0,y=up?size-1-vert:vert;
      if(!fn[y][x]&&k2<all.length*8){mod[y][x]=bit(all[k2>>>3],7-(k2&7));k2++}}}
  function mk(mask){for(var y=0;y<size;y++)for(var x=0;x<size;x++){var inv;switch(mask){case 0:inv=(x+y)%2===0;break;case 1:inv=y%2===0;break;case 2:inv=x%3===0;break;case 3:inv=(x+y)%3===0;break;case 4:inv=(Math.floor(x/3)+Math.floor(y/2))%2===0;break;case 5:inv=x*y%2+x*y%3===0;break;case 6:inv=(x*y%2+x*y%3)%2===0;break;default:inv=((x+y)%2+x*y%3)%2===0}
      if(!fn[y][x]&&inv)mod[y][x]=!mod[y][x]}}
  function pen(){var res=0,x,y,run;
    for(y=0;y<size;y++){run=1;for(x=1;x<size;x++){if(mod[y][x]===mod[y][x-1]){run++;if(run===5)res+=3;else if(run>5)res++}else run=1}}
    for(x=0;x<size;x++){run=1;for(y=1;y<size;y++){if(mod[y][x]===mod[y-1][x]){run++;if(run===5)res+=3;else if(run>5)res++}else run=1}}
    for(y=0;y<size-1;y++)for(x=0;x<size-1;x++){var c=mod[y][x];if(c===mod[y][x+1]&&c===mod[y+1][x]&&c===mod[y+1][x+1])res+=3}
    var dark=0;mod.forEach(function(r){r.forEach(function(c){if(c)dark++})});res+=(Math.ceil(Math.abs(dark*20-size*size*10)/(size*size))-1)*10;return res}
  var best=0,bp=1e9;for(var m=0;m<8;m++){mk(m);fmt(m);var pp=pen();if(pp<bp){bp=pp;best=m}mk(m)}
  mk(best);fmt(best);
  return {n:size,d:mod}
}
g.qrcode=function(){var t="",q;return{addData:function(s){t+=s},make:function(){q=Q(t)},getModuleCount:function(){return q.n},isDark:function(r,c){return q.d[r][c]}}}
})(window);
