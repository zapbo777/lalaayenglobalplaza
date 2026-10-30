/* Lala Ayen Global Plaza: one shared cart for the whole site, currency converter, and international checkout (Zonos, TEST mode).
   Prices are stored and charged in USD. Converted prices are approximate. No secret keys are in this file. */
(function(){
  'use strict';
  var KEY='lala_cart_v1',CKEY='lala_currency';
  var CURRENCIES=[['USD','US$ USD'],['EUR','€ EUR'],['GBP','£ GBP'],['CAD','CA$ CAD'],['AUD','A$ AUD'],['PHP','₱ PHP'],['JPY','¥ JPY'],['MXN','MX$ MXN'],['NZD','NZ$ NZD'],['SGD','S$ SGD'],['HKD','HK$ HKD'],['CNY','CN¥ CNY'],['KRW','₩ KRW'],['INR','₹ INR'],['AED','AED'],['BRL','R$ BRL']];
  var rates={USD:1},ratesInfo='';
  var mail='lalaayenglobalplaza@gmail.com';
  var byId=function(id){return document.getElementById(id);};
  var el=function(tag,attrs,text){var e=document.createElement(tag);if(attrs)for(var k in attrs){if(k==='class')e.className=attrs[k];else if(k in e&&typeof attrs[k]!=='string')e[k]=attrs[k];else e.setAttribute(k,attrs[k]);}if(text!=null)e.textContent=text;return e;};
  var opts=function(v){return String(v||'').split(/[,/|]/).map(function(x){return x.trim();}).filter(Boolean);};
  function load(){try{var a=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(a)?a.filter(function(x){return x&&x.id&&x.qty>0;}):[];}catch(e){return [];}}
  function save(c){try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}render();}
  function currency(){var c='USD';try{c=localStorage.getItem(CKEY)||'USD';}catch(e){}return rates[c]?c:'USD';}
  function fmt(usd,cur){cur=cur||'USD';var v=Number(usd)*(rates[cur]||1);try{return v.toLocaleString(undefined,{style:'currency',currency:cur,maximumFractionDigits:(cur==='JPY'||cur==='KRW')?0:2});}catch(e){return cur+' '+v.toFixed(2);}}
  var usd=function(n){return fmt(n,'USD');};
  function count(){return load().reduce(function(s,x){return s+x.qty;},0);}
  function subtotal(){return load().reduce(function(s,x){return s+x.qty*Number(x.price||0);},0);}
  function lineKey(x){return x.id+'|'+(x.size||'')+'|'+(x.color||'');}

  /* ---------- Add to cart ---------- */
  function add(p,qty,size,color){
    var c=load(),line={id:String(p.id),title:String(p.title||'').slice(0,120),price:Number(p.price)||0,image:String(p.image||''),store:String(p.store||''),size:size||'',color:color||'',qty:Math.max(1,qty||1),max:Math.max(1,Math.min(20,Number(p.stock)||1))};
    var k=lineKey(line),ex=c.filter(function(x){return lineKey(x)===k;})[0];
    if(ex)ex.qty=Math.min(ex.max||20,ex.qty+line.qty);else c.push(line);
    save(c);toast(line.title+' added to cart.');
  }
  function toast(msg){var t=byId('toast');if(t){t.textContent=msg;t.classList.remove('hidden');clearTimeout(t.lcTimer);t.lcTimer=setTimeout(function(){t.classList.add('hidden');},3500);}else{var s=byId('lc-status');if(s)s.textContent=msg;}}

  /* ---------- Product details / options view ---------- */
  function showDetails(p){
    var d=byId('lc-details');if(!d)return;var body=byId('lc-details-body');body.replaceChildren();
    var sizes=opts(p.sizes),colors=opts(p.colors),buyable=p.status==='ready'&&Number(p.stock)>0&&Number(p.price)>0;
    if(/^https:\/\//.test(p.image||'')){body.appendChild(el('img',{src:p.image,alt:p.title,class:'lc-details-img',loading:'lazy'}));}
    body.appendChild(el('h3',null,p.title));
    var price=el('p',{class:'lc-details-price notranslate','data-usd':String(p.price)});price.textContent=usd(p.price)+' USD';body.appendChild(price);
    if(p.description)body.appendChild(el('p',{class:'lc-details-desc'},String(p.description).slice(0,600)));
    var form=el('div',{class:'lc-details-form'});var selS=null,selC=null;
    if(sizes.length>1){var l=el('label',null,'Size ');selS=el('select',{class:'notranslate'});sizes.forEach(function(s){selS.appendChild(new Option(s,s));});l.appendChild(selS);form.appendChild(l);}
    if(colors.length>1){var l2=el('label',null,'Color ');selC=el('select',{class:'notranslate'});colors.forEach(function(s){selC.appendChild(new Option(s,s));});l2.appendChild(selC);form.appendChild(l2);}
    var lq=el('label',null,'Qty ');var q=el('input',{type:'number',min:'1',max:String(Math.max(1,Math.min(20,Number(p.stock)||1))),value:'1',class:'lc-qty-input'});lq.appendChild(q);form.appendChild(lq);
    body.appendChild(form);
    var b=el('button',{type:'button',class:'lc-primary'},buyable?'＋ Add to Cart':'Unavailable');b.disabled=!buyable;
    b.addEventListener('click',function(){add(p,Math.max(1,Math.min(Number(q.max),parseInt(q.value,10)||1)),selS?selS.value:(sizes[0]||''),selC?selC.value:(colors[0]||''));d.close();});
    body.appendChild(b);applyPrices(body);d.showModal();
  }
  function addProduct(p){var sizes=opts(p.sizes),colors=opts(p.colors);if(sizes.length>1||colors.length>1)return showDetails(p);add(p,1,sizes[0]||'',colors[0]||'');}

  /* ---------- Currency ---------- */
  function applyPrices(root){
    var cur=currency();
    Array.prototype.forEach.call((root||document).querySelectorAll('[data-usd]'),function(n){
      var ap=n.querySelector('.lc-approx');
      if(cur==='USD'){if(ap)ap.remove();return;}
      if(!ap){ap=el('span',{class:'lc-approx notranslate'});n.appendChild(ap);}
      ap.textContent='≈ '+fmt(n.getAttribute('data-usd'),cur)+' approx.';
    });
  }
  function loadRates(){
    return fetch('/api/rates',{headers:{Accept:'application/json'}}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(d&&d.rates){rates=d.rates;ratesInfo='Rates: '+(d.source||'')+(d.updated?', '+d.updated:'');}
      fillCurrency();applyPrices();render();
    }).catch(function(){fillCurrency();});
  }
  function fillCurrency(){
    var s=byId('lc-currency');if(!s)return;var cur=currency();s.replaceChildren();
    CURRENCIES.forEach(function(c){if(rates[c[0]]||c[0]==='USD'){var o=new Option(c[1],c[0]);s.appendChild(o);}});s.value=cur;
    s.title=Object.keys(rates).length>1?'Prices are charged in USD. Converted prices are approximate. '+ratesInfo:'Currency rates are loading or unavailable; prices shown in USD.';
  }

  /* ---------- Cart drawer ---------- */
  function render(){
    var n=count();Array.prototype.forEach.call(document.querySelectorAll('.lc-cart-count'),function(b){b.textContent=String(n);});
    var list=byId('lc-lines');if(!list)return;list.replaceChildren();var c=load(),cur=currency();
    if(!c.length){list.appendChild(el('p',{class:'lc-empty'},'Your cart is empty.'));}
    c.forEach(function(x,i){
      var row=el('div',{class:'lc-line'});
      if(/^https:\/\//.test(x.image||''))row.appendChild(el('img',{src:x.image,alt:'',loading:'lazy'}));
      var info=el('div',{class:'lc-line-info'});info.appendChild(el('strong',null,x.title));
      var o=[x.size&&('Size '+x.size),x.color&&('Color '+x.color)].filter(Boolean).join(' · ');if(o)info.appendChild(el('small',null,o));
      var pr=el('small',{class:'notranslate','data-usd':String(x.price*x.qty)},usd(x.price)+' × '+x.qty+' = '+usd(x.price*x.qty));info.appendChild(pr);
      var ctr=el('div',{class:'lc-qty'});
      var minus=el('button',{type:'button','aria-label':'Decrease quantity'},'−'),num=el('span',{class:'notranslate'},String(x.qty)),plus=el('button',{type:'button','aria-label':'Increase quantity'},'+'),rm=el('button',{type:'button',class:'lc-remove'},'Remove');
      minus.addEventListener('click',function(){var a=load();if(a[i]){a[i].qty=Math.max(1,a[i].qty-1);save(a);}});
      plus.addEventListener('click',function(){var a=load();if(a[i]){a[i].qty=Math.min(a[i].max||20,a[i].qty+1);save(a);}});
      rm.addEventListener('click',function(){var a=load();a.splice(i,1);save(a);});
      ctr.append(minus,num,plus,rm);info.appendChild(ctr);row.appendChild(info);list.appendChild(row);
    });
    var st=byId('lc-subtotal');if(st){st.setAttribute('data-usd',String(subtotal()));st.textContent=usd(subtotal())+' USD';}
    var co=byId('lc-checkout');if(co)co.disabled=!c.length;var sq=byId('lc-square');if(sq)sq.disabled=!c.length;var em=byId('lc-email');if(em)em.disabled=!c.length;
    applyPrices(byId('lc-drawer'));
  }
  function emailOrder(){
    var c=load();if(!c.length)return;
    var lines=['Hello LALA AYEN GLOBAL PLAZA,','I would like to order:',''].concat(c.map(function(x){return x.qty+' × '+x.title+(x.size?' (Size '+x.size+')':'')+(x.color?' (Color '+x.color+')':'')+' at '+usd(x.price)+' each';}),['','Subtotal: '+usd(subtotal())+' USD','Please confirm shipping, duties, taxes and the final total before I pay.']);
    location.href='mailto:'+mail+'?subject='+encodeURIComponent('LALA AYEN order request')+'&body='+encodeURIComponent(lines.join('\n'));
  }

  /* ---------- Zonos international checkout (TEST mode) ---------- */
  var zonosState='idle';
  function status(msg){var s=byId('lc-status');if(s)s.textContent=msg;}
  function createCartId(){
    var items=load().map(function(x){return {id:x.id,qty:x.qty,size:x.size||'',color:x.color||''};});
    return fetch('/api/checkout/cart',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({items:items})})
      .then(function(r){return r.json().then(function(d){if(!r.ok||!d.cartId)throw new Error(d.error||'Checkout is unavailable.');return d.cartId;});});
  }
  function initZonos(){
    if(zonosState!=='idle')return;zonosState='loading';
    fetch('/api/checkout/config').then(function(r){return r.json();}).then(function(cfg){
      if(!cfg||!cfg.enabled||!cfg.publicKey||!cfg.storeId){zonosState='off';return;}
      var s=document.createElement('script');s.src='https://js.zonos.com/dist/scripts/loadZonos.js?timestamp='+Date.now();s.async=true;
      s.onload=function(){
        try{
          var p=window.Zonos&&window.Zonos.init({storeId:Number(cfg.storeId),zonosApiKey:cfg.publicKey,checkoutSettings:{placeOrderButtonSelector:'#lc-checkout',createCartId:function(){return createCartId().then(function(id){return id;}).catch(function(e){status(e.message);throw e;});}}});
          Promise.resolve(p).then(function(){zonosState='ready';}).catch(function(){zonosState='off';});
        }catch(e){zonosState='off';}
      };
      s.onerror=function(){zonosState='off';};document.head.appendChild(s);
    }).catch(function(){zonosState='off';});
  }
  function checkoutClick(){
    if(zonosState==='ready')return; // Zonos handles the click itself
    // Not ready: still validate the cart with the server, then explain.
    status('Checking your cart…');
    createCartId().then(function(){status('International checkout is in TEST mode and not open to the public yet. Your cart is saved. To order now, use "Email my order".');})
      .catch(function(e){var m=e&&e.message||'';status(!m||/not enabled|unavailable/i.test(m)?'International checkout is coming soon (TEST mode). Your cart is saved. To order now, use "Email my order".':m);});
  }

  function squareClick(){
    var b=byId('lc-square');var items=load().map(function(x){return {id:x.id,qty:x.qty,size:x.size||'',color:x.color||''};});if(!items.length)return;
    if(b)b.disabled=true;status('Opening secure Square checkout…');
    fetch('/api/checkout/square',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({items:items,returnTo:location.href.split('#')[0].split('?')[0]})})
      .then(function(r){return r.json().then(function(d){if(!r.ok||!d.url)throw new Error(d.error||'');return d.url;});})
      .then(function(url){location.href=url;})
      .catch(function(e){if(b)b.disabled=false;var m=e&&e.message||'';status(!m||/not enabled|unavailable/i.test(m)?'Square quick pay is coming soon (TEST mode). Your cart is saved. To order now, use "Email my order".':m);});
  }
  function paidNotice(){
    if(!/[?&]paid=square\b/.test(location.search))return;
    try{localStorage.removeItem(KEY);}catch(e){}
    toast('Thank you! Your Square payment was received. A receipt is sent by Square to your email.');
  }

  /* ---------- Build UI ---------- */
  function build(){
    var host=document.querySelector('.topbar-actions')||document.querySelector('.site-account-actions');
    if(!host||byId('lc-cart-open'))return;
    var sel=el('select',{id:'lc-currency',class:'lc-currency notranslate','aria-label':'Currency'});sel.appendChild(new Option('US$ USD','USD'));
    sel.addEventListener('change',function(){try{localStorage.setItem(CKEY,sel.value);}catch(e){}applyPrices();render();});
    var btn=el('button',{type:'button',id:'lc-cart-open',class:'lc-cart-button','aria-label':'Open cart'});btn.append('🛒 Cart ',el('b',{class:'lc-cart-count notranslate'},'0'));
    var lt=document.getElementById('lt-lang');var ref=lt?lt.nextSibling:host.firstChild;host.insertBefore(btn,ref);host.insertBefore(sel,btn);
    var d=el('dialog',{id:'lc-drawer',class:'lc-drawer','aria-labelledby':'lc-title'});
    d.innerHTML='<div class="lc-head"><h2 id="lc-title">Your cart</h2><button type="button" class="lc-close" aria-label="Close cart">×</button></div><div id="lc-lines" class="lc-lines"></div><div class="lc-foot"><div class="lc-subtotal-row"><span>Subtotal</span><strong id="lc-subtotal" class="notranslate" data-usd="0">$0.00 USD</strong></div><p class="lc-note">Prices are charged in US dollars. Other currencies are shown as an approximate guide. Shipping, duties and taxes for your country are calculated at checkout.</p><div class="lc-pay-row"><button type="button" id="lc-checkout" class="lc-primary">International checkout (Zonos) <span class="lc-test">TEST MODE</span></button><button type="button" id="lc-square" class="lc-primary lc-square">Pay with Square (US) <span class="lc-test">TEST MODE</span></button></div><button type="button" id="lc-email" class="lc-secondary">Email my order</button><p id="lc-status" class="lc-status" role="status" aria-live="polite"></p></div>';
    document.body.appendChild(d);
    var dd=el('dialog',{id:'lc-details',class:'lc-details','aria-label':'Product details'});dd.innerHTML='<button type="button" class="lc-close" aria-label="Close">×</button><div id="lc-details-body"></div>';document.body.appendChild(dd);
    dd.querySelector('.lc-close').addEventListener('click',function(){dd.close();});
    d.querySelector('.lc-close').addEventListener('click',function(){d.close();});
    d.addEventListener('click',function(e){if(e.target===d)d.close();});dd.addEventListener('click',function(e){if(e.target===dd)dd.close();});
    btn.addEventListener('click',function(){render();status('');d.showModal();initZonos();});
    byId('lc-checkout').addEventListener('click',checkoutClick);byId('lc-square').addEventListener('click',squareClick);byId('lc-email').addEventListener('click',emailOrder);
    var grid=byId('product-grid');if(grid&&window.MutationObserver)new MutationObserver(function(){applyPrices(grid);}).observe(grid,{childList:true});
    window.addEventListener('storage',function(e){if(e.key===KEY)render();});
    render();loadRates();paidNotice();render();
  }
  window.LalaCart={add:add,addProduct:addProduct,showDetails:showDetails,items:load,count:count,applyPrices:applyPrices};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
