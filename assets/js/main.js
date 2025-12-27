/* ========= Header highlight + year ========= */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const bar = nav.querySelector('.active-bar');
  const links = [...nav.querySelectorAll('.nav-link')];

  function setBar(el) {
    const r = el.getBoundingClientRect();
    const nr = nav.getBoundingClientRect();
    bar.style.width = r.width + 'px';
    bar.style.transform = `translateX(${r.left - nr.left}px)`;
  }
  function mark() {
    const file = location.pathname.split('/').pop() || 'index.html';
    const map = {
      'index.html': 'home',
      'about.html': 'about',
      'skills.html': 'skills',
      'experience.html': 'experience',
      'projects.html': 'projects',
      'contact.html': 'contact'
    };
    const active = map[file] || 'home';
    const el = links.find(a => a.dataset.active === active) || links[0];
    setBar(el);
  }
  window.addEventListener('resize', mark);
  setTimeout(mark, 60);

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ========= Skills page (safe if page not present) ========= */
(function () {
  const onSkills = /skills\.html$/.test(location.pathname);
  if (!onSkills) return;

  const chips = document.querySelectorAll('#chipTabs .chip-pill');
  const panels = {
    tech: document.getElementById('panel-tech'),
    ml: document.getElementById('panel-ml'),
    tools: document.getElementById('panel-tools'),
    biz: document.getElementById('panel-biz')
  };

  function showTab(key) {
    chips.forEach(b => b.classList.toggle('active', b.dataset.tab === key));
    Object.keys(panels).forEach(k => {
      const p = panels[k];
      if (!p) return;
      if (k === key) {
        p.hidden = false;
        p.classList.add('show');
        p.querySelectorAll('.meter span').forEach(s => {
          const val = getComputedStyle(s).getPropertyValue('--val');
          requestAnimationFrame(() => (s.style.width = val.trim() || '0'));
        });
      } else {
        p.classList.remove('show');
        p.hidden = true;
        p.querySelectorAll('.meter span').forEach(s => (s.style.width = '0'));
      }
    });
  }

  chips.forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
  const hash = location.hash.replace('#', '') || 'tech';
  if (panels[hash]) showTab(hash);
  else showTab('tech');

  // animated counters
  const counters = document.querySelectorAll('.count');
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const end = parseInt(el.dataset.to || '0', 10);
          let n = 0;
          const inc = Math.max(1, Math.ceil(end / 40));
          const tick = () => {
            n += inc;
            if (n >= end) n = end;
            el.textContent = n;
            if (n < end) requestAnimationFrame(tick);
          };
          tick();
          io.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach(c => io.observe(c));
})();

/* ========= Projects page ========= */
(function () {
  const onProjects = /projects\.html$/.test(location.pathname);
  if (!onProjects) return;

  // small data map (text only) — images come from data-modal-img on each card
  const dataMap = {
    supply: {
      title: 'Landing Page',
      cat: 'UI/UX Design',
      desc: 'This project showcases a user-centered Web3 education platform designed with clear user flows, modular course structure, and progress tracking. Emphasis was placed on accessibility, clarity, and reducing cognitive load for beginners.',
      tags: ['Figma', 'Adobe Illustrator', 'Canva'],
      features: ['Responsive UI designed for both web and mobile experiences', 'Clear user flows for onboarding, course navigation, and module access', 'Progress tracking with visual indicators to motivate continued learning'],
      outcomes: ['Improved content clarity and reduced cognitive load for beginner users', 'Faster navigation and smoother learning experience across screens', 'Scalable design framework ready for future courses and features'],
      demo: '#',
      code: '#'
    },
    
    home_rent: {
      title: 'NFT Design',
      cat: ' · NFT Design · Digital Illustration · Character Design',
      desc:'Designed an original character-based NFT artwork focused on visual storytelling and brand appeal. The design combines expressive illustration, vibrant colors, and scalable composition suitable for digital collectibles and merchandise.',
      tags: ['Adobe Illustrator', 'Canva', 'Sketch'],
      features: [
        'Original NFT character with playful, expressive detailing',
        'Clean color palette and gradients for depth and clarity',
        'Scalable design optimized for badges, collectibles, and branding'
      ],
      outcomes: ['Created a distinctive visual identity with strong engagement appeal', 'Delivered versatile artwork adaptable across multiple digital platforms'],
      demo: '#',
      code: '#'
    },
    retail: {
      title: 'Logo & Brand Identity Design',
      cat: '· Logo Design · Brand Identity · Visual Identity',
      desc: 'Designed a dynamic logo system for the KSB Marathon, focusing on motion, energy, and community spirit. The visual identity uses abstract human forms and vibrant gradients to represent speed, endurance, and inclusivity.',
      tags: ['Adobe Suite', 'Canva'],
      features: ['Multiple logo variations exploring form, motion, and color', 'Abstract human silhouettes symbolizing movement and athleticism', 'Scalable design adaptable for digital, print, and event branding'],
      outcomes: ['Established a strong and recognizable brand identity for the marathon', 'Improved visual consistency across marketing and promotional materials', 'Created a flexible logo system suitable for long-term brand use'],
      demo: '#',
      code: '#'
    },
    sales: {
      title: 'Social Media Campaign',
      cat: 'Social Media Design',
      desc: 'Multi-platform social media campaign focused on visual storytelling, motion design, and audience engagement.',
      tags: ['Figma', 'Canva', 'After Effects', 'Photoshop'],
      features: [
        'Short-form video creatives',
        'Platform-specific visual design',
        'Motion graphics & branding'
      ],
      outcomes: [
        '+300% engagement growth',
        'Higher reach across platforms',
        'Consistent brand identity'
      ],
      demo: '#',
      code: '#'
    },
    health: {
      title: 'Healthcare Analytics Platform',
      cat: 'Healthcare Analytics',
      desc: 'Clinical KPI & outcomes reporting.',
      tags: ['Python', 'R', 'Power BI'],
      features: ['Cohorts', 'HIPAA-safe processing', 'Clinical dashboards'],
      outcomes: ['+8% throughput', 'Lower readmissions', 'Centralized quality metrics'],
      demo: '#',
      code: '#'
    },
    ecom: {
      title: 'E-commerce Analytics Suite',
      cat: 'Digital Analytics',
      desc: 'User behavior tracking and conversion optimization.',
      tags: ['GA', 'Python', 'Tableau'],
      features: ['Attribution modeling', 'Funnel drop-off', 'Marketing ROI dashboards'],
      outcomes: ['+12% conversion', '-18% CPA', 'Unified growth analytics layer'],
      demo: '#',
      code: '#'
    }
  };

  /* ----- Filters ----- */
  const chips = document.querySelectorAll('#projFilters .chip-pill');
  const cards = document.querySelectorAll('#projectsGrid .project-card');
  function applyFilter(cat) {
    chips.forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
    cards.forEach(card => {
      const ok = cat === 'all' || card.dataset.cat === cat;
      card.style.display = ok ? '' : 'none';
    });
  }
  chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.cat)));
  applyFilter('all');

  /* ----- Modal ----- */
  const modal = document.getElementById('projectModal');
  const mTitle = modal.querySelector('#modalTitle');
  const mDesc = modal.querySelector('.modal-desc');
  const mCat = modal.querySelector('.modal-cat');
  const mTags = modal.querySelector('.modal-tags');
  const mFeats = modal.querySelector('.modal-feats');
  const mOut = modal.querySelector('.modal-outcomes');
  const galleryImg = document.getElementById('modalGalleryImg');
  const prevBtn = modal.querySelector('.gallery-btn.prev');
  const nextBtn = modal.querySelector('.gallery-btn.next');
  const modalImg = document.getElementById('modalImg');
  const modalVideo = document.getElementById('modalVideo');

  let galleryImages = [];
  let galleryIndex = 0;

  function showGalleryImage() {
    galleryImg.src = galleryImages[galleryIndex];
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    showGalleryImage();
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    showGalleryImage();
  });


  


  function imgFrom(card, id) {
    // 1) Per-card override
    const override =
      card?.getAttribute('data-modal-img') ||
      card?.dataset?.modalImg ||
      '';
    if (override) return override;

    // 2) If you ever add an image path in dataMap[id].img
    const mapped = (dataMap[id] && dataMap[id].img) || '';
    if (mapped) return mapped;

    // 3) Thumbnail fallback
    const thumb = card?.querySelector('.p-thumb img')?.getAttribute('src') || '';
    return thumb;
  }

  function fillModal(id) {
  const card = document.querySelector(`.project-card[data-id="${id}"]`);
  const d = dataMap[id];
  if (!card || !d) return;

  mTitle.textContent = d.title;
  mDesc.textContent = d.desc;
  mCat.textContent = d.cat;

  mTags.innerHTML = d.tags.map(t => `<span class="tag violet">${t}</span>`).join(' ');
  mFeats.innerHTML = d.features.map(i => `<li>${i}</li>`).join('');
  mOut.innerHTML = d.outcomes.map(i => `<li>${i}</li>`).join('');

  if (card.dataset.modalImages) {
  galleryImages = card.dataset.modalImages
    .split(',')
    .map(img => img.trim());
} else if (card.dataset.modalImg) {
  galleryImages = [card.dataset.modalImg];
} else {
  const thumb = card.querySelector('.p-thumb img')?.src;
  galleryImages = thumb ? [thumb] : [];
}

galleryIndex = 0;
showGalleryImage();


  galleryIndex = 0;
  showGalleryImage();
}


  function openModal(id) {
    fillModal(id);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modal.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  modal.querySelector('.modal-close').addEventListener('click', closeModal);
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  cards.forEach(card =>
    card.addEventListener('click', () => openModal(card.dataset.id))
  );
})();


// === Contact page enhancements ===
(function () {
  const emailAddress = 'sejalsudrik@gmail.com';

  // Copy email to clipboard
  const copyBtn = document.getElementById('copyEmail');
  const emailText = document.getElementById('emailText');
  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', async () => {
      const text = (emailText.textContent || emailText.innerText || '').trim();
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = 'Copied!';
      } catch {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyBtn.textContent = 'Copied!';
      }
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });
  }

  // Mailto fallback submit (if you don't have a backend)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = (document.getElementById('cfName')?.value || '').trim();
      const from = (document.getElementById('cfEmail')?.value || '').trim();
      const subject =
        (document.getElementById('cfSubject')?.value || '').trim() ||
        `New message from ${name || 'Portfolio'}`;
      const message = (document.getElementById('cfMessage')?.value || '').trim();

      if (!message) {
        document.getElementById('cfMessage')?.focus();
        return;
      }

      const body =
`Name: ${name}
Email: ${from}

${message}`;

      const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
    });
  }
})();

// Mail button: try mailto; if blocked, fall back to Gmail web compose
(function () {
  const mailBtn = document.getElementById('mailBtn');
  if (!mailBtn) return;

  const to = 'sejalsudrik@gmail.com';

  mailBtn.addEventListener('click', () => {
    // allow the browser to try mailto normally.
    // If nothing happens after a short delay, open Gmail compose.
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}`;
        window.open(gmail, '_blank', 'noopener');
      }
    }, 400);
  });
})();


// === Contact form: mailto + Gmail fallback ===
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameEl    = document.getElementById('cfName');
  const emailEl   = document.getElementById('cfEmail');
  const subjEl    = document.getElementById('cfSubject');
  const msgEl     = document.getElementById('cfMessage');
  const consentEl = document.getElementById('cfConsent');
  const sendBtn   = document.getElementById('cfSend');

  const TO_EMAIL = 'sejalsudrik@gmail.com';

  // Disable send when consent is unchecked
  function syncBtn() {
    const disabled = !consentEl.checked;
    sendBtn.disabled = disabled;
  }
  consentEl.addEventListener('change', syncBtn);
  syncBtn();

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!consentEl.checked) {
      alert('Please consent to be contacted.');
      return;
    }
    if (!nameEl.value.trim() || !emailEl.value.trim() || !msgEl.value.trim()) {
      alert('Please fill in your name, email, and message.');
      return;
    }

    const subject = (subjEl.value.trim() || `Portfolio contact from ${nameEl.value.trim()}`);
    const body =
`Name: ${nameEl.value}
Email: ${emailEl.value}

${msgEl.value}`;

    const mailto = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Try system email client
    window.location.href = mailto;

    // If the tab stays visible (client not configured / blocked), open Gmail compose
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TO_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmail, '_blank', 'noopener');
      }
    }, 500);
  });
})();


// === Video hover preview on project cards (ONLY card thumbnails) ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-thumb video').forEach(video => {
    video.pause();
    video.currentTime = 0;

    const card = video.closest('.project-card');
    if (!card) return;

    card.addEventListener('mouseenter', () => {
      video.play();
    });

    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
});
