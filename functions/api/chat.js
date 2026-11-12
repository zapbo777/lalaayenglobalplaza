// Preview-only chat for plaza-preview. Knowledge matches the Worker ambassador training.
// Does not store card/ID data. Real Google Workspace logging is not built yet.
const headers = {
  'content-type': 'application/json',
  'cache-control': 'no-store',
  'x-robots-tag': 'noindex',
  'access-control-allow-origin': '*'
};
const SHOP_EMAIL = 'lalaayenglobalplaza@gmail.com';
const AMB_EMAIL = 'lalaayen@lalaayenglobalplaza.com';

const STEPS = [
  ['name', "What's the name of your business?"],
  ['about', 'What does your business do, and what is it all about?'],
  ['offer', 'What products or services do you offer?'],
  ['benefits', 'What are the main benefits for your customers?'],
  ['customers', 'Who are your customers?'],
  ['special', 'What makes your business special or different?'],
  ['links', 'Please share your website, social links, or photos we should use.'],
  ['else', 'Is there anything else a customer would need to understand about your business?']
];

const SINGLE_BUNDLE = "Single is one poster or one video, posted once to TikTok, Facebook and Instagram. You get a copy and run it yourself. Bundle means you sit back and relax: you still get a copy, and Lala Ayen's team pushes it to all social media with a boost for one or two weeks — you relax, we've got it. AI tool subscriptions and everyone's pay are already built into the price. Contact us for rates.";
const RATES = 'Contact us for rates. Please share your name, business and email (and a phone number if you like) so Lala Ayen can follow up at ' + AMB_EMAIL + '. We never ask you to send card or ID details in chat.';
const PROMISE = 'Lala Ayen: Songwriter. Musician. Artist. Author. Publisher. Producer. Content creator. Influencer. Promoter. Business owner. She runs Lala Ayen LLC. Promise: "We deliver a great service. We don\'t scam people." Guarantee: "If I don\'t deliver what we agreed, I\'ll fix it. If I still can\'t, I\'ll refund you." Terms: one round of changes, payment before work begins, and no promise of sales. Reviews are honest.';
const SHIPPING = 'We ship to US and international addresses. Shipping is free on eligible items for US and international orders. Duties or taxes for international orders (if any) are the buyer\'s responsibility unless noted at checkout. Most orders arrive in about 7 to 14 business days, including 1 to 3 business days of processing. Items from a US warehouse usually arrive sooner, in about 3 to 8 business days. Each product page shows its own estimate. Delivery times are estimates and can be longer during holidays or carrier delays.';
const RETURNS = 'You can return any item, including lingerie, within 14 days of delivery, for any reason. Returns are free: email ' + SHOP_EMAIL + ' with your order number, the item and the reason, and we email a free prepaid return label. Ship to the address on that label. Refunds go back to your original payment method.';
const PAYMENT = "US orders are paid on Square's secure checkout page in US dollars. International (non-US) buyers can pay with PayPal at checkout when it is offered. Card details never reach our website.";

function clean(s, n) {
  return String(s || '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(0, n);
}

function looksLikeSecret(text) {
  // Card-like 13-19 digits or SSN-like pattern; never store or echo them.
  return /\b(?:\d[ -]*?){13,19}\b/.test(text) || /\b\d{3}-\d{2}-\d{4}\b/.test(text);
}

function wantsHire(q, page) {
  if (page === 'ambassador' && /^(hi|hello|hey|good (morning|afternoon|evening)|start|apply|hire)\b/i.test(q)) return true;
  return /(ambassador|hire lala|hire you|promote my (business|brand|company)|be my (ambassador|promoter)|brand ambassador|review (my|our) (business|company|brand|product)|advertis(e|ing) (my|our))/i.test(q);
}
function asksRates(q) {
  return /(how much|cost|price|rate|pricing|fee|magkano|presyo|quote a? ?price|dollar|\$\s?\d)/i.test(q) &&
    !/(portrait|invitation|video greeting|party|shipping)/i.test(q);
}
function asksBundle(q) {
  return /(single|\bbundle\b|single vs|package option|what('s| is) (the )?(difference|option))/i.test(q);
}
function asksPromise(q) {
  return /(your promise|the promise|the guarantee|don'?t scam|do you scam|who is lala|your titles?|what is the guarantee|what is your (promise|guarantee))/i.test(q);
}
function asksShip(q) {
  return /(how long|shipping|deliver|arrive|ship outside|international ship|gaano katagal|dating|darating|env[ií]o|entrega)/i.test(q);
}
function asksReturn(q) {
  return /(return|refund|ibalik|isauli|devol|reembolso)/i.test(q) && !/guarantee/i.test(q);
}
function asksPay(q) {
  return /\b(pay|payment|card|square|paypal|bayad|pago|pagar|tarjeta)\b/i.test(q);
}

function interviewStarted(history, page, q) {
  if (page === 'ambassador') return true;
  if (wantsHire(q, page)) return true;
  return (history || []).some((t) => t && t.role === 'assistant' && /business name|what does your business do|products or services do you offer/i.test(t.content || ''));
}

function answersFromHistory(history) {
  const out = [];
  const turns = history || [];
  for (let i = 0; i < turns.length; i++) {
    const t = turns[i];
    if (t.role !== 'assistant') continue;
    const step = STEPS.findIndex(([, q]) => t.content && t.content.indexOf(q) !== -1);
    if (step < 0) continue;
    // the following user message is the answer, if any
    const nxt = turns.slice(i + 1).find((x) => x.role === 'user');
    if (nxt && nxt.content) out[step] = clean(nxt.content, 500);
  }
  return out;
}

function nextStepIndex(answers) {
  for (let i = 0; i < STEPS.length; i++) if (!answers[i]) return i;
  return STEPS.length;
}

function summary(answers) {
  const labels = ['Business name', 'What it does', 'Products or services', 'Benefits', 'Customers', 'What makes it special', 'Photos or links', 'Anything else'];
  return labels.map((l, i) => answers[i] ? (l + ': ' + answers[i]) : null).filter(Boolean).join(' ');
}

export function previewReply({ message, history, page }) {
  const q = clean(message, 500);
  if (!q) return { reply: 'Please type a short question, or email us if you prefer.' };
  if (looksLikeSecret(q)) {
    return { reply: 'Please do not send card numbers or ID details in chat. Those are never stored here. For ambassador rates, contact us for rates and email ' + AMB_EMAIL + ' with your name and business only.' };
  }

  const hist = (Array.isArray(history) ? history : []).filter((t) => t && (t.role === 'user' || t.role === 'assistant'));
  const inInterview = interviewStarted(hist, page, q);
  const asideOnly = asksRates(q) || asksBundle(q) || (asksPromise(q) && (page === 'ambassador' || inInterview));
  const answers = answersFromHistory(hist); // do not treat rate/bundle/promise asides as answers
  let idx = nextStepIndex(answers);
  if (!asideOnly && inInterview && idx < STEPS.length && hist.length) {
    const lastAsst = [...hist].reverse().find((t) => t.role === 'assistant');
    if (lastAsst && lastAsst.content && lastAsst.content.indexOf(STEPS[idx][1]) !== -1) {
      answers[idx] = q;
      idx += 1;
    }
  }

  let aside = '';
  if (asksRates(q)) aside = RATES + ' ';
  else if (asksBundle(q)) aside = SINGLE_BUNDLE + ' ';
  else if (asksPromise(q) && (page === 'ambassador' || inInterview)) aside = PROMISE + ' ';

  if (inInterview) {
    if (idx < STEPS.length) {
      const start = (idx === 0 && !aside) ? 'I will first learn about your business, one question at a time, before Lala Ayen records any talking-head review. No review is made without that research. ' : '';
      return { reply: clean((aside + start + STEPS[idx][1]), 1500) };
    }
    const sum = 'Here is what I have: ' + summary(answers) + ' Does that sound right? Once you confirm, Lala Ayen can record an honest talking-head video review. Reviews are honest and never promise sales. ' + RATES;
    return { reply: clean((aside + sum), 1500) };
  }

  if (asksRates(q) && /(ambassador|promot|advertise|advertis|review|poster|boost)/i.test(q) || (asksRates(q) && page === 'ambassador')) {
    return { reply: RATES };
  }
  if (asksBundle(q) && (page === 'ambassador' || /(ambassador|poster|video|social)/i.test(q))) {
    return { reply: SINGLE_BUNDLE };
  }
  if (asksPromise(q) && (page === 'ambassador' || /lala ayen/i.test(q))) return { reply: PROMISE };
  if (asksShip(q)) return { reply: SHIPPING };
  if (asksReturn(q)) return { reply: RETURNS };
  if (asksPay(q)) return { reply: PAYMENT };
  if (wantsHire(q, page)) {
    return { reply: "I will first learn about your business, one question at a time, before Lala Ayen records any talking-head review. No review is made without that research. " + STEPS[0][1] };
  }
  return { reply: 'I can help with shipping, returns, payment, or hiring Lala Ayen as a brand ambassador. For shop orders email ' + SHOP_EMAIL + '. For ambassador work, contact us for rates at ' + AMB_EMAIL + '.' };
}

export async function onRequestGet() {
  return new Response(JSON.stringify({ enabled: true, preview: true }), { headers });
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const message = clean(body && body.message, 501);
    if (!message) return new Response(JSON.stringify({ fallback: true, error: 'Empty message.' }), { status: 400, headers });
    if (message.length > 500) return new Response(JSON.stringify({ fallback: true, error: 'Please keep your question under 500 characters.' }), { status: 400, headers });
    const page = String((body && body.page) || '');
    const history = Array.isArray(body && body.history) ? body.history.slice(-12) : [];
    const { reply } = previewReply({ message, history, page });
    return new Response(JSON.stringify({ reply, preview: true }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ fallback: true, reason: 'error' }), { status: 500, headers });
  }
}
