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
  // Nessuna copia dei messaggi a terzi: il modulo recapita SOLO alla casella della parrocchia.
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
     Chip temporanei ("dall'11 ottobre"): spariscono da soli a data raggiunta
     ========================================================= */
  function initUntil() {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    $$('[data-until]').forEach(function (el) {
      var d = new Date(el.getAttribute('data-until') + 'T00:00:00');
      if (!isNaN(d) && today > d) el.classList.add('is-past');
    });
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
        message: (form.message && form.message.value || '').trim()
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
        var parts = val ? val.querySelectorAll('.ib-part') : [];
        var txt = parts.length ? [].map.call(parts, function (p) { return p.textContent; }).join('') : ((val && val.textContent) || '');
        var iban = txt.replace(/\s+/g, '').trim();
        cp.classList.add('copied'); setTimeout(function () { cp.classList.remove('copied'); }, 2200);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(iban).then(function () { toast(en ? 'IBAN copied' : 'IBAN copiato'); })
            .catch(function () { toast(iban); });
        } else { toast(iban); }
      });
    });
  }

  /* =========================================================
     10. Condividi ([data-share-url]): condivisione nativa o copia del link
     ========================================================= */
  function initShare() {
    $$('[data-share-url]').forEach(function (b) {
      b.addEventListener('click', function () {
        var en = document.documentElement.lang === 'en';
        var url = b.getAttribute('data-share-url'), title = b.getAttribute('data-share-title') || document.title;
        if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(function () { toast(en ? 'Link copied — paste it where you like' : 'Link copiato: incollalo dove vuoi'); });
        } else { toast(url); }
      });
    });
  }

  /* ---------- Condivisione degli avvisi (Fede e vita): WhatsApp, Facebook, Instagram, copia link ----------
     Il link condiviso è la pagina ponte /avviso/<id>.html (anteprima dedicata), che rimanda all'avviso. */
  function initShareBars() {
    var bars = $$('[data-share-bar]');
    if (!bars.length) return;
    var isEn = function () { return document.documentElement.lang === 'en'; };
    var mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.platform));
    function legacyCopy(text) {
      return new Promise(function (ok, ko) {
        var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-100px;opacity:0'; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy') ? ok() : ko(); } catch (e) { ko(e); } document.body.removeChild(ta);
      });
    }
    function copy(text) {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(function () { return legacyCopy(text); });
      return legacyCopy(text);
    }
    function flash(btn) { btn.classList.add('done'); setTimeout(function () { btn.classList.remove('done'); }, 1800); }
    bars.forEach(function (bar) {
      var d = bar.dataset, file = null, loading = null;
      var title = function () { return isEn() ? d.titleEn : d.titleIt; };
      var when = function () { return isEn() ? d.whenEn : d.whenIt; };
      // la locandina viene preparata in anticipo: la condivisione nativa deve partire subito dal tocco
      function prep() {
        if (loading || !window.fetch || !window.File) return loading;
        loading = fetch(d.img).then(function (r) { return r.blob(); })
          .then(function (b) { file = new File([b], d.file, { type: 'image/jpeg' }); return file; })
          .catch(function () { loading = null; });
        return loading;
      }
      var ig = $('[data-sh="ig"]', bar);
      ['pointerenter', 'touchstart', 'focus'].forEach(function (ev) { ig.addEventListener(ev, prep, { passive: true, once: true }); });
      if ('IntersectionObserver' in window && mobile) {
        var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { prep(); io.disconnect(); } }, { rootMargin: '200px' });
        io.observe(bar);
      }
      bar.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-sh]'); if (!btn) return;
        var kind = btn.dataset.sh, url = d.url;
        if (kind === 'wa') {
          btn.href = 'https://wa.me/?text=' + encodeURIComponent('*' + title() + '*\n' + when() + '\n\n' + url);
          return; // il link si apre da sé
        }
        if (kind === 'fb') {
          if (!mobile) { e.preventDefault(); window.open(btn.href, 'fbshare', 'width=620,height=560,noopener'); }
          return;
        }
        e.preventDefault();
        if (kind === 'link') {
          copy(url).then(function () { flash(btn); toast(isEn() ? 'Link copied' : 'Link copiato'); }, function () { toast(url); });
          return;
        }
        // Instagram: non esiste un link di condivisione web. Dal telefono si apre il menu di sistema con la
        // locandina (Storia, Post o Direct); dal computer si scarica la locandina e si copia il link.
        var text = title() + ' — ' + url;
        if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
          copy(url).catch(function () {});
          navigator.share({ files: [file], title: title(), text: text }).catch(function () {});
          return;
        }
        if (mobile && navigator.share && !file) {
          prep(); navigator.share({ title: title(), text: text, url: url }).catch(function () {});
          return;
        }
        var save = function (f) {
          var a = document.createElement('a'), u = URL.createObjectURL(f); a.href = u; a.download = d.file;
          document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
        };
        if (file) save(file); else { var pr = prep(); if (pr) pr.then(function (f) { if (f) save(f); }); }
        copy(url).catch(function () {});
        flash(btn);
        toast(isEn() ? 'Poster downloaded and link copied: post it on Instagram from your phone'
                     : 'Locandina scaricata e link copiato: pubblicala su Instagram dal telefono');
      });
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initLang(); initHeader(); initReveal(); initCookies(); initYear(); initForm(); initVideo(); initCopyIban(); initShare(); initShareBars(); initUntil();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
