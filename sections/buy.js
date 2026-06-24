(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* [PLACEHOLDER] — incolla qui il link/overlay checkout di Lemon Squeezy. */
  var LEMON_SQUEEZY_URL = 'https://lemonsqueezy.com/[PLACEHOLDER_CHECKOUT]';

  var FEATURES = [
    { f: 'Profilo pilota, dashboard, glossario, teoria base', free: true,  pro: true },
    { f: 'Guida postazione: primi 3 passi', free: true,  pro: true },
    { f: 'Guida postazione completa (9 passi)', free: false, pro: true },
    { f: 'Force Feedback: parametri, preset e diagnostica', free: false, pro: true },
    { f: 'Esercizi progressivi: tutte le fasi (non solo le prime 4)', free: false, pro: true },
    { f: 'Setup auto: livelli Intermedio e Avanzato + diagnostica completa', free: false, pro: true },
    { f: 'Quaderno: sessioni e setup illimitati', free: false, pro: true },
    { f: 'Confronto setup affiancato + export PDF', free: false, pro: true }
  ];

  var FAQ = [
    { q: 'È un abbonamento?', a: 'No. È un pagamento unico una tantum. Una volta sbloccato, è tuo.' },
    { q: 'Su quanti dispositivi funziona?', a: 'La license key è legata al tuo racing tag. Puoi attivarla sui tuoi dispositivi reinserendola.' },
    { q: 'Come ricevo la key?', a: 'Dopo il pagamento ricevi la license key via email (Lemon Squeezy). La incolli qui sotto per sbloccare.' },
    { q: 'Funziona offline?', a: 'Sì. L\'attivazione e tutta l\'app funzionano offline una volta caricata.' }
  ];

  function render(container, state, utils) {
    var info = utils.licenseInfo();
    var pro = utils.isPro();

    var statusBanner = '';
    if (info.valid) {
      statusBanner = '<div class="callout"><strong>✓ Versione PRO attiva.</strong> Grazie! Tutte le sezioni sono sbloccate.</div>';
    } else if (info.trialActive) {
      statusBanner = '<div class="callout"><strong>Prova PRO attiva</strong> — ti restano ' + info.trialDaysLeft +
        ' giorni. Sblocca a vita per non perdere l\'accesso.</div>';
    }

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Sblocca Sim Racing Academy PRO</h1>' +
        '<p class="section-subtitle">Dal primo giro alla guida competitiva — tutto il percorso, sempre con te.</p>' +
      '</div>' +

      statusBanner +

      '<div class="card mb-3 buy-hero">' +
        '<div class="buy-price"><span class="buy-price-amount">24€</span> <span class="buy-price-note">una tantum · niente abbonamento</span></div>' +
        '<p class="text-muted text-sm">Pagamento sicuro via Lemon Squeezy (IVA inclusa). Garanzia rimborso 14 giorni.</p>' +
        (pro
          ? '<button class="btn" disabled>Già sbloccato ✓</button>'
          : '<a class="btn buy-cta" href="' + LEMON_SQUEEZY_URL + '" target="_blank" rel="noopener">Acquista PRO — 24€</a>' +
            '<button class="btn btn-ghost" id="buy-trial">Prova PRO 7 giorni gratis</button>'
        ) +
      '</div>' +

      '<div class="buy-video-slot card mb-3">' +
        '<span class="text-muted text-sm">[PLACEHOLDER] Video demo dell\'app</span>' +
      '</div>' +

      '<h2 class="mb-2">Cosa include</h2>' +
      '<div class="table-wrap mb-3">' +
        '<table class="data-table buy-compare">' +
          '<thead><tr><th>Funzione</th><th>FREE</th><th>PRO</th></tr></thead>' +
          '<tbody>' +
          FEATURES.map(function (r) {
            return '<tr>' +
              '<td>' + r.f + '</td>' +
              '<td>' + (r.free ? '✓' : '—') + '</td>' +
              '<td class="buy-pro-cell">✓</td>' +
            '</tr>';
          }).join('') +
          '</tbody>' +
        '</table>' +
      '</div>' +

      '<h2 class="mb-2">Hai già una license key?</h2>' +
      '<div class="card mb-3">' +
        '<div class="form-field">' +
          '<label for="lic-input">Incolla la tua license key</label>' +
          '<input type="text" id="lic-input" placeholder="xxxxx.yyyyy" autocomplete="off"' +
            (pro ? ' disabled' : '') + '>' +
        '</div>' +
        '<button class="btn" id="lic-activate"' + (pro ? ' disabled' : '') + '>Attiva</button>' +
        '<p class="lic-feedback" id="lic-feedback" role="status"></p>' +
        '<p class="text-muted text-xs mt-1">La key è legata al racing tag del tuo Profilo. Imposta il tag prima di attivare.</p>' +
      '</div>' +

      '<h2 class="mb-2">Domande frequenti</h2>' +
      '<div class="mb-3">' +
        FAQ.map(function (item) {
          return '<details class="mb-1"><summary>' + item.q + '</summary>' +
            '<div class="details-body"><p class="text-sm text-muted">' + item.a + '</p></div></details>';
        }).join('') +
      '</div>' +

      '<div class="callout"><strong>Garanzia 14 giorni:</strong> se non fa per te, scrivici entro 14 giorni e ti rimborsiamo. Nessuna domanda.</div>';

    /* ---------- Prova PRO ---------- */
    var trialBtn = container.querySelector('#buy-trial');
    if (trialBtn) {
      trialBtn.addEventListener('click', function () {
        utils.startTrial();
        render(container, state, utils);
      });
    }

    /* ---------- Attivazione key ---------- */
    var activateBtn = container.querySelector('#lic-activate');
    var input = container.querySelector('#lic-input');
    var feedback = container.querySelector('#lic-feedback');
    if (activateBtn && input) {
      activateBtn.addEventListener('click', function () {
        var key = input.value.trim();
        if (!key) {
          feedback.textContent = 'Inserisci una key.';
          feedback.className = 'lic-feedback is-error';
          return;
        }
        feedback.textContent = 'Verifica in corso…';
        feedback.className = 'lic-feedback';
        activateBtn.disabled = true;
        utils.activateLicense(key).then(function (res) {
          if (res.ok) {
            feedback.textContent = '✓ PRO attivato. Grazie!';
            feedback.className = 'lic-feedback is-ok';
            render(container, state, utils);
          } else {
            feedback.textContent = '✗ ' + (res.error || 'Key non valida.');
            feedback.className = 'lic-feedback is-error';
            activateBtn.disabled = false;
          }
        });
      });
    }
  }

  window.SimRacing.sections.push({
    id: 'buy',
    label: '✦ Sblocca PRO',
    icon: '✦',
    render: render
  });

}());
