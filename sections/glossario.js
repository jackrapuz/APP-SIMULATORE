(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var GLOSSARY = [
    /* FFB */
    { sigla: 'FFB',           cat: 'FFB',       def: 'Force Feedback. Sistema che trasmette le forze della fisica del veicolo al volante attraverso il motore.' },
    { sigla: 'Clipping',      cat: 'FFB',       def: 'Saturazione del segnale FFB: il motore del volante non riesce a riprodurre la forza richiesta. Si manifesta come perdita di dettaglio.' },
    { sigla: 'SEN',           cat: 'FFB',       def: 'Steering Sensitivity — range di rotazione fisico del volante in gradi.' },
    { sigla: 'FF / Gain',     cat: 'FFB',       def: 'Forza complessiva del Force Feedback. Va calibrato per evitare clipping.' },
    { sigla: 'NDP',           cat: 'FFB',       def: 'Natural Damper — smorzamento basico che rende il volante più pesante. Va tenuto basso (5–20) per sim.' },
    { sigla: 'NFR',           cat: 'FFB',       def: 'Natural Friction — attrito fisico del meccanismo del volante. Tenere a 0–5 in sim.' },
    { sigla: 'NIN',           cat: 'FFB',       def: 'Natural Inertia — inerzia simulata. Aggiunge peso realistico ma può mascherare segnali di grip.' },
    { sigla: 'INT',           cat: 'FFB',       def: 'Interpolation — smoothing del segnale FFB. 0–2 per sim, più alto rende il FFB più fluido ma meno preciso.' },
    { sigla: 'FEI',           cat: 'FFB',       def: 'FFB Effects Intensity — intensità degli effetti extra (kerbs, road texture). 40–60 è un buon punto di partenza.' },
    { sigla: 'SPR',           cat: 'FFB',       def: 'Spring Strength — forza di ritorno al centro a livello OS. SEMPRE 0 per sim: è un effetto arcade.' },
    { sigla: 'DPR',           cat: 'FFB',       def: 'Damper Strength — smorzamento OS-level. SEMPRE 0 per sim: maschera il vero FFB.' },

    /* Setup */
    { sigla: 'Camber',        cat: 'Setup',     def: 'Angolo di inclinazione della ruota rispetto alla verticale. Negativo (cima verso l\'interno) aumenta il grip in curva.' },
    { sigla: 'Toe',           cat: 'Setup',     def: 'Angolo delle ruote rispetto all\'asse longitudinale. Toe-in = punte verso l\'interno, toe-out = punte verso l\'esterno.' },
    { sigla: 'Rake',          cat: 'Setup',     def: 'Differenza di altezza da terra tra anteriore e posteriore. Più rake = più downforce posteriore dinamica.' },
    { sigla: 'Downforce',     cat: 'Setup',     def: 'Forza aerodinamica verso il basso che aumenta il grip. Più downforce = più grip in curva, più drag in rettilineo.' },
    { sigla: 'BB (Brake Bias)', cat: 'Setup',   def: 'Bilanciamento della forza frenante tra anteriore e posteriore. Più avanti = frenata potente ma rischio bloccaggio ant.' },
    { sigla: 'Diff',          cat: 'Setup',     def: 'Differenziale — controlla come la coppia si distribuisce tra le ruote posteriori (o anteriori in FWD).' },
    { sigla: 'Caster',        cat: 'Setup',     def: 'Angolo di inclinazione del perno dello sterzo. Più caster = più stabilità, più recupero auto-sterzante.' },
    { sigla: 'ARB',           cat: 'Setup',     def: 'Anti-Roll Bar (barra stabilizzatrice) — resistenza al rollio laterale. Rigida = meno rollio, più sovrasterzo (post).' },
    { sigla: 'Bump / Rebound', cat: 'Setup',    def: 'Compressione (bump) ed estensione (rebound) degli ammortizzatori. Controlla la risposta alle variazioni di carico.' },
    { sigla: 'TC',            cat: 'Setup',     def: 'Traction Control — sistema elettronico che limita lo slittamento delle ruote motrici in accelerazione.' },
    { sigla: 'ABS',           cat: 'Setup',     def: 'Anti-lock Braking System — evita il bloccaggio delle ruote in frenata. In sim, imparare senza ABS è fondamentale.' },

    /* Race Craft */
    { sigla: 'Racing Line',   cat: 'Race Craft', def: 'Traiettoria ottimale in curva: entra largo, tocca l\'apex più interno, esci allargando. Permette la velocità massima.' },
    { sigla: 'Apex',          cat: 'Race Craft', def: 'Il punto più interno di una curva. Apex tardivo (più tardi nel giro) permette gas prima in uscita.' },
    { sigla: 'Trail Braking', cat: 'Race Craft', def: 'Tecnica di frenata: si riduce gradualmente la pressione del freno mentre si comincia a girare il volante.' },
    { sigla: 'Heel-Toe',      cat: 'Race Craft', def: 'Tecnica di scalata marcia: si frena con la punta del piede e si dà un blip di gas con il tallone/bordo contemporaneamente.' },
    { sigla: 'Oversteer',     cat: 'Race Craft', def: 'Sovrasterzo — il retrotreno perde grip e scivola verso l\'esterno. Si corregge con counter-steer e riducendo il gas.' },
    { sigla: 'Understeer',    cat: 'Race Craft', def: 'Sottosterzo — l\'anteriore perde grip e l\'auto va dritta nonostante si sterzi. Si corregge riducendo velocità.' },
    { sigla: 'Snap oversteer', cat: 'Race Craft', def: 'Sovrasterzo improvviso senza preavviso. Spesso causato da rilascio gas brusco in curva o da FFB poco comunicativo.' },
    { sigla: 'Tyre Deg',      cat: 'Race Craft', def: 'Degradazione delle gomme nel tempo. Gestirla significa guidare fluido, evitare slittamento eccessivo, modulare la pressione.' },
    { sigla: 'Out-lap',       cat: 'Race Craft', def: 'Giro di uscita dai box per scaldare gomme e freni prima del giro veloce.' },
    { sigla: 'In-lap',        cat: 'Race Craft', def: 'Giro di rientro ai box dopo un giro veloce o a fine stint. Si gestisce la temperature gomme per l\'eventuale pit stop.' },
    { sigla: 'Slipstream',    cat: 'Race Craft', def: 'Scia aerodinamica di un\'auto davanti. Riduce la resistenza dell\'aria, permette velocità maggiore in rettilineo.' },
    { sigla: 'DRS',           cat: 'Race Craft', def: 'Drag Reduction System — alettone posteriore apribile in zone definite. Riduce downforce/drag per facilitare i sorpassi.' },

    /* Generale */
    { sigla: 'iRating',       cat: 'Generale',  def: 'Rating competitivo di iRacing (Elo). Parte da 1350. Sale vincendo contro avversari più forti, scende perdendo.' },
    { sigla: 'SR',            cat: 'Generale',  def: 'Safety Rating — iRacing e ACC. Misura la pulizia di guida. Incidenti lo abbassano, gare pulite lo alzano.' },
    { sigla: 'Delta',         cat: 'Generale',  def: 'Differenza di tempo tra il lap corrente e un riferimento (best lap, giro precedente). Positivo = sei più lento.' },
    { sigla: 'Sector',        cat: 'Generale',  def: 'Settore della pista. Le piste sono divise in 3 settori per analizzare dove si guadagna/perde tempo.' },
    { sigla: 'Flying lap',    cat: 'Generale',  def: 'Giro veloce "at the limit" dopo un out-lap di riscaldamento. L\'obiettivo è il miglior tempo possibile.' },
    { sigla: 'Stint',         cat: 'Generale',  def: 'Periodo di guida continua senza pit stop. Un stint si pianifica in termini di giri, carburante e consumo gomme.' },
    { sigla: 'MoTeC',         cat: 'Generale',  def: 'Software di analisi telemetria. Legge i dati del veicolo (velocità, gas, freno, G-force) per analizzare la guida.' },
    { sigla: 'CrewChief',     cat: 'Generale',  def: 'App per sim racing con co-pilota vocale (in inglese). Legge dati AC/ACC/iRacing in tempo reale.' },
    { sigla: 'Content Manager', cat: 'Generale', def: 'Launcher alternativo per Assetto Corsa. Indispensabile per installare mod, CSP e gestire setup.' },
    { sigla: 'CSP',           cat: 'Generale',  def: 'Custom Shaders Patch — mod per AC che migliora grafica, fisica e aggiunge funzionalità (weather, ecc).' }
  ];

  var CATS = ['FFB', 'Setup', 'Race Craft', 'Generale'];

  function highlight(text, query) {
    if (!query) return text;
    var escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(' + escaped + ')', 'gi');
    return text.replace(re, '<mark>$1</mark>');
  }

  function renderResults(items, query) {
    if (!items.length) {
      return '<div class="empty-state"><div class="empty-state-icon">◌</div><p>Nessun termine trovato per "' + (query || '') + '"</p></div>';
    }

    /* Raggruppa per categoria */
    var bycat = {};
    CATS.forEach(function (c) { bycat[c] = []; });
    items.forEach(function (item) { bycat[item.cat].push(item); });

    return CATS.map(function (cat) {
      if (!bycat[cat].length) return '';
      return '<div class="glossary-group-label">' + cat + '</div>' +
        '<dl class="glossary-dl">' +
        bycat[cat].map(function (item) {
          return '<dt>' + highlight(item.sigla, query) + '</dt>' +
            '<dd>' + highlight(item.def, query) + '</dd>';
        }).join('') +
        '</dl>';
    }).join('');
  }

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Glossario</h1>' +
        '<p class="section-subtitle">Tutte le sigle e i termini del sim racing</p>' +
      '</div>' +

      '<div class="glossary-search">' +
        '<input type="text" id="glossary-input" placeholder="Cerca un termine... (es. FFB, oversteer, apex)" autocomplete="off">' +
      '</div>' +

      '<div id="glossary-results">' + renderResults(GLOSSARY, '') + '</div>' +

      utils.completionBarHTML('glossario');

    var input = document.getElementById('glossary-input');
    var resultsEl = document.getElementById('glossary-results');

    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var filtered = q
        ? GLOSSARY.filter(function (item) {
            return item.sigla.toLowerCase().includes(q) ||
                   item.def.toLowerCase().includes(q) ||
                   item.cat.toLowerCase().includes(q);
          })
        : GLOSSARY;
      resultsEl.innerHTML = renderResults(filtered, q);
    });

    input.focus();
    utils.bindCompletionBar(container, 'glossario');
  }

  window.SimRacing.sections.push({
    id: 'glossario',
    label: 'Glossario',
    icon: '≡',
    render: render
  });

}());
