// QUASI Quotation Maker work area. Loaded by quote.html only after the server confirms sign-in.
// Contains layout only; no prices, quotes or account data (those come from the API per account).
window.QUASI_QUOTE_APP_HTML = `    <section class="break" id="prices">
      <h2>1 · Your business and prices</h2>
      <form id="profileForm" class="panel" novalidate>
        <div class="grid">
          <div><label for="businessName">Business name (shown on every quote)</label><input id="businessName" name="businessName" maxlength="120" autocomplete="organization" required></div>
          <div class="grid g4">
            <div><label for="pStandard">Standard clean</label><div class="money"><span>$</span><input id="pStandard" name="standard" type="number" min="0" step="1" inputmode="decimal" required></div></div>
            <div><label for="pDeep">Deep clean</label><div class="money"><span>$</span><input id="pDeep" name="deep" type="number" min="0" step="1" inputmode="decimal" required></div></div>
            <div><label for="pMoveout">Move-out clean</label><div class="money"><span>$</span><input id="pMoveout" name="moveout" type="number" min="0" step="1" inputmode="decimal" required></div></div>
            <div><label for="pBedroom">Add per extra bedroom</label><div class="money"><span>$</span><input id="pBedroom" name="perBedroom" type="number" min="0" step="1" inputmode="decimal" required></div></div>
          </div>
          <p style="margin:0;font-size:13px">The clean prices are for a studio or 1-bedroom home. For bigger homes, QUASI adds your extra-bedroom amount for each bedroom after the first.</p>
          <div class="row"><button class="btn main" type="submit">Save prices</button></div>
        </div>
        <p class="msg" id="profileMsg" role="status"></p>
      </form>
    </section>

    <section class="break" id="new">
      <h2>2 · New quote</h2>
      <form id="quoteForm" class="panel" novalidate>
        <div class="grid g3">
          <div><label for="customerName">Customer name</label><input id="customerName" name="customerName" maxlength="80" autocomplete="off" required></div>
          <div><label for="cleanType">Type of clean</label>
            <select id="cleanType" name="cleanType">
              <option value="standard">Standard clean</option>
              <option value="deep">Deep clean</option>
              <option value="moveout">Move-out clean</option>
            </select></div>
          <div><label for="homeSize">Home size</label>
            <select id="homeSize" name="homeSize">
              <option value="studio">Studio / 1 bedroom</option>
              <option value="bed2">2 bedrooms</option>
              <option value="bed3">3 bedrooms</option>
              <option value="bed4">4 bedrooms</option>
              <option value="bed5">5+ bedrooms</option>
            </select></div>
        </div>
        <div class="estimate" id="estimate"></div>
        <div class="row" style="margin-top:12px"><button class="btn main" type="submit">Make quote</button></div>
        <p class="msg" id="quoteMsg" role="status"></p>
      </form>
      <div id="latest" style="margin-top:18px" hidden></div>
    </section>

    <section class="break" id="saved">
      <h2>3 · Saved quotes</h2>
      <p>Only you can see this list. Anyone you send a link to sees just that one quote.</p>
      <div class="list" id="quoteList"></div>
      <p class="msg" id="listMsg" role="status"></p>
    </section>
    <section class="break" id="plan">
      <div class="panel plan">
        <div>
          <h2 style="margin-bottom:6px">QUASI Quotation Maker plan</h2>
          <p style="margin:0">Unlimited quotes, your own prices, saved quotes list.</p>
        </div>
        <div style="text-align:right">
          <div class="price">$19<span style="font-size:16px">/month</span></div>
          <span class="pill">Coming soon · not for sale yet</span>
        </div>
      </div>
      <p class="msg info" style="display:block">Free while in early access. No payment is taken and there is no checkout.</p>
    </section>`;
