(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* Valori reali dal manuale CSL DD QR2 (Advanced Tuning Menu).
     Default = valore di fabbrica Fanatec. */
  var FFB_PARAMS = [
    { sig: 'SEN', nome: 'Sensitivity',            range: 'AUTO / 90–2520°', def: 'AUTO', desc: 'Gradi di rotazione del volante.', tip: 'Lascia AUTO: AC/ACC/iRacing impostano il range corretto per ogni auto. Forza un valore solo se il gioco non lo gestisce.' },
    { sig: 'FF',  nome: 'Force Feedback',         range: 'OFF / 1–100',     def: '100', desc: 'Forza massima del motore.',     tip: 'Meglio alzare FF qui che lo strength in-game (evita clipping). Da principiante parti a 100 e regola la forza dal gioco.' },
    { sig: 'FFS', nome: 'FFB Scaling',            range: 'LIN / PEA',       def: 'PEA', desc: 'Linearità vs picco di coppia.', tip: 'Col tuo Boost Kit 180: PEA = 8 Nm (più forte), LIN = 6 Nm (più lineare e consistente). Parti da PEA.' },
    { sig: 'NDP', nome: 'Natural Damper',         range: 'OFF / 1–100',     def: '50',  desc: 'Smorzamento che frena la rotazione.', tip: 'Default 50 è il bilanciamento Fanatec: controlla il volante in sovrasterzo e riduce le oscillazioni. Abbassa solo se lo senti troppo "denso".' },
    { sig: 'NFR', nome: 'Natural Friction',       range: 'OFF / 1–100',     def: 'OFF', desc: 'Attrito meccanico simulato.',   tip: 'Tieni OFF. Alzalo poco (5–15) per simulare auto senza servosterzo. Aiuta anche contro le oscillazioni.' },
    { sig: 'NIN', nome: 'Natural Inertia',        range: 'OFF / 1–100',     def: 'OFF', desc: 'Peso/inerzia aggiuntiva.',      tip: 'OFF: il tuo volante RS è già pesante. Utile solo con volanti molto leggeri.' },
    { sig: 'INT', nome: 'FFB Interpolation',      range: 'OFF / 1–20',      def: '11',  desc: 'Filtro/smoothing del segnale.', tip: 'OFF = grezzo, 20 = massimo filtro. Il default 11 va bene; abbassa verso 1–5 per più dettaglio, alza se il FFB è "spigoloso".' },
    { sig: 'FEI', nome: 'Force Effect Intensity', range: '0–100',           def: '100', desc: 'Nitidezza degli effetti FFB.',  tip: '100 = più diretto e netto, 0 = più morbido. Abbassa (es. 60–80) se in un gioco il FFB è troppo aspro/spigoloso.' },
    { sig: 'FOR', nome: 'Force Effect',           range: 'OFF / 10–120',    def: '100', desc: 'Moltiplicatore segnale "forza".', tip: 'Lascia 100. Alza oltre 100 solo se un gioco ha un FFB più debole di altri (scalda di più il motore).' },
    { sig: 'SPR', nome: 'Spring Effect',          range: 'OFF / 10–120',    def: '100', desc: 'Moltiplicatore segnale "molla".', tip: 'IMPORTANTE: lascia 100. NON mettere a OFF/basso o il volante non si ricentra dopo la calibrazione. (Diverso dai volanti economici!)' },
    { sig: 'DPR', nome: 'Damper Effect',          range: 'OFF / 10–120',    def: '100', desc: 'Moltiplicatore segnale "damper".', tip: 'Lascia 100. È un modificatore del segnale del gioco, non un effetto arcade da azzerare.' },
    { sig: 'BLI', nome: 'Brake Level Indicator',  range: 'OFF / 1–100',     def: 'OFF', desc: 'Vibrazione del freno (tua CSP V3).', tip: 'Imposta il punto in cui il pedale vibra: ottimo per imparare il threshold braking. Prova 90–95. Funziona in ogni gioco.' },
    { sig: 'BRF', nome: 'Brake Force',            range: 'Lo / 1–100 / Hi', def: '50',  desc: 'Durezza della load cell (tua CSP V3).', tip: 'Quanta pressione serve per il 100% di freno. Alza se freni "a fondo" troppo facilmente, abbassa se ti stanca il polpaccio.' },
    { sig: 'SHO', nome: 'Shock / Vibration',      range: 'OFF / ON',        def: 'ON',  desc: 'Motori di vibrazione.',         tip: 'Lascia ON se vuoi le vibrazioni gestite dal gioco.' }
  ];

  var PROFILES = {
    'Assetto Corsa': {
      note: 'Content Manager → Settings → Assetto Corsa → Controls (consigliato usare CM).',
      lines: [
        '# Content Manager → Controls → FFB',
        'Gain: 100%',
        'Minimum Force: 0%   (il DD non ne ha bisogno)',
        'Filter (smoothing): 0%',
        'Enhanced understeer effect: OFF',
        '',
        '# Effetti (a gusto)',
        'Kerb effect: 20%',
        'Road effect: 20%',
        'Slip effect: 0%',
        '',
        '# Fanatec Tuning Menu (volante)',
        'SEN: AUTO   FF: 100   FFS: PEA',
        'NDP: 50   INT: 11   FEI: 100',
        'SPR/DPR/FOR: 100  (NON azzerare SPR)'
      ].join('\n')
    },
    'ACC': {
      note: 'In-game → Settings → Controls. ACC gestisce molto bene il FFB da solo.',
      lines: [
        '# ACC → Controls → Advanced',
        'Steer Lock / Rotation: gestito dal gioco',
        'Gain: 70-80%',
        'Minimum Force: 0%',
        'Dynamic Damping: ~80%',
        'Road Effects: 30-50%',
        '',
        '# Fanatec Tuning Menu (volante)',
        'SEN: AUTO   FF: 100   FFS: PEA',
        'NDP: 50   INT: 11   FEI: 100',
        'SPR/DPR/FOR: 100  (NON azzerare SPR)'
      ].join('\n')
    },
    'iRacing': {
      note: 'Options → Force Feedback. iRacing controlla la forza in Nm direttamente.',
      lines: [
        '# iRacing → Options → Force Feedback',
        'Strength: parti ~20-24 (auto-regola con "Auto")',
        'Use linear mode: ON',
        'Min Force: 0%  (DD non serve)',
        'Damping: 0%',
        'Reduce force when parked: ON',
        '',
        '# Fanatec Tuning Menu (volante)',
        'SEN: AUTO   FF: 100   FFS: PEA',
        'NDP: 50   INT: 11   FEI: 100',
        'SPR/DPR/FOR: 100  (NON azzerare SPR)'
      ].join('\n')
    }
  };

  var DIAGNOSTICA = [
    {
      sintomo: 'Volante troppo pesante e stancante',
      causa:   'FF o NDP troppo alti',
      azione:  'Riduci FF del 10–15% alla volta. NDP tieni sotto 20.'
    },
    {
      sintomo: 'Volante privo di feeling, troppo legero',
      causa:   'FF troppo basso o clipping',
      azione:  'Aumenta FF. Controlla clipping con la telemetria (AC: FFB clip in HUD).'
    },
    {
      sintomo: 'Oscillazioni (volante che oscilla da solo)',
      causa:   'FF troppo alto → clipping → oscillazioni auto-indotte',
      azione:  'Abbassa FF finché le oscillazioni cessano. Spesso basta –10%.'
    },
    {
      sintomo: 'Perdo il retrotreno senza preavviso',
      causa:   'INT troppo alto smussa il segnale di sovrasterzo',
      azione:  'Abbassa INT verso 1–5 e FEI verso 100. Segnali più nitidi = più preavviso. Non azzerare NDP (serve a controllare il sovrasterzo).'
    },
    {
      sintomo: 'Kerbs / dossi non si sentono',
      causa:   'FEI basso o effetti kerb/road a 0 nel gioco',
      azione:  'Porta FEI verso 100 e alza kerb/road effect nel gioco.'
    },
    {
      sintomo: 'FFB troppo aspro / spigoloso',
      causa:   'FEI a 100 + segnale grezzo in certi giochi',
      azione:  'Abbassa FEI (es. 60–80) e/o alza un po\' INT. NON toccare SPR/DPR.'
    },
    {
      sintomo: 'Il volante NON si ricentra dopo la calibrazione',
      causa:   'SPR impostato su OFF o valore basso',
      azione:  'Riporta SPR a 100. Su Fanatec lo Spring serve alla ricentratura: non va azzerato (errore comune copiato dai volanti economici).'
    },
    {
      sintomo: 'Il motore si scalda molto in fretta',
      causa:   'FOR/SPR/DPR alzati sopra 100, o ambiente poco areato',
      azione:  'Riportali a 100 e lascia spazio attorno alla base per il ricircolo d\'aria (raffreddamento passivo).'
    }
  ];

  function render(container, state, utils) {
    var pro = utils.isPro();
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Force Feedback</h1>' +
        '<p class="section-subtitle">Sigle, configurazione e diagnostica FFB Fanatec</p>' +
      '</div>' +

      /* Box hardware specifico */
      '<div class="callout mb-3">' +
        '<strong>Il tuo hardware:</strong> CSL DD + Boost Kit 180 → max <span class="mono">8 Nm</span> (FFS PEA) o <span class="mono">6 Nm</span> (FFS LIN). ' +
        'Pedaliera ClubSport V3 con load cell → puoi usare <span class="mono">BRF</span> e <span class="mono">BLI</span>. ' +
        'Apri il Tuning Menu premendo il pulsante dedicato sul volante RS; tieni premuto 4s per passare Standard↔Advanced.' +
        '<div class="mt-2" style="font-size:var(--text-xs);">' +
          '📄 <a href="CSL%20DD%20QR2%20BK%20180%20Manual%20_%20Quick%20Start%20Guide%20_%20Fanatec.pdf" target="_blank">Manuale CSL DD QR2</a>' +
          ' · 🎥 <a href="https://youtu.be/o11Vuzjq8Hc" target="_blank">Video guida ufficiale</a>' +
          ' · 🔧 <a href="https://fanatec.com/driver" target="_blank">Driver / Fanatec App</a>' +
        '</div>' +
      '</div>' +

      /* Setup base consigliato */
      '<h2 class="mb-2">Punto di partenza consigliato (principiante)</h2>' +
      '<div class="code-wrap mb-4">' +
        '<pre class="code-block">' + escapeHtml(
          'TUNING MENU — CSL DD + Boost Kit 180\n' +
          'SEN  AUTO     FF   100      FFS  PEA (8 Nm)\n' +
          'NDP  50       NFR  OFF      NIN  OFF\n' +
          'INT  11       FEI  100      \n' +
          'FOR  100      SPR  100      DPR  100   <- lasciali a 100\n' +
          'BRF  50       BLI  90       SHO  ON\n\n' +
          '# La forza vera regolala dal gioco, non abbassando FF.\n' +
          '# 8 Nm da principiante puo\' essere tanto: se ti stanca,\n' +
          '# riduci lo strength IN-GAME (non FF) o passa a FFS LIN.'
        ) + '</pre>' +
      '</div>' +

      /* Parametri */
      '<h2 class="mb-2">Parametri Fanatec — Tuning Menu</h2>' +
      (pro
        ? '<div class="table-wrap mb-4">' +
          '<table class="data-table">' +
            '<thead><tr><th>Sigla</th><th>Nome</th><th>Range</th><th>Default</th><th>Descrizione</th><th>Consiglio pratico</th></tr></thead>' +
            '<tbody>' +
            FFB_PARAMS.map(function (p) {
              return '<tr>' +
                '<td><span class="mono">' + p.sig + '</span></td>' +
                '<td style="white-space:nowrap;">' + p.nome + '</td>' +
                '<td><span class="badge">' + p.range + '</span></td>' +
                '<td><span class="mono text-red">' + p.def + '</span></td>' +
                '<td>' + p.desc + '</td>' +
                '<td class="text-muted" style="font-size:var(--text-xs);">' + p.tip + '</td>' +
              '</tr>';
            }).join('') +
            '</tbody>' +
          '</table>' +
        '</div>'
        : utils.paywallCardHTML('La tabella completa dei parametri FFB Fanatec è PRO.')) +

      /* Profili preset */
      '<h2 class="mb-2">Profili preset per sim</h2>' +
      (pro
        ? '<div class="tab-switcher" id="ffb-tabs">' +
          Object.keys(PROFILES).map(function (k, i) {
            return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + k + '">' + k + '</button>';
          }).join('') +
          '</div>' +
          '<div id="ffb-tab-content"></div>'
        : utils.paywallCardHTML('I profili preset FFB pronti all\'uso per ogni sim sono PRO.')) +

      /* Diagnostica */
      '<h2 class="mb-2 mt-4">Diagnostica — sintomi e soluzioni</h2>' +
      (pro
        ? '<div id="ffb-accordion">' +
          DIAGNOSTICA.map(function (d) {
            return '<details>' +
              '<summary>' + d.sintomo + '</summary>' +
              '<div class="details-body">' +
                '<p><strong>Causa probabile:</strong> ' + d.causa + '</p>' +
                '<p style="margin-top:0.5rem;"><strong>Soluzione:</strong> ' + d.azione + '</p>' +
              '</div>' +
            '</details>';
          }).join('') +
          '</div>'
        : utils.paywallCardHTML('La diagnostica FFB sintomo→soluzione è PRO.')) +

      utils.completionBarHTML('ffb');

    /* Render first tab */
    renderTab(Object.keys(PROFILES)[0]);

    /* Tab switcher */
    container.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        renderTab(btn.dataset.tab);
      });
    });

    function renderTab(key) {
      var p = PROFILES[key];
      var content = document.getElementById('ffb-tab-content');
      if (!content) return;
      content.innerHTML =
        '<p class="text-muted text-sm mb-2">' + p.note + '</p>' +
        '<div class="code-wrap">' +
          '<pre class="code-block">' + escapeHtml(p.lines) + '</pre>' +
          '<button class="code-copy-btn" data-content="' + escapeAttr(p.lines) + '" aria-label="Copia configurazione negli appunti">Copia</button>' +
        '</div>';

      content.querySelector('.code-copy-btn').addEventListener('click', function () {
        var btn = this;
        var text = p.lines;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () { flashCopied(btn); });
        } else {
          /* Fallback */
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          flashCopied(btn);
        }
      });
    }

    utils.bindCompletionBar(container, 'ffb');
  }

  function flashCopied(btn) {
    btn.textContent = '✓ Copiato';
    btn.classList.add('copied');
    setTimeout(function () { btn.textContent = 'Copia'; btn.classList.remove('copied'); }, 1500);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeAttr(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;');
  }

  window.SimRacing.sections.push({
    id: 'ffb',
    label: 'Force Feedback',
    icon: '◎',
    render: render
  });

}());
