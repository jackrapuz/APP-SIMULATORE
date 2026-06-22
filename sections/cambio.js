(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var SWITCH_STEPS = [
    {
      titolo: 'Spegni il PC e stacca il cavo USB',
      desc: 'Sempre esegui modifiche hardware a macchina spenta. Il ClubSport Shifter SQ V1.5 è plug-and-play via USB o via porta ShifterHub del volante.'
    },
    {
      titolo: 'Localizza il pulsante H/SEQ sul lato del cambio',
      desc: 'Sul lato sinistro del corpo del SQ V1.5 c\'è un piccolo pulsante fisico a slitta o a pressione. Leggi l\'etichetta "H / SEQ" incisa sul corpo.'
    },
    {
      titolo: 'Modalità H (sequenziale → H-pattern)',
      desc: 'Sposta il selettore verso l\'alto (posizione H). In questa modalità il cambio riconosce 7 marce + retromarcia disposte a H. Perfetto per auto GT, turismo, classiche.'
    },
    {
      titolo: 'Modalità SEQ (H-pattern → sequenziale)',
      desc: 'Sposta il selettore verso il basso (posizione SEQ). Il cambio diventa una leva avanti/indietro: avanti = +1, indietro = -1. Usare per monoposto, rally, vetture con paddle che non hai.'
    },
    {
      titolo: 'Ricollega e calibra in-game',
      desc: 'Avvia il gioco, vai in Opzioni → Controller → Configura asse/bottoni cambio. Mappa ogni marcia separatamente in modalità H, o assegna Gear Up/Down in modalità SEQ.'
    },
    {
      titolo: 'Verifica in pista',
      desc: 'Fai un giro lento verificando che ogni ingranaggio risponda correttamente. In modalità H, assicurati che la retromarcia (di solito con pressione verso il basso + sinistra) funzioni.'
    }
  ];

  var H_VS_SEQ = [
    { cat: 'Formula / Monoposto',   consigliato: 'SEQ',  perche: 'Le vetture F1/F2 non hanno H-pattern. La leva SEQ simula la logica avanti/indietro.' },
    { cat: 'GT3 / GT4',             consigliato: 'SEQ o H', perche: 'Dipende dall\'auto: DSG/PDK → SEQ, manuale tradizionale → H.' },
    { cat: 'Turismo / Berlina',      consigliato: 'H',    perche: 'Cambio manuale tradizionale 5/6 rapporti. Esperienza realistica.' },
    { cat: 'Auto storiche / Classiche', consigliato: 'H', perche: 'Pre-1990 quasi sempre manuale H. Richiede anche frizione.' },
    { cat: 'Rally (AC Dirt mod)',    consigliato: 'SEQ',  perche: 'I rally moderni usano cambio sequenziale con palette.' },
    { cat: 'Prototype LMP / Hypercar', consigliato: 'SEQ', perche: 'Cambio automatico/sequenziale robotizzato.' }
  ];

  var HEEL_TOE_STEPS = [
    'Stai frenando forte con la punta del piede destro sul pedale del freno.',
    'Mantieni la pressione sul freno, non allentare.',
    'Il bordo esterno del piede destro (tallone o fianco) "ruota" verso l\'acceleratore.',
    'Dai un colpo di gas (blip) breve e deciso mentre sei ancora sul freno.',
    'Contemporaneamente, piede sinistro preme la frizione.',
    'Scala la marcia. Il blip ha alzato i giri per matchare la marcia più bassa.',
    'Rilascia frizione. Niente scossone: giri già al punto giusto.',
    'Ora puoi rilasciare il freno controllando il sottosterzo in frenata.'
  ];

  /* Heel-toe SVG animated */
  var HEEL_TOE_SVG =
    '<svg class="svg-diagram" viewBox="0 0 300 140" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;">' +
    /* Labels */
    '<text x="45" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#6B6359">FRIZIONE</text>' +
    '<text x="150" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#6B6359">FRENO</text>' +
    '<text x="255" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#6B6359">GAS</text>' +
    /* Pedal bodies */
    '<rect x="10" y="25" width="70" height="95" rx="4" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    '<rect x="115" y="25" width="70" height="95" rx="4" fill="#D4CCB8" stroke="#C0392B" stroke-width="2"/>' +
    '<rect x="220" y="25" width="70" height="95" rx="4" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    /* Foot on brake (big shape) */
    '<ellipse cx="150" cy="105" rx="28" ry="14" fill="#1A1814" opacity="0.7">' +
      '<animate attributeName="ry" values="14;16;14" dur="2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    /* Foot corner on gas (blip) */
    '<ellipse cx="248" cy="110" rx="14" ry="10" fill="#1A1814" opacity="0.5">' +
      '<animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    /* Arrow brake → gas */
    '<path d="M 185 90 Q 205 75 222 88" fill="none" stroke="#C0392B" stroke-width="1.5" marker-end="url(#arrowRed)" stroke-dasharray="3 2"/>' +
    '<defs>' +
      '<marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">' +
        '<path d="M0,0 L6,3 L0,6 Z" fill="#C0392B"/>' +
      '</marker>' +
    '</defs>' +
    /* Blip label */
    '<text x="205" y="68" text-anchor="middle" font-size="9" font-family="monospace" fill="#C0392B">blip</text>' +
    '</svg>';

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Cambio</h1>' +
        '<p class="section-subtitle">ClubSport SQ V1.5: switch H/Seq, calibrazione, heel-toe</p>' +
      '</div>' +

      /* Switch H/SEQ */
      '<h2 class="mb-2">Switch modalità H ↔ Sequenziale</h2>' +
      '<div class="callout mb-3"><strong>Attenzione:</strong> Esegui la procedura sempre a macchina spenta e con il gioco chiuso.</div>' +
      '<div class="card mb-4">' +
        '<ol class="step-list">' +
        SWITCH_STEPS.map(function (s) {
          return '<li><div><strong>' + s.titolo + '</strong><p class="text-muted text-sm mt-1">' + s.desc + '</p></div></li>';
        }).join('') +
        '</ol>' +
      '</div>' +

      /* H vs SEQ table */
      '<h2 class="mb-2">Quando usare H-Pattern vs Sequenziale</h2>' +
      '<div class="table-wrap mb-4">' +
        '<table class="data-table">' +
          '<thead><tr><th>Categoria auto</th><th>Consigliato</th><th>Perché</th></tr></thead>' +
          '<tbody>' +
          H_VS_SEQ.map(function (row) {
            var tagClass = row.consigliato === 'SEQ' ? 'tag-red' : 'tag-tan';
            return '<tr>' +
              '<td>' + row.cat + '</td>' +
              '<td><span class="tag ' + tagClass + '">' + row.consigliato + '</span></td>' +
              '<td class="text-muted" style="font-size:var(--text-xs);">' + row.perche + '</td>' +
            '</tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +

      /* Heel-toe */
      '<h2 class="mb-2">Heel-Toe (Tacco-Punta)</h2>' +
      '<div class="callout mb-2">' +
        '<strong>Cos\'è:</strong> Tecnica per scalare marcia in frenata bilanciando i giri motore con un blip sull\'acceleratore. Elimina il sobbalzo in scalata.' +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:2rem;align-items:flex-start;margin-bottom:1.5rem;">' +
        '<figure class="diagram-wrap" style="flex:0 0 auto;">' +
          HEEL_TOE_SVG +
          '<figcaption>Animazione: piede frena, bordo tocca il gas (blip)</figcaption>' +
        '</figure>' +
        '<div style="flex:1;min-width:220px;">' +
          '<ol class="step-list">' +
          HEEL_TOE_STEPS.map(function (s) {
            return '<li>' + s + '</li>';
          }).join('') +
          '</ol>' +
        '</div>' +
      '</div>' +

      '<div class="callout callout-red">' +
        '<strong>Nei sim:</strong> Se l\'auto ha assistenza auto-blip (es. iRacing F3) puoi disabilitarla e praticare il heel-toe manuale. In ACC è simulato bene nelle GT.' +
      '</div>';

    utils.updateProgress('cambio', 10);
  }

  window.SimRacing.sections.push({
    id: 'cambio',
    label: 'Cambio',
    icon: '⇅',
    render: render
  });

}());
