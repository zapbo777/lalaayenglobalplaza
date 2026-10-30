const $ = (selector,root=document)=>root.querySelector(selector);
const $$ = (selector,root=document)=>Array.from(root.querySelectorAll(selector));
const catalog = document.body.dataset.store || '';
const storeGroup = String(document.body.dataset.storeGroup || '');
const SHELF_GROUPS=['LALA AYEN GYM & SPORTS','LALA AYEN TEMPLE','LALA AYEN WONDERLAND']; // these show only on their own shelf pages, not in Global Shop // department shelf pages (e.g. LALA AYEN TEMPLE) filter Global Shop items by category prefix
const byId = id => document.getElementById(id);
const mail='lalaayenglobalplaza@gmail.com';
// Customer accounts are handled by plaza-auth.js (one shared login for every page). Reviews and the online owner editor are not connected yet.
const configured=false;
let account=null,owner=false;
let inventory=[], basket={},active='All',term='',order='featured',ratingFor='',reviewRows=[];
const categories={
 'author-bookstore':['Children’s Books','Poetry','Inspirational','Novels','Spiritual & Faith','Other Original Writings'],
 'preloved-books':['Children’s Books','Fiction & Novels','Education','Biography','Spiritual & Faith','Cookbooks','Comics','Other Used Books'],
 'thrift-store':['Women’s Tops','Women’s Dresses','Women’s Shorts','Women’s Bottoms','Women’s Outerwear','Men’s Clothing','Kids & Babies','Shoes','Bags & Accessories','Toys & Games','Home & Kitchen','Other Finds'],
 'affiliate-marketing':['Affiliate Links','Discount Codes','Resources','Other Programs'],
 'lala-merchants':['T-Shirts','Hoodies','Mugs & Drinkware','Tote Bags','Stickers & Prints','Other Merch'],
 'global-shop':['Home & Living','Gadgets & Tech','Beauty & Wellness','Fashion Accessories','Kids & Baby','Trending Finds'],
 'diy-craft':['DIY Craft Kits','Painting & Drawing','Sewing & Embroidery','Crochet & Knitting','Beads & Jewelry','Paper & Scrapbooking','Resin & Candle Making','Woodcraft & Home Decor','Kids Creative Crafts','Seasonal & Party Crafts','Craft Tools & Supplies','Storage & Organization'],'party-shop':['Balloons & Backdrops','Birthday Parties','Tableware & Table Decor','Weddings & Anniversaries','Baby Showers','Party Favors & Gift Wrap','DIY Party Supplies','Seasonal Celebrations']
};
const symbols={'author-bookstore':'📚','preloved-books':'📖','thrift-store':'🛍️','affiliate-marketing':'🔗','lala-merchants':'👕','global-shop':'🌐','diy-craft':'✂️','party-shop':'🎉'};
const priceFormat = n => Number(n).toLocaleString('en-US',{style:'currency',currency:'USD'});
const safe = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isHttp = u=>{try{const a=new URL(String(u));return a.protocol==='https:';}catch{return false;}};
const clean = x=>({colors:String(x.colors||'').slice(0,300),id:String(x.id||'').slice(0,150),store:String(x.store||''),title:String(x.title||'').slice(0,120),category:String(x.category||'Other'),condition:String(x.condition||'New'),description:String(x.description||'').slice(0,2000),sizes:String(x.sizes||'').slice(0,180),price:Math.max(0,Number(x.price)||0),stock:Math.max(0,parseInt(x.stock,10)||0),status:String(x.status)==='ready'?'ready':'draft',image:String(x.image||''),merchantUrl:String(x.merchantUrl||''),isSample:false});
const notify=(s)=>{const el=byId('toast');if(el){el.textContent=s;el.classList.remove('hidden');clearTimeout(el.timer);el.timer=setTimeout(()=>el.classList.add('hidden'),4500);}else{const el=byId('account-status');if(el)el.textContent=s;}};
function openModal(d){if(d && !d.open)d.showModal();}
function closeModal(d){if(d?.open)d.close();}
function authText(msg){const el=byId('account-status');if(el)el.textContent=msg;}
function updateAuthUI(){
 $$('.owner-only').forEach(e=>e.hidden=!owner);
 if(byId('review-form')){const form=byId('review-form');form.querySelector('button[type=submit]').disabled=true;}
}
document.addEventListener('lala-auth',e=>{account=e.detail?.user||null;updateAuthUI();});
async function loadPrepared(){try{const res=await fetch('products.json',{cache:'no-store'});if(res.ok){const data=await res.json();if(Array.isArray(data))inventory=data.map(clean).filter(x=>x.status==='ready'&&x.title&&x.price>=0);}}catch(e){inventory=[];}renderCategories();renderCatalog();}
function subscribeProducts(){return loadPrepared();}
function renderCategories(){const box=byId('category-row');if(!box)return;box.replaceChildren();const shelfCats=(storeGroup||!categories[catalog])?[...new Set(inventory.filter(p=>p.store===catalog&&(!storeGroup||p.category.startsWith(storeGroup))&&(p.status==='ready'||owner)).map(p=>p.category))]:null;
 for(const x of ['All',...(shelfCats||categories[catalog]||[])]){const button=document.createElement('button');button.type='button';button.className='category-chip'+(active===x?' active':'');button.textContent=storeGroup?x.replace(storeGroup+' · ',''):x;button.addEventListener('click',()=>{active=x;renderCategories();renderCatalog();});box.append(button);}}
function matching(){const x=inventory.filter(p=>(p.store===catalog||!p.store)&&(!storeGroup||p.category.startsWith(storeGroup))&&(storeGroup||catalog!=='global-shop'||!SHELF_GROUPS.some(g=>p.category.startsWith(g)))&&((p.status==='ready')||owner)&& (active==='All'||p.category===active) &&([p.title,p.category,p.description,p.sizes].join(' ').toLowerCase().includes(term.toLowerCase())));
 if(order==='low')x.sort((a,b)=>a.price-b.price);if(order==='high')x.sort((a,b)=>b.price-a.price);if(order==='title')x.sort((a,b)=>a.title.localeCompare(b.title));return x;}
const displayStars=(r)=>r?.count>0?`<span class="rating-icon">${'★'.repeat(Math.round(r.avg))}${'☆'.repeat(5-Math.round(r.avg))}</span> ${r.avg.toFixed(1)} (${r.count})`:'☆☆☆☆☆ No reviews yet';
let ratingCache={};
let reviewPreviews={};
const reviewMediaTypes={ 'image/jpeg':'jpg','image/png':'png','image/webp':'webp', 'video/mp4':'mp4','video/webm':'webm','video/quicktime':'mov' };

async function pullRatings(ids){}
function renderCatalog(noFetch=false){const grid=byId('product-grid');if(!grid)return;const items=matching();const count=byId('results-count');if(count)count.textContent=`${items.length} ${items.length===1?'item':'items'} in this department`;
 if(items.length===0){grid.innerHTML='<div class="empty-state"><h3>'+safe(document.body.dataset.emptyTitle||'No items listed yet')+'</h3><p>Our shop is preparing real products. Check back soon, or ask about availability.</p><a href="index.html#contact">Contact the Plaza →</a></div>';return;}
 grid.innerHTML=items.map(p=>{const buyable=p.status==='ready'&&p.stock>0;const affiliate=catalog==='affiliate-marketing';const img=isHttp(p.image)||p.image.startsWith('data:image/')?`<img loading="lazy" src="${safe(p.image)}" alt="${safe(p.title)}">`:`<span class="image-placeholder"><span class="emoji">${symbols[catalog]||'🛍️'}</span><small>Photo coming soon</small></span>`;
 const edit=owner?`<button data-action="edit" data-id="${safe(p.id)}">Edit</button>`:'';
 const action=affiliate&&isHttp(p.merchantUrl)?`<a href="${safe(p.merchantUrl)}" rel="noopener noreferrer sponsored" target="_blank">Visit merchant ↗</a>`:affiliate?'<button disabled>Not available</button>':`<button type="button" class="add" data-action="add" data-id="${safe(p.id)}" ${buyable?'':'disabled'}>${buyable?'＋ Add to Cart':'Unavailable'}</button>`;
 return `<article class="product-card"><div class="product-image" data-action="details" data-id="${safe(p.id)}" role="button" tabindex="0" aria-label="View details: ${safe(p.title)}" style="cursor:pointer">${img}${p.status!=='ready'?'<span class="product-badge draft">OWNER DRAFT</span>':''}</div><div class="product-info"><span class="product-category">${safe(p.category)}</span><h3>${safe(p.title)}</h3><div class="product-description">${safe(p.description)}</div><div class="product-meta">${safe(p.condition)} · ${safe(p.sizes||'Details available on request')} · Stock: ${p.stock}</div><div class="product-price notranslate" data-usd="${p.price}">${priceFormat(p.price)} <small>USD</small></div><section class="customer-review-snippet" aria-label="Customer reviews"><div class="review-section-title">Customer Reviews &amp; Comments</div><button type="button" class="reviews-trigger" data-action="reviews" data-id="${safe(p.id)}">${displayStars(ratingCache[p.id])}<span class="review-open-label">Read reviews / Leave your review →</span></button>${reviewPreviews[p.id]?`<p class="review-snippet-text">“${safe(String(reviewPreviews[p.id]).slice(0,110))}”</p>`:''}</section><div class="product-actions">${edit}${action}</div></div></article>`;}).join('');
 if(!noFetch && configured)pullRatings(items.slice(0,40).map(p=>p.id));}
function renderManager(){const box=byId('manager-list');if(!box||!owner)return;box.replaceChildren();for(const p of inventory){const div=document.createElement('div');div.className='manager-list-item';const info=document.createElement('div');const title=document.createElement('strong');title.textContent=p.title;const caption=document.createElement('small');caption.textContent=`${p.store} · ${p.status} · ${priceFormat(p.price)}`;info.append(title,caption);div.append(info);const edit=document.createElement('button');edit.textContent='Edit';edit.addEventListener('click',()=>openEditor(p.id));const del=document.createElement('button');del.textContent='Delete';del.className='danger';del.addEventListener('click',()=>removeItem(p.id));div.append(edit,del);box.append(div);}}
let imageFile=null,imageUrl='';
function fillCats(value){const box=byId('product-category'),sel=byId('product-store');if(!box||!sel)return;box.replaceChildren();for(const name of categories[sel.value]||[]){const op=new Option(name,name);box.append(op);}if(value&&[...box.options].some(x=>x.value===value))box.value=value;}
function openEditor(id=''){if(!owner){notify('Owner-only feature. Sign in as the approved owner.');return;}const form=byId('product-form');if(!form)return;form.reset();imageFile=null;imageUrl='';byId('product-id').value='';byId('product-store').value=catalog;fillCats();let p=inventory.find(x=>x.id===id);if(p){byId('product-id').value=p.id;for(const [k,v] of Object.entries(p)){const el=form.elements.namedItem(k);if(el&&'value'in el)el.value=String(v);}byId('product-store').value=p.store;fillCats(p.category);imageUrl=p.image;}byId('photo-preview').textContent=p?.image?'Current image saved; select new photo to replace.':'Choose a photo (optional)';byId('manager-heading').textContent=p?'Edit product':'Add real product';byId('manager-modal')?.classList.remove('hidden');byId('overlay')?.classList.remove('hidden');document.body.style.overflow='hidden';renderManager();}
function closeOverlay(){for(const id of ['overlay','manager-modal','cart-drawer'])byId(id)?.classList.add('hidden');document.body.style.overflow='';}
async function resizeImage(file){if(file.size>12*1024*1024)throw Error('Please choose a photo under 12 MB.');const img=await createImageBitmap(file);const scale=Math.min(1,1200/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not process photo.')),'image/jpeg',.8));}
async function saveItem(ev){ev.preventDefault();notify('The online product editor is not connected yet. Product changes are made in products.json.');}
async function removeItem(id){notify('The online product editor is not connected yet.');}
function basketFromUI(){const arr=Object.entries(basket).filter(([id,q])=>q>0).map(([id,qty])=>({item:inventory.find(p=>p.id===id),qty})).filter(x=>x.item);return arr;}
function renderBasket(){const count=byId('cart-count');if(count)count.textContent=Object.values(basket).reduce((sum,v)=>sum+Number(v||0),0);const el=byId('cart-items');if(!el)return;const arr=basketFromUI();const total=arr.reduce((s,x)=>s+x.item.price*x.qty,0);if(byId('cart-subtotal'))byId('cart-subtotal').textContent=priceFormat(total);el.replaceChildren();if(!arr.length){el.innerHTML='<div class="empty-state"><h3>Your quote basket is empty</h3><p>Add a real available item to ask for a confirmed quote.</p></div>';return;}
 for(const x of arr){const d=document.createElement('div');d.className='cart-item';const t=document.createElement('div');t.className='cart-item-content';t.textContent=`${x.item.title} · ${x.qty} × ${priceFormat(x.item.price)} = ${priceFormat(x.qty*x.item.price)}`;const b=document.createElement('button');b.textContent='Remove';b.addEventListener('click',()=>{delete basket[x.item.id];renderBasket();});d.append(t,b);el.append(d);}}
function sendQuote(){const arr=basketFromUI();if(!arr.length)return notify('Choose an item first.');const text=['Hello LALA AYEN GLOBAL PLAZA,','I would like an order quote for:','',...arr.map(({item,qty})=>`${qty} × ${item.title} (${priceFormat(item.price)} each)`),'','Please confirm availability, shipping, taxes, final total, and payment instructions before I pay.'];const subj='LALA AYEN product order inquiry';window.location.href=`mailto:${mail}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(text.join('\n'))}`;const m=byId('checkout-message');if(m)m.textContent='An email draft should open. No payment or order was submitted automatically.';}
async function showReviews(id){
 ratingFor=id;const dlg=byId('reviews-dialog');if(!dlg)return;
 const item=inventory.find(p=>p.id===id);
 byId('review-item-name').textContent=item?.title||'Product';
 byId('review-form')?.reset();
 byId('review-list').textContent='Customer reviews are coming soon. No ratings have been invented.';
 byId('review-feedback').textContent=account?'You are signed in. Reviews will open here soon.':'Sign in or create an account now, and you can leave reviews once they open.';
 openModal(dlg);
}
async function submitReview(e){e.preventDefault();const f=byId('review-feedback');if(f)f.textContent='Customer reviews are coming soon.';}
function setupCatalog(){if(!catalog)return;renderCategories();
 byId('product-search')?.addEventListener('input',e=>{term=e.target.value;renderCatalog();});byId('sort')?.addEventListener('change',e=>{order=e.target.value;renderCatalog();});
 byId('product-grid')?.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const id=b.dataset.id;const p=inventory.find(x=>x.id===id);if(!p)return;if(b.dataset.action==='edit')openEditor(id);if(b.dataset.action==='reviews')showReviews(id);if(b.dataset.action==='details'&&window.LalaCart&&catalog!=='affiliate-marketing'){window.LalaCart.showDetails(p);return;}if(b.dataset.action==='add'){if(p.stock<1||p.status!=='ready')return;if(window.LalaCart){window.LalaCart.addProduct(p);return;}basket[id]=Math.min(p.stock,(basket[id]||0)+1);renderBasket();notify(p.title+' added to quote basket.');}});
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
 // Shop chat moved to the shared plaza-chat.js widget (all pages, helper personas, AI with preset fallback). It uses the #store-chat-launch button.
 byId('menu-toggle')?.addEventListener('click',()=>$('.sidebar')?.classList.toggle('mobile-open'));
 renderCatalog();renderBasket();}
setupCatalog();updateAuthUI();
if(catalog)loadPrepared();
