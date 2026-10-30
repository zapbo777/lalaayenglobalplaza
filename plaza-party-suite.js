/* Lala Party Shop: Party Creative Suite (Arlene's "LALA AYEN LLC Party Creative Suite" flyer, updated version Oct 30).
   ONE place for these prices: PARTY_SUITE below. The Worker chat (lala-auth-worker/src/chat.js) quotes the same prices,
   so change both when prices change. All items are digital designs (nothing is shipped).
   Ordering = same flow as Creative/Portrait Studio: "Email to request" (prefilled email; customer attaches photos) and,
   for signed-in customers only, "Pay agreed amount" via GET /api/pay-link (the Square link is never in the page). */
(function () {
  'use strict';
  var EMAIL = 'lalaayenglobalplaza@gmail.com';
  var PARTY_SUITE = {
    singles: [
      { name: 'Custom Birthday Invitation', price: 7.99, icon: '🎂' },
      { name: 'Custom Wedding Invitation', price: 14.99, icon: '💍' },
      { name: 'Custom Baby Shower Invitation', price: 9.99, icon: '🍼' },
      { name: 'Custom Graduation Invitation', price: 9.99, icon: '🎓' },
      { name: 'Custom Anniversary Invitation', price: 9.99, icon: '🥂' },
      { name: "Custom Valentine's Card", price: 5.99, icon: '💌' },
      { name: 'Custom Thank You Card', price: 5.99, icon: '🌸' },
      { name: 'Custom Christening / Baptism Invitation', price: 9.99, icon: '🕊️' },
      { name: 'Custom Party Poster (event posters)', price: 14.99, icon: '🎉' },
      { name: 'Custom Quinceañera / Sweet 16 Invitation', price: 12.99, icon: '👑' },
      { name: 'Custom Holiday Card', price: 5.99, icon: '🎄' },
      { name: 'Custom Movie-Style Poster', price: 19.99, icon: '🎬' },
      { name: 'Custom Memorial Tribute', price: 19.99, icon: '🤍' },
      // Flyer price for a single fantasy-style personal portrait. Different from the Custom Portrait Studio list (Individual $25).
      { name: 'Custom Fantasy Portrait (Party Suite)', price: 9.99, icon: '✨' },
      // New on the updated flyer:
      { name: 'Custom Social Media Design', price: 9.99, icon: '📱' },
      { name: 'Custom Video Greeting (30s)', price: 24.99, icon: '🎥', video: true, note: 'Birthday videos, holiday greetings, personalized messages, slideshow videos' }
    ],
    bundles: [
      { name: 'Complete Party Design Bundle', price: 39.99, best: true, video: true, items: ['Invitation', 'Poster', 'Cards', 'Video'] },
      // The 5 bundles below are from the FIRST flyer and are not on the updated one: kept for now, Arlene to confirm.
      { name: 'Party Essentials Bundle', price: 19.99, items: ['Invitation', 'Matching Poster', 'Thank You Card'] },
      { name: 'Birthday Deluxe Bundle', price: 29.99, items: ['Invitation', 'Birthday Poster', '2 Matching Cards', 'Photo Collage'] },
      { name: 'Wedding Memories Bundle', price: 39.99, items: ['Save the Date', 'Wedding Invitation', 'Wedding Poster', 'Thank You Card'] },
      { name: 'Family Celebration Bundle', price: 39.99, items: ['Family Portrait', 'Invitation', 'Poster', '2 Greeting Cards'] },
      { name: 'Ultimate Creative Bundle', price: 59.99, items: ['5 Custom Designs', 'Any theme', 'Invitations + Posters + Cards', 'OR Portraits + Social Media + Video'] }
    ]
  };
  window.LALA_PARTY_SUITE = PARTY_SUITE;
  var money = function (n) { return '$' + n.toFixed(2); };
  function mailto(x) {
    var subject = 'Party Creative Suite request: ' + x.name + ' (' + money(x.price) + ')';
    var body = ['Hello Lala Ayen,', '', 'I would like to order: ' + x.name + ' — ' + money(x.price) + ' (digital design)',
      'Name:', 'Occasion / event:', 'Names, date, time and place to show on the design:', 'Theme or colors:', 'Format (digital hi-res, print-ready PDF, video MP4, social media sizes):', '',
      '(I attached my photos to this email.)'];
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.join('\n'));
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function card(x, bundle) {
    var c = el('article', 'ps-card' + (bundle ? ' ps-card--bundle' : ''));
    if (x.best) c.append(el('span', 'ps-best', 'Best value'));
    if (!bundle) c.append(el('span', 'ps-icon', x.icon));
    c.append(el('h4', null, x.name), el('strong', 'ps-price', money(x.price)));
    if (x.note) c.append(el('p', 'ps-small', x.note));
    if (bundle) { var ul = el('ul'); x.items.forEach(function (i) { ul.append(el('li', null, i)); }); c.append(ul); }
    var a = el('a', 'button outline ps-req', '✉ Email to request'); a.href = mailto(x); c.append(a);
    if (x.video) { var v = el('button', 'ps-ask', '🎬 Ask Verio (AI Video Creator)'); v.type = 'button'; v.setAttribute('data-suite-chat', 'verio'); c.append(v); }
    return c;
  }
  function render() {
    var s = document.getElementById('ps-singles'), b = document.getElementById('ps-bundles');
    if (s) { s.replaceChildren(); PARTY_SUITE.singles.forEach(function (x) { s.append(card(x, false)); }); }
    if (b) { b.replaceChildren(); PARTY_SUITE.bundles.forEach(function (x) { b.append(card(x, true)); }); }
  }
  // Signed-in-only "Pay agreed amount" (same rules as plaza-studio.js).
  function payState(url) {
    document.querySelectorAll('#creative-suite [data-pay-agreed]').forEach(function (a) { if (url) { a.href = url; a.hidden = false; } else { a.removeAttribute('href'); a.hidden = true; } });
    document.querySelectorAll('#creative-suite [data-pay-signin]').forEach(function (b) { b.hidden = !!url; });
  }
  var payReq = 0;
  function refreshPayLink(user) {
    var n = ++payReq;
    if (!user) { payState(null); return; }
    fetch('/api/pay-link', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { if (n === payReq) payState(d && typeof d.url === 'string' && /^https:\/\/square\.link\//.test(d.url) ? d.url : null); })
      .catch(function () { if (n === payReq) payState(null); });
  }
  function openSignIn() {
    var dlg = document.getElementById('account-dialog');
    if (dlg && typeof dlg.showModal === 'function' && !dlg.open) { dlg.showModal(); return; }
    var b = document.querySelector('[data-auth-open]'); if (b) b.click();
  }
  function init() {
    render(); payState(null);
    document.querySelectorAll('#creative-suite [data-pay-signin]').forEach(function (b) { b.addEventListener('click', openSignIn); });
    document.addEventListener('lala-auth', function (e) { refreshPayLink(e.detail && e.detail.user ? e.detail.user : null); });
    if (window.LalaAuth && window.LalaAuth.user) refreshPayLink(window.LalaAuth.user);
    // Suite chat buttons: data-suite-chat="gerio" (AI Creative Artist) or "verio" (AI Video Creator, video items).
    document.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('[data-suite-chat]'); if (!b) return;
      var who = b.getAttribute('data-suite-chat') === 'verio' ? 'verio' : 'gerio';
      if (window.LalaChat) window.LalaChat.open({ topic: who === 'verio' ? 'party-video' : 'party', persona: who }); else location.href = 'mailto:' + EMAIL;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
