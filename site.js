(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.primary-nav');
  if (menuButton && nav) {
    const closeMenu = () => {
      menuButton.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const form = document.getElementById('inquiry-form');
  const status = document.getElementById('form-status');
  const preview = document.getElementById('draft-preview');
  const draftField = document.getElementById('inquiry-draft');
  const copyButton = document.getElementById('copy-draft');
  const openLink = document.getElementById('open-draft');
  const recipient = 'lalaayenglobalplaza@gmail.com';

  if (form && status && preview && draftField && copyButton && openLink) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const service = String(data.get('service') || 'General inquiry');
      const name = String(data.get('name') || '').trim();
      const email = String(data.get('email') || '').trim();
      const message = String(data.get('message') || '').trim();
      const subject = `LALA AYEN inquiry — ${service}`;
      const lines = [
        `Inquiry type: ${service}`,
        name ? `Name: ${name}` : '',
        email ? `Reply email: ${email}` : '',
        '',
        'Project message:',
        message || '(No project message added.)',
        '',
        'Please confirm scope, total, delivery, and rights before work begins.'
      ];
      const body = lines.join('\n');
      draftField.value = `To: ${recipient}\nSubject: ${subject}\n\n${body}`;
      openLink.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      preview.hidden = false;
      status.textContent = 'Draft prepared. Review it below; no message has been sent.';
    });

    copyButton.addEventListener('click', async () => {
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(draftField.value);
        status.textContent = 'Draft copied. Paste it into your email or preferred message app and review before sending.';
      } catch {
        draftField.focus();
        draftField.select();
        status.textContent = 'Automatic copying is unavailable. The draft is selected so you can copy it manually.';
      }
    });
    openLink.addEventListener('click', () => {
      status.textContent = 'Opening your email app if configured. You must review and send the draft yourself.';
    });
  }

  // Self-service FAQ panels. All answers are local; no external AI, logging, or hidden messages.
  const guideTopics = {
    music: {
      welcome: 'Welcome to the Music Guide! I can show you where to listen and how to contact Lala Ayen about music.',
      questions: [
        ['Where can I listen?', 'Listen using the Apple Music, Spotify, YouTube, and SoundCloud links in the Music section.'],
        ['Can I ask about a song?', 'Yes. Use the inquiry form below and choose Music to prepare your question.'],
        ['Where is Lala Ayen on TikTok?', 'The TikTok account is @lalaayenmusicartist. Find it in the social links at the top of this page.']
      ], service: 'Music'
    },
    portraits: {
      welcome: 'Welcome to the Portrait Guide! Custom portraits are digital-only, and I can help with the basics.',
      questions: [
        ['How much is a portrait?', 'Digital portraits start at $10 USD. The exact price depends on the approved style and requested details.'],
        ['How do I order?', 'Tell us your preferred portrait style and occasion using the contact inquiry form. No payment is requested before the quote is agreed.'],
        ['Can I use my own photo?', 'Ask about using your photo when you contact us. Please do not send sensitive documents or payment details through this guide.']
      ], service: 'Custom digital portrait'
    },
    videos: {
      welcome: 'Welcome to the Video Guide! Ask about creative and promotional video services.',
      questions: [
        ['How much does a video cost?', 'Promotional videos start at $75 USD for a 15–30 second Starter commission with one revision. Final scope and terms are confirmed individually.'],
        ['How can I request a video?', 'Describe your concept, preferred duration, and deadline in the contact inquiry form.'],
        ['Are the sample clips finished orders?', 'No. The eight-second clips show concept styles, not a complete customer deliverable.']
      ], service: 'Promotional video'
    },
    books: {
      welcome: 'Welcome to the Book Guide! Here is what is currently available about the books.',
      questions: [
        ['Can I buy a book here?', 'Automatic book purchasing is not available on this preview. Ask about current and upcoming titles using the contact form.'],
        ['Are there children’s books?', 'Lala Ayen is developing children’s storytelling projects. Request current availability before ordering.'],
        ['Can I get a book trailer?', 'Yes, you can inquire about a promotional video for a book. Choose Promotional video on the contact form.']
      ], service: 'Writing or book-promotion project'
    },
    contact: {
      welcome: 'Welcome to the Contact Guide! Choose a question below or prepare an inquiry. This is not a live human or AI chat.',
      questions: [
        ['How do I contact the Plaza?', 'Write to lalaayenglobalplaza@gmail.com or use the contact form on this page to prepare an email draft. You must send the draft yourself.'],
        ['Where is your Facebook?', 'See the Lala Ayen LLC and Zapbo Tivi Facebook buttons at the top of the page.'],
        ['How do payments work?', 'The Square link is for a written, confirmed quote only. Never pay before agreeing on a total, scope, and terms.']
      ], service: 'General inquiry'
    }
  };
  const chatPanel = document.getElementById('chat-panel');
  const chatShade = document.getElementById('chat-shade');
  const chatBody = document.getElementById('chat-body');
  const chatOptions = document.getElementById('chat-options');
  const chatHeading = document.getElementById('chat-heading');
  const chatClose = document.getElementById('chat-close');
  const chatContact = document.getElementById('chat-contact');
  let previousFocus = null;
  if (chatPanel && chatShade && chatBody && chatOptions && chatClose && chatContact) {
    const addBubble = (message, who) => {
      const el = document.createElement('div');
      el.className = 'chat-bubble' + (who === 'user' ? ' chat-bubble--user' : '');
      el.textContent = message;
      chatBody.append(el);
      chatBody.scrollTop = chatBody.scrollHeight;
    };
    const showTopic = (topic) => {
      const guide = guideTopics[topic] || guideTopics.contact;
      chatHeading.textContent = topic === 'contact' ? 'Plaza Guide' : topic.charAt(0).toUpperCase() + topic.slice(1) + ' Guide';
      chatBody.replaceChildren();
      chatOptions.replaceChildren();
      addBubble(guide.welcome, 'guide');
      guide.questions.forEach(([question, answer]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = question;
        button.addEventListener('click', () => {
          addBubble(question, 'user');
          addBubble(answer, 'guide');
        });
        chatOptions.append(button);
      });
      const service = document.getElementById('service');
      if (service && [...service.options].some(option => option.value === guide.service)) service.value = guide.service;
    };
    const closeChat = () => {
      chatPanel.hidden = true;
      chatShade.hidden = true;
      document.body.style.overflow = '';
      if (previousFocus) previousFocus.focus();
    };
    document.querySelectorAll('.chat-open').forEach(button => button.addEventListener('click', () => {
      previousFocus = button;
      showTopic(button.dataset.topic || 'contact');
      chatShade.hidden = false;
      chatPanel.hidden = false;
      document.body.style.overflow = 'hidden';
      chatClose.focus();
    }));
    chatClose.addEventListener('click', closeChat);
    chatShade.addEventListener('click', closeChat);
    chatContact.addEventListener('click', closeChat);
    document.addEventListener('keydown', (event) => {
      if (chatPanel.hidden) return;
      if (event.key === 'Escape') closeChat();
      if (event.key === 'Tab') {
        const nodes = [...chatPanel.querySelectorAll('a[href], button:not([disabled])')];
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
