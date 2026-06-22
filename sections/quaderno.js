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
                '<span><span class="mono text-red">' + (e.param || '—') + '</span> <span style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-muted);">' + (e.from || '?') + ' → ' + (e.to || '?') + '</span></span>' +
                '<div style="display:flex;align-items:center;gap:0.75rem;">' +
                  '<span class="entry-date">' + fmtDate(e.date) + '</span>' +
                  '<button class="entry-delete" data-index="' + realI + '" title="Elimina">✕</button>' +
                '</div>' +
              '</div>' +
              (e.note ? '<p class="text-sm text-muted">' + e.note + '</p>' : '') +
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

  function renderSessionLog(nb, container, utils) {
    var sessions = nb.sessions || [];
    var area = container.querySelector('#tab-content');
    if (!area) return;

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
          '<button type="submit" class="btn">Salva sessione</button>' +
        '</form>' +
      '</div>' +

      '<h3 class="mb-2">Storico sessioni</h3>' +
      (sessions.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">▷</div><p>Nessuna sessione registrata</p></div>'
        : '<div class="table-wrap">' +
          '<table class="data-table">' +
            '<thead><tr><th>Data</th><th>Pista</th><th>Auto</th><th>Best Lap</th><th>Note</th><th></th></tr></thead>' +
            '<tbody>' +
            sessions.slice().reverse().map(function (s, i) {
              var realI = sessions.length - 1 - i;
              return '<tr>' +
                '<td><span class="mono">' + fmtDate(s.date) + '</span></td>' +
                '<td>' + (s.track || '—') + '</td>' +
                '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + (s.car || '—') + '</td>' +
                '<td><span class="mono text-red">' + (s.lap || '—') + '</span></td>' +
                '<td style="font-size:var(--text-xs);color:var(--ink-muted);max-width:180px;">' + (s.note || '') + '</td>' +
                '<td><button class="entry-delete" data-index="' + realI + '" title="Elimina">✕</button></td>' +
              '</tr>';
            }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>'
      );

    area.querySelector('#sess-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
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
          '<button type="submit" class="btn">Salva setup</button>' +
        '</form>' +
      '</div>' +

      '<h3 class="mb-2">Setup salvati</h3>' +
      (setups.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">⚙</div><p>Nessun setup salvato</p></div>'
        : '<div class="entry-list">' +
          setups.slice().reverse().map(function (s, i) {
            var realI = setups.length - 1 - i;
            return '<div class="entry-card">' +
              '<div class="entry-card-header">' +
                '<div>' +
                  '<strong>' + (s.name || 'Setup') + '</strong>' +
                  '<span style="margin-left:0.5rem;" class="badge">' + (s.car || '') + '</span>' +
                  '<span style="margin-left:0.25rem;" class="tag">' + (s.track || '') + '</span>' +
                '</div>' +
                '<div style="display:flex;gap:0.5rem;">' +
                  '<button class="btn btn-ghost btn-sm setup-copy" data-index="' + realI + '">Copia</button>' +
                  '<button class="entry-delete" data-index="' + realI + '" title="Elimina">✕</button>' +
                '</div>' +
              '</div>' +
              (s.values ? '<pre class="code-block mt-2" style="max-height:120px;overflow-y:auto;font-size:0.7rem;">' + escapeHtml(s.values) + '</pre>' : '') +
            '</div>';
          }).join('') +
          '</div>'
      ) +

      /* Export */
      '<div class="section-divider"></div>' +
      '<div style="display:flex;gap:1rem;align-items:center;">' +
        '<button class="btn btn-ghost" id="export-btn">Esporta tutto (JSON)</button>' +
        '<span class="text-muted text-xs">Scarica tutti i dati del Quaderno</span>' +
      '</div>';

    area.querySelector('#setup-form').addEventListener('submit', function (ev) {
      ev.preventDefault();
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

    area.querySelector('#export-btn').addEventListener('click', function () {
      var data = JSON.stringify(nb, null, 2);
      var blob = new Blob([data], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'simracing-quaderno-' + today() + '.json';
      a.click();
      URL.revokeObjectURL(url);
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
