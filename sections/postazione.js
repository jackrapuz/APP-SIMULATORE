(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var CHECKS = [
    { id: 'sedile',    label: 'Sedile regolato: schiena 100-110°, gambe leggermente piegate sull\'acceleratore' },
    { id: 'volante',   label: 'Volante: altezza e distanza corrette, braccia con lieve flessione a 9-3' },
    { id: 'pedaliera', label: 'Pedaliera: freno raggiungibile con il tallone appoggiato, gas leggero al tocco' },
    { id: 'monitor',   label: 'Monitor: centro schermo all\'altezza degli occhi, distanza 60-80 cm' },
    { id: 'headset',   label: 'Headset/cuffie: audio correttamente bilanciato per sentire il motore' }
  ];

  var ANGLES = [
    { parte: 'Schiena / schienale',  consigliato: '100–110°', note: 'Non troppo reclinato, supporto lombare attivo' },
    { parte: 'Fianchi / sedile',     consigliato: '90–95°',   note: 'Sedile piatto o leggermente inclinato avanti' },
    { parte: 'Ginocchia',            consigliato: '115–130°', note: 'Gamba distesa sull\'acceleratore, non bloccata' },
    { parte: 'Gomiti',               consigliato: '90–120°',  note: 'Braccia con lieve flessione al volante' },
    { parte: 'Polsi al volante',     consigliato: 'neutri',   note: 'No tensione, presa a 9-3 o 10-2' }
  ];

  var VERIFY = [
    { q: 'Riesci a premere a fondo il freno senza sollevare il sedere?',     id: 'v1' },
    { q: 'Le braccia rimangono leggermente piegate (non bloccate) al volante?', id: 'v2' },
    { q: 'Vedi l\'intero schermo senza dover muovere la testa?',               id: 'v3' },
    { q: 'La schiena è supportata per tutta la sessione (no dolori > 30min)?', id: 'v4' }
  ];

  var SIDE_SVG =
    '<svg class="svg-diagram" viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;">' +
    /* Sedile */
    '<rect x="70" y="80" width="60" height="90" rx="4" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    /* Schienale */
    '<rect x="55" y="20" width="22" height="75" rx="4" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" transform="rotate(-5 66 55)"/>' +
    /* Persona - testa */
    '<circle cx="100" cy="30" r="14" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5"/>' +
    /* Busto */
    '<line x1="100" y1="44" x2="92" y2="80" stroke="#1A1814" stroke-width="3" stroke-linecap="round"/>' +
    /* Braccio superiore */
    '<line x1="94" y1="50" x2="150" y2="65" stroke="#1A1814" stroke-width="2.5" stroke-linecap="round"/>' +
    /* Braccio basso */
    '<line x1="150" y1="65" x2="185" y2="50" stroke="#1A1814" stroke-width="2.5" stroke-linecap="round"/>' +
    /* Volante */
    '<circle cx="185" cy="45" r="18" fill="none" stroke="#C0392B" stroke-width="3"/>' +
    '<line x1="167" y1="45" x2="203" y2="45" stroke="#C0392B" stroke-width="2"/>' +
    '<line x1="185" y1="27" x2="185" y2="63" stroke="#C0392B" stroke-width="2"/>' +
    /* Coscia */
    '<line x1="92" y1="80" x2="145" y2="88" stroke="#1A1814" stroke-width="3" stroke-linecap="round"/>' +
    /* Gamba */
    '<line x1="145" y1="88" x2="158" y2="130" stroke="#1A1814" stroke-width="2.5" stroke-linecap="round"/>' +
    /* Piede */
    '<line x1="158" y1="130" x2="190" y2="128" stroke="#1A1814" stroke-width="2.5" stroke-linecap="round"/>' +
    /* Pedaliera */
    '<rect x="185" y="118" width="30" height="25" rx="2" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    /* Arco angolo schiena */
    '<path d="M 82 50 A 25 25 0 0 1 95 73" fill="none" stroke="#C0392B" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="60" y="68" font-size="9" font-family="monospace" fill="#C0392B">105°</text>' +
    /* Arco angolo ginocchio */
    '<path d="M 132 86 A 20 20 0 0 1 148 102" fill="none" stroke="#8B6F47" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="152" y="100" font-size="9" font-family="monospace" fill="#8B6F47">120°</text>' +
    '</svg>';

  var HANDS_SVG =
    '<svg class="svg-diagram" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;">' +
    /* Cerchio volante */
    '<circle cx="100" cy="100" r="72" fill="none" stroke="#D4CCB8" stroke-width="12"/>' +
    '<circle cx="100" cy="100" r="72" fill="none" stroke="#1A1814" stroke-width="2"/>' +
    /* Spoke */
    '<line x1="100" y1="28" x2="100" y2="172" stroke="#1A1814" stroke-width="1.5" opacity="0.3"/>' +
    '<line x1="28" y1="100" x2="172" y2="100" stroke="#1A1814" stroke-width="1.5" opacity="0.3"/>' +
    /* 9 o clock */
    '<circle cx="28" cy="100" r="9" fill="#C0392B"/>' +
    '<text x="28" y="103" text-anchor="middle" font-size="8" fill="white" font-family="monospace" font-weight="bold">9</text>' +
    /* 3 o clock */
    '<circle cx="172" cy="100" r="9" fill="#C0392B"/>' +
    '<text x="172" y="103" text-anchor="middle" font-size="8" fill="white" font-family="monospace" font-weight="bold">3</text>' +
    /* Mani */
    '<ellipse cx="38" cy="108" rx="12" ry="8" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5" transform="rotate(-30 38 108)"/>' +
    '<ellipse cx="162" cy="108" rx="12" ry="8" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5" transform="rotate(30 162 108)"/>' +
    /* Hub */
    '<circle cx="100" cy="100" r="10" fill="#1A1814"/>' +
    /* Labels */
    '<text x="100" y="20" text-anchor="middle" font-size="9" font-family="monospace" fill="#6B6359">12</text>' +
    '<text x="100" y="188" text-anchor="middle" font-size="9" font-family="monospace" fill="#6B6359">6</text>' +
    '</svg>';

  function computeProgress(checks) {
    var done = checks.filter(Boolean).length;
    return Math.round(done / CHECKS.length * 100);
  }

  function render(container, state, utils) {
    var saved = utils.load('postazione_checks', {});
    var verify = utils.load('postazione_verify', {});

    function saveAndUpdate() {
      var newChecks = {};
      CHECKS.forEach(function (c) {
        var el = document.getElementById('chk-' + c.id);
        if (el) newChecks[c.id] = el.checked;
      });
      utils.save('postazione_checks', newChecks);
      var pct = computeProgress(CHECKS.map(function (c) { return newChecks[c.id]; }));
      utils.updateProgress('postazione', pct);
    }

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Postazione</h1>' +
        '<p class="section-subtitle">Ergonomia e setup fisico del cockpit</p>' +
      '</div>' +

      /* Schemi SVG */
      '<h2 class="mb-2">Schemi di riferimento</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:2rem;">' +
        '<figure class="diagram-wrap" style="flex:1;min-width:220px;">' + SIDE_SVG + '<figcaption>Vista laterale — angoli postura</figcaption></figure>' +
        '<figure class="diagram-wrap" style="flex:0 0 auto;">' + HANDS_SVG + '<figcaption>Posizione mani 9-3</figcaption></figure>' +
      '</div>' +

      /* Angoli tabella */
      '<h2 class="mb-2">Angoli di riferimento</h2>' +
      '<div class="table-wrap mb-4">' +
        '<table class="data-table">' +
          '<thead><tr><th>Parte del corpo</th><th>Angolo consigliato</th><th>Note</th></tr></thead>' +
          '<tbody>' +
          ANGLES.map(function (a) {
            return '<tr><td>' + a.parte + '</td>' +
              '<td><span class="mono">' + a.consigliato + '</span></td>' +
              '<td class="text-muted">' + a.note + '</td></tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +

      /* Checklist */
      '<h2 class="mb-1">Checklist setup postazione</h2>' +
      '<p class="text-muted text-sm mb-2">Spunta ogni punto dopo aver verificato. Il progresso viene salvato automaticamente.</p>' +
      '<div class="card mb-3">' +
        '<ul class="checklist">' +
        CHECKS.map(function (c) {
          var checked = saved[c.id] ? ' checked' : '';
          return '<li>' +
            '<input type="checkbox" id="chk-' + c.id + '"' + checked + '>' +
            '<label class="check-label" for="chk-' + c.id + '">' + c.label + '</label>' +
          '</li>';
        }).join('') +
        '</ul>' +
      '</div>' +

      /* Test di verifica */
      '<h2 class="mb-1">Test di verifica</h2>' +
      '<p class="text-muted text-sm mb-2">Rispondi onestamente per identificare eventuali problemi.</p>' +
      '<div class="card">' +
        '<div style="display:flex;flex-direction:column;gap:1rem;">' +
        VERIFY.map(function (v) {
          var cur = verify[v.id] || null;
          return '<div>' +
            '<p class="text-sm mb-1" style="font-weight:500;">' + v.q + '</p>' +
            '<div class="verify-group">' +
              '<button class="verify-btn' + (cur === 'si' ? ' selected-yes' : '') + '" data-id="' + v.id + '" data-val="si">Sì</button>' +
              '<button class="verify-btn' + (cur === 'no' ? ' selected-no' : '') + '" data-id="' + v.id + '" data-val="no">No</button>' +
            '</div>' +
          '</div>';
        }).join('') +
        '</div>' +
      '</div>';

    /* Attach checkbox events */
    CHECKS.forEach(function (c) {
      var el = document.getElementById('chk-' + c.id);
      if (el) el.addEventListener('change', saveAndUpdate);
    });

    /* Attach verify button events */
    container.querySelectorAll('.verify-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id  = btn.dataset.id;
        var val = btn.dataset.val;
        verify[id] = val;
        utils.save('postazione_verify', verify);
        var group = btn.closest('.verify-group');
        group.querySelectorAll('.verify-btn').forEach(function (b) {
          b.classList.remove('selected-yes', 'selected-no');
        });
        btn.classList.add(val === 'si' ? 'selected-yes' : 'selected-no');
      });
    });

    /* Initial progress */
    var pct = computeProgress(CHECKS.map(function (c) { return saved[c.id]; }));
    utils.updateProgress('postazione', pct);
  }

  window.SimRacing.sections.push({
    id: 'postazione',
    label: 'Postazione',
    icon: '⊡',
    render: render
  });

}());
