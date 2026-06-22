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
    '<svg class="svg-diagram" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;">' +
    /* ---- Linea pavimento ---- */
    '<line x1="20" y1="200" x2="285" y2="200" stroke="#8B6F47" stroke-width="1" opacity="0.4"/>' +
    /* ---- Sedile racing (seduta + schienale avvolgente) ---- */
    /* seduta */
    '<path d="M 70 150 L 150 150 Q 158 150 158 142 L 150 132 L 72 134 Q 64 136 64 144 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    /* schienale inclinato ~105° */
    '<path d="M 64 144 L 52 60 Q 51 50 61 49 L 78 52 Q 86 54 86 64 L 88 140 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    /* bordo laterale avvolgente schienale */
    '<path d="M 52 60 Q 44 70 46 110" fill="none" stroke="#8B6F47" stroke-width="1.5" opacity="0.7"/>' +
    /* poggiatesta */
    '<rect x="50" y="36" width="20" height="20" rx="5" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    /* ---- Pilota ---- */
    /* testa */
    '<circle cx="86" cy="46" r="13" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.8"/>' +
    /* collo */
    '<line x1="86" y1="59" x2="90" y2="68" stroke="#1A1814" stroke-width="3" stroke-linecap="round"/>' +
    /* busto (spalla -> bacino), inclinato come lo schienale */
    '<line x1="90" y1="68" x2="104" y2="138" stroke="#1A1814" stroke-width="6" stroke-linecap="round"/>' +
    /* braccio: spalla -> gomito -> volante */
    '<line x1="93" y1="76" x2="138" y2="96" stroke="#1A1814" stroke-width="4" stroke-linecap="round"/>' +
    '<line x1="138" y1="96" x2="196" y2="86" stroke="#1A1814" stroke-width="4" stroke-linecap="round"/>' +
    /* mano sul volante */
    '<circle cx="196" cy="86" r="5" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5"/>' +
    /* coscia: bacino -> ginocchio */
    '<line x1="104" y1="138" x2="178" y2="146" stroke="#1A1814" stroke-width="6" stroke-linecap="round"/>' +
    /* stinco: ginocchio -> caviglia */
    '<line x1="178" y1="146" x2="208" y2="182" stroke="#1A1814" stroke-width="5" stroke-linecap="round"/>' +
    /* piede sul pedale */
    '<line x1="208" y1="182" x2="232" y2="176" stroke="#1A1814" stroke-width="5" stroke-linecap="round"/>' +
    /* ---- Volante ---- */
    '<circle cx="205" cy="78" r="20" fill="none" stroke="#C0392B" stroke-width="3.5"/>' +
    '<line x1="185" y1="78" x2="225" y2="78" stroke="#C0392B" stroke-width="2"/>' +
    '<line x1="205" y1="58" x2="205" y2="98" stroke="#C0392B" stroke-width="2"/>' +
    '<circle cx="205" cy="78" r="4" fill="#C0392B"/>' +
    /* ---- Pedaliera ---- */
    '<path d="M 228 168 L 250 158 L 256 168 L 234 180 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    /* ---- Arco angolo schiena (busto vs coscia) ~105° ---- */
    '<path d="M 99 116 A 22 22 0 0 1 122 132" fill="none" stroke="#C0392B" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="110" y="112" font-size="10" font-family="monospace" fill="#C0392B" font-weight="bold">105°</text>' +
    /* ---- Arco angolo ginocchio ~120° ---- */
    '<path d="M 168 148 A 18 18 0 0 1 185 160" fill="none" stroke="#8B6F47" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="150" y="170" font-size="10" font-family="monospace" fill="#8B6F47" font-weight="bold">120°</text>' +
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

  var MONITOR_TIPS = [
    { t: '32" curvo = schermo di guida', d: 'È il primario. Centralo rispetto a volante e sedile (non alla scrivania), col centro dello schermo all\'altezza degli occhi. Distanza occhi–schermo ~60–80 cm.' },
    { t: '24" flat = secondario laterale', d: 'Mettilo di lato (sinistra consigliata), inclinato verso di te. Non per la guida ma per telemetria/overlay (MoTeC, Content Manager, AC Drive), tempi, CrewChief, Discord.' },
    { t: 'Curvatura simmetrica', d: 'Orienta il curvo in modo che i due lati siano equidistanti dagli occhi: è il suo punto di forza, va centrato bene.' },
    { t: 'Bracci pneumatici', d: 'Hai i due bracci a pinza sulla scrivania: avvicina il cockpit finché, seduto in guida, il centro del 32" è davanti agli occhi. Inclina leggermente il 32" verso il basso per ridurre riflessi.' },
    { t: 'Stabilità', d: 'Con il DD a 8 Nm le vibrazioni arrivano alla scrivania: blocca bene le pinze o l\'immagine "balla".' },
    { t: 'FOV (campo visivo)', d: 'Con monitor singolo di guida non esagerare col FOV. Usa un calcolatore FOV (diagonale 32" + distanza) e regola in AC finché le mani virtuali coincidono con le tue sul volante.' },
    { t: 'Schermo di gara unico', d: 'In gioco imposta SOLO il 32" come display di gara; il 24" resta "secondo monitor" di Windows per le app di supporto.' }
  ];

  /* Schema disposizione monitor */
  var MONITOR_SVG =
    '<svg class="svg-diagram" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">' +
    /* 32 curvo centrale */
    '<path d="M 110 30 Q 200 18 290 30 L 285 92 Q 200 80 115 92 Z" fill="#D4CCB8" stroke="#C0392B" stroke-width="2" stroke-linejoin="round"/>' +
    '<text x="200" y="64" text-anchor="middle" font-size="11" font-family="monospace" fill="#1A1814" font-weight="bold">32" CURVO</text>' +
    '<text x="200" y="78" text-anchor="middle" font-size="8" font-family="monospace" fill="#6B6359">guida</text>' +
    /* 24 flat laterale sinistro, angolato */
    '<path d="M 20 50 L 92 38 L 92 96 L 20 108 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<text x="56" y="70" text-anchor="middle" font-size="9" font-family="monospace" fill="#1A1814" font-weight="bold">24"</text>' +
    '<text x="56" y="83" text-anchor="middle" font-size="7" font-family="monospace" fill="#6B6359">telemetria</text>' +
    /* Pilota / sedile */
    '<circle cx="200" cy="150" r="12" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5"/>' +
    '<path d="M 188 168 Q 200 156 212 168" fill="none" stroke="#1A1814" stroke-width="2"/>' +
    /* Linee di vista */
    '<line x1="200" y1="140" x2="200" y2="92" stroke="#C0392B" stroke-width="1" stroke-dasharray="3 2"/>' +
    '<line x1="200" y1="140" x2="60" y2="100" stroke="#8B6F47" stroke-width="1" stroke-dasharray="3 2"/>' +
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

      /* Setup monitor */
      '<h2 class="mb-2">Setup monitor (32" curvo + 24" flat)</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin-bottom:1.5rem;">' +
        '<figure class="diagram-wrap" style="flex:0 0 auto;">' + MONITOR_SVG +
          '<figcaption>32" curvo centrale per la guida, 24" flat di lato</figcaption></figure>' +
        '<div style="flex:1;min-width:240px;">' +
          '<div id="monitor-accordion">' +
          MONITOR_TIPS.map(function (m) {
            return '<details><summary>' + m.t + '</summary>' +
              '<div class="details-body"><p>' + m.d + '</p></div></details>';
          }).join('') +
          '</div>' +
        '</div>' +
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
