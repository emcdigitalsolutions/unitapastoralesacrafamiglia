/* =============================================================
   Unità Pastorale Sacra Famiglia — main.js
   i18n IT/EN · header · nav mobile · reveal · cookie + maps gating
   · Consent Mode v2 · form contatti  ·  EMC Digital Solutions
   ============================================================= */
(function () {
  'use strict';

  /* ---------- Config ---------- */
  var CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxLCgN0-mHN86Dk37a5m-p2A3DgMjc8b__aCO_9oBA_amLUn5MlipebKalo5qNIoSWl/exec';
  var SITE_KEY = 'unitapastorale';
  var CC_EMAIL = 'emcdigitalsolution@gmail.com';
  var CONSENT_KEY = 'ups-cookie-consent';   // 'all' | 'necessary'
  var LANG_KEY = 'emc-lang';                 // chiave condivisa siti EMC
  var GA_ID = '';                            // impostare G-XXXXXXXXXX quando disponibile

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* =========================================================
     1. Lingua IT / EN
     ========================================================= */
  function applyLang(lang) {
    lang = (lang === 'en') ? 'en' : 'it';
    document.documentElement.lang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    $$('.lang-toggle button').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang);
    });
    // Attributi bilingui (placeholder, aria-label, ecc.)
    $$('[data-ph-it]').forEach(function (el) {
      el.setAttribute('placeholder', el.getAttribute('data-ph-' + lang) || el.getAttribute('data-ph-it'));
    });
    $$('[data-aria-it]').forEach(function (el) {
      el.setAttribute('aria-label', el.getAttribute('data-aria-' + lang) || el.getAttribute('data-aria-it'));
    });
  }
  function initLang() {
    var saved;
    try { saved = localStorage.getItem(LANG_KEY); } catch (e) {}
    applyLang(saved || document.documentElement.lang || 'it');
    $$('.lang-toggle button').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
    });
  }

  /* =========================================================
     2. Header scrolled + nav mobile + active link
     ========================================================= */
  function initHeader() {
    var header = $('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    var toggle = $('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
        var open = document.body.classList.contains('nav-open');
        toggle.setAttribute('aria-expanded', open);
      });
      $$('.nav.mobile a').forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Active link
    var path = location.pathname.split('/').pop() || 'index.html';
    $$('.nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === path || (path === 'index.html' && (href === './' || href === 'index.html'))) {
        a.classList.add('active');
      }
    });
  }

  /* =========================================================
     3. Scroll reveal
     ========================================================= */
  function initReveal() {
    var els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || !els.length) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* =========================================================
     4. Consent Mode v2 + Cookie banner + Google Maps gating
     ========================================================= */
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'granted',
    security_storage: 'granted', wait_for_update: 500
  });

  function loadGA() {
    if (!GA_ID) return;
    if (document.getElementById('ga-lib')) return;
    var s = document.createElement('script');
    s.id = 'ga-lib'; s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function loadMaps() {
    $$('.map[data-src]').forEach(function (f) {
      if (!f.getAttribute('src')) f.setAttribute('src', f.getAttribute('data-src'));
      var w = f.closest('.map-wrap'); if (w) w.classList.add('loaded');
    });
  }

  function grantAll() {
    gtag('consent', 'update', {
      ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted',
      analytics_storage: 'granted'
    });
    loadGA(); loadMaps();
  }

  function initCookies() {
    var banner = $('.cookie-banner');
    var stored;
    try { stored = localStorage.getItem(CONSENT_KEY); } catch (e) {}

    if (stored === 'all') { grantAll(); }
    else if (!stored && banner) { setTimeout(function () { banner.classList.add('show'); }, 900); }

    function choose(v) {
      try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
      if (banner) banner.classList.remove('show');
      if (v === 'all') grantAll();
    }
    window.__upsChoose = choose;
    $$('[data-cookie="all"]').forEach(function (b) { b.addEventListener('click', function () { choose('all'); }); });
    $$('[data-cookie="necessary"]').forEach(function (b) { b.addEventListener('click', function () { choose('necessary'); }); });
    // "Mostra la mappa" carica le mappe (consenso puntuale) senza cambiare la scelta globale
    $$('[data-load-maps]').forEach(function (b) { b.addEventListener('click', loadMaps); });
  }

  /* =========================================================
     5. Footer year
     ========================================================= */
  function initYear() {
    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* =========================================================
     6. Toast
     ========================================================= */
  function toast(msg) {
    var t = $('.toast');
    if (!t) {
      t = document.createElement('div'); t.className = 'toast';
      t.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg><span></span>';
      document.body.appendChild(t);
    }
    t.querySelector('span').textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 5000);
  }
  window.upsToast = toast;

  /* =========================================================
     7. Form contatti (handler isolato + no-cors + toast)
     ========================================================= */
  function initForm() {
    var form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var en = document.documentElement.lang === 'en';
      var privacy = form.querySelector('[name="privacy"]');
      if (privacy && !privacy.checked) {
        toast(en ? 'Please accept the Privacy Policy.' : 'Accetta la Privacy Policy per procedere.');
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      var orig = btn ? btn.innerHTML : '';
      if (btn) { btn.disabled = true; btn.innerHTML = en ? 'Sending…' : 'Invio in corso…'; }

      var payload = {
        site: SITE_KEY,
        name: (form.name && form.name.value || '').trim(),
        email: (form.email && form.email.value || '').trim(),
        phone: (form.phone && form.phone.value || '').trim(),
        message: (form.message && form.message.value || '').trim(),
        cc: CC_EMAIL
      };

      fetch(CONTACT_ENDPOINT, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).then(function () {
        form.reset();
        toast(en ? 'Message sent. Thank you!' : 'Messaggio inviato. Grazie!');
      }).catch(function () {
        toast(en ? 'Error — please email us directly.' : 'Errore — scrivici via email.');
      }).finally(function () {
        if (btn) { btn.disabled = false; btn.innerHTML = orig; }
      });
    });
  }

  /* =========================================================
     8. Video YouTube (facade privacy)
     L'iframe (youtube-nocookie) si carica SOLO quando l'utente preme play:
     prima di allora nessuna richiesta a Google. I capitoli [data-yt-seek]
     avviano il video dal secondo indicato.
     ========================================================= */
  function initVideo() {
    function play(box, start) {
      if (!box) return;
      var id = box.getAttribute('data-yt');
      var src = 'https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1&playsinline=1' + (start ? '&start=' + start : '');
      var f = box.querySelector('iframe');
      if (!f) {
        f = document.createElement('iframe');
        f.title = box.getAttribute('data-yt-title') || 'Video';
        f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        f.allowFullscreen = true;
        box.appendChild(f);
      }
      f.src = src;
      box.classList.add('playing');
      var card = box.closest('.yt-card'); if (card) card.classList.add('playing');
    }
    $$('.yt[data-yt]').forEach(function (box) {
      var b = box.querySelector('.yt-poster');
      if (b) b.addEventListener('click', function () { play(box, 0); });
    });
    $$('[data-yt-seek]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var box = document.getElementById(btn.getAttribute('data-yt-target'));
        play(box, parseInt(btn.getAttribute('data-yt-seek'), 10) || 0);
        $$('[data-yt-seek].active').forEach(function (a) { a.classList.remove('active'); });
        if (btn.closest('.chapters')) btn.classList.add('active');
        var r = box.getBoundingClientRect();
        if (r.top < 70 || r.bottom > window.innerHeight) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }

  /* =========================================================
     9. Copia IBAN (pulsanti [data-copy-iban] dentro .iban-box)
     ========================================================= */
  function initCopyIban() {
    $$('[data-copy-iban]').forEach(function (cp) {
      cp.addEventListener('click', function () {
        var en = document.documentElement.lang === 'en';
        var box = cp.closest('.iban-box');
        var val = box && box.querySelector('.iban-val');
        var iban = ((val && val.textContent) || '').replace(/\s+/g, '').trim();
        if (navigator.clipboard) {
          navigator.clipboard.writeText(iban).then(function () { toast(en ? 'IBAN copied' : 'IBAN copiato'); })
            .catch(function () { toast(iban); });
        } else { toast(iban); }
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLang(); initHeader(); initReveal(); initCookies(); initYear(); initForm(); initVideo(); initCopyIban();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
