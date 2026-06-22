(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* ============================================================
     DATI DI RIFERIMENTO
     ============================================================ */

  var ANGLES = [
    { parte: 'Schiena / schienale',  consigliato: '100–110°', note: 'Non troppo reclinato, supporto lombare attivo' },
    { parte: 'Fianchi / sedile',     consigliato: '90–95°',   note: 'Sedile piatto o leggermente inclinato avanti' },
    { parte: 'Ginocchia',            consigliato: '115–130°', note: 'Gamba distesa sull\'acceleratore, non bloccata' },
    { parte: 'Gomiti',               consigliato: '90–120°',  note: 'Braccia con lieve flessione al volante' },
    { parte: 'Polsi al volante',     consigliato: 'neutri',   note: 'No tensione, presa a 9-3 o 10-2' }
  ];

  var VERIFY = [
    { q: 'Riesci a premere a fondo il freno senza sollevare il sedere?',        id: 'v1' },
    { q: 'Le braccia rimangono leggermente piegate (non bloccate) al volante?', id: 'v2' },
    { q: 'Vedi l\'intero schermo senza dover muovere la testa?',                id: 'v3' },
    { q: 'La schiena è supportata per tutta la sessione (no dolori > 30min)?',  id: 'v4' }
  ];

  /* ============================================================
     WIZARD — passi guidati specifici per l'hardware di Giacomo
     ============================================================ */

  var STEPS = [
    {
      id: 'base',
      titolo: 'Monta la base CSL DD + QR2',
      hardware: 'CSL DD QR2 · Boost Kit 180',
      come: [
        'Fissa la base al supporto frontale del CSL Cockpit V1.5 con tutte e 4 le viti M6 in dotazione: il DD spinge fino a 8 Nm, una sola vite lenta fa "ballare" tutto.',
        'Orienta la base con il connettore del volante (QR2) rivolto verso di te e ben dritto.',
        'Lascia qualche cm d\'aria attorno al corpo motore: il CSL DD si raffredda passivamente, non chiuderlo in una scocca.',
        'Collega alimentatore e cavo dati, accendi e attendi la calibrazione (il volante cerca il centro da solo).'
      ],
      perche: 'Una base rigida e ben centrata trasmette il force feedback in modo pulito. Vibrazioni del telaio = segnali sporchi che confondono mentre impari a sentire il grip.',
      verifica: 'Spingi/tira il cockpit dal volante a motore spento: non deve flettere né scricchiolare.',
      erroreComune: 'Stringere solo 2 viti "per provare". Con 8 Nm il gioco meccanico diventa subito fastidioso e rovina il feeling.'
    },
    {
      id: 'pedaliera',
      titolo: 'Posiziona la pedaliera ClubSport V3',
      hardware: 'ClubSport Pedals V3 · load cell',
      come: [
        'Avvita la pedaliera alla piastra del cockpit: con la load cell del freno spingerai forte, deve essere immobile.',
        'Regola la distanza della piastra così che, schiena appoggiata, il piede prema il freno a fondo senza distendere del tutto la gamba.',
        'Inclina la pedaliera (angolo piastra) per avere il tallone appoggiato e il gas dosabile con la caviglia.',
        'Imposta la durezza del freno (load cell / molla elastomero o parametro BRF nel Tuning Menu) — vedi la sezione FFB.'
      ],
      perche: 'Il freno della V3 è a cella di carico: frena in base alla PRESSIONE, non alla corsa. Una pedaliera stabile e alla distanza giusta ti fa modulare la frenata invece di "spegnere/accendere" il freno.',
      verifica: 'Frenata di prova: riesci a tenere l\'80% costante per 3 secondi senza che la piastra si muova? Allora è ok.',
      erroreComune: 'Pedaliera troppo vicina: la gamba resta piegata e non riesci a dare il 100% di freno nelle staccate forti.'
    },
    {
      id: 'sedile',
      titolo: 'Regola il sedile (Seat Sliders)',
      hardware: 'CSL Cockpit Seat Bundle · Seat Sliders',
      come: [
        'Siediti e usa gli Seat Sliders per regolare la distanza dai pedali.',
        'Cerca un angolo delle ginocchia di 115–130°: gamba quasi distesa sull\'acceleratore ma mai bloccata.',
        'Controlla di poter premere il freno a fondo tenendo il tallone appoggiato e il bacino fermo.',
        'Stringi i pomelli/viti degli slider: il sedile non deve scorrere sotto la frenata.'
      ],
      perche: 'La distanza gambe è la base di tutto: se sei troppo lontano perdi forza sul freno, se sei troppo vicino ti irrigidisci e ti stanchi.',
      verifica: 'Premi il freno al massimo: il bacino resta incollato al sedile (non ti spingi indietro)?',
      erroreComune: 'Regolare il sedile guardando solo le braccia. Si parte SEMPRE dai pedali, poi si sistema il volante.'
    },
    {
      id: 'schienale',
      titolo: 'Imposta l\'angolo dello schienale',
      hardware: 'Seat Bundle',
      come: [
        'Inclina lo schienale a 100–110° rispetto alla seduta: leggermente reclinato, non sdraiato.',
        'Assicurati che la zona lombare sia supportata (eventuale cuscino lombare se senti vuoto sulla schiena).',
        'Le spalle devono restare appoggiate quando le braccia sono al volante.'
      ],
      perche: 'Un angolo 100–110° tiene la schiena neutra e ti permette sessioni lunghe senza dolore, mantenendo riferimenti stabili di testa e occhi.',
      verifica: 'Dopo 30 minuti simulati niente fastidi a lombi/collo? Angolo corretto.',
      erroreComune: 'Schienale troppo verticale (ti irrigidisce) o troppo reclinato (perdi sensibilità sul volante e la testa "cade").'
    },
    {
      id: 'volante',
      titolo: 'Sistema il volante ClubSport RS',
      hardware: 'ClubSport Steering Wheel RS',
      come: [
        'Aggancia il volante al QR2 finché senti il click: dev\'essere saldo, senza gioco assiale.',
        'Regola altezza e profondità del supporto volante così che, mani a 9-3, i gomiti restino a 90–120°.',
        'Il volante deve poter girare senza toccare le cosce e senza farti distendere del tutto le braccia a ore 12.',
        'Imposta la presa fissa 9-3 (o 10-2) come riferimento: nei sim non si "rema" come in città.'
      ],
      perche: 'Con i gomiti leggermente piegati controlli meglio le correzioni rapide di controsterzo e non ti affatichi. Braccia bloccate = reazioni lente e dolore alle spalle.',
      verifica: 'Ruota di 90° a sinistra e destra: le braccia restano comode e non tocchi le gambe?',
      erroreComune: 'Volante troppo lontano/alto: a ore 12 le braccia si distendono e perdi precisione nel controsterzo.'
    },
    {
      id: 'shifter',
      titolo: 'Monta lo shifter SQ V1.5',
      hardware: 'ClubSport Shifter SQ V1.5 · Shifter Holder',
      come: [
        'Fissa lo Shifter Holder sul lato destro del cockpit e monta lo shifter.',
        'Regola altezza e distanza: la mano destra deve raggiungere la leva tenendo la schiena appoggiata.',
        'Posizionalo vicino al piano del volante, come in un\'auto reale, non troppo in basso.',
        'Scegli la modalità (H-pattern o sequenziale) con lo switch laterale in base all\'auto — dettagli nella sezione Cambio.'
      ],
      perche: 'Uno shifter raggiungibile senza staccare la schiena ti fa cambiare marcia senza perdere la posizione di guida né i riferimenti visivi.',
      verifica: 'Inserisci 1ª e 2ª (o tira la sequenziale) senza sporgerti in avanti: ci arrivi comodo?',
      erroreComune: 'Holder troppo basso o arretrato: ti sporgi ad ogni cambio e perdi traiettoria.'
    },
    {
      id: 'monitor32',
      titolo: 'Centra il monitor 32" curvo (guida)',
      hardware: 'Monitor primario · 32" curvo',
      come: [
        'Posiziona il 32" curvo come schermo di GUIDA, centrato rispetto a volante e sedile (NON rispetto alla scrivania).',
        'Porta il centro dello schermo all\'altezza degli occhi, da seduto in posizione di guida.',
        'Distanza occhi–schermo 60–80 cm; orienta la curvatura in modo che i due lati siano equidistanti dagli occhi.',
        'Inclina leggermente verso il basso per ridurre i riflessi; in gioco imposta SOLO questo come display di gara.'
      ],
      perche: 'Il curvo dà il meglio solo se centrato e simmetrico: diventa il tuo "parabrezza". Un\'altezza occhi corretta ti dà un orizzonte stabile e migliora la percezione delle traiettorie.',
      verifica: 'Da seduto, lo sguardo dritto cade al centro dello schermo e i bordi sono alla stessa distanza?',
      erroreComune: 'Centrare il monitor sulla scrivania invece che sul sedile: ti ritrovi leggermente di lato senza accorgertene.'
    },
    {
      id: 'monitor24',
      titolo: 'Posiziona il 24" flat (telemetria/aiuto)',
      hardware: 'Monitor secondario · 24" flat',
      come: [
        'Mettilo di lato (sinistra consigliata), angolato verso di te: è il "secondo monitor" di Windows.',
        'Usalo per telemetria/overlay (MoTeC, Content Manager, AC Drive), tempi sul giro, CrewChief, Discord — non per la guida.',
        'Proposta migliorativa: tienilo alla stessa altezza-base del 32" ma leggermente arretrato, così resta a colpo d\'occhio senza distrarti dalla pista.',
        'Se in futuro vorrai un upgrade: due 24" laterali simmetrici darebbero più immersione di un singolo laterale — ma per ora il 24" come aiuto va benissimo.'
      ],
      perche: 'Separare guida (32") e dati (24") ti fa imparare a leggere la telemetria senza togliere il monitor di gara dalla configurazione ottimale.',
      verifica: 'Durante un giro riesci a dare un\'occhiata al 24" senza spostare la testa più di pochi gradi?',
      erroreComune: 'Mettere overlay e tempi sul monitor di guida: rubano spazio e attenzione al "parabrezza".'
    },
    {
      id: 'fov',
      fov: true,
      titolo: 'Calcola e imposta il FOV',
      hardware: 'Field of View · Assetto Corsa',
      come: [
        'Misura la distanza reale fra i tuoi occhi e il monitor 32" (in cm).',
        'Inserisci diagonale (32") e distanza nel calcolatore qui sotto.',
        'In Assetto Corsa imposta il valore di FOV verticale ottenuto.',
        'Verifica in macchina: le tue mani reali sul volante devono coincidere con le mani virtuali a schermo.'
      ],
      perche: 'Un FOV corretto rende le distanze e le velocità realistiche: con un FOV troppo largo tutto sembra lontano e lento, e sbagli i punti di frenata. È uno dei segreti meno conosciuti dai principianti.',
      verifica: 'Mani virtuali allineate alle tue + sensazione di velocità credibile = FOV giusto.',
      erroreComune: 'Tenere il FOV di default altissimo "per vedere di più": falsa completamente la percezione e rallenta l\'apprendimento.'
    }
  ];

  /* ============================================================
     SVG (invariati — schemi di riferimento)
     ============================================================ */

  var SIDE_SVG =
    '<svg class="svg-diagram" viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg" style="max-width:300px;">' +
    '<line x1="20" y1="200" x2="285" y2="200" stroke="#8B6F47" stroke-width="1" opacity="0.4"/>' +
    '<path d="M 70 150 L 150 150 Q 158 150 158 142 L 150 132 L 72 134 Q 64 136 64 144 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M 64 144 L 52 60 Q 51 50 61 49 L 78 52 Q 86 54 86 64 L 88 140 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M 52 60 Q 44 70 46 110" fill="none" stroke="#8B6F47" stroke-width="1.5" opacity="0.7"/>' +
    '<rect x="50" y="36" width="20" height="20" rx="5" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5"/>' +
    '<circle cx="86" cy="46" r="13" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.8"/>' +
    '<line x1="86" y1="59" x2="90" y2="68" stroke="#1A1814" stroke-width="3" stroke-linecap="round"/>' +
    '<line x1="90" y1="68" x2="104" y2="138" stroke="#1A1814" stroke-width="6" stroke-linecap="round"/>' +
    '<line x1="93" y1="76" x2="138" y2="96" stroke="#1A1814" stroke-width="4" stroke-linecap="round"/>' +
    '<line x1="138" y1="96" x2="196" y2="86" stroke="#1A1814" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="196" cy="86" r="5" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5"/>' +
    '<line x1="104" y1="138" x2="178" y2="146" stroke="#1A1814" stroke-width="6" stroke-linecap="round"/>' +
    '<line x1="178" y1="146" x2="208" y2="182" stroke="#1A1814" stroke-width="5" stroke-linecap="round"/>' +
    '<line x1="208" y1="182" x2="232" y2="176" stroke="#1A1814" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="205" cy="78" r="20" fill="none" stroke="#C0392B" stroke-width="3.5"/>' +
    '<line x1="185" y1="78" x2="225" y2="78" stroke="#C0392B" stroke-width="2"/>' +
    '<line x1="205" y1="58" x2="205" y2="98" stroke="#C0392B" stroke-width="2"/>' +
    '<circle cx="205" cy="78" r="4" fill="#C0392B"/>' +
    '<path d="M 228 168 L 250 158 L 256 168 L 234 180 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M 99 116 A 22 22 0 0 1 122 132" fill="none" stroke="#C0392B" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="110" y="112" font-size="10" font-family="monospace" fill="#C0392B" font-weight="bold">105°</text>' +
    '<path d="M 168 148 A 18 18 0 0 1 185 160" fill="none" stroke="#8B6F47" stroke-width="1.5" stroke-dasharray="3 2"/>' +
    '<text x="150" y="170" font-size="10" font-family="monospace" fill="#8B6F47" font-weight="bold">120°</text>' +
    '</svg>';

  var HANDS_SVG =
    '<svg class="svg-diagram" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="max-width:200px;">' +
    '<circle cx="100" cy="100" r="72" fill="none" stroke="#D4CCB8" stroke-width="12"/>' +
    '<circle cx="100" cy="100" r="72" fill="none" stroke="#1A1814" stroke-width="2"/>' +
    '<line x1="100" y1="28" x2="100" y2="172" stroke="#1A1814" stroke-width="1.5" opacity="0.3"/>' +
    '<line x1="28" y1="100" x2="172" y2="100" stroke="#1A1814" stroke-width="1.5" opacity="0.3"/>' +
    '<circle cx="28" cy="100" r="9" fill="#C0392B"/>' +
    '<text x="28" y="103" text-anchor="middle" font-size="8" fill="white" font-family="monospace" font-weight="bold">9</text>' +
    '<circle cx="172" cy="100" r="9" fill="#C0392B"/>' +
    '<text x="172" y="103" text-anchor="middle" font-size="8" fill="white" font-family="monospace" font-weight="bold">3</text>' +
    '<ellipse cx="38" cy="108" rx="12" ry="8" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5" transform="rotate(-30 38 108)"/>' +
    '<ellipse cx="162" cy="108" rx="12" ry="8" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5" transform="rotate(30 162 108)"/>' +
    '<circle cx="100" cy="100" r="10" fill="#1A1814"/>' +
    '<text x="100" y="20" text-anchor="middle" font-size="9" font-family="monospace" fill="#6B6359">12</text>' +
    '<text x="100" y="188" text-anchor="middle" font-size="9" font-family="monospace" fill="#6B6359">6</text>' +
    '</svg>';

  var MONITOR_SVG =
    '<svg class="svg-diagram" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">' +
    '<path d="M 110 30 Q 200 18 290 30 L 285 92 Q 200 80 115 92 Z" fill="#D4CCB8" stroke="#C0392B" stroke-width="2" stroke-linejoin="round"/>' +
    '<text x="200" y="64" text-anchor="middle" font-size="11" font-family="monospace" fill="#1A1814" font-weight="bold">32" CURVO</text>' +
    '<text x="200" y="78" text-anchor="middle" font-size="8" font-family="monospace" fill="#6B6359">guida</text>' +
    '<path d="M 20 50 L 92 38 L 92 96 L 20 108 Z" fill="#D4CCB8" stroke="#8B6F47" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<text x="56" y="70" text-anchor="middle" font-size="9" font-family="monospace" fill="#1A1814" font-weight="bold">24"</text>' +
    '<text x="56" y="83" text-anchor="middle" font-size="7" font-family="monospace" fill="#6B6359">telemetria</text>' +
    '<circle cx="200" cy="150" r="12" fill="#E8E1D5" stroke="#1A1814" stroke-width="1.5"/>' +
    '<path d="M 188 168 Q 200 156 212 168" fill="none" stroke="#1A1814" stroke-width="2"/>' +
    '<line x1="200" y1="140" x2="200" y2="92" stroke="#C0392B" stroke-width="1" stroke-dasharray="3 2"/>' +
    '<line x1="200" y1="140" x2="60" y2="100" stroke="#8B6F47" stroke-width="1" stroke-dasharray="3 2"/>' +
    '</svg>';

  /* ============================================================
     FOV — calcolo (FOV verticale per Assetto Corsa, schermo 16:9)
     ============================================================ */

  function computeFov(diagInch, distCm) {
    if (!(diagInch > 0) || !(distCm > 0)) return null;
    var heightCm = diagInch * 0.4903 * 2.54;          // altezza schermo 16:9
    var rad = 2 * Math.atan((heightCm / 2) / distCm);
    return Math.round(rad * 180 / Math.PI);
  }

  /* ============================================================
     RENDER
     ============================================================ */

  function render(container, state, utils) {
    var done = utils.load('postazione_wizard', {});   // { stepId: true }
    var verify = utils.load('postazione_verify', {});
    var current = 0;

    function doneCount() {
      return STEPS.filter(function (s) { return done[s.id]; }).length;
    }

    function syncProgress() {
      var pct = Math.round(doneCount() / STEPS.length * 100);
      utils.updateProgress('postazione', pct);
    }

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Postazione</h1>' +
        '<p class="section-subtitle">Configura il cockpit passo-passo, nell\'ordine giusto</p>' +
      '</div>' +

      '<div class="callout mb-3"><strong>Come funziona:</strong> segui i passi in ordine (si parte sempre dai pedali, non dal volante). ' +
      'Ad ogni passo trovi <em>come fare</em>, <em>perché</em>, <em>come verificare</em> e l\'<em>errore comune</em> da evitare. ' +
      'Spunta "Fatto" per salvare i progressi.</div>' +

      /* Schemi di riferimento collassabili */
      '<details class="mb-3">' +
        '<summary>Schemi e angoli di riferimento</summary>' +
        '<div class="details-body">' +
          '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center;margin-bottom:1rem;">' +
            '<figure class="diagram-wrap" style="flex:1;min-width:220px;margin:0;">' + SIDE_SVG + '<figcaption>Vista laterale — angoli postura</figcaption></figure>' +
            '<figure class="diagram-wrap" style="flex:0 0 auto;margin:0;">' + HANDS_SVG + '<figcaption>Posizione mani 9-3</figcaption></figure>' +
            '<figure class="diagram-wrap" style="flex:0 0 auto;margin:0;">' + MONITOR_SVG + '<figcaption>32" guida + 24" telemetria</figcaption></figure>' +
          '</div>' +
          '<table class="data-table">' +
            '<thead><tr><th>Parte del corpo</th><th>Angolo</th><th>Note</th></tr></thead>' +
            '<tbody>' +
            ANGLES.map(function (a) {
              return '<tr><td>' + a.parte + '</td><td><span class="mono">' + a.consigliato + '</span></td><td class="text-muted">' + a.note + '</td></tr>';
            }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</details>' +

      /* Wizard */
      '<h2 class="mb-2">Setup guidato</h2>' +
      '<div class="wizard" id="pz-wizard"></div>' +

      /* Test di verifica finali */
      '<h2 class="mb-1 mt-4">Test di verifica</h2>' +
      '<p class="text-muted text-sm mb-2">Quando hai finito, rispondi onestamente per scovare problemi residui.</p>' +
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

    var wizardEl = container.querySelector('#pz-wizard');

    function renderWizard() {
      var step = STEPS[current];
      var isDone = !!done[step.id];
      var pct = Math.round(doneCount() / STEPS.length * 100);

      wizardEl.innerHTML =
        '<div class="wizard-progress"><div class="wizard-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="wizard-head">' +
          '<span class="wizard-step-count">Passo ' + (current + 1) + ' / ' + STEPS.length + '</span>' +
          '<span class="wizard-step-state' + (isDone ? ' done' : '') + '">' + (isDone ? '✓ Fatto' : 'Da fare') + '</span>' +
        '</div>' +
        '<div class="wizard-body">' +
          '<span class="wizard-hw">⚙ ' + step.hardware + '</span>' +
          '<h3>' + step.titolo + '</h3>' +

          '<div class="wizard-block">' +
            '<span class="wizard-block-label">Come fare</span>' +
            '<ol class="wizard-howto">' +
            step.come.map(function (c) { return '<li>' + c + '</li>'; }).join('') +
            '</ol>' +
          '</div>' +

          (step.fov ? renderFovBlock() : '') +

          '<div class="wizard-block">' +
            '<span class="wizard-block-label">Perché</span>' +
            '<p class="wizard-why">' + step.perche + '</p>' +
          '</div>' +

          '<div class="wizard-block">' +
            '<span class="wizard-block-label">Come verificare</span>' +
            '<p class="wizard-verify">' + step.verifica + '</p>' +
          '</div>' +

          '<div class="wizard-block">' +
            '<span class="wizard-block-label">Errore comune</span>' +
            '<p class="wizard-mistake">' + step.erroreComune + '</p>' +
          '</div>' +

          '<label class="wizard-done-toggle">' +
            '<input type="checkbox" id="pz-done"' + (isDone ? ' checked' : '') + '> Fatto, passo completato' +
          '</label>' +
        '</div>' +

        '<div class="wizard-foot">' +
          '<div class="wizard-nav-btns">' +
            '<button class="btn btn-ghost btn-sm" id="pz-prev"' + (current === 0 ? ' disabled' : '') + '>← Indietro</button>' +
            '<button class="btn btn-sm" id="pz-next"' + (current === STEPS.length - 1 ? ' disabled' : '') + '>Avanti →</button>' +
          '</div>' +
          '<div class="wizard-dots">' +
          STEPS.map(function (s, i) {
            return '<button class="wizard-dot' + (done[s.id] ? ' done' : '') + (i === current ? ' current' : '') +
              '" data-goto="' + i + '" title="Passo ' + (i + 1) + ': ' + s.titolo + '"></button>';
          }).join('') +
          '</div>' +
        '</div>';

      /* Eventi navigazione */
      var prev = wizardEl.querySelector('#pz-prev');
      var next = wizardEl.querySelector('#pz-next');
      if (prev) prev.addEventListener('click', function () { if (current > 0) { current--; renderWizard(); } });
      if (next) next.addEventListener('click', function () { if (current < STEPS.length - 1) { current++; renderWizard(); } });

      wizardEl.querySelectorAll('.wizard-dot').forEach(function (d) {
        d.addEventListener('click', function () { current = parseInt(d.dataset.goto, 10); renderWizard(); });
      });

      var chk = wizardEl.querySelector('#pz-done');
      if (chk) chk.addEventListener('change', function () {
        done[step.id] = chk.checked;
        utils.save('postazione_wizard', done);
        syncProgress();
        renderWizard();
      });

      /* Eventi FOV */
      if (step.fov) bindFov();
    }

    function renderFovBlock() {
      var saved = utils.load('postazione_fov', { diag: 32, dist: 65 });
      var fov = computeFov(saved.diag, saved.dist);
      return '<div class="wizard-block">' +
        '<span class="wizard-block-label">Calcolatore FOV</span>' +
        '<div class="card fov-calc">' +
          '<div class="form-field" style="margin:0;"><label>Diagonale schermo (pollici)</label>' +
            '<input type="number" id="fov-diag" value="' + saved.diag + '" min="15" max="65" step="1"></div>' +
          '<div class="form-field" style="margin:0;"><label>Distanza occhi–schermo (cm)</label>' +
            '<input type="number" id="fov-dist" value="' + saved.dist + '" min="30" max="150" step="1"></div>' +
          '<div class="fov-result">' +
            '<div class="fov-result-value" id="fov-out">' + (fov !== null ? fov + '°' : '—') + '</div>' +
            '<div class="fov-result-label">FOV verticale</div>' +
          '</div>' +
        '</div>' +
        '<p class="text-muted text-xs mt-1">Inserisci questo valore come FOV verticale in Assetto Corsa, poi verifica che le mani virtuali coincidano con le tue.</p>' +
      '</div>';
    }

    function bindFov() {
      var diagEl = wizardEl.querySelector('#fov-diag');
      var distEl = wizardEl.querySelector('#fov-dist');
      var outEl = wizardEl.querySelector('#fov-out');
      if (!diagEl || !distEl || !outEl) return;
      function recompute() {
        var diag = parseFloat(diagEl.value);
        var dist = parseFloat(distEl.value);
        var fov = computeFov(diag, dist);
        outEl.textContent = fov !== null ? fov + '°' : '—';
        utils.save('postazione_fov', { diag: diag, dist: dist });
      }
      diagEl.addEventListener('input', recompute);
      distEl.addEventListener('input', recompute);
    }

    /* Verify buttons */
    container.querySelectorAll('.verify-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
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

    renderWizard();
    syncProgress();
  }

  window.SimRacing.sections.push({
    id: 'postazione',
    label: 'Postazione',
    icon: '⊡',
    render: render
  });

}());
