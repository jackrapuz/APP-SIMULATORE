(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* Traiettoria SVG */
  var TRAJECTORY_SVG =
    '<svg class="svg-diagram" viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">' +
    /* Pista - bordi */
    '<path d="M 20 180 Q 80 180 120 120 Q 160 60 240 40 L 300 40" fill="none" stroke="#D4CCB8" stroke-width="30" stroke-linecap="round"/>' +
    '<path d="M 20 160 Q 75 160 112 103 Q 148 46 236 28 L 300 28" fill="none" stroke="#E8E1D5" stroke-width="1.5"/>' +
    '<path d="M 20 200 Q 85 198 130 136 Q 172 72 244 52 L 300 52" fill="none" stroke="#E8E1D5" stroke-width="1.5"/>' +
    /* Traiettoria racing line */
    '<path d="M 20 195 Q 65 175 110 125 Q 155 78 200 50 L 300 35" fill="none" stroke="#C0392B" stroke-width="2.5" stroke-dasharray="5 0"/>' +
    /* Entry point */
    '<circle cx="50" cy="184" r="7" fill="#C0392B"/>' +
    '<text x="50" y="178" text-anchor="middle" font-size="10" font-family="monospace" fill="#C0392B" font-weight="bold">E</text>' +
    '<text x="30" y="165" font-size="9" font-family="monospace" fill="#6B6359">ENTRY</text>' +
    /* Apex */
    '<circle cx="155" cy="87" r="7" fill="#8B6F47"/>' +
    '<text x="155" y="82" text-anchor="middle" font-size="10" font-family="monospace" fill="#8B6F47" font-weight="bold">A</text>' +
    '<text x="162" y="80" font-size="9" font-family="monospace" fill="#8B6F47">APEX</text>' +
    /* Exit */
    '<circle cx="265" cy="40" r="7" fill="#1A1814"/>' +
    '<text x="265" y="35" text-anchor="middle" font-size="10" font-family="monospace" fill="#1A1814" font-weight="bold">X</text>' +
    '<text x="242" y="25" font-size="9" font-family="monospace" fill="#6B6359">EXIT</text>' +
    /* Late apex arrow */
    '<path d="M 140 130 L 120 105" stroke="#C0392B" stroke-width="1" marker-end="url(#arrowT)"/>' +
    '<text x="145" y="138" font-size="8" font-family="monospace" fill="#C0392B">apex tardivo</text>' +
    '<defs><marker id="arrowT" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#C0392B"/></marker></defs>' +
    '</svg>';

  /* Grafico frenata SVG */
  var BRAKING_SVG =
    '<svg class="svg-diagram" viewBox="0 0 280 180" xmlns="http://www.w3.org/2000/svg" style="max-width:280px;">' +
    /* Assi */
    '<line x1="40" y1="150" x2="260" y2="150" stroke="#1A1814" stroke-width="1.5"/>' +
    '<line x1="40" y1="20"  x2="40"  y2="150" stroke="#1A1814" stroke-width="1.5"/>' +
    /* Frecce assi */
    '<polygon points="260,147 265,150 260,153" fill="#1A1814"/>' +
    '<polygon points="37,20 40,15 43,20" fill="#1A1814"/>' +
    /* Label assi */
    '<text x="262" y="154" font-size="9" font-family="monospace" fill="#6B6359">t</text>' +
    '<text x="28" y="18"  font-size="9" font-family="monospace" fill="#6B6359">F</text>' +
    '<text x="42" y="165" font-size="8" font-family="monospace" fill="#6B6359">→ ingresso curva</text>' +
    /* Zona frenata */
    '<rect x="40" y="20" width="130" height="130" fill="rgba(192,57,43,0.05)"/>' +
    /* Frenata normale (linea piatta alta) */
    '<polyline points="40,35 80,32 130,32 175,90 220,140 240,148" fill="none" stroke="#C0392B" stroke-width="2.5"/>' +
    /* Trail braking (linea che scende graduale) */
    '<polyline points="40,35 80,32 130,38 175,70 220,125 240,148" fill="none" stroke="#8B6F47" stroke-width="2" stroke-dasharray="5 3"/>' +
    /* Legenda */
    '<line x1="45" y1="170" x2="70" y2="170" stroke="#C0392B" stroke-width="2.5"/>' +
    '<text x="75" y="173" font-size="8" font-family="monospace" fill="#C0392B">frenata classica</text>' +
    '<line x1="150" y1="170" x2="175" y2="170" stroke="#8B6F47" stroke-width="2" stroke-dasharray="4 2"/>' +
    '<text x="180" y="173" font-size="8" font-family="monospace" fill="#8B6F47">trail braking</text>' +
    '</svg>';

  var SOVRASTERZO = [
    {
      tipo: 'Sovrasterzo (Oversteer)',
      icona: '↙',
      causa: 'Retrotreno perde grip: troppo gas uscita curva, entry troppo veloce, setup bilanciato dietro.',
      effetto: 'L\'auto ruota, il retrotreno scivola verso l\'esterno. Senti il volante che si "alleggerisce".',
      correzione: 'Svolta il volante nella direzione del pattinamento (counter-steer). Riduci il gas gradualmente. Non frenare.',
      color: '--red'
    },
    {
      tipo: 'Sottosterzo (Understeer)',
      icona: '↗',
      causa: 'Anteriore perde grip: velocità d\'ingresso troppo alta, sterzata eccessiva, setup bilanciato avanti.',
      effetto: 'L\'auto "va dritta" nonostante stia girando il volante. Senti resistenza al volante.',
      correzione: 'Riduci gas / frena leggermente. Diminuisci l\'angolo di sterzo. Aspetta che il grip torni prima di gas.',
      color: '--tan'
    }
  ];

  var RACEECRAFT = [
    {
      titolo: 'Sorpassi: il punto di frenata',
      contenuto: 'Un sorpasso si costruisce nei 2-3 giri precedenti, non nell\'istante dell\'attacco. Avvicinati lungo il rettilineo, copri la scia, attacca al punto di frenata. Non frenare prima: chi frena prima di te mantiene la traiettoria interna.'
    },
    {
      titolo: 'Difesa: una mossa sola',
      contenuto: 'Nel sim racing competitivo: puoi spostarti una volta per difendere. Non chiudere il sorpassatore che ha già la testa dell\'auto affiancata. Le regole di sportività valgono: studia il regolamento iRacing o ACC.'
    },
    {
      titolo: 'Gestione gomme: thermal management',
      contenuto: 'Le gomme si surriscaldano con sterzate brusche e frenate tardive. Guida fluida = gomme che durano. Nei stint lunghi, mantieni traiettorie pulite, evita kerbs aggressivi, usa il pieno appoggio in curva con carico verticale stabile.'
    },
    {
      titolo: 'Partenza',
      contenuto: 'In griglia, monitora la temperatura gomme (out-lap di caldo). Alla luce verde: gas proporzionale alla coppia, non sgommare. In partenza umida: molto meno gas, apertura gas gradualissima nei primi 100m.'
    }
  ];

  var TELEMETRY = [
    { voce: 'Grafico velocità',          desc: 'La linea V nel tempo. Ti dice dove freni tardi (spike verso destra) o dove sei lento (valore basso nel mezzo curva).' },
    { voce: 'Throttle trace',            desc: 'Quanto gas stai dando. Ideale: 0% in frenata, salita graduale all\'apex, 100% appena possibile in uscita.' },
    { voce: 'Brake trace',               desc: 'La curva del freno. Trail braking = discesa graduale, non taglio netto. Confronta con giri di riferimento.' },
    { voce: 'Steer angle',               desc: 'Angolo volante nel tempo. Curve pulite = angolo stabile al picco. Correzioni = micro-oscillazioni nel grafico.' },
    { voce: 'Lateral G / Long G',        desc: 'G laterale = forza in curva. G longitudinale = frenata/accelerazione. Alti e stabili = buona guida.' },
    { voce: 'Wheel slip / Tyre temp',    desc: 'Slittamento gomme e temperatura. Slittamento alto = perdita grip. Temp ideale dipende dalla mescola (guarda la finestra ottimale).' }
  ];

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Teoria di guida</h1>' +
        '<p class="section-subtitle">Traiettoria, frenata, race craft e lettura telemetria</p>' +
      '</div>' +

      /* Traiettoria */
      '<h2 class="mb-2">La traiettoria — Racing Line</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin-bottom:2rem;">' +
        '<figure class="diagram-wrap" style="flex:0 0 auto;">' + TRAJECTORY_SVG + '<figcaption>Entry → Apex tardivo → Exit</figcaption></figure>' +
        '<div style="flex:1;min-width:200px;">' +
          '<div class="card mb-2"><strong>Entry (E):</strong> Entra largo, vicino al cordolo esterno. Mantieni la velocità e lascia spazio per avvicinarti all\'apex.</div>' +
          '<div class="card mb-2"><strong>Apex (A):</strong> Il punto più interno della curva. L\'apex tardivo è quasi sempre superiore: permette di aprire il gas prima in uscita.</div>' +
          '<div class="card"><strong>Exit (X):</strong> Esci al massimo della pista usando tutto l\'asfalto disponibile. Aprendo progressivamente il volante puoi dare più gas prima.</div>' +
        '</div>' +
      '</div>' +

      /* Frenata */
      '<h2 class="mb-2">Frenata e Trail Braking</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start;margin-bottom:2rem;">' +
        '<figure class="diagram-wrap" style="flex:0 0 auto;">' + BRAKING_SVG + '<figcaption>Forza frenante nel tempo — trail braking vs classica</figcaption></figure>' +
        '<div style="flex:1;min-width:200px;">' +
          '<div class="callout mb-2"><strong>Trail braking:</strong> Invece di rilasciare il freno bruscamente al punto di corda, si riduce gradualmente la pressione mentre si comincia a girare il volante. Trasferisce carico sull\'anteriore → più grip anteriore → sterzata più precisa.</div>' +
          '<div class="callout callout-red"><strong>Errore comune:</strong> Frenare tardi MA anche rilasciare bruscamente. Il picco di frenata deve essere immediato, il rilascio graduale.</div>' +
        '</div>' +
      '</div>' +

      /* Sovrasterzo / Sottosterzo */
      '<h2 class="mb-2">Sovrasterzo e Sottosterzo</h2>' +
      '<div style="display:flex;flex-wrap:wrap;gap:1rem;margin-bottom:2rem;">' +
      SOVRASTERZO.map(function (s) {
        return '<div class="card" style="flex:1;min-width:220px;">' +
          '<div style="font-size:1.5rem;margin-bottom:0.5rem;">' + s.icona + '</div>' +
          '<h3 style="color:var(' + s.color + ');">' + s.tipo + '</h3>' +
          '<p class="text-sm mt-1"><strong>Causa:</strong> ' + s.causa + '</p>' +
          '<p class="text-sm mt-1"><strong>Come si sente:</strong> ' + s.effetto + '</p>' +
          '<p class="text-sm mt-1"><strong>Correzione:</strong> ' + s.correzione + '</p>' +
        '</div>';
      }).join('') +
      '</div>' +

      /* Race craft */
      '<h2 class="mb-2">Race Craft</h2>' +
      '<div id="raceecraft-acc">' +
      RACEECRAFT.map(function (r) {
        return '<details class="mb-1">' +
          '<summary>' + r.titolo + '</summary>' +
          '<div class="details-body">' + r.contenuto + '</div>' +
        '</details>';
      }).join('') +
      '</div>' +

      /* Telemetria */
      '<h2 class="mt-4 mb-2">Leggere la telemetria</h2>' +
      '<div class="callout mb-2">In Assetto Corsa usa il <strong>Built-in Telemetry</strong> (F9) o installa <strong>CrewChief + MoTeC i2 Pro</strong>. In iRacing: <strong>iRacing telemetry reader</strong> o <strong>MoTeC</strong>.</div>' +
      '<div class="table-wrap">' +
        '<table class="data-table">' +
          '<thead><tr><th>Canale</th><th>Cosa misura e come leggerlo</th></tr></thead>' +
          '<tbody>' +
          TELEMETRY.map(function (t) {
            return '<tr><td><span class="mono">' + t.voce + '</span></td><td class="text-muted" style="font-size:var(--text-xs);">' + t.desc + '</td></tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +

      utils.completionBarHTML('teoria');

    utils.bindCompletionBar(container, 'teoria');
  }

  window.SimRacing.sections.push({
    id: 'teoria',
    label: 'Teoria',
    icon: '◌',
    render: render
  });

}());
