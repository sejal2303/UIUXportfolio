/* =========================================================
   Portfolio – main.js
   Handles: nav highlight, mobile hamburger menu, skills tabs,
   animated counters, project filters, project modal + gallery,
   contact form, footer year, small perf helpers.
========================================================= */

/* ---------- small helpers ---------- */
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/* ========= Header: active link highlight + footer year ========= */
(function () {
  const nav = document.querySelector('.nav');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  if (!nav) return;

  const bar = nav.querySelector('.active-bar');
  const links = [...nav.querySelectorAll('.nav-link')];

  function setBar(el) {
    if (!bar || !el) return;
    const r = el.getBoundingClientRect();
    const nr = nav.getBoundingClientRect();
    bar.style.width = r.width + 'px';
    bar.style.transform = `translateX(${r.left - nr.left}px)`;
  }

  function mark() {
    const file = location.pathname.split('/').pop() || 'index.html';
    const map = {
      'index.html': 'home',
      '': 'home',
      'about.html': 'about',
      'skills.html': 'skills',
      'experience.html': 'experience',
      'projects.html': 'projects',
      'contact.html': 'contact'
    };
    const active = map[file] || 'home';
    const el = links.find(a => a.dataset.active === active) || links[0];
    links.forEach(a => a.classList.toggle('is-active', a === el));
    setBar(el);
  }

  window.addEventListener('resize', debounce(mark, 120));
  window.addEventListener('load', mark);
  setTimeout(mark, 60);
})();

/* ========= Mobile hamburger navigation ========= */
(function () {
  const header = document.querySelector('.site-header');
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('.nav');
  if (!header || !hamburger || !nav) return;

  // Backdrop used to close the menu when tapping outside of it
  let backdrop = document.querySelector('.nav-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('data-nav-backdrop', '');
    document.body.appendChild(backdrop);
  }

  function openMenu() {
    nav.classList.add('open');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    nav.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('nav-open');
  }

  function toggleMenu() {
    if (nav.classList.contains('open')) closeMenu();
    else openMenu();
  }

  hamburger.addEventListener('click', toggleMenu);
  backdrop.addEventListener('click', closeMenu);

  // Close after selecting a nav link
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking anywhere outside the open nav / hamburger
  document.addEventListener('click', e => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || hamburger.contains(e.target)) return;
    closeMenu();
  });

  // Escape key closes the menu
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) closeMenu();
  });

  // Reset state if the viewport grows back to desktop size
  window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 900) closeMenu();
  }, 150));
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

  function animateMeters(panel) {
    panel.querySelectorAll('.meter span').forEach(s => {
      const val = getComputedStyle(s).getPropertyValue('--val').trim() || '0';
      s.style.width = '0';
      requestAnimationFrame(() => requestAnimationFrame(() => (s.style.width = val)));
    });
  }

  function showTab(key) {
    if (!panels[key]) key = 'tech';
    chips.forEach(b => {
      const active = b.dataset.tab === key;
      b.classList.toggle('active', active);
      b.setAttribute('aria-selected', String(active));
    });
    Object.keys(panels).forEach(k => {
      const p = panels[k];
      if (!p) return;
      if (k === key) {
        p.hidden = false;
        p.classList.add('show');
        animateMeters(p);
      } else {
        p.classList.remove('show');
        p.hidden = true;
        p.querySelectorAll('.meter span').forEach(s => (s.style.width = '0'));
      }
    });
  }

  chips.forEach(b => {
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => {
      showTab(b.dataset.tab);
      history.replaceState(null, '', `#${b.dataset.tab}`);
    });
    b.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showTab(b.dataset.tab);
      }
    });
  });

  const hash = location.hash.replace('#', '') || 'tech';
  showTab(panels[hash] ? hash : 'tech');

  // Animated counters (only once each, when scrolled into view)
  const counters = document.querySelectorAll('.count');
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target;
          const end = parseFloat(el.dataset.to || '0');
          const isDecimal = String(el.dataset.to || '').includes('.');
          let n = 0;
          const steps = 40;
          const inc = end / steps;
          const tick = () => {
            n += inc;
            if (n >= end) n = end;
            el.textContent = isDecimal ? n.toFixed(1) : Math.ceil(n);
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

/* ========= Projects page: filters + modal + gallery ========= */
(function () {
  const onProjects = /projects\.html$/.test(location.pathname);
  if (!onProjects) return;

  /* Text content shown inside the modal for each project id.
     Image galleries are read directly from each card's
     data-modal-images / data-modal-img attribute in the HTML. */
  const dataMap = {
    supply: {
      title: 'Web3 Learning Platform (Web & Mobile)',
      cat: 'UI/UX Design · Multi-Page SaaS UI · Web & Mobile',
      desc: 'This project showcases a user-centered Web3 education platform designed with clear user flows, modular course structure, and progress tracking. Emphasis was placed on accessibility, clarity, and reducing cognitive load for beginners.',
      tags: ['Figma', 'Adobe Illustrator', 'Canva'],
      features: ['Responsive UI for desktop and mobile', 'Dark-themed, scalable design system', 'Reusable UI components for consistency'],
      outcomes: ['Improved learning clarity and navigation', 'Faster design scalability and iteration', 'Better user engagement with courses']
    },
    health: {
      title: 'Movie Ticket Booking App – Mobile UI/UX',
      cat: 'UI/UX Design · Mobile App · User Flow',
      desc: 'A dark-themed movie booking app crafted for immersive exploration and effortless booking. Optimized interactions help users book tickets quickly, even in low-light environments.',
      tags: ['Figma', 'Photoshop', 'Canva'],
      features: ['Interactive seat selection flow', 'QR-based mobile ticket access', 'Dark UI for low-light use'],
      outcomes: ['Faster booking flow with fewer user actions', 'Enhanced usability in low light', 'Faster ticket access']
    },
    ecom: {
      title: 'SkyFly – Flight Booking Mobile App | UI/UX Design',
      cat: 'UI/UX Design · Mobile App · User Flow',
      desc: 'End-to-end flight booking experience with intuitive search, seat selection, and streamlined booking workflows, taken from low-fidelity wireframes through to high-fidelity screens.',
      tags: ['Figma', 'Photoshop', 'Mobile UI/UX'],
      features: ['Flight search & filtering', 'Interactive seat selection', 'Passenger details management', 'Secure payment workflow', 'Booking confirmation', 'Reusable design system'],
      outcomes: ['Improved booking flow usability', 'Simplified multi-step interactions', 'Consistent mobile user experience', 'Scalable UI component system']
    },
    home_rent: {
      title: 'NFT Art Collection',
      cat: 'NFT Design · Digital Illustration · Character Design',
      desc: 'Designed an original character-based NFT artwork focused on visual storytelling and brand appeal. The design combines expressive illustration, vibrant colors, and scalable composition suitable for digital collectibles and merchandise.',
      tags: ['Adobe Illustrator', 'Canva', 'Procreate'],
      features: [
        'Original NFT character with playful, expressive detailing',
        'Clean color palette and gradients for depth and clarity',
        'Scalable design optimized for badges, collectibles, and branding'
      ],
      outcomes: ['Created a distinctive visual identity with strong engagement appeal', 'Delivered versatile artwork adaptable across multiple digital platforms']
    },
    retail: {
      title: 'Brand Identity Design',
      cat: 'Logo Design · Brand Identity · Visual Identity',
      desc: 'Complete brand identity system for a tech startup including logo, color palette, and brand guidelines, focused on motion, energy, and recognizability across platforms.',
      tags: ['Adobe Illustrator', 'Canva'],
      features: ['Multiple logo variations exploring form, motion, and color', 'Cohesive color and typography system', 'Scalable design adaptable for digital, print, and event branding'],
      outcomes: ['Established a strong and recognizable brand identity', 'Improved visual consistency across marketing materials', 'Created a flexible logo system suitable for long-term use']
    },
    sales: {
      title: 'Social Media Campaign',
      cat: 'Social Media Design',
      desc: 'Multi-platform social media campaign focused on visual storytelling, motion design, and audience engagement.',
      tags: ['Figma', 'Canva', 'After Effects', 'Photoshop'],
      features: ['Short-form video creatives', 'Platform-specific visual design', 'Motion graphics & branding'],
      outcomes: ['+300% engagement growth', 'Higher reach across platforms', 'Consistent brand identity']
    }
  };

  /* ----- Filters ----- */
  const chips = document.querySelectorAll('#projFilters .chip-pill');
  const cards = [...document.querySelectorAll('#projectsGrid .project-card')];

  function applyFilter(cat) {
    chips.forEach(c => c.classList.toggle('active', c.dataset.cat === cat));
    cards.forEach(card => {
      const ok = cat === 'all' || card.dataset.cat === cat;
      card.style.display = ok ? '' : 'none';
    });
  }
  chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.cat)));
  applyFilter('all');

  /* ----- Modal + gallery ----- */
  const modal = document.getElementById('projectModal');
  if (!modal) return;

  const mTitle = modal.querySelector('#modalTitle');
  const mDesc = modal.querySelector('.modal-desc');
  const mCat = modal.querySelector('.modal-cat');
  const mTags = modal.querySelector('.modal-tags');
  const mFeats = modal.querySelector('.modal-feats');
  const mOut = modal.querySelector('.modal-outcomes');
  const thumbFigure = modal.querySelector('.modal-thumb');
  const galleryImg = document.getElementById('modalGalleryImg');
  const prevBtn = modal.querySelector('.gallery-btn.prev');
  const nextBtn = modal.querySelector('.gallery-btn.next');

  // Loading spinner + counter, created once and reused
  const loadingEl = document.createElement('div');
  loadingEl.className = 'gallery-loading hidden';
  thumbFigure.appendChild(loadingEl);

  const counterEl = document.createElement('div');
  counterEl.className = 'gallery-counter';
  thumbFigure.appendChild(counterEl);

  let galleryImages = [];
  let galleryIndex = 0;
  let lastFocused = null;
  const preloaded = new Map();

  function preload(src) {
    if (!src || preloaded.has(src)) return;
    const im = new Image();
    im.src = src;
    preloaded.set(src, im);
  }

  function preloadNeighbors() {
    const next = galleryImages[(galleryIndex + 1) % galleryImages.length];
    const prev = galleryImages[(galleryIndex - 1 + galleryImages.length) % galleryImages.length];
    preload(next);
    preload(prev);
  }

  function updateArrowsAndCounter() {
    const multi = galleryImages.length > 1;
    prevBtn.classList.toggle('hidden', !multi);
    nextBtn.classList.toggle('hidden', !multi);
    counterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
    counterEl.style.display = multi ? '' : 'none';
  }

  function showGalleryImage() {
    const src = galleryImages[galleryIndex];
    if (!src) return;

    galleryImg.classList.remove('loaded');
    loadingEl.classList.remove('hidden');
    thumbFigure.classList.remove('portrait');

    const finish = () => {
      loadingEl.classList.add('hidden');
      galleryImg.classList.add('loaded');
      if (galleryImg.naturalHeight > galleryImg.naturalWidth * 1.15) {
        thumbFigure.classList.add('portrait');
      }
    };

    if (preloaded.has(src) && preloaded.get(src).complete) {
      galleryImg.src = src;
      finish();
    } else {
      galleryImg.onload = finish;
      galleryImg.onerror = () => loadingEl.classList.add('hidden');
      galleryImg.src = src;
    }

    updateArrowsAndCounter();
    preloadNeighbors();
  }

  function goPrev() {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    showGalleryImage();
  }
  function goNext() {
    if (!galleryImages.length) return;
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    showGalleryImage();
  }

  prevBtn.addEventListener('click', e => { e.stopPropagation(); goPrev(); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); goNext(); });

  // Touch swipe support
  let touchStartX = 0;
  thumbFigure.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  thumbFigure.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) goPrev(); else goNext();
  }, { passive: true });

  function galleryFromCard(card) {
    if (card.dataset.modalImages) {
      return card.dataset.modalImages
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    if (card.dataset.modalImg) return [card.dataset.modalImg.trim()];
    const thumb = card.querySelector('.p-thumb img')?.getAttribute('src');
    return thumb ? [thumb] : [];
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

    // Deduplicate consecutive/repeated entries (fixes bugs like a single
    // image being referenced many times in a row) while preserving order.
    const raw = galleryFromCard(card);
    galleryImages = raw.filter((src, i) => raw.indexOf(src) === i);
    galleryIndex = 0;

    // warm the cache for every image in this gallery
    galleryImages.forEach(preload);

    showGalleryImage();
  }

  function openModal(id, trigger) {
    lastFocused = trigger || document.activeElement;
    fillModal(id);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close')?.focus();
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  modal.addEventListener('click', e => {
    if (e.target.hasAttribute('data-close')) closeModal();
  });
  modal.querySelector('.modal-close').addEventListener('click', closeModal);

  window.addEventListener('keydown', e => {
    if (!modal.classList.contains('show')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') goPrev();
    if (e.key === 'ArrowRight') goNext();
  });

  cards.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => openModal(card.dataset.id, card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.id, card);
      }
    });
  });
})();

/* ========= Contact page: copy email + mailto/Gmail submit ========= */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const TO_EMAIL = 'sejalsudrik@gmail.com';

  const copyBtn = document.getElementById('copyEmail');
  const emailText = document.getElementById('emailText');
  if (copyBtn && emailText) {
    copyBtn.addEventListener('click', async () => {
      const text = (emailText.textContent || '').trim();
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
    });
  }

  const nameEl = document.getElementById('cfName');
  const emailEl = document.getElementById('cfEmail');
  const subjEl = document.getElementById('cfSubject');
  const msgEl = document.getElementById('cfMessage');
  const consentEl = document.getElementById('cfConsent');
  const sendBtn = document.getElementById('cfSend');
  const toast = document.getElementById('toast');

  function syncBtn() {
    if (sendBtn && consentEl) sendBtn.disabled = !consentEl.checked;
  }
  if (consentEl) {
    consentEl.addEventListener('change', syncBtn);
    syncBtn();
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    if (consentEl && !consentEl.checked) {
      showToast('Please consent to be contacted.');
      return;
    }
    if (!nameEl.value.trim() || !emailEl.value.trim() || !msgEl.value.trim()) {
      showToast('Please fill in your name, email, and message.');
      return;
    }

    const subject = subjEl.value.trim() || `Portfolio contact from ${nameEl.value.trim()}`;
    const body = `Name: ${nameEl.value}\nEmail: ${emailEl.value}\n\n${msgEl.value}`;

    const mailto = `mailto:${TO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(TO_EMAIL)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmail, '_blank', 'noopener');
      }
    }, 500);

    showToast('Opening your email client…');
  });
})();

/* ========= Optional: video hover preview on any project card ========= */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-thumb video').forEach(video => {
    video.pause();
    video.currentTime = 0;

    const card = video.closest('.project-card');
    if (!card) return;

    card.addEventListener('mouseenter', () => video.play().catch(() => {}));
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  // Lazy-load every content image that doesn't already opt out
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
    if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
  });
});
