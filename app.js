/* ============================================================
   APP.JS — Router hash-based, state globale, localStorage
   ============================================================ */

(function () {
  'use strict';

  /* ---------- localStorage utils ---------- */

  function save(key, val) {
    try {
      localStorage.setItem('simracing_' + key, JSON.stringify(val));
    } catch (e) { /* storage full or private mode */ }
    /* Quando cambia il profilo, aggiorna l'intestazione sidebar (avatar + tag). */
    if (key === 'profile') renderBrand();
  }

  function load(key, def) {
    try {
      var raw = localStorage.getItem('simracing_' + key);
      return raw !== null ? JSON.parse(raw) : def;
    } catch (e) {
      return def;
    }
  }

  /* ---------- Stato globale ---------- */

  var STATE = {
    progress: load('progress', {}),
    notebook: load('notebook', { ffb: [], sessions: [], setups: [] }),
    settings: load('settings', {}),
    license: load('license', { key: null, valid: false, trialStart: null })
  };

  /* ============================================================
     LICENZA PRO — firma asimmetrica ECDSA P-256 (Web Crypto)
     ------------------------------------------------------------
     La verifica è OFFLINE: la chiave pubblica è embedded qui sotto,
     così l'app può validare una license key senza backend. La firma
     impedisce di *forgiare* una key valida; NON impedisce di patchare
     questo JS in chiaro. È quindi "soft gating" a bassa frizione, non
     DRM (vedi LICENSING.md).

     Formato key:  base64url(payloadJSON) "." base64url(firma)
     payload:      { name:<racing tag>, product:'sra', v:1 }
     ============================================================ */

  /* SPKI (base64) della chiave pubblica. Generata con tools/keygen.mjs.
     Coppia di PRODUZIONE (generata 2026-06-24). La privata corrispondente è
     conservata fuori dal repo (SECRETS.local.md / gestore password) e serve
     solo a firmare le license key. NON rigenerare le chiavi: invaliderebbe
     tutte le key già emesse (vedi LICENSING.md). */
  var PUBLIC_KEY_SPKI = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErIS4WqJ/DoROY6wVc7+izfqq1iFqao1IlKAtwUbpg4DhV18f72rEb6slavJcM7caZmEizzske8eQlgKSWagQbg==';

  var TRIAL_MS = 7 * 24 * 60 * 60 * 1000;

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  function b64urlToBytes(b64url) {
    var b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    return b64ToBytes(b64);
  }

  /* Verifica una license key. Restituisce una Promise<{ok, name?}>.
     Controlla firma + product 'sra' + che il name corrisponda al racing
     tag del profilo (anti-condivisione soft). */
  function verifyKey(key) {
    if (!key || typeof key !== 'string' || key.indexOf('.') === -1) {
      return Promise.resolve({ ok: false });
    }
    if (!(window.crypto && window.crypto.subtle)) {
      return Promise.resolve({ ok: false });
    }
    var parts = key.split('.');
    var payloadBytes, payload, sigBytes;
    try {
      payloadBytes = b64urlToBytes(parts[0]);
      sigBytes = b64urlToBytes(parts[1]);
      payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    } catch (e) {
      return Promise.resolve({ ok: false });
    }
    if (!payload || payload.product !== 'sra') {
      return Promise.resolve({ ok: false });
    }
    return crypto.subtle.importKey(
      'spki', b64ToBytes(PUBLIC_KEY_SPKI),
      { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
    ).then(function (pub) {
      return crypto.subtle.verify(
        { name: 'ECDSA', hash: 'SHA-256' }, pub, sigBytes, payloadBytes
      );
    }).then(function (valid) {
      if (!valid) return { ok: false };
      /* Lega la key al racing tag del profilo, se impostato. */
      var prof = load('profile', null);
      var tag = (prof && prof.identity && prof.identity.tag || '').trim();
      if (tag && payload.name && payload.name !== tag) {
        return { ok: false, reason: 'tag' };
      }
      return { ok: true, name: payload.name };
    }).catch(function () {
      return { ok: false };
    });
  }

  function trialActive() {
    var t = STATE.license.trialStart;
    return !!t && (Date.now() - t) < TRIAL_MS;
  }

  function trialDaysLeft() {
    if (!trialActive()) return 0;
    return Math.ceil((TRIAL_MS - (Date.now() - STATE.license.trialStart)) / 86400000);
  }

  /* Lettura sincrona usata in tutti i render. */
  function isPro() {
    return STATE.license.valid || trialActive();
  }

  function startTrial() {
    if (!STATE.license.trialStart) {
      STATE.license.trialStart = Date.now();
      save('license', STATE.license);
    }
    refreshProMarkers();
    return trialActive();
  }

  /* Attiva una license key: verifica async, persiste solo se valida. */
  function activateLicense(key) {
    key = (key || '').trim();
    return verifyKey(key).then(function (res) {
      if (res.ok) {
        STATE.license.key = key;
        STATE.license.valid = true;
        save('license', STATE.license);
        refreshProMarkers();
        return { ok: true, name: res.name };
      }
      return { ok: false, error: res.reason === 'tag'
        ? 'Questa key è intestata a un altro racing tag.'
        : 'Key non valida.' };
    });
  }

  function licenseInfo() {
    var prof = load('profile', null);
    var tag = (prof && prof.identity && prof.identity.tag) || null;
    return {
      valid: STATE.license.valid,
      trialActive: trialActive(),
      trialDaysLeft: trialDaysLeft(),
      name: tag
    };
  }

  /* Aggiorna i marcatori PRO globali (voce nav) dopo un cambio di stato. */
  function refreshProMarkers() {
    buildNav();
    var current = location.hash.slice(1) || 'profilo';
    document.querySelectorAll('#nav-list li').forEach(function (li) {
      li.classList.toggle('active', li.dataset.id === current);
    });
  }

  /* ---------- Paywall UI riusabile ---------- */

  /* Blocco-teaser inline: sostituisce il contenuto gated con una CTA. */
  function paywallCardHTML(msg) {
    return '<div class="paywall-gate">' +
      '<span class="paywall-badge">PRO</span>' +
      '<p class="paywall-msg">' + (msg || 'Questo contenuto fa parte della versione PRO.') + '</p>' +
      '<a href="#buy" class="btn">Sblocca PRO</a>' +
    '</div>';
  }

  /* Overlay modale accessibile per i blocchi "hard" (es. tab lock). */
  function showPaywallModal(msg) {
    var existing = document.getElementById('paywall-modal');
    if (existing) existing.remove();

    var prevFocus = document.activeElement;
    var wrap = document.createElement('div');
    wrap.id = 'paywall-modal';
    wrap.className = 'paywall-modal';
    wrap.innerHTML =
      '<div class="paywall-modal-backdrop" data-close></div>' +
      '<div class="paywall-modal-card" role="dialog" aria-modal="true" aria-labelledby="paywall-modal-title">' +
        '<span class="paywall-badge">PRO</span>' +
        '<h2 id="paywall-modal-title">Contenuto PRO</h2>' +
        '<p>' + (msg || 'Sblocca tutte le sezioni avanzate con la versione PRO.') + '</p>' +
        '<div class="paywall-modal-actions">' +
          '<a href="#buy" class="btn" data-close>Sblocca PRO</a>' +
          '<button type="button" class="btn btn-ghost" data-close>Chiudi</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);

    function close() {
      document.removeEventListener('keydown', onKey);
      wrap.remove();
      if (prevFocus && prevFocus.focus) prevFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        /* Focus trap sui soli elementi interattivi della card. */
        var f = wrap.querySelectorAll('a[href], button');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    wrap.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', close);
    });
    document.addEventListener('keydown', onKey);
    var firstBtn = wrap.querySelector('.btn');
    if (firstBtn) firstBtn.focus();
  }

  /* ---------- updateProgress ---------- */

  function updateProgress(sectionId, pct) {
    STATE.progress[sectionId] = Math.max(0, Math.min(100, Math.round(pct)));
    save('progress', STATE.progress);
    renderSidebarProgress();

    /* Se la dashboard è attiva, aggiorna il tachimetro senza navigare */
    var currentHash = location.hash.slice(1) || 'profilo';
    if (currentHash === 'dashboard' && window.SimRacing && window.SimRacing.refreshDashboard) {
      window.SimRacing.refreshDashboard(STATE);
    }
  }

  /* ---------- markComplete (sezioni di sola lettura) ---------- */

  function markComplete(sectionId, done) {
    updateProgress(sectionId, done ? 100 : 0);
  }

  /* Genera la barra "Segna come completata" riusabile.
     Restituisce una stringa HTML; gli eventi vanno collegati con bindCompletionBar. */
  function completionBarHTML(sectionId) {
    var done = (STATE.progress[sectionId] || 0) >= 100;
    return '<div class="completion-bar' + (done ? ' is-done' : '') + '" data-section="' + sectionId + '">' +
      '<span class="completion-text">' +
        (done ? '✓ Sezione completata' : 'Hai letto tutto? Segna questa sezione come completata.') +
      '</span>' +
      '<button class="btn' + (done ? ' btn-ghost' : '') + '" data-complete-btn>' +
        (done ? 'Annulla' : 'Segna come completata ✓') +
      '</button>' +
    '</div>';
  }

  function bindCompletionBar(container, sectionId) {
    var bar = container.querySelector('.completion-bar[data-section="' + sectionId + '"]');
    if (!bar) return;
    var btn = bar.querySelector('[data-complete-btn]');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var done = (STATE.progress[sectionId] || 0) >= 100;
      markComplete(sectionId, !done);
      /* Aggiorna la barra in-place senza re-render della sezione */
      var nowDone = !done;
      bar.classList.toggle('is-done', nowDone);
      bar.querySelector('.completion-text').textContent = nowDone
        ? '✓ Sezione completata'
        : 'Hai letto tutto? Segna questa sezione come completata.';
      btn.textContent = nowDone ? 'Annulla' : 'Segna come completata ✓';
      btn.classList.toggle('btn-ghost', nowDone);
    });
  }

  /* ---------- Shift-light progress strip ----------
     Genera una striscia LED segmentata (riferimento alle luci RPM del
     volante ClubSport). Le celle accese usano --trace; l'ultima accesa
     riceve un glow (.lead). Restituisce solo le celle: va inserito dentro
     un contenitore .shift-strip, oppure usa shiftHTML() per il blocco completo. */
  function shiftStripCells(pct, cells) {
    cells = cells || 14;
    pct = Math.max(0, Math.min(100, pct));
    var lit = Math.round(pct / 100 * cells);
    var out = '';
    for (var i = 0; i < cells; i++) {
      var cls = 'shift-cell';
      if (i < lit) cls += ' lit';
      if (i === lit - 1) cls += ' lead';
      out += '<span class="' + cls + '"></span>';
    }
    return out;
  }

  /* Pad percentuale a 3 cifre tipo strumento: 68 -> "068". */
  function padPct(pct) {
    var n = Math.max(0, Math.min(100, Math.round(pct)));
    return (n < 10 ? '00' : n < 100 ? '0' : '') + n + '%';
  }

  /* Blocco completo: striscia + readout monospace tabular-nums. */
  function shiftStripHTML(pct, opts) {
    opts = opts || {};
    var cells = opts.cells || 14;
    var sm = opts.sm ? ' sm' : '';
    return '<div class="shift">' +
      '<div class="shift-strip' + sm + '">' + shiftStripCells(pct, cells) + '</div>' +
      (opts.readout === false ? '' : '<span class="shift-readout">' + padPct(pct) + '</span>') +
    '</div>';
  }

  /* ---------- Streak / attività recente ----------
     Le sessioni salvano date "YYYY-MM-DD" (vedi quaderno.js). Calcola la serie
     di giorni consecutivi con almeno una sessione (che termina oggi o ieri) e
     il numero di sessioni negli ultimi 7 giorni. Esposto via utils per riuso
     in dashboard e profilo (niente copie duplicate). */
  function dayDiff(aStr, bStr) {
    var a = new Date(aStr + 'T00:00:00');
    var b = new Date(bStr + 'T00:00:00');
    return Math.round((a - b) / 86400000);
  }

  function computeActivity(sessions) {
    var dates = {};
    (sessions || []).forEach(function (s) { if (s && s.date) dates[s.date] = true; });
    var unique = Object.keys(dates).sort();           // ascendente
    var today = new Date().toISOString().slice(0, 10);

    var last7 = unique.filter(function (d) {
      var diff = dayDiff(today, d);
      return diff >= 0 && diff < 7;
    }).length;

    /* Streak: parti da oggi (o ieri) e conta a ritroso i giorni consecutivi. */
    var streak = 0;
    if (unique.length) {
      var newest = unique[unique.length - 1];
      var gapFromToday = dayDiff(today, newest);
      if (gapFromToday <= 1) {
        var cursor = newest;
        streak = 1;
        for (var i = unique.length - 2; i >= 0; i--) {
          if (dayDiff(cursor, unique[i]) === 1) { streak++; cursor = unique[i]; }
          else break;
        }
      }
    }
    return { streak: streak, last7: last7 };
  }

  /* ---------- Calcolo % globale ---------- */

  function globalPct() {
    var sections = (window.SimRacing && window.SimRacing.sections) || [];
    /* Escludi dashboard e quaderno (utility) dal calcolo del progresso. */
    var tracked = sections.filter(function (s) {
      return s.id !== 'dashboard' && s.id !== 'quaderno';
    });
    var total = tracked.length;
    if (total === 0) return 0;
    var sum = tracked.reduce(function (acc, s) {
      return acc + (STATE.progress[s.id] || 0);
    }, 0);
    return Math.round(sum / total);
  }

  /* ---------- Sidebar brand (avatar + tag pilota) ----------
     Personalizza l'intestazione della sidebar col profilo: foto avatar se
     presente, altrimenti iniziali su sfondo colorato (stessa logica di
     profilo.js), altrimenti l'esagono di default. Aggiornato in tempo reale
     da save() ad ogni modifica del profilo. */
  function brandTagColor(tag) {
    var s = (tag || 'PILOTA').toUpperCase();
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 360; }
    return 'hsl(' + h + ', 55%, 42%)';
  }

  function brandInitials(tag) {
    var s = (tag || '').trim();
    if (!s) return '?';
    var parts = s.split(/[\s_\-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return s.slice(0, 2).toUpperCase();
  }

  function renderBrand() {
    var mark = document.getElementById('brand-mark');
    var name = document.getElementById('brand-name');
    if (!mark || !name) return;
    var p = load('profile', null);
    var id = (p && p.identity) || {};
    var tag = (id.tag || '').trim();

    mark.style.background = '';
    if (id.avatar) {
      mark.className = 'brand-mark has-img';
      mark.innerHTML = '<img src="' + id.avatar + '" alt="">';
    } else if (tag) {
      mark.className = 'brand-mark has-initials';
      mark.style.background = brandTagColor(tag);
      mark.textContent = brandInitials(tag);
    } else {
      mark.className = 'brand-mark';
      mark.textContent = '⬡';
    }
    name.textContent = tag ? tag.toUpperCase() : 'PILOTA';
  }

  /* ---------- Sidebar progress ---------- */

  function renderSidebarProgress() {
    var pct = globalPct();
    var strip = document.getElementById('global-progress-strip');
    var pctEl = document.getElementById('global-progress-pct');
    if (strip) {
      strip.innerHTML = shiftStripCells(pct, 14);
      strip.setAttribute('aria-valuenow', pct);
    }
    if (pctEl) pctEl.textContent = pct + '%';
  }

  /* ---------- Nav builder ---------- */

  function buildNav() {
    var sections = (window.SimRacing && window.SimRacing.sections) || [];
    var list = document.getElementById('nav-list');
    if (!list) return;

    list.innerHTML = sections.map(function (s) {
      var label = s.label;
      var cls = '';
      /* La voce vendita riflette lo stato licenza. */
      if (s.id === 'buy' && isPro()) {
        label = 'PRO ✓';
        cls = ' class="nav-pro-active"';
      }
      return '<li data-id="' + s.id + '"' + cls + '>' +
        '<a href="#' + s.id + '">' +
        '<span class="nav-icon">' + s.icon + '</span>' +
        label +
        '</a></li>';
    }).join('');
  }

  /* ---------- Router ---------- */

  function navigate(id) {
    var sections = (window.SimRacing && window.SimRacing.sections) || [];
    var section = sections.find(function (s) { return s.id === id; });
    if (!section) {
      /* Fallback alla prima sezione */
      section = sections[0];
      if (!section) return;
    }

    /* Aggiorna nav active */
    document.querySelectorAll('#nav-list li').forEach(function (li) {
      var isActive = li.dataset.id === section.id;
      li.classList.toggle('active', isActive);
      var link = li.querySelector('a');
      if (link) {
        if (isActive) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      }
    });

    /* Chiudi sidebar su mobile */
    closeSidebar();

    /* Render sezione */
    var main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    var utils = {
      save: save,
      load: load,
      updateProgress: updateProgress,
      markComplete: markComplete,
      completionBarHTML: completionBarHTML,
      bindCompletionBar: bindCompletionBar,
      shiftStripHTML: shiftStripHTML,
      shiftStripCells: shiftStripCells,
      globalPct: globalPct,
      computeActivity: computeActivity,
      isPro: isPro,
      activateLicense: activateLicense,
      startTrial: startTrial,
      licenseInfo: licenseInfo,
      paywallCardHTML: paywallCardHTML,
      showPaywallModal: showPaywallModal,
      STATE: STATE
    };
    section.render(main, STATE, utils);

    /* Transizione di sezione discreta */
    main.classList.remove('section-fade');
    /* reflow per ri-triggerare l'animazione */
    void main.offsetWidth;
    main.classList.add('section-fade');

    /* Scroll top */
    main.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  /* ---------- Mobile sidebar ---------- */

  function openSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    var btn = document.getElementById('hamburger');
    if (sidebar) sidebar.classList.add('open');
    if (overlay) overlay.classList.add('open');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    var btn = document.getElementById('hamburger');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* ---------- Init ---------- */

  window.addEventListener('DOMContentLoaded', function () {
    renderBrand();

    /* Verifica l'eventuale key salvata PRIMA del primo render, così
       isPro() è già corretto e non c'è flash di contenuto bloccato. */
    var verifyStep = STATE.license.key
      ? verifyKey(STATE.license.key).then(function (res) {
          STATE.license.valid = !!res.ok;
          if (!res.ok) save('license', STATE.license);
        })
      : Promise.resolve();

    verifyStep.then(function () {
      buildNav();
      renderSidebarProgress();
      var initialId = location.hash.slice(1) || 'profilo';
      navigate(initialId);
    });

    window.addEventListener('hashchange', function () {
      navigate(location.hash.slice(1) || 'profilo');
    });

    var hamburger = document.getElementById('hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        var isOpen = document.getElementById('sidebar').classList.contains('open');
        isOpen ? closeSidebar() : openSidebar();
      });
    }

    var overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }
  });

  /* Esponi utils globali per le sezioni */
  window.SimRacing = window.SimRacing || {};
  window.SimRacing.save = save;
  window.SimRacing.load = load;
  window.SimRacing.shiftStripHTML = shiftStripHTML;
  window.SimRacing.shiftStripCells = shiftStripCells;
  window.SimRacing.isPro = isPro;
  window.SimRacing.activateLicense = activateLicense;
  window.SimRacing.startTrial = startTrial;
  window.SimRacing.licenseInfo = licenseInfo;

}());
