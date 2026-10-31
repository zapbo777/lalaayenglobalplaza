/* Lala Plaza "Coming Soon" switch (Arlene, Oct 30 2026: close stores that are not in use yet).
   To REOPEN a store: remove its file name from CLOSED below (an empty list turns this off everywhere).
   Nothing is deleted: the store pages, their content and links stay; this only adds a banner on the closed page
   and a small "Coming Soon" badge on links to it (sidebar, menus, homepage tiles). */
(function () {
  'use strict';
  var CLOSED = [
    'LALA_AYEN_AUTHOR_BOOKSTORE_MARK1.html',
    'PRELOVED_BOOKSTORE_MARK1.html',
    'LALA_IRON_THRIFT_STORE_MARK1.html',
    'LALA_AYEN_MERCHANTS_MARK1.html',
    'LALA_AYEN_AFFILIATE_MARKETING_MARK1.html', // Arlene, Oct 30: closed too (partner links kept on the page)
    'LALA_COWGIRL_COWBOY_WORLD_MARK1.html', // Arlene, Oct 30: new Western store, categories only for now
    'LALA_AYEN_FASHIONS_MARK1.html' // Arlene, Oct 30: Fashion Department (bags & jewelry), coming soon
  ];
  if (!CLOSED.length || window.LalaComingSoon) return;
  function fileOf(href) {
    try { var u = new URL(href, location.href); if (u.origin !== location.origin) return '';
      var f = decodeURIComponent(u.pathname.split('/').pop() || ''); return f ? (/\.html?$/i.test(f) ? f : f + '.html') : 'index.html'; } catch (e) { return ''; }
  }
  function isClosed(f) { return CLOSED.indexOf(f) !== -1; }
  var css = '.cs-badge{display:inline-block;margin-left:6px;padding:1px 7px;border:1px solid #dfbd77;border-radius:999px;background:rgba(223,189,119,.16);color:#dfbd77;font:700 9px/1.6 Inter,Arial,sans-serif;letter-spacing:.08em;text-transform:uppercase;vertical-align:middle;white-space:nowrap}'
    + '.cs-closed-link{opacity:.72}'
    + '.cs-banner{margin:0 0 22px;padding:clamp(20px,3.5vw,34px);border:1px solid #dfbd77;border-radius:18px;background:linear-gradient(135deg,#29115f,#4a1ca0);color:#f7f0fd;text-align:center;box-shadow:0 16px 44px rgba(29,14,58,.18)}'
    + '.cs-banner .cs-eyebrow{margin:0;font:700 11px Inter,Arial,sans-serif;letter-spacing:.18em;color:#dfbd77}'
    + '.cs-banner h2{margin:8px 0 6px;font:500 clamp(28px,4vw,40px)/1.15 Georgia,serif;color:#fff}'
    + '.cs-banner h2 span{display:block;font-size:.55em;color:#dfbd77;margin-top:4px}'
    + '.cs-banner p{margin:8px auto 16px;max-width:560px;color:#e6dcf5;font-size:15px;line-height:1.55}'
    + '.cs-banner p,.cs-banner h2{min-height:0;text-align:center}.cs-banner .cs-eyebrow{display:block;width:100%}'
    + '.cs-banner .cs-actions{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}'
    + '.cs-banner a{display:inline-block;padding:10px 18px;border-radius:999px;border:1px solid #dfbd77;font-weight:700;font-size:14px}'
    + '.cs-banner a.cs-primary{background:#dfbd77;color:#29115f}.cs-banner a.cs-secondary{color:#dfbd77}'
    + 'body.is-coming-soon .catalog-shell{opacity:.38;filter:grayscale(.4);pointer-events:none;user-select:none}';
  function run() {
    var st = document.createElement('style'); st.id = 'plaza-coming-soon-css'; st.textContent = css; document.head.appendChild(st);
    // Badges on every link to a closed store (links stay clickable).
    document.querySelectorAll('a[href]').forEach(function (a) {
      if (!isClosed(fileOf(a.getAttribute('href'))) || a.closest('.cs-banner')) return;
      a.classList.add('cs-closed-link'); a.setAttribute('data-coming-soon', '');
      if (/coming soon/i.test(a.textContent)) return; // homepage tiles already say COMING SOON
      var b = document.createElement('span'); b.className = 'cs-badge'; b.textContent = 'Coming Soon';
      var label = a.querySelector('span:last-child') || a; label.appendChild(b);
    });
    // Banner on the closed store page itself.
    if (isClosed(fileOf(location.href))) {
      document.body.classList.add('is-coming-soon');
      var name = (document.querySelector('.shop-hero h2') || {}).textContent || 'This store';
      var ban = document.createElement('section'); ban.className = 'cs-banner'; ban.setAttribute('role', 'status');
      ban.innerHTML = '<p class="cs-eyebrow">TEMPORARILY CLOSED</p><h2>Coming Soon<span>Malapit na!</span></h2><p></p>'
        + '<div class="cs-actions"><a class="cs-primary" href="index.html#marketplace">← Back to the Plaza</a><a class="cs-secondary" href="LALA_AYEN_GLOBAL_SHOP_MARK1.html">Shop the Global Shop</a></div>';
      ban.querySelector('p:not(.cs-eyebrow)').textContent = name + ' is getting ready and is not taking orders yet. Thank you for your patience. Our other stores are open now!';
      var main = document.querySelector('main.main-content, main') || document.body; main.insertBefore(ban, main.firstChild);
    }
  }
  window.LalaComingSoon = { closed: CLOSED.slice() };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
