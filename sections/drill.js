(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* Esercizi disponibili in FREE; il resto è gated PRO. */
  var FREE_DRILLS = { d1: true, d2: true, d3: true, d4: true };

  var DRILLS = [
    {
      fase: 'Settimane 1–2',
      titolo: 'Fondamenta',
      descrizione: 'Obiettivo: prendere confidenza con volante, pedaliera e cambio. Nessuna fretta sul giro veloce.',
      esercizi: [
        { id: 'd1', desc: 'Guida libera su pista corta (Brands Hatch Indy, Mugello Corto) per 30 minuti. Nessun obiettivo cronometrico.', metrica: '30 min senza uscire di pista 3+ volte consecutive', durata: '2 sessioni' },
        { id: 'd2', desc: 'Pratica il setup della postazione: regola sedile, volante, pedaliera. Usa la checklist della sezione Postazione.', metrica: 'Checklist completata al 100%', durata: '1 sessione' },
        { id: 'd3', desc: 'Imposta il FFB con i valori base della sezione Force Feedback per il gioco che stai usando.', metrica: 'Profilo FFB applicato e testato', durata: '1 sessione' },
        { id: 'd4', desc: 'Giri di installazione: fai 20 giri consecutivi sulla stessa pista senza pensare al tempo. Cerca la fluidità.', metrica: '20 giri puliti (nessun testacoda)', durata: '3 sessioni' }
      ]
    },
    {
      fase: 'Mese 1',
      titolo: 'Costruire la base tecnica',
      descrizione: 'Obiettivo: capire la traiettoria, imparare a frenare in modo costante, ridurre i tempi sul giro.',
      esercizi: [
        { id: 'd5', desc: 'Studia la racing line della sezione Teoria. Poi guidaci sopra cercando di toccare l\'apex esatto su ogni curva.', metrica: 'Senti il cambio di feeling al tocco dell\'apex', durata: '4 sessioni' },
        { id: 'd6', desc: 'Sessione di frenata pura: scegli 3 curve con frenata pesante. Trova il punto di frenata esatto ripetendo 15 giri.', metrica: 'Stesso punto di frenata (±5m) su 10 giri su 15', durata: '3 sessioni' },
        { id: 'd7', desc: 'Pratica lo scalare marcia con H-pattern se stai usando auto GT/Turismo. Usa il heel-toe.', metrica: 'Zero sobbalzi in scalata per un intero stint', durata: '4 sessioni' },
        { id: 'd8', desc: 'Registra 3 giri con la telemetria e confronta throttle/brake trace. Identifica un punto dove sei lento.', metrica: 'Identificato 1 area di miglioramento dalla telemetria', durata: '2 sessioni' },
        { id: 'd9', desc: 'Race weekend simulato: qualifica (10 min, giro flying) + gara (10 lap). Focus: partenza pulita.', metrica: 'Gara completata senza incidenti', durata: '2 sessioni' }
      ]
    },
    {
      fase: 'Mesi 2–3',
      titolo: 'Competitività',
      descrizione: 'Obiettivo: avvicinarsi ai tempi di riferimento, gestire la gara, prime esperienze online.',
      esercizi: [
        { id: 'd10', desc: 'Confronto giro con ghost/reference lap. Identifica i punti dove perdi tempo. Migliora settore per settore.', metrica: 'Avvicinati al reference lap del 3% o meno', durata: '6 sessioni' },
        { id: 'd11', desc: 'Sessione long run (20+ giri): mantieni tempi costanti entro 0.5 secondi dal tuo best lap.', metrica: 'Deviazione standard tempi < 0.5s su 20 giri', durata: '4 sessioni' },
        { id: 'd12', desc: 'Pratica il trail braking su almeno 2 curve per giro. Confronta tempi prima/dopo.', metrica: 'Delta positivo di almeno 0.3s sul tuo tempo base', durata: '4 sessioni' },
        { id: 'd13', desc: 'Sperimenta modifiche di setup: cambia 1 parametro e misura l\'effetto. Documenta nel Quaderno.', metrica: 'Almeno 3 setup documentati nel Quaderno', durata: '3 sessioni' },
        { id: 'd14', desc: 'Prima gara online (iRacing Rookie / ACC Public Lobby). Obiettivo: finire la gara e rispettare gli altri.', metrica: 'Gara completata, nessuna penalty grave', durata: '2 sessioni' },
        { id: 'd15', desc: 'Analisi post-gara: rivedi almeno 1 incidente/errore con la telemetria o il replay. Scrivi cosa avresti fatto diversamente.', metrica: 'Nota nel Quaderno Diario con l\'analisi', durata: '1 sessione' }
      ]
    }
  ];

  function computeDrillPct(done) {
    var total = DRILLS.reduce(function (acc, f) { return acc + f.esercizi.length; }, 0);
    var completati = Object.values(done).filter(Boolean).length;
    return total > 0 ? Math.round(completati / total * 100) : 0;
  }

  function fasePct(fase, done) {
    var completati = fase.esercizi.filter(function (e) { return done[e.id]; }).length;
    return Math.round(completati / fase.esercizi.length * 100);
  }

  function render(container, state, utils) {
    var done = utils.load('drill_done', {});
    var pro = utils.isPro();

    function saveAndUpdate(id, checked) {
      done[id] = checked;
      utils.save('drill_done', done);
      var pct = computeDrillPct(done);
      utils.updateProgress('drill', pct);
      /* Update fase progress bars in-place */
      DRILLS.forEach(function (fase) {
        var bar = document.getElementById('fase-bar-' + fase.fase.replace(/\s+/g, '-'));
        var pctEl = document.getElementById('fase-pct-' + fase.fase.replace(/\s+/g, '-'));
        var fp = fasePct(fase, done);
        if (bar) bar.style.width = fp + '%';
        if (pctEl) pctEl.textContent = fp + '%';
      });
    }

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Esercizi Progressivi</h1>' +
        '<p class="section-subtitle">Piano di allenamento strutturato da principiante a competitivo</p>' +
      '</div>' +

      '<div class="callout mb-3">' +
        '<strong>Come usare:</strong> Spunta un esercizio quando l\'hai completato soddisfacendo la metrica di successo. Non avanzare di fase prima di completare almeno il 75% della fase corrente.' +
      '</div>' +

      (pro ? '' : utils.paywallCardHTML('I primi 4 esercizi sono FREE. Sblocca tutto il piano di allenamento (oltre 20 esercizi su tutte le fasi) con PRO.')) +

      DRILLS.map(function (fase) {
        var fId = fase.fase.replace(/\s+/g, '-');
        var fp = fasePct(fase, done);
        return '<div class="card mt-3">' +
          '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:0.25rem;">' +
            '<div>' +
              '<span class="badge">' + fase.fase + '</span> ' +
              '<strong style="margin-left:0.5rem;">' + fase.titolo + '</strong>' +
            '</div>' +
            '<span class="text-muted text-xs font-bold" id="fase-pct-' + fId + '">' + fp + '%</span>' +
          '</div>' +
          '<p class="text-muted text-sm mb-2">' + fase.descrizione + '</p>' +
          '<div class="progress-bar mb-3">' +
            '<div class="progress-fill" id="fase-bar-' + fId + '" style="width:' + fp + '%"></div>' +
          '</div>' +
          '<ul class="checklist">' +
          fase.esercizi.map(function (e) {
            var locked = !pro && !FREE_DRILLS[e.id];
            var checked = done[e.id] ? ' checked' : '';
            return '<li' + (locked ? ' class="locked"' : '') + '>' +
              '<input type="checkbox" id="drill-' + e.id + '"' + checked + ' data-id="' + e.id + '"' +
                (locked ? ' disabled' : '') + '>' +
              '<label class="check-label" for="drill-' + e.id + '">' +
                '<div>' + e.desc + (locked ? ' <span class="paywall-badge">PRO</span>' : '') + '</div>' +
                '<div style="margin-top:0.25rem;display:flex;gap:0.75rem;flex-wrap:wrap;">' +
                  '<span class="badge">✓ ' + e.metrica + '</span>' +
                  '<span class="tag">' + e.durata + '</span>' +
                '</div>' +
              '</label>' +
            '</li>';
          }).join('') +
          '</ul>' +
        '</div>';
      }).join('');

    /* Attach events */
    container.querySelectorAll('input[type="checkbox"][data-id]').forEach(function (el) {
      el.addEventListener('change', function () {
        /* Gli esercizi gated non sono spuntabili in FREE. */
        if (!pro && !FREE_DRILLS[el.dataset.id]) {
          el.checked = false;
          utils.showPaywallModal('Questo esercizio fa parte del piano PRO.');
          return;
        }
        saveAndUpdate(el.dataset.id, el.checked);
      });
    });

    utils.updateProgress('drill', computeDrillPct(done));
  }

  window.SimRacing.sections.push({
    id: 'drill',
    label: 'Esercizi',
    icon: '▷',
    render: render
  });

}());
