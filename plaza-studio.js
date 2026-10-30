/* Creative Studio + Custom Portrait Studio (restored from Arlene's original pages).
   ONE place for prices: edit STUDIO_PRICES below. The Worker (/api/checkout/service) keeps the same list
   server-side (STUDIO_SERVICES in lala-auth-worker/src/index.js), so change both when prices change.
   Payment: Square only, via our Worker. While checkout is off, buttons fall back to "Email to book". */
(function(){
  'use strict';
  var EMAIL='lalaayenglobalplaza@gmail.com';
  var STUDIO_PRICES={
    video:[
      {id:'video:starter',name:'Starter Package',price:75},
      {id:'video:professional',name:'Professional Package',price:150},
      {id:'video:premium',name:'Premium Campaign Package',label:'$300+',quoteOnly:true}
    ],
    // Main prices = Arlene's flyer (Oct 30): Individual $25, Couple $35, Family (up to 5 people) $45, Pet $30.
    // Themed styles below are SUGGESTED (scaled up from her older $15-$25 page) and need her confirmation.
    portraits:[
      {id:'portrait:single',name:'Individual Portrait',price:25},
      {id:'portrait:couple',name:'Couple Portrait',price:35},
      {id:'portrait:family',name:'Family Portrait (up to 5 people)',price:45},
      {id:'portrait:pet',name:'Pet Portrait',price:30},
      {id:'portrait:royal-fantasy',name:'Royal & Fantasy',price:35},
      {id:'portrait:movie-poster',name:'Movie-Style Poster',price:40},
      {id:'portrait:wedding',name:'Wedding/Anniversary',price:40},
      {id:'portrait:military',name:'Military Tribute',price:40},
      {id:'portrait:memorial',name:'Memorial Tribute',price:40},
      {id:'portrait:gift-poster',name:'Custom Gift Poster',price:40},
      {id:'portrait:premium-deluxe',name:'Premium Deluxe Poster',price:45}
    ],
    // Old bundles (2 posters $30, 3 posters $45, Family Package $50) removed: cheaper than singles now. Arlene to re-decide.
    bundles:[]
  };
  window.LALA_STUDIO_PRICES=STUDIO_PRICES;
  var $=function(id){return document.getElementById(id);};
  var money=function(x){return x.label||('$'+x.price);};
  var all=function(){return STUDIO_PRICES.video.concat(STUDIO_PRICES.portraits,STUDIO_PRICES.bundles);};
  var find=function(id){return all().filter(function(x){return x.id===id;})[0];};
  var squareOn=null, current=null;
  function mailto(subject,lines){return 'mailto:'+EMAIL+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(lines.join('\n'));}
  function fillLists(){
    document.querySelectorAll('[data-studio-list]').forEach(function(ul){
      var list=STUDIO_PRICES[ul.getAttribute('data-studio-list')]||[];
      var box=ul.closest('[data-studio-bundles]');if(box)box.hidden=!list.length;ul.innerHTML='';list.forEach(function(x){var li=document.createElement('li');if(ul.classList.contains('cs-list')){var a=document.createElement('span');a.textContent=x.name;var b=document.createElement('b');b.textContent=money(x);li.appendChild(a);li.appendChild(b);}else li.textContent=x.name+' — '+money(x);ul.appendChild(li);});
    });
    document.querySelectorAll('[data-studio-price]').forEach(function(el){var x=find(el.getAttribute('data-studio-price'));if(x)el.textContent=money(x);});
    document.querySelectorAll('select[data-studio-select]').forEach(function(sel){
      var keep=sel.querySelector('option[value=""]');sel.innerHTML='';if(keep)sel.appendChild(keep);
      STUDIO_PRICES.portraits.concat(STUDIO_PRICES.bundles).forEach(function(x){sel.appendChild(new Option(x.name+' — '+money(x),x.id));});
    });
  }
  function payLabel(){var b=$('modal-pay-btn');if(!b||!current)return;
    if(current.quoteOnly)b.textContent='✉ Email us for a quote';
    else if(squareOn)b.textContent='💳 Pay '+money(current)+' with Square';
    else b.textContent='✉ Email to book (online payment coming soon)';}
  function setPortrait(){var sel=$('modal-portrait-type');if(!sel)return;current=find(sel.value)||current;$('modal-pkg-price').textContent=current?money(current):'';payLabel();}
  window.checkout=function(pkg){
    var wrap=$('portrait-type-wrap');
    if(pkg==='portrait'){current=STUDIO_PRICES.portraits[0];$('modal-pkg-name').textContent='Custom Portrait Request';wrap.style.display='block';$('modal-portrait-type').value=current.id;}
    else{current=find('video:'+pkg);wrap.style.display='none';$('modal-pkg-name').textContent=current?current.name:pkg;}
    $('modal-pkg-price').textContent=current?money(current):'';
    $('modal-name').value='';$('modal-email').value='';var m=$('modal-msg');m.textContent='';m.className='modal-msg';
    payLabel();$('payModal').classList.add('active');
  };
  window.updatePortraitPrice=setPortrait;
  window.closeModal=function(){$('payModal').classList.remove('active');current=null;};
  document.addEventListener('click',function(e){if(e.target===$('payModal'))window.closeModal();});
  function emailFallback(msg){
    var name=$('modal-name').value.trim(),email=$('modal-email').value.trim(),m=$('modal-msg');
    var href=mailto((current&&current.quoteOnly?'Quote request: ':'Booking: ')+(current?current.name+' ('+money(current)+')':'Creative Studio'),
      ['Hello Lala Ayen,','','I would like to book: '+(current?current.name+' — '+money(current):''),'Name: '+name,'Email: '+email,'','My idea / details:','']);
    m.className='modal-msg';m.innerHTML='';
    if(msg){m.appendChild(document.createTextNode(msg+' '));}
    var a=document.createElement('a');a.href=href;a.textContent='Open your email app →';a.style.color='#d4af37';m.appendChild(a);
    window.location.href=href;
  }
  window.submitPayment=async function(){
    var name=$('modal-name').value.trim(),email=$('modal-email').value.trim(),m=$('modal-msg');
    if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){m.textContent='Please enter your email.';m.className='modal-msg error';return;}
    if(!current||current.quoteOnly||!squareOn){emailFallback(current&&current.quoteOnly?'We will reply with your quote.':'Online payment is coming soon. Email us to book.');return;}
    m.textContent='Connecting to Square…';m.className='modal-msg';
    try{
      var r=await fetch('/api/checkout/service',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({service:current.id,name:name,email:email,returnTo:location.href.split('?')[0].split('#')[0]})});
      var d=await r.json().catch(function(){return {};});
      if(d.url){window.location.href=d.url;return;}
      emailFallback(d.error||'Online payment is not available right now.');
    }catch(e){emailFallback('Could not reach the payment server.');}
  };
  // Portrait request form -> prefilled email (photos are attached by the customer in their email app).
  window.submitPortraitOrder=function(){
    var msg=$('portrait-order-msg'),name=$('portrait-name').value.trim(),email=$('portrait-email').value.trim(),sel=$('portrait-style');
    var style=find(sel.value);
    if(!name||!email||!style){msg.style.color='#ff8080';msg.textContent='Please fill in your name, email, and portrait style.';return;}
    var href=mailto('Portrait request: '+style.name+' ('+money(style)+')',['Hello Lala Ayen,','','Name: '+name,'Email: '+email,'Portrait style: '+style.name+' — '+money(style),'','Special instructions:',$('portrait-instructions').value.trim(),'','(I attached my reference photo(s) to this email.)']);
    msg.style.color='#9fd8a0';msg.textContent='Your email app is opening with your request. Please attach your reference photo(s) before sending.';
    window.location.href=href;
  };
  // Shop assistant hook: the new Plaza AI chat (branch ai-chat, POST /api/chat) can register window.LalaChat.open(opts)
  // or listen for the cancelable "lala:open-chat" event and call preventDefault(). Until then we show an honest note.
  window.openPlazaChat=function(topic,noteId){
    if(window.LalaChat&&typeof window.LalaChat.open==='function'){window.LalaChat.open({topic:topic});return;}
    var ev=new CustomEvent('lala:open-chat',{detail:{topic:topic},cancelable:true});
    if(!document.dispatchEvent(ev))return;
    var n=$(noteId);if(n){n.style.display='block';n.innerHTML='Our Plaza Guide chat is coming soon. For now, email <a style="color:#d4af37" href="mailto:'+EMAIL+'">'+EMAIL+'</a> and we will reply.';}
  };
  // "Pay agreed amount" (Square enter-amount link) is only for signed-in customers.
  // The URL is never in the page: GET /api/pay-link returns it only with a valid session cookie (401 otherwise).
  function payState(url){
    document.querySelectorAll('[data-pay-agreed]').forEach(function(a){if(url){a.href=url;a.hidden=false;}else{a.removeAttribute('href');a.hidden=true;}});
    document.querySelectorAll('[data-pay-signin]').forEach(function(b){b.hidden=!!url;});
  }
  var payReq=0;
  function refreshPayLink(user){
    var n=++payReq;
    if(user===null){payState(null);return;}
    fetch('/api/pay-link',{credentials:'same-origin',headers:{'Accept':'application/json'}})
      .then(function(r){return r.ok?r.json():{};})
      .then(function(d){if(n===payReq)payState(d&&typeof d.url==='string'&&/^https:\/\/square\.link\//.test(d.url)?d.url:null);})
      .catch(function(){if(n===payReq)payState(null);});
  }
  function openSignIn(){
    var dlg=document.getElementById('account-dialog');
    if(dlg&&typeof dlg.showModal==='function'&&!dlg.open){dlg.showModal();return;}
    var b=document.querySelector('[data-auth-open]');if(b)b.click();
  }
  function init(){
    fillLists();
    payState(null);
    document.querySelectorAll('[data-pay-signin]').forEach(function(b){b.addEventListener('click',openSignIn);});
    document.addEventListener('lala-auth',function(e){refreshPayLink(e.detail&&e.detail.user?e.detail.user:null);});
    if(window.LalaAuth&&window.LalaAuth.user)refreshPayLink(window.LalaAuth.user);
    var sel=$('modal-portrait-type');if(sel)sel.addEventListener('change',setPortrait);
    fetch('/api/checkout/config',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{};}).then(function(c){squareOn=!!(c&&c.square);payLabel();}).catch(function(){squareOn=false;payLabel();});
    var b=$('sidebarToggle'),sb=$('sidebar');if(b&&sb&&document.body.hasAttribute('data-studio-page'))b.addEventListener('click',function(){var o=sb.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
