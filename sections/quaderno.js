(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function fmtDate(d) {
    if (!d) return '—';
    return d.replace(/-/g, '/');
  }

  /* ---------- Render tabs ---------- */

  function renderFFBDiary(nb, container, utils) {
    var entries = nb.ffb || [];
    var area = container.querySelector('#tab-content');
    if (!area) return;

    area.innerHTML =
      '<h3 class="mb-2">Nuovo record FFB</h3>' +
      '<div class="card mb-3">' +
        '<form id="ffb-form">' +
          '<div class="form-grid">' +
            '<div class="form-field"><label>Data</label><input type="date" id="ffb-date" value="' + today() + '"></div>' +
            '<div class="form-field"><label>Parametro (es. FF, NDP)</label><input type="text" id="ffb-param" placeholder="FF"></div>' +
            '<div class="form-field"><label>Valore precedente</label><input type="text" id="ffb-from" placeholder="70"></div>' +
            '<div class="form-field"><label>Nuovo valore</label><input type="text" id="ffb-to" placeholder="65"></div>' +
          '</div>' +
          '<div class="form-field"><label>Note / motivazione</label><textarea id="ffb-note" placeholder="Es: volante troppo pesante in staccata, abbassato FF..."></textarea></div>' +
          '<button type="submit" class="btn">Salva</button>' +
        '</form>' +
      '</div>' +

      '<h3 class="mb-2">Storico modifiche FFB</h3>' +
      (entries.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">◌</div><p>Nessuna modifica registrata</p></div>'
        : '<div class="entry-list">' +
          entries.slice().reverse().map(function (e, i) {
            var realI = entries.length - 1 - i;
            return '<div class="entry-card">' +
              '<div class="entry-card-header">' +
                '<span><span class="mono text-red">' + escapeHtml(e.param || '—') + '</span> <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-muted);">' + escapeHtml(e.from || '?') + ' → ' + escapeHtml(e.to || '?') + '</span></span>' +
                '<div style="display:flex;align-items:center;gap:0.75rem;">' +
                  '<span class="entry-date">' + fmtDate(e.date) + '</span>' +
                  '<button class="entry-delete" data-index="' + realI + '" title="Elimina" aria-label="Elimina voce">✕</button>' +
                '</div>' +
              '</div>' +
              (e.note ? '<p class="text-sm text-muted">' + escapeHtml(e.note) + '</p>' : '') +
            '</div>';
          }).join('') +
          '</div>'
      );

    area.querySelector('#ffb-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var entry = {
        date:  area.querySelector('#ffb-date').value,
        param: area.querySelector('#ffb-param').value.trim(),
        from:  area.querySelector('#ffb-from').value.trim(),
        to:    area.querySelector('#ffb-to').value.trim(),
        note:  area.querySelector('#ffb-note').value.trim()
      };
      if (!entry.param) return;
      nb.ffb = nb.ffb || [];
      nb.ffb.push(entry);
      utils.save('notebook', nb);
      renderFFBDiary(nb, container, utils);
    });

    area.querySelectorAll('.entry-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        nb.ffb.splice(idx, 1);
        utils.save('notebook', nb);
        renderFFBDiary(nb, container, utils);
      });
    });
  }

  var SESSION_CAP = 5;   // limite sessioni in FREE
  var SETUP_CAP = 3;     // limite setup salvati in FREE

  function renderSessionLog(nb, container, utils) {
    var sessions = nb.sessions || [];
    var area = container.querySelector('#tab-content');
    if (!area) return;
    var pro = utils.isPro();
    var atCap = !pro && sessions.length >= SESSION_CAP;
    /* In FREE mostriamo solo le sessioni più recenti entro il cap. */
    var visible = (pro || sessions.length <= SESSION_CAP)
      ? sessions.slice().reverse()
      : sessions.slice(-SESSION_CAP).reverse();
    var hidden = sessions.length - visible.length;

    area.innerHTML =
      '<h3 class="mb-2">Nuova sessione</h3>' +
      '<div class="card mb-3">' +
        '<form id="sess-form">' +
          '<div class="form-grid">' +
            '<div class="form-field"><label>Data</label><input type="date" id="sess-date" value="' + today() + '"></div>' +
            '<div class="form-field"><label>Pista</label><input type="text" id="sess-track" placeholder="Monza, Spa..."></div>' +
            '<div class="form-field"><label>Auto</label><input type="text" id="sess-car" placeholder="Ferrari 488 GT3..."></div>' +
            '<div class="form-field"><label>Best Lap</label><input type="text" id="sess-lap" placeholder="1:48.234"></div>' +
          '</div>' +
          '<div class="form-field"><label>Note</label><textarea id="sess-note" placeholder="Cosa ho imparato, problemi incontrati..."></textarea></div>' +
          '<button type="submit" class="btn"' + (atCap ? ' disabled' : '') + '>Salva sessione</button>' +
        '</form>' +
      '</div>' +

      (atCap ? utils.paywallCardHTML('Hai raggiunto il limite di ' + SESSION_CAP + ' sessioni della versione FREE. Passa a PRO per un log sessioni illimitato.') : '') +

      '<h3 class="mb-2">Storico sessioni</h3>' +
      (sessions.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">▷</div><p>Nessuna sessione registrata</p></div>'
        : '<div class="table-wrap">' +
          '<table class="data-table">' +
            '<thead><tr><th>Data</th><th>Pista</th><th>Auto</th><th>Best Lap</th><th>Note</th><th></th></tr></thead>' +
            '<tbody>' +
            visible.map(function (s, i) {
              var realI = sessions.indexOf(s);
              return '<tr>' +
                '<td><span class="mono">' + fmtDate(s.date) + '</span></td>' +
                '<td>' + escapeHtml(s.track || '—') + '</td>' +
                '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + escapeHtml(s.car || '—') + '</td>' +
                '<td><span class="mono text-red">' + escapeHtml(s.lap || '—') + '</span></td>' +
                '<td style="font-size:var(--text-xs);color:var(--ink-muted);max-width:180px;">' + escapeHtml(s.note || '') + '</td>' +
                '<td><button class="entry-delete" data-index="' + realI + '" title="Elimina">✕</button></td>' +
              '</tr>';
            }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>'
      ) +
      (hidden > 0 ? utils.paywallCardHTML('Altre ' + hidden + ' sessioni più vecchie sono nascoste nella versione FREE. Sblocca lo storico completo con PRO.') : '');

    area.querySelector('#sess-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!pro && (nb.sessions || []).length >= SESSION_CAP) {
        utils.showPaywallModal('La versione FREE salva fino a ' + SESSION_CAP + ' sessioni. Passa a PRO per un log illimitato.');
        return;
      }
      var entry = {
        date:  area.querySelector('#sess-date').value,
        track: area.querySelector('#sess-track').value.trim(),
        car:   area.querySelector('#sess-car').value.trim(),
        lap:   area.querySelector('#sess-lap').value.trim(),
        note:  area.querySelector('#sess-note').value.trim()
      };
      if (!entry.track) return;
      nb.sessions = nb.sessions || [];
      nb.sessions.push(entry);
      utils.save('notebook', nb);
      utils.STATE.notebook = nb;
      renderSessionLog(nb, container, utils);
    });

    area.querySelectorAll('.entry-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        nb.sessions.splice(idx, 1);
        utils.save('notebook', nb);
        renderSessionLog(nb, container, utils);
      });
    });
  }

  function renderSetups(nb, container, utils) {
    var setups = nb.setups || [];
    var area = container.querySelector('#tab-content');
    if (!area) return;
    var pro = utils.isPro();
    var atCap = !pro && setups.length >= SETUP_CAP;
    var visible = (pro || setups.length <= SETUP_CAP)
      ? setups.slice().reverse()
      : setups.slice(-SETUP_CAP).reverse();
    var hidden = setups.length - visible.length;

    area.innerHTML =
      '<h3 class="mb-2">Salva nuovo setup</h3>' +
      '<div class="card mb-3">' +
        '<form id="setup-form">' +
          '<div class="form-grid">' +
            '<div class="form-field"><label>Nome setup</label><input type="text" id="sp-name" placeholder="Monza Q - Alta velocità"></div>' +
            '<div class="form-field"><label>Auto</label><input type="text" id="sp-car" placeholder="Ferrari 488 GT3"></div>' +
            '<div class="form-field"><label>Pista</label><input type="text" id="sp-track" placeholder="Monza"></div>' +
          '</div>' +
          '<div class="form-field"><label>Valori / Note (JSON o testo libero)</label><textarea id="sp-values" placeholder=\'{"camber_ant": -3.0, "pressioni": 27.0, "BB": 56, "FF": 70}\'style="font-family:var(--font-mono);font-size:var(--text-xs);min-height:6rem;"></textarea></div>' +
          '<button type="submit" class="btn"' + (atCap ? ' disabled' : '') + '>Salva setup</button>' +
        '</form>' +
      '</div>' +

      (atCap ? utils.paywallCardHTML('La versione FREE salva fino a ' + SETUP_CAP + ' setup. Passa a PRO per setup illimitati.') : '') +

      '<h3 class="mb-2">Setup salvati</h3>' +
      (setups.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">⚙</div><p>Nessun setup salvato</p></div>'
        : '<div class="entry-list">' +
          visible.map(function (s, i) {
            var realI = setups.indexOf(s);
            return '<div class="entry-card">' +
              '<div class="entry-card-header">' +
                '<div>' +
                  '<strong>' + escapeHtml(s.name || 'Setup') + '</strong>' +
                  '<span style="margin-left:0.5rem;" class="badge">' + escapeHtml(s.car || '') + '</span>' +
                  '<span style="margin-left:0.25rem;" class="tag">' + escapeHtml(s.track || '') + '</span>' +
                '</div>' +
                '<div style="display:flex;gap:0.5rem;">' +
                  '<button class="btn btn-ghost btn-sm setup-copy" data-index="' + realI + '">Copia</button>' +
                  '<button class="entry-delete" data-index="' + realI + '" title="Elimina" aria-label="Elimina voce">✕</button>' +
                '</div>' +
              '</div>' +
              (s.values ? '<pre class="code-block mt-2" style="max-height:120px;overflow-y:auto;font-size:0.7rem;">' + escapeHtml(s.values) + '</pre>' : '') +
            '</div>';
          }).join('') +
          '</div>'
      ) +
      (hidden > 0 ? utils.paywallCardHTML('Altri ' + hidden + ' setup sono nascosti nella versione FREE. Sblocca lo storico completo con PRO.') : '') +

      /* Strumenti PRO: confronto setup e export PDF */
      '<div class="section-divider"></div>' +
      '<div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">' +
        '<button class="btn btn-ghost' + (pro ? '' : ' locked') + '" id="compare-btn">Confronta setup' + (pro ? '' : ' <span class="paywall-badge">PRO</span>') + '</button>' +
        '<button class="btn btn-ghost' + (pro ? '' : ' locked') + '" id="pdf-btn">Export PDF' + (pro ? '' : ' <span class="paywall-badge">PRO</span>') + '</button>' +
      '</div>' +

      /* Export / gestione dati */
      '<div class="section-divider"></div>' +
      '<div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">' +
        '<button class="btn btn-ghost" id="export-btn">Esporta tutto (JSON)</button>' +
        '<button class="btn btn-ghost" id="reset-progress-btn">Reset progresso</button>' +
        '<span class="text-muted text-xs">Esporta i dati o azzera solo il progresso delle sezioni (il Quaderno resta).</span>' +
        '<span class="field-error" id="export-err" role="alert" hidden>Export non riuscito. Riprova o controlla i permessi del browser.</span>' +
      '</div>';

    area.querySelector('#setup-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!pro && (nb.setups || []).length >= SETUP_CAP) {
        utils.showPaywallModal('La versione FREE salva fino a ' + SETUP_CAP + ' setup. Passa a PRO per setup illimitati.');
        return;
      }
      var entry = {
        name:   area.querySelector('#sp-name').value.trim(),
        car:    area.querySelector('#sp-car').value.trim(),
        track:  area.querySelector('#sp-track').value.trim(),
        values: area.querySelector('#sp-values').value.trim(),
        date:   today()
      };
      if (!entry.name) return;
      nb.setups = nb.setups || [];
      nb.setups.push(entry);
      utils.save('notebook', nb);
      renderSetups(nb, container, utils);
    });

    area.querySelectorAll('.setup-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        var s = nb.setups[idx];
        var text = JSON.stringify(s, null, 2);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = '✓';
            setTimeout(function () { btn.textContent = 'Copia'; }, 1500);
          });
        }
      });
    });

    area.querySelectorAll('.entry-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.dataset.index, 10);
        nb.setups.splice(idx, 1);
        utils.save('notebook', nb);
        renderSetups(nb, container, utils);
      });
    });

    /* Strumenti PRO (gating infrastrutturale; la funzione vera è follow-up). */
    ['compare-btn', 'pdf-btn'].forEach(function (id) {
      var b = area.querySelector('#' + id);
      if (!b) return;
      b.addEventListener('click', function () {
        if (!pro) {
          utils.showPaywallModal('Confronto setup ed export PDF sono funzioni PRO.');
        } else {
          utils.showPaywallModal('Funzione in arrivo in una prossima build PRO.');
        }
      });
    });

    area.querySelector('#reset-progress-btn').addEventListener('click', function () {
      if (!window.confirm('Azzerare il progresso di tutte le sezioni? Il Quaderno (note, sessioni, setup) NON verrà toccato.')) return;
      utils.STATE.progress = {};
      utils.save('progress', {});
      /* Aggiorna sidebar e dashboard tramite l'hook esistente */
      utils.updateProgress('quaderno', 0);
    });

    area.querySelector('#export-btn').addEventListener('click', function () {
      var errEl = area.querySelector('#export-err');
      try {
        var data = JSON.stringify(nb, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'simracing-quaderno-' + today() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        if (errEl) errEl.hidden = true;
      } catch (e) {
        if (errEl) errEl.hidden = false;
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function render(container, state, utils) {
    /* Lavora su una reference viva di state.notebook */
    var nb = state.notebook;

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Quaderno</h1>' +
        '<p class="section-subtitle">Diario FFB, log sessioni e setup salvati — tutto persiste offline</p>' +
      '</div>' +

      '<div class="tab-switcher" id="nb-tabs">' +
        '<button class="tab-btn active" data-tab="ffb">Diario FFB</button>' +
        '<button class="tab-btn" data-tab="sessions">Log Sessioni</button>' +
        '<button class="tab-btn" data-tab="setups">Setup Salvati</button>' +
      '</div>' +

      '<div id="tab-content"></div>';

    var tabRenders = {
      ffb:      function () { renderFFBDiary(nb, container, utils); },
      sessions: function () { renderSessionLog(nb, container, utils); },
      setups:   function () { renderSetups(nb, container, utils); }
    };

    container.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        tabRenders[btn.dataset.tab]();
      });
    });

    /* Render first tab */
    tabRenders.ffb();

    utils.updateProgress('quaderno', 5);
  }

  window.SimRacing.sections.push({
    id: 'quaderno',
    label: 'Quaderno',
    icon: '◫',
    render: render
  });

}());
