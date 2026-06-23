(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  var TABS = {
    'Assetto Corsa': {
      badge: 'GRATIS / ECONOMICO',
      intro: 'Assetto Corsa (AC) è il punto di partenza ideale per la sim racing. Motore fisico eccellente, vastissima libreria di mod gratuiti, e la migliore compatibilità hardware.',
      sections: [
        {
          titolo: 'Content Manager (CM) — Setup consigliato',
          contenuto: [
            'Installa <strong>Content Manager</strong>: è il launcher alternativo, obbligatorio per usare i mod.',
            'Installa <strong>Custom Shaders Patch (CSP)</strong>: migliora graficamente AC e aggiunge funzionalità (weather, luci, physics migliorata).',
            'Installa <strong>Sol</strong> o <strong>Pure</strong>: shaders per cielo e meteo realistici.',
            'In CM → Settings → Custom Shaders Patch: abilita "Extended Physics" per piste e auto modded.'
          ]
        },
        {
          titolo: 'Mod essenziali',
          contenuto: [
            '<strong>Race Sim Studio (RSS) F3/F4:</strong> Monoposti Formula eccellenti, fisicamente accurati.',
            '<strong>URD T5 Bayro / Darche:</strong> GT3 di qualità superiore per allenamento tecnica.',
            '<strong>Kunos GT3 Pack:</strong> DLC ufficiale, base ottima per apprendimento.',
            '<strong>VRC Formula Lithium:</strong> Hypercar Formula per chi vuole sfida massima.',
            '<strong>Piste scansionate laser:</strong> Cerca su RaceDepartment piste come Imola, Monza, Spa laser-scanned.'
          ]
        },
        {
          titolo: 'Impostazioni grafiche consigliate',
          contenuto: [
            'Resolution: nativa del tuo monitor.',
            'MSAA: 4x (buon bilanciamento qualità/performance).',
            'World Detail: High. Shadow: Medium.',
            'Post-Process: High con CSP attivo, altrimenti Medium.',
            'VSync: Off, usa frame limiter del CM a 60 o la tua frequenza monitor.',
            'In CSP: abilita "Temporal Anti-Aliasing" per immagine più nitida.'
          ]
        },
        {
          titolo: 'Configurazione controller (CM)',
          contenuto: [
            'CM → Settings → Controls: seleziona il tuo volante Fanatec.',
            'Steering wheel range: lascia che lo gestisca il gioco (SEN su AUTO nel Tuning Menu).',
            'Steering gamma: 1.0 (lineare). Speed sensitivity: 0.',
            'Gain FF: 100% (la forza vera regolala dal volante/in-game). Clipping check: tasto F9 in pista (barra rossa = clip → abbassa il gain in-game).',
            'Freno: con la tua ClubSport Pedals V3 (load cell) metti brake gamma 1.0; calibra la durezza con BRF nel Tuning Menu, non con la pressione software.'
          ]
        },
        {
          titolo: 'Overlay / HUD: serve? (valutazione AC Drive)',
          contenuto: [
            '<strong>Cosa risolve un pacchetto overlay:</strong> l\'HUD nativo di AC è povero. Una suite come <strong>AC Drive</strong> (~25€, licenza a vita) aggiunge dashboard pedali/marce, delta in tempo reale, mappa, gap, gomme, calcolatore carburante, spotter e funzioni VR/streaming.',
            '<strong>Verdetto per te:</strong> a 25€ una-tantum è un acquisto sensato. La funzione che vale da sola il prezzo è il <strong>confronto telemetria con i top driver</strong>: vedere dove freni/acceleri rispetto a un riferimento è il modo più rapido per migliorare da principiante.',
            '<strong>Alternative gratuite</strong> prima di spendere: <em>CG Pedals/Dash</em>, <em>Sidekick</em>, <em>RaceEssentials</em>, <em>Helicorsa</em> (spotter). Provale: se l\'HUD integrato ti basta, rimanda l\'acquisto.',
            '<strong>Regola degli esperti (Driver61, Coach Dave):</strong> l\'overlay è uno strumento di <em>analisi</em>, non una stampella. Guida guardando la pista, poi studia i dati DOPO il run — non inseguire il delta in tempo reale curva per curva.'
          ]
        },
        {
          titolo: 'Come usare gli overlay per migliorare davvero',
          contenuto: [
            '<strong>1. Pedal trace su tutto:</strong> l\'errore #1 dei principianti è freno/gas on-off. Guarda la traccia: deve essere morbida, con rilascio progressivo del freno (trail braking), non un gradino.',
            '<strong>2. Delta a fine giro, non durante:</strong> usa il confronto col reference driver tra un run e l\'altro. Isola UN settore alla volta e lavoraci.',
            '<strong>3. Confronta input, non solo tempi:</strong> il valore del confronto telemetria è vedere <em>perché</em> il top driver è più veloce (frena più tardi? apre il gas prima? traiettoria più larga?).',
            '<strong>4. Spotter sempre attivo</strong> appena fai gare/traffico: sapere chi hai a fianco evita contatti (e in ACC/iRacing salva il Safety Rating).',
            '<strong>5. Disattiva il superfluo</strong> quando hai imparato la pista: troppi widget distraggono. Tieni delta, marce, gomme e spotter; togli il resto.'
          ]
        }
      ]
    },
    'ACC': {
      badge: 'GT WORLD CHALLENGE',
      intro: 'Assetto Corsa Competizione è specializzato nel GT3/GT4 e nel campionato GT World Challenge. Grafica migliore di AC, fisica GT specifica, sistema di safety rating.',
      sections: [
        {
          titolo: 'Differenze rispetto ad Assetto Corsa',
          contenuto: [
            '<strong>Fisica GT-specifica:</strong> ACC simula ABS, TC e le caratteristiche delle auto GT3 in modo accurato. Non è un simulatore generico.',
            '<strong>Niente mod:</strong> ACC non supporta mod di terze parti come AC. Solo il contenuto ufficiale Kunos.',
            '<strong>Meteo dinamico:</strong> ACC ha un sistema meteo e temperatura pista realistici.',
            '<strong>Stanchezza pilota (non simulata):</strong> a differenza di iRacing, non c\'è degradazione performance.',
            '<strong>Paddle shift obbligatorio:</strong> Le auto GT3 hanno cambio sequenziale via paddle. Usa i paddle del volante o imposta leva SEQ.'
          ]
        },
        {
          titolo: 'Sistema Safety Rating (SA) e Licenza',
          contenuto: [
            '<strong>Rating SA (0–99):</strong> Misura la tua pulizia in gara. Incidenti lo abbassano, gare pulite lo alzano.',
            '<strong>Rating PA (0–99+):</strong> Performance pura — quanto sei vicino al teorico reference driver.',
            '<strong>Server pubblici:</strong> Tutti li fanno, ma spesso caotico. Usa solo per pratica gara.',
            '<strong>Server ranked:</strong> Richiedono SA minimo (di solito 50+). Qualità di guida molto più alta.',
            '<strong>Consiglio:</strong> Fai 5-10 gare pubbliche per alzare SA prima dei ranked. Evita contatti a tutti i costi.'
          ]
        },
        {
          titolo: 'Impostazioni consigliate',
          contenuto: [
            'Options → Controls → Force Feedback: Gain 75%, Min Force 0%, Steer Rack 35%.',
            'Abilita "Dynamic Damping" per FFB che cambia con le condizioni.',
            'Steer Wheel Range: 900° per auto GT3.',
            'Camera: cockpit view obbligatoria per imparare bene i reference points.',
            'HUD: abilita delta lap, MFD tires, fuel gauge. Disabilita le frecce di traiettoria una volta imparata la pista.'
          ]
        }
      ]
    },
    'iRacing': {
      badge: 'COMPETITIVO / ABBONAMENTO',
      intro: 'iRacing è la piattaforma sim racing online più competitiva. Richiede abbonamento mensile ($13/mese circa) + acquisto piste e auto. Il sistema di licenze e iRating è lo standard del settore.',
      sections: [
        {
          titolo: 'Sistema licenze e iRating',
          contenuto: [
            '<strong>Classi licenza:</strong> Rookie → D → C → B → A → Pro. Sali di classe con Safety Rating (SR) abbastanza alto.',
            '<strong>iRating:</strong> Elo-based rating che misura le performance vs avversari. Parte da 1350.',
            '<strong>Safety Rating (SR):</strong> 1.0–4.99. Scende con incidenti, sale con gare pulite.',
            '<strong>Incident Points (x):</strong> Ogni contatto/uscita costa x punti. Se superi la soglia in una gara, penalità SR.',
            '<strong>Splits:</strong> I campi gara si dividono per iRating. Troverai avversari al tuo livello.'
          ]
        },
        {
          titolo: 'Come iniziare',
          contenuto: [
            'Iscriviti su iRacing.com. Il primo mese è spesso in sconto.',
            '<strong>Auto gratuite:</strong> Dallara F3, Mazda MX-5 Cup, Skippy. Inizia da Mazda Cup (più tecnica meno potenza).',
            '<strong>Piste gratuite:</strong> Sono incluse alcune piste. Watkins Glen, Silverstone per cominciare.',
            '<strong>Road to Pro:</strong> Segui il percorso Rookie → Mazda Cup → Spec Racer Ford → F3 → ...',
            '<strong>Prima gara:</strong> Fai 5+ test lap (Qualify) prima per imparare la pista. Non partire senza conoscere la pista.'
          ]
        },
        {
          titolo: 'Costi realistici',
          contenuto: [
            'Abbonamento: ~$13/mese o $110/anno (più conveniente).',
            'Auto: $12 ciascuna. Ne bastano 2-3 per iniziare (Mazda + una GT3).',
            'Piste: $12-15 ciascuna. Comprare solo quelle usate nella serie che corri.',
            '<strong>Budget consigliato primo anno:</strong> ~$150-200 (abbonamento + 3 auto + 5 piste).',
            '<strong>Alternativa economica:</strong> Inizia con AC/ACC, passa a iRacing quando sei competitivo.'
          ]
        },
        {
          titolo: 'Setup FFB in iRacing',
          contenuto: [
            'Options → Controls → Force Feedback: Overall Strength dipende dal volante.',
            'Per Fanatec: FF=100% nel tuning menu (iRacing gestisce la forza).',
            'In app.ini: "Use Smoothing=0" (vuoi segnale crudo, non filtrato).',
            'Min Force: 0. Wheel Force: match con il max Nm del tuo volante.',
            'Damping: 0% in-game. Usa NDP del Fanatec invece (5-15).'
          ]
        }
      ]
    }
  };

  function renderTabContent(key) {
    var tab = TABS[key];
    return '<div class="callout mb-3"><span class="badge" style="margin-right:0.5rem;">' + tab.badge + '</span>' + tab.intro + '</div>' +
      tab.sections.map(function (s) {
        return '<details>' +
          '<summary>' + s.titolo + '</summary>' +
          '<div class="details-body"><ul style="list-style:none;padding:0;">' +
          s.contenuto.map(function (c) {
            return '<li style="padding:0.375rem 0;border-bottom:1px solid var(--border);font-size:var(--text-sm);line-height:1.6;">' + c + '</li>';
          }).join('') +
          '</ul></div>' +
        '</details>';
      }).join('');
  }

  function render(container, state, utils) {
    var keys = Object.keys(TABS);

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Guide ai Giochi</h1>' +
        '<p class="section-subtitle">Assetto Corsa, ACC e iRacing: setup, mod e come iniziare</p>' +
      '</div>' +

      '<div class="tab-switcher" id="game-tabs">' +
      keys.map(function (k, i) {
        return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-tab="' + k + '">' + k + '</button>';
      }).join('') +
      '</div>' +

      '<div id="game-content">' + renderTabContent(keys[0]) + '</div>' +

      utils.completionBarHTML('giochi');

    container.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        container.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.getElementById('game-content').innerHTML = renderTabContent(btn.dataset.tab);
      });
    });

    utils.bindCompletionBar(container, 'giochi');
  }

  window.SimRacing.sections.push({
    id: 'giochi',
    label: 'Guide Giochi',
    icon: '▣',
    render: render
  });

}());
