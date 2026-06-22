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

  /* ---------- Calcolo % globale ---------- */

  function globalPct() {
    var sections = (window.SimRacing && window.SimRacing.sections) || [];
    var total = sections.length;
    if (total === 0) return 0;
    var sum = sections.reduce(function (acc, s) {
      return acc + (STATE.progress[s.id] || 0);
    }, 0);
    return Math.round(sum / total);
  }

  /* ---------- Sidebar progress ---------- */

  function renderSidebarProgress() {
    var pct = globalPct();
    var fill = document.getElementById('global-progress-fill');
    var pctEl = document.getElementById('global-progress-pct');
    if (fill) fill.style.width = pct + '%';
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
      li.classList.toggle('active', li.dataset.id === section.id);
    });

    /* Chiudi sidebar su mobile */
    closeSidebar();

    /* Render sezione */
    var main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';

    var utils = { save: save, load: load, updateProgress: updateProgress, globalPct: globalPct, STATE: STATE };
    section.render(main, STATE, utils);

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

}());
