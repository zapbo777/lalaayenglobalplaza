/* Lala Plaza shared chat widget (all pages). Included once per page: <script defer src="plaza-chat.js?v=..."></script>
   - One AI backend: POST /api/chat on the lala-plaza-auth Worker (Workers AI, free plan, gated by AI_CHAT=off|on).
   - While the AI is off, busy or out of free quota, the helper gives preset answers (never invented).
   - Each page shows a helper persona name. Every persona is the store's AI assistant, never presented as a human.
   - Core HQ bots (Echo, Ara): config slots below stay null until Peter provides their links. */
(function () {
  'use strict';
  if (window.LalaChat) return; // exactly one widget per page
  var EMAIL = 'lalaayenglobalplaza@gmail.com';
  var VERSION = '20261030c';

  // ===== Helper personas (display name + greeting; the Worker adds a matching one-line persona to the AI prompt) =====
  // coreHqEndpoint: leave null. When Peter gives a real Core HQ bot link, route it through the Worker (a same-origin
  // /api/... path) and put that path here. Never put API keys or tokens in this file.
  var PERSONAS = {
    ethan:  { name: 'Ethan',  greeting: "Hi, I'm Ethan", coreHqEndpoint: null },
    toby:   { name: 'Toby',   greeting: "Hi, I'm Toby", coreHqEndpoint: null },
    gemini: { name: 'Gemini', greeting: "Hi, I'm Gemini", coreHqEndpoint: null },
    // Echo is also a real Core HQ bot. Until its link is connected, this page helper uses the shared Plaza AI.
    echo:   { name: 'Echo',   greeting: "Hi, I'm Echo", coreHqEndpoint: null /* TODO: Echo's Core HQ endpoint from Peter */ },
    mira:   { name: 'Mira',   greeting: "Hi, I'm Mira", coreHqEndpoint: null },
    peter:  { name: 'Peter',  greeting: "Hi, I'm Peter", coreHqEndpoint: null }
  };
  // Other Core HQ bots that are not page helpers yet.
  var CORE_HQ = { ara: { name: 'Ara', endpoint: null /* TODO: Ara's Core HQ endpoint from Peter */ } };

  // Page -> helper. Rotates Ethan, Toby, Gemini, Echo, Mira, Peter across the Plaza in sidebar order.
  var ROTATION = ['ethan', 'toby', 'gemini', 'echo', 'mira', 'peter'];
  var PAGE_PERSONA = {
    'home': 'ethan', 'global-shop': 'toby', 'lingerie': 'gemini', 'gym-sports': 'echo', 'temple': 'mira', 'wonderland': 'peter',
    'pet-paradise': 'ethan', 'author-bookstore': 'toby', 'preloved-books': 'gemini', 'thrift-store': 'echo', 'affiliate-marketing': 'mira',
    'lala-merchants': 'peter', 'diy-craft': 'ethan', 'party-shop': 'toby', 'creative-studio': 'echo', 'portrait-studio': 'ethan',
    'shipping': 'mira', 'returns': 'peter', 'terms': 'ethan', 'privacy': 'toby'
  };
  // Optional extra greeting line per page (Echo created the Creative Studio, so Echo hosts it).
  var PAGE_INTRO = { 'creative-studio': ' I help with the Creative Studio.' };
  var ROTATE_BY_DAY = false; // true = shift every page's helper by one name each day

  var PAGES = {
    'index.html': ['home', 'Plaza Home'], '': ['home', 'Plaza Home'],
    'LALA_AYEN_GLOBAL_SHOP_MARK1.html': ['global-shop', 'Global Shop'], 'LALA_LINGERIE_MARK1.html': ['lingerie', 'Lingerie Boutique'],
    'LALA_GYM_SPORTS_MARK1.html': ['gym-sports', 'Gym & Sports'], 'LALA_TEMPLE_MARK1.html': ['temple', 'Temple'],
    'LALA_WONDERLAND_MARK1.html': ['wonderland', 'Wonderland'], 'LALA_PET_PARADISE_MARK1.html': ['pet-paradise', 'Pet Paradise'],
    'LALA_AYEN_AUTHOR_BOOKSTORE_MARK1.html': ['author-bookstore', 'Author Bookstore'], 'PRELOVED_BOOKSTORE_MARK1.html': ['preloved-books', 'Preloved Bookstore'],
    'LALA_IRON_THRIFT_STORE_MARK1.html': ['thrift-store', 'Iron Thrift Store'], 'LALA_AYEN_AFFILIATE_MARKETING_MARK1.html': ['affiliate-marketing', 'Affiliate Marketing'],
    'LALA_AYEN_MERCHANTS_MARK1.html': ['lala-merchants', 'Merchants'], 'LALA_AYEN_DIY_CRAFT_MARK1.html': ['diy-craft', 'DIY & Craft'],
    'LALA_PARTY_SHOP_MARK1.html': ['party-shop', 'Party Shop'], 'creative-studio.html': ['creative-studio', 'Creative Studio'],
    'custom-portrait-studio.html': ['portrait-studio', 'Portrait Studio'], 'shipping.html': ['shipping', 'Shipping'],
    'returns.html': ['returns', 'Returns'], 'terms.html': ['terms', 'Terms'], 'privacy.html': ['privacy', 'Privacy']
  };
  // Works with or without the .html extension (Cloudflare can serve /page for /page.html).
  var file = decodeURIComponent(location.pathname.split('/').pop() || '').replace(/\.html?$/i, '');
  var page = PAGES[file ? file + '.html' : ''] || ['home', 'Lala Plaza'];
  var pageId = page[0];
  var personaId = PAGE_PERSONA[pageId] || 'ethan';
  if (ROTATE_BY_DAY) { var day = Math.floor(Date.now() / 864e5); personaId = ROTATION[(ROTATION.indexOf(personaId) + day) % ROTATION.length]; }
  var persona = PERSONAS[personaId];

  // ===== Preset answers (used when the AI is off, and as fallback) =====
  var SHOP = [['How can I buy an item?','Tap "＋ Add to Cart" on any product (choose size or color if asked). Open the 🛒 Cart at the top of the page and choose Pay with Square (US). One cart works across the whole Plaza.'],['How can I pay?',"US orders are paid on Square's secure checkout page in US dollars. Your card details are entered with Square and never reach our website. International checkout is coming soon."],['Do you ship outside the US?','For now we ship to US addresses only. International shipping is coming soon.'],['How long does shipping take?','US shipping is free. Most orders arrive in about 7 to 14 business days, including 1 to 3 business days of processing. Items from US warehouses usually arrive in about 3 to 8 business days. Each product page shows its own estimate.'],['Where is my order?','Email lalaayenglobalplaza@gmail.com with your order number (it is on your Square receipt) and we will check the status for you.'],['Can I return an item?','Yes. Returns are free for any item, including lingerie, for any reason, within 14 days of delivery. Email lalaayenglobalplaza@gmail.com with your order number, the item and the reason. We email you a free prepaid return label; ship the item to the address on that label (it may be a supplier or partner warehouse). Refunds go back to your original payment method.'],['It does not fit. Can I exchange it?','Yes. Request a free return (within 14 days of delivery) and place a new order for the size you need, or email lalaayenglobalplaza@gmail.com and we will help you choose.'],['My item arrived damaged or wrong.','Sorry about that! Email lalaayenglobalplaza@gmail.com with your order number and photos of the item and the package. We will send a replacement or a refund, whichever you prefer.'],['Can I cancel my order?','Yes, before it ships. Email lalaayenglobalplaza@gmail.com as soon as possible with your order number. After it ships, you can use our free 14-day returns.'],['Is the lingerie shop for adults only?','Yes. The Lingerie Boutique is for adults 18 and older only.'],['Can I ask about sizes or availability?','Yes. Email lalaayenglobalplaza@gmail.com with the product name and your question.'],['How do star reviews work?','Customer reviews are coming soon. Ratings are never fabricated.']];
  // Keyword hints (EN/TL/ES) so a typed question can fall back to a preset answer.
  var KEYS = [[/(where is my order|track|status|nasaan|order ko|mi pedido|rastre|estado)/i,4],[/(cancel|kansel|i-cancel|cancelar)/i,8],[/(damage|broken|wrong|sira|mali|da[ñn]ad|equivocad|roto)/i,7],[/(return|refund|ibalik|isauli|balik|devol|reembolso)/i,5],[/(fit|size|exchange|kasya|sukat|palit|talla|cambio|cambiar)/i,6],[/(outside|international|philippines|pilipinas|canada|abroad|ibang bansa|internacional|fuera)/i,2],[/(how long|shipping|deliver|arrive|gaano katagal|dating|darating|env[ií]o|entrega|tarda|llega)/i,3],[/\b(pay|card|square|bayad|pago|pagar|tarjeta)\b/i,1],[/(18|adult|lingerie|matanda|adulto|lencer)/i,9],[/(review|rating|star|reseñ|opini)/i,11],[/(available|stock|availability|meron|mayroon|disponible)/i,10],[/\b(buy|order|cart|add|bumili|bili|comprar|carrito)\b/i,0]];
  // Topic presets for the homepage service buttons and the studio pages (Arlene's flyer prices).
  var TOPICS = {
    music: [['Where can I listen?', 'Listen using the Apple Music, Spotify, YouTube and SoundCloud links in the Music section of the Plaza Home page.'],
      ['Can I ask about a song?', 'Yes. Email ' + EMAIL + ' or use the contact form on the Plaza Home page.'],
      ['Where is Lala Ayen on TikTok?', 'The TikTok account is @lalaayenmusicartist.']],
    portraits: [['How much is a portrait?', 'Custom digital portraits: Individual $25, Couple $35, Family (up to 5 people) $45, Pet $30. Digital files only, nothing is shipped. Other styles: email us for a quote.'],
      ['How do I order a portrait?', 'Open the Custom Portrait Studio page, choose your portrait and send your photo by email to ' + EMAIL + '. We confirm the details before you pay.'],
      ['Can I use my own photo?', 'Yes. Send a clear photo by email with your order. Please never send passwords or card details.']],
    videos: [['How much does a video cost?', 'Promotional video packages: Starter $75, Professional $150, Premium Campaign from $300 (quote).'],
      ['How can I request a video?', 'Open the Creative Studio page or email ' + EMAIL + ' with your idea, length and deadline.'],
      ['Are the sample clips finished orders?', 'No. The sample clips show styles, not a finished customer video.']],
    books: [['Can I buy a book here?', 'The Author Bookstore and Preloved Bookstore are coming soon. Email ' + EMAIL + ' to ask about titles.'],
      ['Can I get a book trailer?', 'Yes. Ask about a promotional video in the Creative Studio or by email.']],
    contact: [['How do I contact the Plaza?', 'Email ' + EMAIL + '. You can also prepare an email with the contact form on the Plaza Home page.']]
  };
  var PAGE_TOPIC = { 'creative-studio': 'videos', 'portrait-studio': 'portraits', 'author-bookstore': 'books', 'preloved-books': 'books' };

  function fallback(q) {
    for (var i = 0; i < KEYS.length; i++) if (KEYS[i][0].test(q)) return SHOP[KEYS[i][1]][1];
    if (/(portrait|larawan|retrato)/i.test(q)) return TOPICS.portraits[0][1];
    if (/(video|vid)/i.test(q)) return TOPICS.videos[0][1];
    return 'Each product card shows its price, sizes and colors. For anything else, please email ' + EMAIL + ' (include your order number if you have one) and we will help you.';
  }

  // ===== AI (same backend for every persona) =====
  var preview = (function () { try { var u = new URL(location.href), t = u.searchParams.get('aichat');
    if (t && /^[A-Za-z0-9_-]{16,128}$/.test(t)) { sessionStorage.setItem('lala_ai_preview', t); u.searchParams.delete('aichat'); history.replaceState(null, '', u); }
    return sessionStorage.getItem('lala_ai_preview') || ''; } catch (e) { return ''; } })();
  function headers(extra) { var h = preview ? { 'x-lala-chat-preview': preview } : {}; for (var k in extra || {}) h[k] = extra[k]; return h; }
  var aiOn = null, hist = [];
  function aiCheck() {
    if (aiOn !== null) return Promise.resolve(aiOn);
    return fetch('/api/chat', { headers: headers(), credentials: 'same-origin' }).then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { return (aiOn = !!(d && d.enabled)); }).catch(function () { return (aiOn = false); });
  }
  function ask(q) {
    // A persona's own Core HQ endpoint (once Peter provides it) would be tried here first; until then everyone uses /api/chat.
    var url = persona.coreHqEndpoint || '/api/chat';
    return fetch(url, { method: 'POST', credentials: 'same-origin', headers: headers({ 'content-type': 'application/json' }),
      body: JSON.stringify({ message: q, history: hist.slice(-6), persona: personaId, page: pageId }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return r.ok && d.reply && !d.fallback ? String(d.reply) : ''; }); })
      .catch(function () { return ''; })
      .then(function (a) { if (!a) return { text: fallback(q), preset: true }; hist.push({ role: 'user', content: q }, { role: 'assistant', content: a }); hist = hist.slice(-6); return { text: a }; });
  }

  // ===== Widget =====
  var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'plaza-chat.css?v=' + VERSION; document.head.appendChild(css);
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var shade = el('div', 'lala-chat-shade'); shade.hidden = true;
  var panel = el('aside', 'lala-chat-panel'); panel.hidden = true; panel.id = 'lala-chat';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'lala-chat-name');
  var head = el('div', 'lala-chat-head'), who = el('div'), kicker = el('small', null, 'LALA PLAZA AI HELPER'), name = el('h2', null, persona.name);
  name.id = 'lala-chat-name'; var sub = el('span', 'lala-chat-sub', page[1] + ' helper');
  var x = el('button', 'lala-chat-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close chat');
  who.append(kicker, name, sub); head.append(el('span', 'lala-chat-avatar', persona.name.charAt(0)), who, x);
  var log = el('div', 'lala-chat-log'); log.setAttribute('role', 'log'); log.setAttribute('aria-live', 'polite');
  var opts = el('div', 'lala-chat-options'); opts.setAttribute('aria-label', 'Quick questions');
  var form = el('form', 'lala-chat-form'); form.hidden = true;
  var input = el('input'); input.type = 'text'; input.maxLength = 500; input.required = true; input.autocomplete = 'off';
  input.placeholder = 'Ask ' + persona.name + ' a question…'; input.setAttribute('aria-label', 'Type your question');
  var send = el('button', null, 'Send'); send.type = 'submit'; form.append(input, send);
  var foot = el('div', 'lala-chat-foot'), note = el('p'), more = el('p');
  more.textContent = 'Live chat with our Core HQ team bots is coming soon.';
  var mail = el('a', null, 'Email the Plaza ↗'); mail.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Plaza question (' + page[1] + ')');
  foot.append(note, more, mail);
  panel.append(head, log, opts, form, foot);

  function setNote() {
    kicker.textContent = aiOn ? 'LALA PLAZA AI ASSISTANT' : 'LALA PLAZA HELPER';
    note.textContent = aiOn
      ? persona.name + ' is our AI shop assistant, not a human. AI can make mistakes; for orders, returns and refunds, email us.'
      : persona.name + ' is our store helper. Right now ' + persona.name + ' gives preset answers (not a live person or live AI). For anything else, email us.';
  }
  function line(from, text) {
    var p = el('p', 'lala-chat-msg ' + (from === 'you' ? 'from-you' : 'from-bot')); var b = el('strong', null, from === 'you' ? 'You' : persona.name);
    var t = el('span', null, text); p.append(b, t); log.append(p); log.scrollTop = log.scrollHeight; return t;
  }
  function greet() { var intro = PAGE_INTRO[pageId] || ''; return persona.greeting + (aiOn ? ", Lala Plaza's AI shop assistant (not a human)." + intro + ' Tap a question below or type your own.' : ', your Lala Plaza helper.' + intro + ' Tap a question below.'); }
  var lastFocus = null;
  function open(o) {
    var topic = o && o.topic && TOPICS[o.topic] ? o.topic : PAGE_TOPIC[pageId];
    lastFocus = document.activeElement; log.replaceChildren(); opts.replaceChildren(); hist = [];
    setNote();
    line('bot', greet());
    var list = (topic ? TOPICS[topic] : []).concat(topic && topic !== 'contact' ? SHOP.slice(0, 4) : SHOP);
    list.forEach(function (qa) { var b = el('button', null, qa[0]); b.type = 'button'; b.addEventListener('click', function () { line('you', qa[0]); line('bot', qa[1]); }); opts.append(b); });
    shade.hidden = false; panel.hidden = false; x.focus();
    aiCheck().then(function (on) { setNote(); form.hidden = !on; if (log.children.length === 1) log.firstChild.lastChild.textContent = greet(); });
  }
  function close() { panel.hidden = true; shade.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  x.addEventListener('click', close); shade.addEventListener('click', close);
  document.addEventListener('keydown', function (e) {
    if (panel.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') { var n = panel.querySelectorAll('a[href],button:not([disabled]),input:not([disabled])'), f = n[0], l = n[n.length - 1];
      if (e.shiftKey && document.activeElement === f) { e.preventDefault(); l.focus(); } else if (!e.shiftKey && document.activeElement === l) { e.preventDefault(); f.focus(); } }
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var q = input.value.trim().slice(0, 500); if (!q) return;
    line('you', q); input.value = ''; input.disabled = send.disabled = true; var t = line('bot', '…');
    ask(q).then(function (a) { t.textContent = a.text; input.disabled = send.disabled = false; input.focus(); log.scrollTop = log.scrollHeight; });
  });

  function mount() {
    document.body.append(shade, panel);
    // Reuse the page's own chat buttons (shelf "Chat about this shop", homepage "Ask Plaza Guide" and service buttons); add one only if none exists.
    var launch = document.getElementById('store-chat-launch') || document.querySelector('.floating-chat');
    if (!launch) { launch = el('button', 'lala-chat-launch'); launch.type = 'button'; document.body.append(launch); }
    if (launch.id === 'store-chat-launch') launch.textContent = '💬 Chat with ' + persona.name;
    else if (launch.classList.contains('floating-chat')) { var s = launch.querySelector('span'); if (s) s.textContent = 'Ask ' + persona.name; }
    else launch.textContent = '💬 Ask ' + persona.name;
    launch.setAttribute('aria-label', 'Open chat with ' + persona.name + ', the Lala Plaza AI helper');
    document.querySelectorAll('#store-chat-launch,.chat-open,.lala-chat-launch').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); e.stopImmediatePropagation(); open({ topic: b.getAttribute('data-topic') }); }, true);
    });
    document.addEventListener('lala:open-chat', function (e) { e.preventDefault(); open(e.detail || {}); });
  }
  window.LalaChat = { open: open, close: close, persona: personaId, page: pageId, personas: PERSONAS, pagePersona: PAGE_PERSONA, coreHq: CORE_HQ };
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
