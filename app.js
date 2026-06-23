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
    settings: load('settings', {})
  };

  /* ---------- updateProgress ---------- */

  function updateProgress(sectionId, pct) {
    STATE.progress[sectionId] = Math.max(0, Math.min(100, Math.round(pct)));
    save('progress', STATE.progress);
    renderSidebarProgress();

    /* Se la dashboard è attiva, aggiorna il tachimetro senza navigare */
    var currentHash = location.hash.slice(1) || 'dashboard';
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
      return '<li data-id="' + s.id + '">' +
        '<a href="#' + s.id + '">' +
        '<span class="nav-icon">' + s.icon + '</span>' +
        s.label +
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
    buildNav();
    renderSidebarProgress();

    var initialId = location.hash.slice(1) || 'dashboard';
    navigate(initialId);

    window.addEventListener('hashchange', function () {
      navigate(location.hash.slice(1) || 'dashboard');
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

}());
