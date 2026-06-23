(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* ---------- Tachimetro math ----------
     Arc: 270° clockwise in SVG, from angle 135° to 45° (through top at 270°)
     Center: (110, 115), Radius: 78
     Arc length for r=78: 2π*78 * 270/360 ≈ 366.4
  ---------------------------------------- */
  var CX = 110, CY = 115, R = 78;
  var ARC_LEN = Math.round(2 * Math.PI * R * 270 / 360);   // ≈ 366
  var FULL_CIRC = Math.round(2 * Math.PI * R);              // ≈ 490

  function angleToXY(deg, radius) {
    var rad = deg * Math.PI / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad)
    };
  }

  function pctToAngle(pct) {
    return 135 + pct * 2.7;   // 0%=135°, 100%=405°(=45°)
  }

  /* Build arc <path> string */
  var startPt = angleToXY(135, R);
  var endPt   = angleToXY(45,  R);
  var ARC_D   = 'M ' + startPt.x.toFixed(1) + ' ' + startPt.y.toFixed(1) +
                ' A ' + R + ' ' + R + ' 0 1 1 ' +
                endPt.x.toFixed(1) + ' ' + endPt.y.toFixed(1);

  function buildTick(angleDeg, major) {
    var outer = angleToXY(angleDeg, R + 4);
    var inner = angleToXY(angleDeg, R + (major ? 12 : 8));
    return '<line x1="' + outer.x.toFixed(1) + '" y1="' + outer.y.toFixed(1) +
           '" x2="' + inner.x.toFixed(1) + '" y2="' + inner.y.toFixed(1) +
           '" class="tacho-tick' + (major ? ' tacho-tick-major' : '') + '"/>';
  }

  function buildTicks() {
    var ticks = '';
    for (var i = 0; i <= 10; i++) {
      var ang = 135 + i * 27;
      ticks += buildTick(ang, i % 5 === 0);
    }
    return ticks;
  }

  /* Needle line */
  function needlePath(pct) {
    var ang = pctToAngle(pct);
    var tip = angleToXY(ang, R - 14);
    var tail = angleToXY(ang + 180, 10);
    return 'M ' + tail.x.toFixed(1) + ' ' + tail.y.toFixed(1) +
           ' L ' + tip.x.toFixed(1) + ' ' + tip.y.toFixed(1);
  }

  /* Level label based on pct */
  function levelLabel(pct) {
    if (pct < 40) return 'NOVIZIO';
    if (pct < 80) return 'IN ALLENAMENTO';
    return 'COMPETITIVO';
  }

  /* Level text positions */
  var labelPos = [
    { pct:  0, text: 'NOVIZIO',        ang: 135 },
    { pct: 50, text: 'ALLENAMENTO',    ang: 270 },
    { pct:100, text: 'COMPETITIVO',    ang:  45 }
  ];

  function buildLabels() {
    return labelPos.map(function (lp) {
      var pos = angleToXY(lp.ang, R + 22);
      return '<text class="tacho-label" x="' + pos.x.toFixed(1) + '" y="' + pos.y.toFixed(1) + '">' + lp.text + '</text>';
    }).join('');
  }

  /* Build the full tachimetro SVG string */
  function buildSVG(pct) {
    var dashoffset = ARC_LEN * (1 - pct / 100);
    var needle = needlePath(pct);

    return '<svg class="tacho-svg" viewBox="0 0 220 180" xmlns="http://www.w3.org/2000/svg"' +
      ' role="img" aria-label="Progresso complessivo ' + pct + '%, livello ' + levelLabel(pct) + '">' +
      '<path class="tacho-track" d="' + ARC_D + '" />' +
      '<path class="tacho-fill" id="tacho-fill-path" d="' + ARC_D + '"' +
        ' stroke-dasharray="' + ARC_LEN + ' ' + FULL_CIRC + '"' +
        ' stroke-dashoffset="' + dashoffset.toFixed(1) + '" />' +
      buildTicks() +
      buildLabels() +
      '<path id="tacho-needle-path" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" fill="none" d="' + needle + '" />' +
      '<circle class="tacho-center" cx="' + CX + '" cy="' + CY + '" r="5"/>' +
      '<text class="tacho-pct" id="tacho-pct-text" x="' + CX + '" y="' + (CY + 40) + '">' + pct + '%</text>' +
      '<text class="tacho-sublabel" id="tacho-level-text" x="' + CX + '" y="' + (CY + 56) + '">' + levelLabel(pct) + '</text>' +
      '</svg>';
  }

  /* Update tachimetro in-place without full re-render */
  function updateTacho(pct) {
    var dashoffset = ARC_LEN * (1 - pct / 100);
    var fill = document.getElementById('tacho-fill-path');
    var needle = document.getElementById('tacho-needle-path');
    var pctText = document.getElementById('tacho-pct-text');
    var levelText = document.getElementById('tacho-level-text');

    if (fill) fill.setAttribute('stroke-dashoffset', dashoffset.toFixed(1));
    if (needle) needle.setAttribute('d', needlePath(pct));
    if (pctText) pctText.textContent = pct + '%';
    if (levelText) levelText.textContent = levelLabel(pct);
  }

  /* Expose refresh hook for app.js */
  window.SimRacing.refreshDashboard = function (state) {
    var sections = window.SimRacing.sections || [];
    var pct = computeGlobalPct(state, sections);
    updateTacho(pct);
    var cardEl = document.getElementById('dash-global-pct');
    if (cardEl) cardEl.textContent = pct + '%';
    var stripEl = document.getElementById('dash-global-strip');
    if (stripEl && window.SimRacing.shiftStripHTML) {
      stripEl.innerHTML = window.SimRacing.shiftStripHTML(pct, { cells: 18 });
    }
    var nextEl = document.getElementById('dash-next');
    if (nextEl) nextEl.innerHTML = buildNextActivity(state, sections);
  };

  /* ---------- Streak / attività recente ----------
     Le sessioni salvano date "YYYY-MM-DD" (vedi quaderno.js). Calcola la
     serie di giorni consecutivi con almeno una sessione (che termina oggi o
     ieri) e il numero di sessioni negli ultimi 7 giorni. */
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

  function computeGlobalPct(state, sections) {
    /* Coerente con globalPct() in app.js: escludi dashboard e quaderno. */
    var tracked = sections.filter(function (s) {
      return s.id !== 'dashboard' && s.id !== 'quaderno';
    });
    if (!tracked.length) return 0;
    var sum = tracked.reduce(function (acc, s) { return acc + (state.progress[s.id] || 0); }, 0);
    return Math.round(sum / tracked.length);
  }

  /* ---------- Render ---------- */

  function render(container, state, utils) {
    var sections = window.SimRacing.sections || [];
    var pct = computeGlobalPct(state, sections);
    var nb = state.notebook || {};
    var sessions = nb.sessions || [];
    var setups   = nb.setups  || [];

    var lastSession = sessions.length
      ? sessions[sessions.length - 1].date || '—'
      : '—';

    var activity = computeActivity(sessions);
    var streakText = activity.streak > 0
      ? '<span class="streak-flame">🔥</span>' + activity.streak + (activity.streak === 1 ? ' giorno' : ' giorni')
      : '—';

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Dashboard</h1>' +
        '<p class="section-subtitle">Il tuo percorso da pilota sim racing</p>' +
      '</div>' +

      /* Tachimetro */
      '<div class="card mb-3" style="display:flex;flex-wrap:wrap;align-items:center;gap:2rem;">' +
        '<div class="tacho-wrap">' + buildSVG(pct) + '</div>' +
        '<div style="flex:1;min-width:180px;">' +
          '<div class="card-title">Progresso Complessivo</div>' +
          '<div class="card-value" id="dash-global-pct">' + pct + '%</div>' +
          '<p class="text-muted text-sm mt-1">Completa le sezioni per avanzare di livello</p>' +
          '<div class="mt-2" id="dash-global-strip">' + utils.shiftStripHTML(pct, { cells: 18 }) + '</div>' +
        '</div>' +
      '</div>' +

      /* Stats cards */
      '<div class="cards-grid mb-3">' +
        '<div class="card streak-card">' +
          '<div class="card-title">Streak</div>' +
          '<div class="card-value" style="font-family:var(--font-display);">' + streakText + '</div>' +
          '<p class="text-muted text-xs mt-1">' + activity.last7 + ' sessioni negli ultimi 7 giorni</p>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-title">Sessioni Log</div>' +
          '<div class="card-value">' + sessions.length + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-title">Setup Salvati</div>' +
          '<div class="card-value">' + setups.length + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-title">Ultima Sessione</div>' +
          '<div class="mono-data" style="font-size:var(--text-sm);margin-top:0.25rem;color:var(--ink-muted);">' + lastSession + '</div>' +
        '</div>' +
      '</div>' +

      /* Next activity */
      '<h3 class="mb-1">Prossima attività consigliata</h3>' +
      '<div id="dash-next">' + buildNextActivity(state, sections) + '</div>' +

      /* Section overview */
      '<h3 class="mb-1 mt-3">Panoramica sezioni</h3>' +
      buildSectionOverview(state, sections);

    /* Trigger animation after DOM insertion */
    setTimeout(function () {
      updateTacho(pct);
    }, 50);
  }

  function buildNextActivity(state, sections) {
    var incomplete = sections.filter(function (s) {
      return s.id !== 'dashboard' && (state.progress[s.id] || 0) < 100;
    });
    if (!incomplete.length) {
      return '<div class="callout"><strong>Ottimo!</strong> Hai completato tutte le sezioni. Continua ad allenarti!</div>';
    }
    var next = incomplete[0];
    return '<a href="#' + next.id + '" class="next-activity">' +
      '<div>' +
        '<span class="next-activity-label">Riprendi da</span>' +
        '<span class="next-activity-title">' + next.label + '</span>' +
      '</div>' +
      '<span class="next-arrow">→</span>' +
    '</a>';
  }

  function buildSectionOverview(state, sections) {
    return '<div style="display:flex;flex-direction:column;gap:0.5rem;">' +
      sections.filter(function (s) { return s.id !== 'dashboard'; }).map(function (s) {
        var pct = state.progress[s.id] || 0;
        return '<a href="#' + s.id + '" style="text-decoration:none;display:flex;align-items:center;gap:1rem;padding:0.625rem 0;border-bottom:1px solid var(--border);color:var(--ink);">' +
          '<span style="width:1.5rem;text-align:center;font-size:0.9rem;">' + s.icon + '</span>' +
          '<span style="flex:1;font-size:var(--text-sm);font-weight:500;">' + s.label + '</span>' +
          '<span class="mono-data" style="font-size:var(--text-xs);color:var(--ink-muted);width:2.5rem;text-align:right;">' + pct + '%</span>' +
          '<div class="shift-strip sm" style="width:80px;flex:none;">' + window.SimRacing.shiftStripCells(pct, 10) + '</div>' +
        '</a>';
      }).join('') +
    '</div>';
  }

  window.SimRacing.sections.push({
    id: 'dashboard',
    label: 'Dashboard',
    icon: '◉',
    render: render
  });

}());
