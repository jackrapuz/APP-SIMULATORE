(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var SWITCH_STEPS = [
    {
      titolo: 'Trova lo slider sul lato inferiore del cambio',
      desc: 'Il cambio modalità NON è un pulsante laterale: è uno slider fisico sotto al corpo del SQ V1.5, con due posizioni serigrafate "H" (icona 8) e "SEQ". Si può spostare anche a PC acceso.'
    },
    {
      titolo: 'Modalità H-Pattern → slider su "8"',
      desc: 'Sposta lo slider sulla posizione "8" (H). Il cambio riconosce le marce disposte a H (R, 1-2, 3-4, 5-6, 7) e le mantiene ingranate. Per GT manuali, turismo, classiche.'
    },
    {
      titolo: 'Modalità Sequenziale → slider su "SEQ"',
      desc: 'Sposta lo slider su "SEQ". La leva diventa avanti = +1 / indietro = -1. NOTA: in sequenziale la marcia NON resta ingranata: dopo ogni spinta la leva torna in folle (è normale). Per monoposto, rally, prototipi.'
    },
    {
      titolo: 'Cambia il pomello in base alla modalità',
      desc: 'Hai due pomelli in dotazione. Per smontare il pomello sequenziale svita in senso antiorario; per montare quello a sfera (H) avvita in senso orario fino a bloccarlo. Usa il pomello a sfera in H e quello sequenziale in SEQ.'
    },
    {
      titolo: 'Retromarcia e 7ª marcia (modalità H)',
      desc: 'R e 7ª si innestano spingendo la leva VERSO IL BASSO e selezionando contemporaneamente la posizione: R in alto a sinistra, 7ª in basso a destra.'
    },
    {
      titolo: 'Mappa il cambio in gioco',
      desc: 'In H mappa ogni marcia separatamente (Opzioni → Controller). In SEQ assegna solo Gear Up / Gear Down. Per le auto H ricorda di mappare anche la frizione (pedale o paddle).'
    }
  ];

  /* Calibrazione H-pattern — dal manuale Fanatec (2 metodi) */
  var CALIB_WHEEL = [
    'Metti lo slider del cambio in modalità H (posizione "8").',
    'Sul volante RS premi la combinazione di tasti indicata nella Quick Start Guide del volante per entrare in calibrazione cambio.',
    'Sul display del volante comparirà la marcia da calibrare (es. "6_n").',
    'Porta la leva nella posizione di quella marcia.',
    'Conferma con il tasto indicato sulla QSG del volante.',
    'Ripeti per tutte le marce (R, 1-7 e folle).'
  ];

  var CALIB_APP = [
    'Collega la base al PC via USB e metti il cambio in modalità H.',
    'Apri la Fanatec App e seleziona la scheda "SHIFTER".',
    'Clicca "H-SHIFTER CALIBRATION".',
    'Tieni la leva in FOLLE e premi "NEUTRAL SET".',
    'La app mostra la marcia da calibrare: portaci la leva e conferma. Ripeti per tutte (9 passaggi).',
    'Quando finisci, chiudi: la calibrazione è salvata nella base.'
  ];

  var SETUP_TIPS = [
    { t: 'Quando ricalibrare', d: 'Dopo un aggiornamento firmware della base il cambio H può smettere di funzionare: rifai la calibrazione. È la causa #1 di "marce sbagliate".' },
    { t: 'Durezza dello shift', d: 'Puoi regolare la resistenza della leva con una brugola da 5 mm nell\'apertura di regolazione sul corpo del cambio: "+" più dura, "−" più morbida.' },
    { t: 'Collegamento', d: 'Collega il cambio alla porta "Shifter 1" della base con il cavo RJ12 incluso (oppure all\'adattatore USB ClubSport se usi il cambio da solo).' },
    { t: 'Bulloni e utensili', d: 'Per fissarlo: brugola 2 mm per i tappi di fondo, bulloni M5 (laterale, filetto max 8 mm) o M6 (sotto, max 15 mm) NON inclusi. Le T-nut sono incluse.' }
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
    '<text x="45" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#8B95A7">FRIZIONE</text>' +
    '<text x="150" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#8B95A7">FRENO</text>' +
    '<text x="255" y="16" text-anchor="middle" font-size="10" font-family="monospace" fill="#8B95A7">GAS</text>' +
    /* Pedal bodies */
    '<rect x="10" y="25" width="70" height="95" rx="4" fill="#212834" stroke="#4FD1C5" stroke-width="1.5"/>' +
    '<rect x="115" y="25" width="70" height="95" rx="4" fill="#212834" stroke="#FFB454" stroke-width="2"/>' +
    '<rect x="220" y="25" width="70" height="95" rx="4" fill="#212834" stroke="#4FD1C5" stroke-width="1.5"/>' +
    /* Foot on brake (big shape) */
    '<ellipse cx="150" cy="105" rx="28" ry="14" fill="#E7EAF0" opacity="0.7">' +
      '<animate attributeName="ry" values="14;16;14" dur="2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    /* Foot corner on gas (blip) */
    '<ellipse cx="248" cy="110" rx="14" ry="10" fill="#E7EAF0" opacity="0.5">' +
      '<animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite"/>' +
    '</ellipse>' +
    /* Arrow brake → gas */
    '<path d="M 185 90 Q 205 75 222 88" fill="none" stroke="#FFB454" stroke-width="1.5" marker-end="url(#arrowRed)" stroke-dasharray="3 2"/>' +
    '<defs>' +
      '<marker id="arrowRed" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">' +
        '<path d="M0,0 L6,3 L0,6 Z" fill="#FFB454"/>' +
      '</marker>' +
    '</defs>' +
    /* Blip label */
    '<text x="205" y="68" text-anchor="middle" font-size="9" font-family="monospace" fill="#FFB454">blip</text>' +
    '</svg>';

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Cambio</h1>' +
        '<p class="section-subtitle">ClubSport SQ V1.5: switch H/Seq, calibrazione, heel-toe</p>' +
      '</div>' +

      /* Switch H/SEQ */
      '<h2 class="mb-2">Switch modalità H ↔ Sequenziale</h2>' +
      '<div class="callout mb-3"><strong>Slider sul fondo:</strong> il cambio modalità è meccanico e immediato. Lo switch del pomello va invece fatto con calma.' +
        '<div class="mt-2" style="font-size:var(--text-xs);">' +
          '📄 <a href="ClubSport%20Shifter%20SQ%20V1.5%20%2B%20ClubSport%20USB%20Adapter%20Manual%20_%20Quick%20Start%20Guide%20_%20Fanatec.pdf" target="_blank">Manuale ClubSport Shifter SQ V1.5</a>' +
        '</div>' +
      '</div>' +
      '<div class="card mb-4">' +
        '<ol class="step-list">' +
        SWITCH_STEPS.map(function (s) {
          return '<li><div><strong>' + s.titolo + '</strong><p class="text-muted text-sm mt-1">' + s.desc + '</p></div></li>';
        }).join('') +
        '</ol>' +
      '</div>' +

      /* Calibrazione marce */
      '<h2 class="mb-2">Calibrazione marce (H-Pattern)</h2>' +
      '<p class="text-muted text-sm mb-2">Necessaria al primo uso e dopo ogni aggiornamento firmware. Due metodi:</p>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;margin-bottom:1.5rem;">' +
        '<div class="card" style="flex:1;min-width:260px;">' +
          '<div class="card-title mb-2">Metodo A — dal volante</div>' +
          '<ol class="step-list">' +
          CALIB_WHEEL.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
          '</ol>' +
        '</div>' +
        '<div class="card" style="flex:1;min-width:260px;">' +
          '<div class="card-title mb-2">Metodo B — Fanatec App</div>' +
          '<ol class="step-list">' +
          CALIB_APP.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
          '</ol>' +
        '</div>' +
      '</div>' +

      /* Tips setup */
      '<h2 class="mb-2">Note utili di setup</h2>' +
      '<div id="cambio-accordion" class="mb-4">' +
      SETUP_TIPS.map(function (s) {
        return '<details><summary>' + s.t + '</summary>' +
          '<div class="details-body"><p>' + s.d + '</p></div></details>';
      }).join('') +
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
      '</div>' +

      utils.completionBarHTML('cambio');

    utils.bindCompletionBar(container, 'cambio');
  }

  window.SimRacing.sections.push({
    id: 'cambio',
    label: 'Cambio',
    icon: '⇅',
    render: render
  });

}());
