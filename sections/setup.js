(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* Rank livelli: 1=Base, 2=Intermedio, 3=Avanzato */
  var LEVELS = { Base: 1, Intermedio: 2, Avanzato: 3 };

  var SETUP_CATEGORIES = [
    {
      cat: 'Gomme & Pressioni',
      icon: '○',
      params: [
        { nome: 'Pressione gomme',     liv: 'Base',       up: 'Risposta più diretta, meno contatto con asfalto',    down: 'Più contatto, più grip in curva lenta, ma più rotolamento' },
        { nome: 'Camber (campanatura)', liv: 'Intermedio', up: 'Più grip in curva (lato esterno caricato di più)',   down: 'Più contatto rettilineo, meno surriscaldamento in curva rapida' },
        { nome: 'Toe anteriore',        liv: 'Intermedio', up: 'Toe-out: più reattività sterzo, possibile instabilità rettilineo', down: 'Toe-in: più stabilità, sterzo leggermente più lento' },
        { nome: 'Toe posteriore',       liv: 'Avanzato',   up: 'Toe-out: più sovrasterzo, instabilità ad alta velocità', down: 'Toe-in: più stabilità posteriore, meno sovrasterzo' }
      ]
    },
    {
      cat: 'Freni',
      icon: '◈',
      params: [
        { nome: 'Bilanciamento freni (BB %)', liv: 'Base',       up: 'Più carico anteriore: frenata più potente ma rischio bloccaggio ant.', down: 'Più carico posteriore: meno bloccaggio ant., ma possibile bloccaggio post. (spin)' },
        { nome: 'Pressione freno massima',    liv: 'Intermedio', up: 'Frenata più aggressiva, serve più sensibilità',      down: 'Frenata più progressiva, più facile da modulare' },
        { nome: 'Ducts / raffreddamento',     liv: 'Avanzato',   up: 'Freni più freddi, meno fade in stint lunghi',       down: 'Freni a temperatura ottimale più velocemente, utile piste corte' }
      ]
    },
    {
      cat: 'Aerodinamica',
      icon: '◁',
      params: [
        { nome: 'Ala anteriore (downforce)',  liv: 'Intermedio', up: 'Più grip anteriore, più stabilità, più drag',        down: 'Meno drag, più velocità max, possibile sottosterzo' },
        { nome: 'Ala posteriore (downforce)', liv: 'Intermedio', up: 'Più grip posteriore, più stabilità, più drag',      down: 'Meno drag, possibile sovrasterzo in curva veloce' },
        { nome: 'Bilanciamento aero (Rake)',  liv: 'Avanzato',   up: 'Più rake: più deportanza posteriore e anteriore dinamica', down: 'Meno rake: auto più piatta, comportamento più prevedibile' }
      ]
    },
    {
      cat: 'Sospensioni',
      icon: '⊞',
      params: [
        { nome: 'Altezza da terra (ant.)',  liv: 'Intermedio', up: 'Più altezza: meno aerodinamica, più guardia da terra', down: 'Meno altezza: più aero, ma rischio strisciamento' },
        { nome: 'Altezza da terra (post.)', liv: 'Intermedio', up: 'Più altezza: più rake, più grip post. dinamico',       down: 'Meno altezza: meno rake, auto più neutrale' },
        { nome: 'Caster',                   liv: 'Avanzato',   up: 'Più caster: più stabilità in rettilineo, più carico camber dinamico', down: 'Meno caster: sterzo più leggero, meno ritorno automatico' }
      ]
    },
    {
      cat: 'Ammortizzatori',
      icon: '⋮',
      params: [
        { nome: 'Bump (compressione)',  liv: 'Avanzato', up: 'Più rigido: auto reagisce subito ai dossi, meno rollio', down: 'Più morbido: assorbe meglio le buche, più confort di guida' },
        { nome: 'Rebound (estensione)', liv: 'Avanzato', up: 'Più rigido: gomme tornano a contatto velocemente',      down: 'Più morbido: transizioni più graduali, meno nervosismo' },
        { nome: 'Bump lento / veloce',  liv: 'Avanzato', up: 'Bump veloce alto: resistenza a impatti improvvisi (kerbs)', down: 'Bump lento basso: rollio in curva più fluido' }
      ]
    },
    {
      cat: 'Barre antirollio & Molle',
      icon: '△',
      params: [
        { nome: 'Barra antirollio ant. (ARB)',  liv: 'Base',     up: 'Più rigida: meno rollio, più reattività, possibile sottosterzo', down: 'Più morbida: più rollio, più grip anteriore in curva lenta' },
        { nome: 'Barra antirollio post. (ARB)', liv: 'Base',     up: 'Più rigida: meno rollio post., più sovrasterzo',               down: 'Più morbida: più grip posteriore, più sottosterzo' },
        { nome: 'Molle anteriori',               liv: 'Avanzato', up: 'Più rigide: meno rollio, risposta rapida',                      down: 'Più morbide: più grip in trazione, meglio su piste con dossi' }
      ]
    },
    {
      cat: 'Differenziale',
      icon: '⊕',
      params: [
        { nome: 'Precarico diff.',     liv: 'Avanzato', up: 'Più blocco: più trazione in uscita, possibile instabilità',     down: 'Meno blocco: uscita più fluida, meno trazione su fondo bagnato' },
        { nome: 'Power (gas aperto)',  liv: 'Avanzato', up: 'Più blocco: più spinta in rettilineo, ma sovrasterzo in gas',   down: 'Più aperto: meno sovrasterzo gas, più facilità di guida' },
        { nome: 'Coast (rilascio gas)', liv: 'Avanzato', up: 'Più blocco: stabilità in decelerazione in curva',               down: 'Più aperto: più sovrasterzo in rilascio, più naturale per alcuni' }
      ]
    }
  ];

  /* ============================================================
     DIAGNOSTICA HANDLING — sintomo → soluzione
     soluzioni ordinate: prima la modifica più sicura/efficace
     ============================================================ */

  var DIAGNOSI = [
    { zona: 'Ingresso curva', problema: 'Sottosterzo (non gira)', soluzioni: [
      { cosa: 'Ammorbidisci la barra antirollio anteriore', come: 'ARB ant. −1/−2 step', perche: 'Carica di più la gomma anteriore esterna in inserimento → più grip davanti.' },
      { cosa: 'Aumenta il camber anteriore (più negativo)', come: '−0.2 / −0.4°', perche: 'In appoggio la gomma lavora più piatta sull\'asfalto.' },
      { cosa: 'Riduci leggermente la pressione gomme anteriori', come: '−0.3 / −0.5 psi', perche: 'Allarga l\'impronta a terra e aumenta il grip.' }
    ]},
    { zona: 'Ingresso curva', problema: 'Sovrasterzo / instabilità (retrotreno leggero)', soluzioni: [
      { cosa: 'Ammorbidisci la barra antirollio posteriore', come: 'ARB post. −1/−2 step', perche: 'Più grip al retrotreno in inserimento, l\'auto è più stabile.' },
      { cosa: 'Aggiungi toe-in posteriore', come: '+0.1 / +0.2°', perche: 'Stabilizza l\'asse posteriore nei cambi di direzione.' },
      { cosa: 'Sposta il bilanciamento freni un filo avanti', come: 'BB +0.5 / +1%', perche: 'Meno freno dietro = meno tendenza a girare in staccata/trail braking.' }
    ]},
    { zona: 'Percorrenza (centro curva)', problema: 'Sottosterzo (allarga a metà curva)', soluzioni: [
      { cosa: 'Ammorbidisci la barra antirollio anteriore', come: 'ARB ant. −1/−2 step', perche: 'Bilancia il grip verso l\'anteriore in percorrenza.' },
      { cosa: 'Aggiungi ala/carico anteriore (se presente)', come: 'Ala ant. +1', perche: 'Più deportanza davanti nelle curve a media/alta velocità.' },
      { cosa: 'Controlla le pressioni: se l\'anteriore è troppo caldo, abbassalo', come: 'Verso il target del gioco', perche: 'Una gomma fuori temperatura perde grip e fa allargare.' }
    ]},
    { zona: 'Percorrenza (centro curva)', problema: 'Sovrasterzo (scoda a metà curva)', soluzioni: [
      { cosa: 'Ammorbidisci la barra antirollio posteriore', come: 'ARB post. −1/−2 step', perche: 'Più grip dietro a centro curva = auto più neutra.' },
      { cosa: 'Aggiungi ala/carico posteriore', come: 'Ala post. +1', perche: 'Stabilizza il retrotreno nelle curve veloci.' }
    ]},
    { zona: 'Uscita curva (gas)', problema: 'Sovrasterzo in trazione (scoda col gas)', soluzioni: [
      { cosa: 'Apri il differenziale in Power', come: 'Power −5 / −10%', perche: 'Meno blocco in accelerazione = meno tendenza a scodare aprendo il gas.' },
      { cosa: 'Ammorbidisci la barra antirollio posteriore', come: 'ARB post. −1 step', perche: 'Più grip al posteriore quando dai gas in uscita.' },
      { cosa: 'Aggiungi ala posteriore', come: 'Ala post. +1', perche: 'Più carico dietro alle alte velocità di uscita.' }
    ]},
    { zona: 'Uscita curva (gas)', problema: 'Poca trazione (pattina / sottosterza in uscita)', soluzioni: [
      { cosa: 'Aumenta il blocco del differenziale in Power', come: 'Power +5 / +10%', perche: 'Distribuisce meglio la coppia tra le due ruote → più trazione.' },
      { cosa: 'Ammorbidisci le molle/ARB posteriori', come: '−1 step', perche: 'La ruota interna resta più a contatto col terreno in accelerazione.' }
    ]},
    { zona: 'Frenata', problema: 'Bloccaggio anteriore (fumo davanti)', soluzioni: [
      { cosa: 'Sposta il bilanciamento freni indietro', come: 'BB −1 / −2%', perche: 'Meno carico frenante davanti → l\'anteriore blocca più tardi.' },
      { cosa: 'Riduci la pressione freno massima', come: '−2 / −5%', perche: 'Frenata più progressiva, più facile da modulare con la load cell.' },
      { cosa: 'Allena la frenata: rilascia un filo alla soglia di bloccaggio', come: 'Tecnica (threshold braking)', perche: 'Spesso è la modulazione, non il setup: usa il BLI per sentire la soglia.' }
    ]},
    { zona: 'Frenata', problema: 'Instabilità / spin in staccata (retrotreno scappa)', soluzioni: [
      { cosa: 'Sposta il bilanciamento freni avanti', come: 'BB +1 / +2%', perche: 'Più freno davanti = retrotreno più stabile in decelerazione.' },
      { cosa: 'Apri il differenziale in Coast', come: 'Coast −5 / −10%', perche: 'Meno blocco al rilascio → il posteriore è meno nervoso entrando in curva.' },
      { cosa: 'Aggiungi toe-in posteriore', come: '+0.1 / +0.2°', perche: 'Aumenta la stabilità dell\'asse posteriore in frenata.' }
    ]},
    { zona: 'Generale', problema: 'Auto nervosa su cordoli e dossi', soluzioni: [
      { cosa: 'Ammorbidisci bump e rebound', come: '−1 / −2 step', perche: 'Le sospensioni assorbono meglio gli urti invece di scaricarli sul telaio.' },
      { cosa: 'Alza un po\' l\'altezza da terra', come: '+2 / +3 mm', perche: 'Più margine sui cordoli, meno colpi e saltellamenti.' },
      { cosa: 'Ammorbidisci il bump veloce (se separato)', come: '−1 step', perche: 'Gestisce gli impatti improvvisi senza irrigidire tutta la sospensione.' }
    ]},
    { zona: 'Generale', problema: 'Gomme troppo calde (surriscaldano)', soluzioni: [
      { cosa: 'Riduci leggermente il camber', come: '−0.2 / −0.3°', perche: 'Meno camber = temperature più uniformi sul battistrada.' },
      { cosa: 'Avvicina le pressioni al target del gioco', come: 'Verso il valore hot consigliato', perche: 'Pressione corretta = temperatura più stabile e meno usura.' },
      { cosa: 'Apri i ducts dei freni (se scaldano i mozzi)', come: '+1 step', perche: 'Meno calore trasmesso dal freno alla gomma.' }
    ]}
  ];

  var WORKFLOW = [
    'Definisci la pista: layout (lento/misto/veloce), tipo di asfalto, temperature.',
    'Parti da un setup base (di solito il setup "safe" del gioco è equilibrato).',
    'Giro di ricognizione: identifica i 3-4 punti più critici (sovrasterzo, sottosterzo, instabilità).',
    'Modifica UN parametro alla volta. Non cambiare più cose contemporaneamente.',
    'Giro di confronto: stessa traiettoria, stessa velocità d\'ingresso. Misura il delta.',
    'Annota tutto nel Quaderno → Setup Salvati (sezione apposita nell\'app).',
    'Ripeti per ogni area problematica. Parti sempre dalle gomme e dai freni.',
    'Sessione finale: giro flying con setup ottimizzato.'
  ];

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ============================================================
     RENDER
     ============================================================ */

  function render(container, state, utils) {
    var maxRank = 1;   // filtro livello corrente (1=Base di default per principiante)

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Setup Auto</h1>' +
        '<p class="section-subtitle">Diagnostica i problemi, capisci i parametri, lavora con metodo</p>' +
      '</div>' +

      '<div class="callout mb-3"><strong>Principio base:</strong> ogni modifica ha un effetto diretto e un effetto collaterale. ' +
      'Il setup è sempre un compromesso tra grip, stabilità e velocità massima. Da principiante: <strong>una modifica alla volta</strong>.</div>' +

      /* DIAGNOSTICA INTERATTIVA */
      '<h2 class="mb-1">Diagnostica: "la mia auto fa così..."</h2>' +
      '<p class="text-muted text-sm mb-2">Scegli dove senti il problema e cosa fa l\'auto: ti suggerisco le modifiche in ordine, dalla più sicura.</p>' +
      '<div class="card mb-2">' +
        '<div class="diag-selectors">' +
          '<div class="form-field" style="margin:0;"><label>Dove succede</label><select id="diag-zona"></select></div>' +
          '<div class="form-field" style="margin:0;"><label>Cosa fa l\'auto</label><select id="diag-prob"></select></div>' +
        '</div>' +
        '<div id="diag-results"></div>' +
      '</div>' +
      '<div class="callout callout-red mb-4"><strong>Regola d\'oro:</strong> applica UNA modifica, torna in pista, confronta lo stesso giro, poi annota nel ' +
      '<a href="#quaderno" style="color:var(--red);">Quaderno → Setup Salvati</a>. Solo così capisci davvero cosa cambia.</div>' +

      /* PARAMETRI per livello */
      '<h2 class="mb-1">Parametri per livello</h2>' +
      '<p class="text-muted text-sm mb-2">Da principiante parti dal <strong>Base</strong>: pochi parametri ad alto impatto. Sblocca il resto quando sei pronto.</p>' +
      '<div class="tab-switcher" id="level-filter">' +
        '<button class="tab-btn active" data-rank="1">Base</button>' +
        '<button class="tab-btn" data-rank="2">Intermedio</button>' +
        '<button class="tab-btn" data-rank="3">Tutti</button>' +
      '</div>' +
      '<div id="setup-accordion"></div>' +

      /* WORKFLOW */
      '<h2 class="mt-4 mb-2">Workflow setup per pista</h2>' +
      '<div class="card">' +
        '<ol class="step-list">' +
        WORKFLOW.map(function (s) { return '<li>' + s + '</li>'; }).join('') +
        '</ol>' +
      '</div>' +

      utils.completionBarHTML('setup');

    /* ---------- Diagnostica ---------- */
    var zonaSel = container.querySelector('#diag-zona');
    var probSel = container.querySelector('#diag-prob');
    var diagOut = container.querySelector('#diag-results');

    var zones = DIAGNOSI.reduce(function (acc, d) {
      if (acc.indexOf(d.zona) === -1) acc.push(d.zona);
      return acc;
    }, []);

    zonaSel.innerHTML = zones.map(function (z) {
      return '<option value="' + escapeHtml(z) + '">' + escapeHtml(z) + '</option>';
    }).join('');

    function refreshProblems() {
      var zona = zonaSel.value;
      var probs = DIAGNOSI.filter(function (d) { return d.zona === zona; });
      probSel.innerHTML = probs.map(function (d) {
        return '<option value="' + escapeHtml(d.problema) + '">' + escapeHtml(d.problema) + '</option>';
      }).join('');
      refreshResults();
    }

    function refreshResults() {
      var entry = DIAGNOSI.filter(function (d) {
        return d.zona === zonaSel.value && d.problema === probSel.value;
      })[0];
      if (!entry) { diagOut.innerHTML = ''; return; }
      diagOut.innerHTML =
        '<div class="section-divider" style="margin:1rem 0;"></div>' +
        entry.soluzioni.map(function (s, i) {
          return '<div class="solution-card">' +
            '<div class="sol-what"><span class="sol-rank">' + (i + 1) + '</span>' + escapeHtml(s.cosa) + '</div>' +
            '<div class="sol-line"><b>Come:</b> ' + escapeHtml(s.come) + '</div>' +
            '<div class="sol-line"><b>Perché:</b> ' + escapeHtml(s.perche) + '</div>' +
          '</div>';
        }).join('');
    }

    zonaSel.addEventListener('change', refreshProblems);
    probSel.addEventListener('change', refreshResults);
    refreshProblems();

    /* ---------- Parametri per livello ---------- */
    var accordion = container.querySelector('#setup-accordion');

    function renderParams() {
      accordion.innerHTML = SETUP_CATEGORIES.map(function (cat) {
        var rows = cat.params.filter(function (p) { return LEVELS[p.liv] <= maxRank; });
        if (!rows.length) return '';
        return '<details>' +
          '<summary><span>' + cat.icon + ' ' + cat.cat + '</span></summary>' +
          '<div class="details-body" style="padding:0;">' +
            '<table class="data-table">' +
              '<thead><tr><th>Parametro</th><th>Livello</th><th>Se aumenti →</th><th>Se diminuisci →</th></tr></thead>' +
              '<tbody>' +
              rows.map(function (p) {
                return '<tr>' +
                  '<td style="font-weight:500;min-width:150px;">' + p.nome + '</td>' +
                  '<td><span class="level-badge level-' + p.liv.toLowerCase() + '">' + p.liv + '</span></td>' +
                  '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + p.up + '</td>' +
                  '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + p.down + '</td>' +
                '</tr>';
              }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</details>';
      }).join('');
    }

    container.querySelectorAll('#level-filter .tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('#level-filter .tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        maxRank = parseInt(btn.dataset.rank, 10);
        renderParams();
      });
    });

    renderParams();

    utils.bindCompletionBar(container, 'setup');
  }

  window.SimRacing.sections.push({
    id: 'setup',
    label: 'Setup Auto',
    icon: '⚙',
    render: render
  });

}());
