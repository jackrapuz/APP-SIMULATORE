(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var SETUP_CATEGORIES = [
    {
      cat: 'Gomme & Pressioni',
      icon: '○',
      params: [
        { nome: 'Pressione gomme',        up: 'Risposta più diretta, meno contatto con asfalto',    down: 'Più contatto, più grip in curva lenta, ma più rotolamento' },
        { nome: 'Camber (campanatura)',    up: 'Più grip in curva (lato esterno caricato di più)',   down: 'Più contatto rettilineo, meno surriscaldamento in curva rapida' },
        { nome: 'Toe anteriore',          up: 'Toe-out: più reattività sterzo, possibile instabilità rettilineo', down: 'Toe-in: più stabilità, sterzo leggermente più lento' },
        { nome: 'Toe posteriore',         up: 'Toe-out: più sovrasterzo, instabilità ad alta velocità', down: 'Toe-in: più stabilità posteriore, meno sovrasterzo' }
      ]
    },
    {
      cat: 'Freni',
      icon: '◈',
      params: [
        { nome: 'Bilanciamento freni (BB %)', up: 'Più carico anteriore: frenata più potente ma rischio bloccaggio ant.', down: 'Più carico posteriore: meno bloccaggio ant., ma possibile bloccaggio post. (spin)' },
        { nome: 'Pressione freno massima',    up: 'Frenata più aggressiva, serve più sensibilità',      down: 'Frenata più progressiva, più facile da modulare' },
        { nome: 'Ducts / raffreddamento',     up: 'Freni più freddi, meno fade in stint lunghi',       down: 'Freni a temperatura ottimale più velocemente, utile piste corte' }
      ]
    },
    {
      cat: 'Aerodinamica',
      icon: '◁',
      params: [
        { nome: 'Ala anteriore (downforce)', up: 'Più grip anteriore, più stabilità, più drag',        down: 'Meno drag, più velocità max, possibile sottosterzo' },
        { nome: 'Ala posteriore (downforce)', up: 'Più grip posteriore, più stabilità, più drag',      down: 'Meno drag, possibile sovrasterzo in curva veloce' },
        { nome: 'Bilanciamento aero (Rake)', up: 'Più rake: più deportanza posteriore e anteriore dinamica', down: 'Meno rake: auto più piatta, comportamento più prevedibile' }
      ]
    },
    {
      cat: 'Sospensioni',
      icon: '⊞',
      params: [
        { nome: 'Altezza da terra (ant.)',    up: 'Più altezza: meno aerodinamica, più guardia da terra', down: 'Meno altezza: più aero, ma rischio strisciamento' },
        { nome: 'Altezza da terra (post.)',   up: 'Più altezza: più rake, più grip post. dinamico',       down: 'Meno altezza: meno rake, auto più neutrale' },
        { nome: 'Caster',                     up: 'Più caster: più stabilità in rettilineo, più carico camber dinamico', down: 'Meno caster: sterzo più leggero, meno ritorno automatico' }
      ]
    },
    {
      cat: 'Ammortizzatori',
      icon: '⋮',
      params: [
        { nome: 'Bump (compressione)',        up: 'Più rigido: auto reagisce subito ai dossi, meno rollio', down: 'Più morbido: assorbe meglio le buche, più confort di guida' },
        { nome: 'Rebound (estensione)',       up: 'Più rigido: gomme tornano a contatto velocemente',      down: 'Più morbido: transizioni più graduali, meno nervosismo' },
        { nome: 'Bump lento / veloce',        up: 'Bump veloce alto: resistenza a impatti improvvisi (kerbs)', down: 'Bump lento basso: rollio in curva più fluido' }
      ]
    },
    {
      cat: 'Geometria',
      icon: '△',
      params: [
        { nome: 'Stiffness barre ant.',       up: 'Più rigida: meno rollio, più reattività, possibile sottosterzo', down: 'Più morbida: più rollio, più grip anteriore in curva lenta' },
        { nome: 'Stiffness barre post.',      up: 'Più rigida: meno rollio post., più sovrasterzo',               down: 'Più morbida: più grip posteriore, più sottosterzo' },
        { nome: 'Molle anteriori',            up: 'Più rigide: meno rollio, risposta rapida',                      down: 'Più morbide: più grip in trazione, meglio su piste con dossi' }
      ]
    },
    {
      cat: 'Differenziale',
      icon: '⊕',
      params: [
        { nome: 'Precarico diff.',            up: 'Più blocco: più trazione in uscita, possibile instabilità',     down: 'Meno blocco: uscita più fluida, meno trazione su fondo bagnato' },
        { nome: 'Power (gas aperto)',         up: 'Più blocco: più spinta in rettilineo, ma sovrasterzo in gas',   down: 'Più aperto: meno sovrasterzo gas, più facilità di guida' },
        { nome: 'Coast (rilascio gas)',       up: 'Più blocco: stabilità in decelerazione in curva',               down: 'Più aperto: più sovrasterzo in rilascio, più naturale per alcuni' }
      ]
    }
  ];

  var WORKFLOW = [
    'Definisci la pista: layout (lento/misto/veloce), tipo di asfalto, temperature.',
    'Parti da un setup base (di solito il setup "safe" del gioco è equilibrato).',
    'Giro di ricognizione: identifica i 3-4 punti più critici (sovrasterzo, sottosterzo, instabilità).',
    'Modifica UN parametro alla volta. Non cambiare più cose contemporaneamente.',
    'Giro di confronto: stessa traiettoria, stessa velocità d\'ingresso. Misura il delta.',
    'Annota tutto nel Quaderno → Setup Salvati (sezione apposita nell\'app).',
    'Ripeti per ogni area problematica. Parti sempre dalle gomme e dai freni.',
    'Sesssione finale: giro flying con setup ottimizzato.'
  ];

  function render(container, state, utils) {
    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Setup Auto</h1>' +
        '<p class="section-subtitle">Parametri, effetti e workflow per il setup in pista</p>' +
      '</div>' +

      '<div class="callout mb-3"><strong>Principio base:</strong> Ogni modifica ha un effetto diretto e un effetto collaterale. Il setup è sempre un compromesso tra grip, stabilità e velocità massima.</div>' +

      /* Categorie accordion */
      '<h2 class="mb-2">Parametri per categoria</h2>' +
      '<div id="setup-accordion">' +
      SETUP_CATEGORIES.map(function (cat) {
        return '<details>' +
          '<summary>' +
            '<span>' + cat.icon + ' ' + cat.cat + '</span>' +
          '</summary>' +
          '<div class="details-body" style="padding:0;">' +
            '<table class="data-table">' +
              '<thead><tr>' +
                '<th>Parametro</th>' +
                '<th>Se aumenti →</th>' +
                '<th>Se diminuisci →</th>' +
              '</tr></thead>' +
              '<tbody>' +
              cat.params.map(function (p) {
                return '<tr>' +
                  '<td style="font-weight:500;min-width:160px;">' + p.nome + '</td>' +
                  '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + p.up + '</td>' +
                  '<td style="font-size:var(--text-xs);color:var(--ink-muted);">' + p.down + '</td>' +
                '</tr>';
              }).join('') +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</details>';
      }).join('') +
      '</div>' +

      /* Workflow */
      '<h2 class="mt-4 mb-2">Workflow setup per pista</h2>' +
      '<div class="card">' +
        '<ol class="step-list">' +
        WORKFLOW.map(function (s) {
          return '<li>' + s + '</li>';
        }).join('') +
        '</ol>' +
      '</div>' +

      '<div class="callout callout-red mt-3">' +
        '<strong>Regola d\'oro:</strong> Salva SEMPRE il setup base prima di modificare. Usa la sezione <a href="#quaderno" style="color:var(--red);">Quaderno → Setup Salvati</a> per avere una storia delle versioni.' +
      '</div>';

    utils.updateProgress('setup', 10);
  }

  window.SimRacing.sections.push({
    id: 'setup',
    label: 'Setup Auto',
    icon: '⚙',
    render: render
  });

}());
