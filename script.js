/* =============================================
   CLÍNICA DRA. YESSENIA AJÚ — SCRIPT.JS
   Interactividad: navbar, scroll, animaciones, formulario
   ============================================= */

'use strict';

/* ─── NAVBAR ─────────────────────────────────── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navMenu  = document.getElementById('navMenu');
  const navLinks = navMenu ? navMenu.querySelectorAll('a') : [];

  // Scroll: add .scrolled class
  function onScroll() {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Toggle mobile menu
  function setMenuOpen(open) {
    if (!toggle || !navMenu) return;
    toggle.setAttribute('aria-expanded', String(open));
    navMenu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isOpen);
    });
  }

  // Close menu on link click
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      setMenuOpen(false);
    });
  });

  // Close menu on outside click
  document.addEventListener('click', function (e) {
    if (
      navMenu &&
      navMenu.classList.contains('open') &&
      !navMenu.contains(e.target) &&
      toggle &&
      !toggle.contains(e.target)
    ) {
      setMenuOpen(false);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenuOpen(false);
  });
})();


/* ─── ACTIVE NAV LINK (INTERSECTION) ─────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__links a[href^="#"]');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(function (link) {
            const isActive = link.getAttribute('href') === '#' + id;
            link.style.color = isActive ? 'var(--pink)' : '';
            link.style.background = isActive ? 'var(--pink-light)' : '';
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );

  sections.forEach(function (s) { observer.observe(s); });
})();


/* ─── SCROLL REVEAL ──────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry, idx) {
        if (entry.isIntersecting) {
          // Stagger siblings in same parent
          const siblings = Array.from(
            entry.target.parentElement
              ? entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')
              : []
          );
          const delay = siblings.indexOf(entry.target);
          const ms = Math.max(0, delay * 80);

          setTimeout(function () {
            entry.target.classList.add('visible');
          }, ms);

          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) { observer.observe(el); });
})();


/* ─── SMOOTH SCROLL FOR ANCHOR LINKS ─────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
})();


/* ─── CONTACT FORM VALIDATION ────────────────── */
(function initContactForm() {
  const form       = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  if (!form) return;

  const fields = {
    name:    { el: document.getElementById('name'),    error: document.getElementById('nameError'),    validate: v => v.trim().length >= 2 ? '' : 'Por favor ingresa tu nombre completo.' },
    email:   { el: document.getElementById('email'),   error: document.getElementById('emailError'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Ingresa un correo electrónico válido.' },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError'), validate: v => v.trim().length >= 10 ? '' : 'El mensaje debe tener al menos 10 caracteres.' },
  };

  function validateField(key) {
    const { el, error, validate } = fields[key];
    if (!el) return true;
    const msg = validate(el.value);
    if (error) error.textContent = msg;
    el.classList.toggle('error', !!msg);
    return !msg;
  }

  // Real-time validation on blur
  Object.keys(fields).forEach(function (key) {
    const el = fields[key].el;
    if (!el) return;
    el.addEventListener('blur', function () { validateField(key); });
    el.addEventListener('input', function () {
      if (el.classList.contains('error')) validateField(key);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let allValid = true;
    Object.keys(fields).forEach(function (key) {
      if (!validateField(key)) allValid = false;
    });

    if (!allValid) return;

    // Build WhatsApp message
    const nameVal    = fields.name.el    ? fields.name.el.value.trim()    : '';
    const emailVal   = fields.email.el   ? fields.email.el.value.trim()   : '';
    const phoneEl    = document.getElementById('phone');
    const phoneVal   = phoneEl           ? phoneEl.value.trim()           : '';
    const messageVal = fields.message.el ? fields.message.el.value.trim() : '';

    const waText = encodeURIComponent(
      `Hola Dra. Yessenia, mi nombre es ${nameVal}.` +
      (phoneVal   ? ` Mi teléfono es ${phoneVal}.` : '') +
      (emailVal   ? ` Mi correo es ${emailVal}.`   : '') +
      ` ${messageVal}`
    );

    // Show success
    if (successBox) {
      successBox.hidden = false;
      successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Reset form
    form.reset();
    Object.keys(fields).forEach(function (key) {
      const el = fields[key].el;
      if (el) el.classList.remove('error');
    });

    // Open WhatsApp after brief delay
    setTimeout(function () {
      window.open('https://wa.me/50249650279?text=' + waText, '_blank', 'noopener,noreferrer');
    }, 600);

    // Hide success after 6s
    setTimeout(function () {
      if (successBox) successBox.hidden = true;
    }, 6000);
  });
})();


/* ─── WHATSAPP FAB VISIBILITY ────────────────── */
(function initFAB() {
  const fab = document.querySelector('.whatsapp-fab');
  if (!fab) return;

  let lastScroll = 0;
  let hideTimer  = null;

  window.addEventListener('scroll', function () {
    const cur = window.scrollY;
    const scrollingUp = cur < lastScroll;
    lastScroll = cur;

    // Always visible past 400px; animate in on scroll-up
    if (cur > 400) {
      fab.style.opacity = '1';
      fab.style.pointerEvents = 'all';
      fab.style.transform = scrollingUp ? 'scale(1.08)' : '';
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        fab.style.transform = '';
      }, 300);
    } else {
      fab.style.opacity = cur > 100 ? '1' : '0';
      fab.style.pointerEvents = cur > 100 ? 'all' : 'none';
    }
  }, { passive: true });
})();


/* ─── HERO STATS COUNTER ─────────────────────── */
(function initCounters() {
  const stats = document.querySelectorAll('.stat__num');
  if (!stats.length) return;

  function animateCount(el, target, suffix, duration) {
    const start    = performance.now();
    const isPlus   = suffix.includes('+');
    const isStar   = suffix.includes('★');
    const numTarget = parseInt(target, 10);

    function frame(time) {
      const elapsed  = time - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const current  = Math.round(ease * numTarget);

      if (isStar) {
        el.textContent = target + '★';
      } else if (isPlus) {
        el.textContent = '+' + current;
      } else {
        el.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el   = entry.target;
        const text = el.textContent.trim();

        if (text.startsWith('+')) {
          animateCount(el, text.replace('+', ''), '+', 1200);
        } else if (text.endsWith('★')) {
          // static, just render
        } else {
          animateCount(el, text, '', 900);
        }
        observer.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach(function (s) { observer.observe(s); });
})();
