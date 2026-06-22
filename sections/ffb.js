(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var FFB_PARAMS = [
    { sig: 'SEN', nome: 'Steering Sensitivity',    range: '1–1080°', desc: 'Gradi di rotazione fisici del volante.', tip: 'Imposta uguale al range dell\'auto in gioco. Auto Formula ~360°, GT/Turismo ~900°.' },
    { sig: 'FF',  nome: 'Force Feedback Strength', range: '0–100%',  desc: 'Forza complessiva del FFB.',            tip: 'Parti da 50–65%. Troppo alto = clipping, troppo basso = no feeling.' },
    { sig: 'FFS', nome: 'FFB Sensitivity',         range: '0–100%',  desc: 'Sensibilità alla variazione di forza.', tip: 'Default 50. Aumenta per più dettaglio nelle piccole variazioni di grip.' },
    { sig: 'NDP', nome: 'Natural Damper',          range: '0–100%',  desc: 'Smorzamento naturale (resistenza base).',tip: '10–20 per sim. Valori alti rendono il volante pesante e lento.' },
    { sig: 'NFR', nome: 'Natural Friction',        range: '0–100%',  desc: 'Attrito naturale del meccanismo.',       tip: 'Tenere basso (0–5) per non perdere dettaglio FFB.' },
    { sig: 'NIN', nome: 'Natural Inertia',         range: '0–100%',  desc: 'Inerzia naturale simulata.',             tip: 'Usare con cautela. Aggiunge peso realistico ma può mascherare segnali.' },
    { sig: 'INT', nome: 'Interpolation',           range: '0–10',    desc: 'Livello di interpolazione del segnale.', tip: '0–3 per sim racing. Valori alti rendono il FFB più fluido ma meno vivo.' },
    { sig: 'FEI', nome: 'FFB Effects Intensity',  range: '0–100%',  desc: 'Intensità effetti aggiuntivi (buche ecc.).', tip: '50 è un buon punto di partenza. Non sostituisce il vero FFB.' },
    { sig: 'SPR', nome: 'Spring Strength',         range: '0–100%',  desc: 'Forza dell\'effetto molla (centra volante).', tip: '0 per sim. Lo spring è un effetto del OS, non viene da AC/iRacing.' },
    { sig: 'DPR', nome: 'Damper Strength',         range: '0–100%',  desc: 'Smorzamento aggiuntivo OS-level.',        tip: '0 per sim. Può confondere con il vero FFB.' },
    { sig: 'BLI', nome: 'Brake Linearity',         range: '0–100%',  desc: 'Linearità della risposta del freno.',     tip: 'Default 0 (lineare). Aumenta se il freno ti sembra troppo secco all\'inizio della corsa.' }
  ];

  var PROFILES = {
    'Assetto Corsa': {
      note: 'Valori in app.ini (Documents/Assetto Corsa/cfg/)',
      lines: [
        'GAIN=85',
        'FILTER=0',
        'MIN_FORCE=0',
        'KERB_EFFECT=20',
        'ROAD_EFFECT=20',
        'SLIP_EFFECT=0',
        'ABS_EFFECT=20',
        '',
        '# CSP Content Manager → Impostazioni Controller',
        'FF (Fanatec): 70',
        'SEN: AUTO',
        'NDP: 15,  NFR: 0,  NIN: 0',
        'INT: 1,   FEI: 50, SPR: 0, DPR: 0'
      ].join('\n')
    },
    'ACC': {
      note: 'Controls.json — valore gain principale',
      lines: [
        '# ACC Control Settings',
        '"steerWheelRange": 900,',
        '"steerLinear": 0,',
        '"ffbMultiplier": 75,',
        '"ffbSteerRack": 35,',
        '"ffbSoftLock": 1,',
        '"ffbMinForce": 0,',
        '"ffbDynamic": 1,',
        '"ffbGainMinSpeed": 0',
        '',
        '# Fanatec Tuning Menu',
        'FF: 70,  SEN: AUTO',
        'SPR: 0,  DPR: 0,  NDP: 10'
      ].join('\n')
    },
    'iRacing': {
      note: 'Renderer.ini + in-game Force Feedback',
      lines: [
        '# iRacing app.ini',
        '[Force Feedback]',
        'Use Smoothing=0',
        'Smoothing Strength=0',
        'Min Force=0',
        'Max Force=32',
        '',
        '# In-game Options → Controls',
        'Overall Strength: 8 Nm (aggiusta per volante)',
        'Wheel Force: 7.0 Nm',
        'Damping: 0%',
        '',
        '# Fanatec',
        'FF: 100 (iRacing gestisce la forza)',
        'NDP: 5,  NFR: 0,  SPR: 0'
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
      causa:   'INT o NDP troppo alti mascherano il segnale di sovrasterzo',
      azione:  'Porta INT a 0–2 e NDP sotto 15. Segnali più vivi = più preavviso.'
    },
    {
      sintomo: 'Kerbs / dossi non si sentono',
      causa:   'FEI o effetti kerb/road settati a 0',
      azione:  'Aumenta FEI a 50–60 e kerb_effect / road_effect nel gioco.'
    },
    {
      sintomo: 'FFB sembra artificioso, "rubber-banding"',
      causa:   'SPR o DPR > 0',
      azione:  'Imposta SPR=0 e DPR=0. Questi sono effetti OS, non realistici.'
    },
    {
      sintomo: 'Il volante torna sempre al centro da solo',
      causa:   'SPR troppo alto',
      azione:  'Imposta SPR=0 nel profilo Fanatec e nel gioco.'
    }
  ];

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Force Feedback</h1>' +
        '<p class="section-subtitle">Sigle, configurazione e diagnostica FFB Fanatec</p>' +
      '</div>' +

      /* Parametri */
      '<h2 class="mb-2">Parametri Fanatec — Tuning Menu</h2>' +
      '<div class="table-wrap mb-4">' +
        '<table class="data-table">' +
          '<thead><tr><th>Sigla</th><th>Nome</th><th>Range</th><th>Descrizione</th><th>Consiglio pratico</th></tr></thead>' +
          '<tbody>' +
          FFB_PARAMS.map(function (p) {
            return '<tr>' +
              '<td><span class="mono">' + p.sig + '</span></td>' +
              '<td style="white-space:nowrap;">' + p.nome + '</td>' +
              '<td><span class="badge">' + p.range + '</span></td>' +
              '<td>' + p.desc + '</td>' +
              '<td class="text-muted" style="font-size:var(--text-xs);">' + p.tip + '</td>' +
            '</tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +

      /* Profili preset */
      '<h2 class="mb-2">Profili preset per sim</h2>' +
      '<div class="tab-switcher" id="ffb-tabs">' +
      Object.keys(PROFILES).map(function (k, i) {
        return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + k + '">' + k + '</button>';
      }).join('') +
      '</div>' +
      '<div id="ffb-tab-content"></div>' +

      /* Diagnostica */
      '<h2 class="mb-2 mt-4">Diagnostica — sintomi e soluzioni</h2>' +
      '<div id="ffb-accordion">' +
      DIAGNOSTICA.map(function (d) {
        return '<details>' +
          '<summary>' + d.sintomo + '</summary>' +
          '<div class="details-body">' +
            '<p><strong>Causa probabile:</strong> ' + d.causa + '</p>' +
            '<p style="margin-top:0.5rem;"><strong>Soluzione:</strong> ' + d.azione + '</p>' +
          '</div>' +
        '</details>';
      }).join('') +
      '</div>';

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
          '<button class="code-copy-btn" data-content="' + escapeAttr(p.lines) + '">Copia</button>' +
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

    utils.updateProgress('ffb', 10);
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
