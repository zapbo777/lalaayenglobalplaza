import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc, addDoc, query, where, serverTimestamp, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js';
const $ = (selector,root=document)=>root.querySelector(selector);
const $$ = (selector,root=document)=>Array.from(root.querySelectorAll(selector));
const catalog = document.body.dataset.store || '';
const storeGroup = String(document.body.dataset.storeGroup || ''); // department shelf pages (e.g. LALA AYEN TEMPLE) filter Global Shop items by category prefix
const byId = id => document.getElementById(id);
const mail='lalaayenglobalplaza@gmail.com';
const ownerUid=String(window.LALA_OWNER_UID||'').trim();
const firebaseDetails=window.LALA_FIREBASE_CONFIG;
const configured=Boolean(firebaseDetails && firebaseDetails.projectId && firebaseDetails.apiKey);
let app=null,auth=null,db=null,storage=null,account=null,owner=false;
let inventory=[], basket={},active='All',term='',order='featured',ratingFor='',reviewRows=[];
const categories={
 'author-bookstore':['Children’s Books','Poetry','Inspirational','Novels','Spiritual & Faith','Other Original Writings'],
 'preloved-books':['Children’s Books','Fiction & Novels','Education','Biography','Spiritual & Faith','Cookbooks','Comics','Other Used Books'],
 'thrift-store':['Women’s Tops','Women’s Dresses','Women’s Shorts','Women’s Bottoms','Women’s Outerwear','Men’s Clothing','Kids & Babies','Shoes','Bags & Accessories','Toys & Games','Home & Kitchen','Other Finds'],
 'affiliate-marketing':['Affiliate Links','Discount Codes','Resources','Other Programs'],
 'lala-merchants':['T-Shirts','Hoodies','Mugs & Drinkware','Tote Bags','Stickers & Prints','Other Merch'],
 'global-shop':['Home & Living','Gadgets & Tech','Beauty & Wellness','Fashion Accessories','Kids & Baby','Trending Finds']
};
const symbols={'author-bookstore':'📚','preloved-books':'📖','thrift-store':'🛍️','affiliate-marketing':'🔗','lala-merchants':'👕','global-shop':'🌐'};
const priceFormat = n => Number(n).toLocaleString('en-US',{style:'currency',currency:'USD'});
const safe = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isHttp = u=>{try{const a=new URL(String(u));return a.protocol==='https:';}catch{return false;}};
const clean = x=>({id:String(x.id||'').slice(0,150),store:String(x.store||''),title:String(x.title||'').slice(0,120),category:String(x.category||'Other'),condition:String(x.condition||'New'),description:String(x.description||'').slice(0,2000),sizes:String(x.sizes||'').slice(0,180),price:Math.max(0,Number(x.price)||0),stock:Math.max(0,parseInt(x.stock,10)||0),status:String(x.status)==='ready'?'ready':'draft',image:String(x.image||''),merchantUrl:String(x.merchantUrl||''),isSample:false});
const notify=(s)=>{const el=byId('toast');if(el){el.textContent=s;el.classList.remove('hidden');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.add('hidden'),4500);}else{const el=byId('account-status');if(el)el.textContent=s;}};
function openModal(d){if(d && !d.open)d.showModal();}
function closeModal(d){if(d?.open)d.close();}
function authText(msg){const el=byId('account-status');if(el)el.textContent=msg;}
function updateAuthUI(){
 $$('[data-signout]').forEach(e=>e.hidden=!account);$$('[data-auth-open]').forEach(e=>{e.textContent=account?'My account':'Sign in / Create account';});
 $$('.owner-only').forEach(e=>e.hidden=!owner);
 if(account)authText('Signed in as '+account.email+(owner?' · Owner access':' · Customer access'));
 else authText(configured?'Sign in or create a customer account.':'Accounts will be available after secure account setup.');
 if(byId('review-form')){const form=byId('review-form');form.querySelector('button[type=submit]').disabled=!account||!configured;}
}
function setupAuth(){
 const dlg=byId('account-dialog'),form=byId('account-form');
 $$('[data-auth-open]').forEach(b=>b.addEventListener('click',()=>openModal(dlg)));
 $$('[data-signout]').forEach(b=>b.addEventListener('click',async()=>{if(auth)await signOut(auth);else authText('Not connected.');}));
 $$('[data-auth-close]').forEach(b=>b.addEventListener('click',()=>closeModal(dlg)));
 if(!form)return;
 const email=()=>String(byId('account-email').value).trim();const pass=()=>String(byId('account-password').value);
 form.addEventListener('submit',async e=>{e.preventDefault();if(!auth)return authText('Secure account login is not connected yet.');try{await signInWithEmailAndPassword(auth,email(),pass());closeModal(dlg);}catch(e){authText('Sign-in failed: '+(e.code||'Check email and password.'));}});
 byId('account-create')?.addEventListener('click',async()=>{if(!auth)return authText('Create-account is waiting for account setup.');if(pass().length<6)return authText('Password must be 6+ characters.');try{await createUserWithEmailAndPassword(auth,email(),pass());closeModal(dlg);}catch(e){authText('Unable to create account: '+(e.code||'Please try again.'));}});
 byId('account-reset')?.addEventListener('click',async()=>{if(!auth)return authText('Password reset is waiting for account setup.');if(!email())return authText('Enter your email first.');try{await sendPasswordResetEmail(auth,email());authText('If the address is registered, check your inbox for a password reset email.');}catch(e){authText('Unable to send reset: '+(e.code||'Try again.'));}});
}
async function loadPrepared(){try{const res=await fetch('products.json',{cache:'no-store'});if(res.ok){const data=await res.json();if(Array.isArray(data))inventory=data.map(clean).filter(x=>x.status==='ready'&&x.title&&x.price>=0);}}catch(e){inventory=[];}renderCategories();renderCatalog();}
function subscribeProducts(){if(!db)return loadPrepared();
 if(window.__catalogUnsub)window.__catalogUnsub();
 const q=owner?query(collection(db,'products'),where('store','==',catalog)):query(collection(db,'products'),where('store','==',catalog),where('status','==','ready'));
 window.__catalogUnsub=onSnapshot(q,s=>{inventory=s.docs.map(d=>clean({...d.data(),id:d.id}));renderCatalog();renderManager();renderBasket();},()=>notify('Unable to read products. Verify Firestore rules and settings.'));
}
function renderCategories(){const box=byId('category-row');if(!box)return;box.replaceChildren();const shelfCats=(storeGroup||!categories[catalog])?[...new Set(inventory.filter(p=>p.store===catalog&&(!storeGroup||p.category.startsWith(storeGroup))&&(p.status==='ready'||owner)).map(p=>p.category))]:null;
 for(const x of ['All',...(shelfCats||categories[catalog]||[])]){const button=document.createElement('button');button.type='button';button.className='category-chip'+(active===x?' active':'');button.textContent=storeGroup?x.replace(storeGroup+' · ',''):x;button.addEventListener('click',()=>{active=x;renderCategories();renderCatalog();});box.append(button);}}
function matching(){const x=inventory.filter(p=>(p.store===catalog||!p.store)&&(!storeGroup||p.category.startsWith(storeGroup))&&((p.status==='ready')||owner)&& (active==='All'||p.category===active) &&([p.title,p.category,p.description,p.sizes].join(' ').toLowerCase().includes(term.toLowerCase())));
 if(order==='low')x.sort((a,b)=>a.price-b.price);if(order==='high')x.sort((a,b)=>b.price-a.price);if(order==='title')x.sort((a,b)=>a.title.localeCompare(b.title));return x;}
const displayStars=(r)=>r?.count>0?`<span class="rating-icon">${'★'.repeat(Math.round(r.avg))}${'☆'.repeat(5-Math.round(r.avg))}</span> ${r.avg.toFixed(1)} (${r.count})`:'☆☆☆☆☆ No reviews yet';
let ratingCache={};
let reviewPreviews={};
const reviewMediaTypes={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp', 'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov' };

async function pullRatings(ids){if(!db||ids.length===0)return;await Promise.all(ids.map(async id=>{try{const data=await getDocs(collection(db,'products',id,'reviews'));const rows=data.docs.map(x=>x.data());if(rows.length){ratingCache[id]={avg:rows.reduce((n,x)=>n+Number(x.stars||0),0)/rows.length,count:rows.length};reviewPreviews[id]=rows.find(r=>String(r.text||'').trim())?.text||'';}else{ratingCache[id]={avg:0,count:0};reviewPreviews[id]='';}}catch{ratingCache[id]={avg:0,count:0};}}));if(catalog)renderCatalog(true);}
function renderCatalog(noFetch=false){const grid=byId('product-grid');if(!grid)return;const items=matching();const count=byId('results-count');if(count)count.textContent=`${items.length} ${items.length===1?'item':'items'} in this department`;
 if(items.length===0){grid.innerHTML='<div class="empty-state"><h3>'+safe(document.body.dataset.emptyTitle||'No items listed yet')+'</h3><p>Our shop is preparing real products. Check back soon, or ask about availability.</p><a href="index.html#contact">Contact the Plaza →</a></div>';return;}
 grid.innerHTML=items.map(p=>{const buyable=p.status==='ready'&&p.stock>0;const affiliate=catalog==='affiliate-marketing';const img=isHttp(p.image)||p.image.startsWith('data:image/')?`<img loading="lazy" src="${safe(p.image)}" alt="${safe(p.title)}">`:`<span class="image-placeholder"><span class="emoji">${symbols[catalog]||'🛍️'}</span><small>Photo coming soon</small></span>`;
 const edit=owner?`<button data-action="edit" data-id="${safe(p.id)}">Edit</button>`:'';
 const action=affiliate&&isHttp(p.merchantUrl)?`<a href="${safe(p.merchantUrl)}" rel="noopener noreferrer sponsored" target="_blank">Visit merchant ↗</a>`:affiliate?'<button disabled>Not available</button>':`<button type="button" class="add" data-action="add" data-id="${safe(p.id)}" ${buyable?'':'disabled'}>${buyable?'＋ Add to Quote Basket':'Unavailable'}</button>`;
 return `<article class="product-card"><div class="product-image">${img}${p.status!=='ready'?'<span class="product-badge draft">OWNER DRAFT</span>':''}</div><div class="product-info"><span class="product-category">${safe(p.category)}</span><h3>${safe(p.title)}</h3><div class="product-description">${safe(p.description)}</div><div class="product-meta">${safe(p.condition)} · ${safe(p.sizes||'Details available on request')} · Stock: ${p.stock}</div><div class="product-price">${priceFormat(p.price)} <small>USD</small></div><section class="customer-review-snippet" aria-label="Customer reviews"><div class="review-section-title">Customer Reviews &amp; Comments</div><button type="button" class="reviews-trigger" data-action="reviews" data-id="${safe(p.id)}">${displayStars(ratingCache[p.id])}<span class="review-open-label">Read reviews / Leave your review →</span></button>${reviewPreviews[p.id]?`<p class="review-snippet-text">“${safe(String(reviewPreviews[p.id]).slice(0,110))}”</p>`:''}</section><div class="product-actions">${edit}${action}</div></div></article>`;}).join('');
 if(!noFetch && configured)pullRatings(items.slice(0,40).map(p=>p.id));}
function renderManager(){const box=byId('manager-list');if(!box||!owner)return;box.replaceChildren();for(const p of inventory){const div=document.createElement('div');div.className='manager-list-item';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=p.title;const caption=document.createElement('small');caption.textContent=`${p.store} · ${p.status} · ${priceFormat(p.price)}`;info.append(title,caption);div.append(info);const edit=document.createElement('button');edit.textContent='Edit';edit.addEventListener('click',()=>openEditor(p.id));const del=document.createElement('button');del.textContent='Delete';del.className='danger';del.addEventListener('click',()=>removeItem(p.id));div.append(edit,del);box.append(div);}}
let imageFile=null,imageUrl='';
function fillCats(value){const box=byId('product-category'),sel=byId('product-store');if(!box||!sel)return;box.replaceChildren();for(const name of categories[sel.value]||[]){const op=new Option(name,name);box.append(op);}if(value&&[...box.options].some(x=>x.value===value))box.value=value;}
function openEditor(id=''){if(!owner){notify('Owner-only feature. Sign in as the approved owner.');return;}const form=byId('product-form');if(!form)return;form.reset();imageFile=null;imageUrl='';byId('product-id').value='';byId('product-store').value=catalog;fillCats();let p=inventory.find(x=>x.id===id);if(p){byId('product-id').value=p.id;for(const [k,v] of Object.entries(p)){const el=form.elements.namedItem(k);if(el&&'value'in el)el.value=String(v);}byId('product-store').value=p.store;fillCats(p.category);imageUrl=p.image;}byId('photo-preview').textContent=p?.image?'Current image saved; select new photo to replace.':'Choose a photo (optional)';byId('manager-heading').textContent=p?'Edit product':'Add real product';byId('manager-modal')?.classList.remove('hidden');byId('overlay')?.classList.remove('hidden');document.body.style.overflow='hidden';renderManager();}
function closeOverlay(){for(const id of ['overlay','manager-modal','cart-drawer'])byId(id)?.classList.add('hidden');document.body.style.overflow='';}
async function resizeImage(file){if(file.size>12*1024*1024)throw Error('Please choose a photo under 12 MB.');const img=await createImageBitmap(file);const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not process photo.')),'image/jpeg',.8));}
async function saveItem(ev){ev.preventDefault();if(!owner||!db){notify('Owner authentication and database must be connected first.');return;}
 const form=byId('product-form'),data=Object.fromEntries(new FormData(form).entries());const id=data.id?String(data.id):`item-${crypto.randomUUID()}`;
 const p=clean({...data,id});p.store=catalog;p.stock=Math.floor(p.stock);
 if(!p.title||p.title.trim().length<2||!Number.isFinite(p.price)||p.price<0)return notify('Enter a real product name and valid price.');
 if(!categories[catalog]?.includes(p.category))return notify('Select a valid category.');
 if(catalog==='affiliate-marketing'&&p.merchantUrl&&!isHttp(p.merchantUrl))return notify('Only https merchant links are allowed.');
 if(p.status==='ready'&&(!p.description||!p.stock||(!p.image&&!imageFile)||p.price===0)&&catalog!=='affiliate-marketing')return notify('To publish: add description, photo, price above $0, and stock.');
 if(catalog==='affiliate-marketing'&&p.status==='ready'&&!isHttp(p.merchantUrl))return notify('Affiliate listings need an approved https merchant link.');
 const button=form.querySelector('button[type=submit]');button.disabled=true;const old=button.textContent;button.textContent='Saving…';
 try{if(imageFile){if(!storage)throw Error('Photo storage is not connected.');const blob=await resizeImage(imageFile);const itemRef=ref(storage,`products/${id}/${crypto.randomUUID()}.jpg`);const result=await uploadBytes(itemRef,blob,{contentType:'image/jpeg'});p.image=await getDownloadURL(result.ref);}else p.image=imageUrl;
 await setDoc(doc(db,'products',id),{...p,updatedAt:serverTimestamp(),updatedBy:account.uid});notify('Product saved. Published items can be seen by customers.');closeOverlay();}
 catch(e){notify('Save failed: '+(e.code||e.message||'Please check setup and permissions.'));}finally{button.disabled=false;button.textContent=old;}}
async function removeItem(id){if(!owner||!db)return;const x=inventory.find(p=>p.id===id);if(!window.confirm(`Delete ${x?.title||'this item'}? This cannot be undone.`))return;try{await deleteDoc(doc(db,'products',id));notify('Listing deleted.');}catch(e){notify('Delete failed: '+e.message);}}
function basketFromUI(){const arr=Object.entries(basket).filter(([id,q])=>q>0).map(([id,qty])=>({item:inventory.find(p=>p.id===id),qty})).filter(x=>x.item);return arr;}
function renderBasket(){const count=byId('cart-count');if(count)count.textContent=Object.values(basket).reduce((sum,v)=>sum+Number(v||0),0);const el=byId('cart-items');if(!el)return;const arr=basketFromUI();const total=arr.reduce((s,x)=>s+x.item.price*x.qty,0);if(byId('cart-subtotal'))byId('cart-subtotal').textContent=priceFormat(total);el.replaceChildren();if(!arr.length){el.innerHTML='<div class="empty-state"><h3>Your quote basket is empty</h3><p>Add a real available item to ask for a confirmed quote.</p></div>';return;}
 for(const x of arr){const d=document.createElement('div');d.className='cart-item';const t=document.createElement('div');t.className='cart-item-content';t.textContent=`${x.item.title} · ${x.qty} × ${priceFormat(x.item.price)} = ${priceFormat(x.qty*x.item.price)}`;const b=document.createElement('button');b.textContent='Remove';b.addEventListener('click',()=>{delete basket[x.item.id];renderBasket();});d.append(t,b);el.append(d);}}
function sendQuote(){const arr=basketFromUI();if(!arr.length)return notify('Choose an item first.');const text=['Hello LALA AYEN GLOBAL PLAZA,','I would like an order quote for:','',...arr.map(({item,qty})=>`${qty} × ${item.title} (${priceFormat(item.price)} each)`),'','Please confirm availability, shipping, taxes, final total, and payment instructions before I pay.'];const subj='LALA AYEN product order inquiry';window.location.href=`mailto:${mail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text.join('\n'))}`;const m=byId('checkout-message');if(m)m.textContent='An email draft should open. No payment or order was submitted automatically.';}
async function showReviews(id){
 ratingFor=id;const dlg=byId('reviews-dialog');if(!dlg)return;
 const item=inventory.find(p=>p.id===id);
 byId('review-item-name').textContent=item?.title||'Product';
 byId('review-feedback').textContent='';byId('review-list').textContent='Loading customer comments…';
 byId('review-form')?.reset();
 openModal(dlg);
 if(!configured||!db){byId('review-list').textContent='Customer reviews will open after a secure account service is configured. No ratings have been invented.';return;}
 try{
  const snap=await getDocs(collection(db,'products',id,'reviews'));
  const rows=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  reviewRows=rows;
  const box=byId('review-list');box.replaceChildren();
  if(!rows.length)box.textContent='No customer comments yet. Be the first to review this item.';
  for(const r of rows){
   const row=document.createElement('article');row.className='review-entry';
   const header=document.createElement('div');header.className='review-entry-heading';
   const stars=document.createElement('strong');stars.className='review-stars';const n=Math.max(1,Math.min(5,Number(r.stars)||1));stars.textContent='★'.repeat(n)+'☆'.repeat(5-n);stars.setAttribute('aria-label',`${n} out of 5 stars`);
   const author=document.createElement('small');author.textContent='Customer review';
   header.append(stars,author);row.append(header);
   if(r.text){const p=document.createElement('p');p.textContent=String(r.text).slice(0,500);row.append(p);}
   const path=String(r.mediaPath||'');
   const expectedPrefix=`review-media/${id}/${r.id}/`;
   if(storage && path.startsWith(expectedPrefix) && /^review-media\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/review\.(jpg|png|webp|mp4|webm|mov)$/.test(path)){
    const holder=document.createElement('div');holder.className='customer-media';holder.textContent='Loading customer photo / video…';row.append(holder);
    getDownloadURL(ref(storage,path)).then(url=>{
     if(!holder.isConnected)return;
     holder.replaceChildren();
     const video=r.mediaKind==='video';
     const media=document.createElement(video?'video':'img');
     media.src=url;
     if(video){media.controls=true;media.preload='metadata';media.setAttribute('playsinline','');media.setAttribute('aria-label','Customer review video');}
     else{media.loading='lazy';media.alt='Photo shared by a customer with this review';}
     holder.append(media);
    }).catch(()=>{holder.textContent='Customer attachment is unavailable.';});
   }
   if(owner){const del=document.createElement('button');del.type='button';del.className='review-remove';del.textContent='Remove review';del.addEventListener('click',async()=>{
     if(!window.confirm('Remove this review? Only remove spam, abuse, or content that violates the review policy.'))return;
     try{await deleteDoc(doc(db,'products',id,'reviews',r.id));await showReviews(id);await pullRatings([id]);}catch(e){byId('review-feedback').textContent='Unable to remove review: '+(e.code||e.message);}
   });row.append(del);}
   box.append(row);
  }
  if(account){const mine=rows.find(x=>x.id===account.uid);if(mine){byId('review-stars').value=String(mine.stars);byId('review-text').value=String(mine.text||'');}}
  byId('review-feedback').textContent=account?'Ratings are tied to your signed-in account. You can update your own review.':'Sign in or create an account to leave a rating and comment.';
 }catch(e){byId('review-list').textContent='Reviews unavailable. Please check account permissions.';}
}
async function submitReview(e){
 e.preventDefault();
 const feedback=byId('review-feedback'),button=byId('review-form')?.querySelector('button[type=submit]');
 if(!db||!storage||!account){feedback.textContent='Please sign in to leave a review. secure account service must be connected.';return;}
 const id=ratingFor,item=inventory.find(x=>x.id===id);
 if(!item||item.status!=='ready'){feedback.textContent='This product is not available for reviews.';return;}
 const stars=Number(byId('review-stars').value),comment=String(byId('review-text').value).trim().slice(0,500);
 if(!Number.isInteger(stars)||stars<1||stars>5){feedback.textContent='Choose 1 to 5 stars.';return;}
 const file=byId('review-media')?.files?.[0]||null;
 if(file){
  const limit=file.type.startsWith('video/')?25*1024*1024:8*1024*1024;
  if(!reviewMediaTypes[file.type]||file.size>limit||!file.size){feedback.textContent='Choose one JPG, PNG, WEBP (max 8 MB) or MP4, WEBM, MOV video (max 25 MB).';return;}
 }
 if(button)button.disabled=true;
 try{
  const existing=doc(db,'products',id,'reviews',account.uid);
  const prior=await getDoc(existing);
  let mediaPath=prior.exists()?String(prior.data().mediaPath||''):'';
  let mediaKind=prior.exists()?String(prior.data().mediaKind||''):'';
  if(file){
   feedback.textContent='Uploading customer '+(file.type.startsWith('video/')?'video':'photo')+'…';
   const path=`review-media/${id}/${account.uid}/review.${reviewMediaTypes[file.type]}`;
   await uploadBytes(ref(storage,path),file,{contentType:file.type});
   mediaPath=path;mediaKind=file.type.startsWith('video/')?'video':'image';
  }
  const data={stars,text:comment,authorId:account.uid,mediaPath,mediaKind,createdAt:serverTimestamp()};
  await setDoc(existing,data);
  await showReviews(id);await pullRatings([id]);
  feedback.textContent='Your customer rating and comment were saved. Thank you!';
 }catch(err){feedback.textContent='Could not save review or attachment: '+(err.code||err.message||'Check your connection.');}
 finally{if(button)button.disabled=!account||!configured;}
}
function setupCatalog(){if(!catalog)return;renderCategories();
 byId('product-search')?.addEventListener('input',e=>{term=e.target.value;renderCatalog();});byId('sort')?.addEventListener('change',e=>{order=e.target.value;renderCatalog();});
 byId('product-grid')?.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;const p=inventory.find(x=>x.id===id);if(!p)return;if(b.dataset.action==='edit')openEditor(id);if(b.dataset.action==='reviews')showReviews(id);if(b.dataset.action==='add'){if(p.stock<1||p.status!=='ready')return;basket[id]=Math.min(p.stock,(basket[id]||0)+1);renderBasket();notify(p.title+' added to quote basket.');}});
 const openManager=()=>openEditor();for(const id of ['open-manager','open-manager-top','manage-inline'])byId(id)?.addEventListener('click',openManager);
 for(const id of ['close-manager','close-cart','overlay'])byId(id)?.addEventListener('click',closeOverlay);
 byId('product-store')?.addEventListener('change',()=>fillCats());
 byId('product-photo')?.addEventListener('change',e=>{imageFile=e.target.files?.[0]||null;byId('photo-preview').textContent=imageFile?`Selected photo: ${imageFile.name}`:'No photo selected';});
 byId('product-form')?.addEventListener('submit',saveItem);
 byId('clear-form')?.addEventListener('click',()=>openEditor());
 byId('open-cart')?.addEventListener('click',()=>{renderBasket();byId('overlay')?.classList.remove('hidden');byId('cart-drawer')?.classList.remove('hidden');});
 byId('checkout-btn')?.addEventListener('click',sendQuote);
 byId('export-json')?.addEventListener('click',()=>{if(!owner)return;const blob=new Blob([JSON.stringify(inventory,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='lala-plaza-products-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 byId('reviews-form')?.addEventListener('submit',submitReview);byId('review-form')?.addEventListener('submit',submitReview);$$('[data-reviews-close]').forEach(x=>x.addEventListener('click',()=>closeModal(byId('reviews-dialog'))));
 const chat=byId('shop-chat-dialog'),title=byId('shop-chat-title'),log=byId('shop-chat-log'),qs=byId('shop-chat-questions');
 byId('store-chat-launch')?.addEventListener('click',()=>{if(!chat)return;title.textContent=(byId('manager-heading')?.textContent.includes('book')?'Book':'Shop')+' Guide';log.textContent='Welcome! Here are answers about this store.';qs.replaceChildren();for(const [q,a] of [['How can I buy an item?','Open a listing and choose Add to Quote Basket. Request a quote. Prices, delivery and taxes are confirmed before you pay.'],['How can I pay?','After confirming a real order, use the Square payment link provided by the Plaza. International payment options are confirmed before orders.'],['Can I ask about sizes or availability?','Yes. Email lalaayenglobalplaza@gmail.com with the product name and your question.'],['How do star reviews work?','Customers with signed-in accounts can post a 1–5-star rating; ratings are never fabricated.']]){const b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',()=>{log.textContent=q+'\n\n'+a;});qs.append(b);}openModal(chat);});
 $$('[data-chat-close]').forEach(b=>b.addEventListener('click',()=>closeModal(chat)));
 byId('menu-toggle')?.addEventListener('click',()=>$('.sidebar')?.classList.toggle('mobile-open'));
 renderCatalog();renderBasket();}
setupAuth();setupCatalog();updateAuthUI();
if(configured){try{app=initializeApp(firebaseDetails);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
 onAuthStateChanged(auth,async user=>{account=user;owner=!!(user&&user.uid===ownerUid);updateAuthUI();if(catalog)subscribeProducts();});
 if(catalog)loadPrepared();}catch(e){authText('account setup error: '+e.message);if(catalog)loadPrepared();}}
else{if(catalog)loadPrepared();}
