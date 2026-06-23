/* ============================================================
   PROFILO PILOTA — "Licenza FIA + scheda tecnica vettura"
   Landing dell'app. Tutto offline, localStorage chiave `profile`.
   ============================================================ */

(function () {
  'use strict';

  window.SimRacing = window.SimRacing || {};
  window.SimRacing.sections = window.SimRacing.sections || [];

  /* ---------- Default (hardware reale da CLAUDE.md) ---------- */
  function defaults() {
    return {
      identity: {
        tag: '',
        avatar: null,            // dataURL JPEG o null
        nationality: '🇮🇹',
        birthYear: '',
        bio: ''
      },
      rig: {
        base: 'Fanatec CSL DD QR2 (8 Nm · Boost Kit 180)',
        wheel: 'ClubSport Steering Wheel RS',
        pedals: 'ClubSport Pedals V3',
        pedalType: 'Load cell',
        shifter: 'ClubSport Shifter SQ V1.5',
        handbrake: '',
        cockpit: 'CSL Cockpit V1.5 + Seat Bundle',
        monitorSetup: 'Singolo',
        monitorInch: '',
        monitorDist: ''
      },
      prefs: {
        games: [],
        categories: [],
        level: '',
        goal: ''
      }
    };
  }

  var GAMES = ['Assetto Corsa', 'ACC', 'iRacing', 'Gran Turismo', 'Altro'];
  var CATEGORIES = ['GT3', 'Touge / JDM', 'Formula', 'Rally', 'Drift', 'Endurance', 'Stradali'];
  var LEVELS = ['Novizio', 'In allenamento', 'Competitivo'];
  var NATIONS = ['🇮🇹', '🇯🇵', '🇩🇪', '🇬🇧', '🇫🇷', '🇪🇸', '🇺🇸', '🏁'];
  var WATERMARK = '[PLACEHOLDER]';   // dominio da confermare in Fase 4

  /* ---------- Helpers ---------- */
  function today() { return new Date().toISOString().slice(0, 10); }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Deep-merge dei default coi dati salvati (campi mancanti = default). */
  function mergeDefaults(saved) {
    var d = defaults();
    if (!saved || typeof saved !== 'object') return d;
    ['identity', 'rig', 'prefs'].forEach(function (k) {
      var src = saved[k];
      if (src && typeof src === 'object') {
        Object.keys(d[k]).forEach(function (f) {
          if (src[f] !== undefined && src[f] !== null) d[k][f] = src[f];
        });
      }
    });
    return d;
  }

  /* Pre-compila monitor da postazione_fov {diag, dist} se profilo vuoto. */
  function fillFromPostazione(profile, utils) {
    var fov = utils.load('postazione_fov', null);
    if (!fov) return;
    if (!profile.rig.monitorInch && fov.diag != null) profile.rig.monitorInch = String(fov.diag);
    if (!profile.rig.monitorDist && fov.dist != null) profile.rig.monitorDist = String(fov.dist);
  }

  /* Colore deterministico dal tag (hash → HSL). */
  function tagColor(tag) {
    var s = (tag || 'PILOTA').toUpperCase();
    var h = 0;
    for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 360; }
    return 'hsl(' + h + ', 55%, 42%)';
  }

  function initials(tag) {
    var s = (tag || '').trim();
    if (!s) return '?';
    var parts = s.split(/[\s_\-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return s.slice(0, 2).toUpperCase();
  }

  function avatarInner(profile) {
    var id = profile.identity;
    if (id.avatar) {
      return '<img src="' + id.avatar + '" alt="Avatar pilota">';
    }
    return '<span class="pilot-avatar-initials" style="background:' + tagColor(id.tag) + ';">' +
      escapeHtml(initials(id.tag)) + '</span>';
  }

  /* ---------- Render ---------- */
  function render(container, state, utils) {
    var profile = mergeDefaults(utils.load('profile', null));
    fillFromPostazione(profile, utils);
    utils.save('profile', profile);   // persiste eventuali pre-compilazioni

    var nb = state.notebook || {};
    var sessions = nb.sessions || [];
    var setups = nb.setups || [];
    var pct = utils.globalPct();
    var activity = utils.computeActivity(sessions);
    var streakText = activity.streak > 0
      ? '<span class="streak-flame">🔥</span>' + activity.streak + (activity.streak === 1 ? ' giorno' : ' giorni')
      : '—';

    var id = profile.identity, rig = profile.rig, prefs = profile.prefs;

    /* Tag livello/obiettivo riusando le varianti esistenti. */
    var levelTag = prefs.level
      ? '<span class="tag tag-tan">' + escapeHtml(prefs.level) + '</span>' : '';
    var goalTag = prefs.goal
      ? '<span class="tag tag-red">🎯 ' + escapeHtml(prefs.goal) + '</span>' : '';

    container.innerHTML =
      '<div class="section-header">' +
        '<h1>Profilo Pilota</h1>' +
        '<p class="section-subtitle">La tua licenza e la scheda tecnica della postazione</p>' +
      '</div>' +

      /* ---- Pilot card ---- */
      '<div class="card pilot-card mb-3">' +
        '<div class="pilot-avatar" id="pilot-avatar">' + avatarInner(profile) + '</div>' +
        '<div class="pilot-id">' +
          '<div class="pilot-flag">' + escapeHtml(id.nationality || '🏁') + '</div>' +
          '<div class="pilot-tag" id="pilot-tag-text">' +
            escapeHtml(id.tag || 'PILOTA SENZA NOME') + '</div>' +
          (id.bio ? '<p class="pilot-bio">' + escapeHtml(id.bio) + '</p>' : '') +
          '<div class="pilot-tags">' + levelTag + goalTag + '</div>' +
        '</div>' +
      '</div>' +

      /* ---- HUD stats ---- */
      '<div class="cards-grid mb-3">' +
        '<div class="card">' +
          '<div class="card-title">Completamento</div>' +
          '<div class="card-value">' + pct + '%</div>' +
          '<div class="mt-2">' + utils.shiftStripHTML(pct, { cells: 14 }) + '</div>' +
        '</div>' +
        '<div class="card streak-card">' +
          '<div class="card-title">Streak</div>' +
          '<div class="card-value" style="font-family:var(--font-display);">' + streakText + '</div>' +
          '<p class="text-muted text-xs mt-1">' + activity.last7 + ' sessioni negli ultimi 7 giorni</p>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-title">Sessioni Log</div>' +
          '<div class="card-value">' + sessions.length + '</div>' +
        '</div>' +
        '<div class="card">' +
          '<div class="card-title">Setup Salvati</div>' +
          '<div class="card-value">' + setups.length + '</div>' +
        '</div>' +
      '</div>' +

      /* ---- Scheda tecnica ---- */
      '<h3 class="mb-1">Scheda tecnica postazione</h3>' +
      '<div class="table-wrap spec-sheet mb-3">' +
        '<table class="data-table">' +
          specRow('Base sterzo', rig.base) +
          specRow('Volante', rig.wheel) +
          specRow('Pedaliera', rig.pedals + (rig.pedalType ? ' · ' + rig.pedalType : '')) +
          specRow('Cambio', rig.shifter) +
          (rig.handbrake ? specRow('Freno a mano', rig.handbrake) : '') +
          specRow('Cockpit', rig.cockpit) +
          specRow('Monitor', monitorLabel(rig)) +
        '</table>' +
      '</div>' +

      /* ---- Form collassabili ---- */
      buildForm(profile) +

      /* ---- Export / Import ---- */
      '<h3 class="mb-1 mt-3">Condividi & backup</h3>' +
      '<div class="card">' +
        '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">' +
          '<button class="btn" id="prof-export-json">Esporta JSON</button>' +
          '<button class="btn btn-ghost" id="prof-export-png">Esporta immagine PNG</button>' +
          '<button class="btn btn-ghost" id="prof-import-btn">Importa JSON</button>' +
          '<input type="file" id="prof-import-file" accept="application/json,.json" hidden>' +
          '<input type="file" id="prof-avatar-file" accept="image/*" hidden>' +
        '</div>' +
        '<p class="field-error" id="prof-err" role="alert" hidden></p>' +
        '<p class="text-muted text-xs mt-2">Tutto resta sul tuo PC. L\'immagine PNG è pensata per condividere la tua licenza.</p>' +
      '</div>';

    bind(container, profile, state, utils);
  }

  function specRow(label, value) {
    return '<tr><th scope="row" style="white-space:nowrap;">' + escapeHtml(label) + '</th>' +
      '<td>' + escapeHtml(value || '—') + '</td></tr>';
  }

  function monitorLabel(rig) {
    var bits = [];
    if (rig.monitorSetup) bits.push(rig.monitorSetup);
    if (rig.monitorInch) bits.push(rig.monitorInch + '"');
    if (rig.monitorDist) bits.push(rig.monitorDist + ' cm');
    return bits.join(' · ');
  }

  /* ---------- Form ---------- */
  function field(label, path, value, attrs) {
    return '<div class="form-field"><label>' + escapeHtml(label) + '</label>' +
      '<input type="' + (attrs && attrs.type || 'text') + '" data-field="' + path + '"' +
      (attrs && attrs.maxlength ? ' maxlength="' + attrs.maxlength + '"' : '') +
      (attrs && attrs.placeholder ? ' placeholder="' + escapeHtml(attrs.placeholder) + '"' : '') +
      (attrs && attrs.min != null ? ' min="' + attrs.min + '"' : '') +
      (attrs && attrs.max != null ? ' max="' + attrs.max + '"' : '') +
      ' value="' + escapeHtml(value) + '"></div>';
  }

  function selectField(label, path, value, options) {
    var opts = '<option value="">—</option>' + options.map(function (o) {
      return '<option value="' + escapeHtml(o) + '"' + (o === value ? ' selected' : '') + '>' +
        escapeHtml(o) + '</option>';
    }).join('');
    return '<div class="form-field"><label>' + escapeHtml(label) + '</label>' +
      '<select data-field="' + path + '">' + opts + '</select></div>';
  }

  function checkGroup(label, path, selected, options) {
    var sel = selected || [];
    return '<div class="form-field"><label>' + escapeHtml(label) + '</label>' +
      '<div style="display:flex;flex-wrap:wrap;gap:0.5rem;">' +
      options.map(function (o) {
        var on = sel.indexOf(o) !== -1;
        return '<label class="tag' + (on ? ' tag-tan' : '') + '" style="cursor:pointer;gap:0.35em;">' +
          '<input type="checkbox" data-multi="' + path + '" value="' + escapeHtml(o) + '"' +
          (on ? ' checked' : '') + ' style="margin:0;width:auto;"> ' + escapeHtml(o) + '</label>';
      }).join('') +
      '</div></div>';
  }

  function buildForm(profile) {
    var id = profile.identity, rig = profile.rig, prefs = profile.prefs;
    return '' +
      '<h3 class="mb-1">Modifica profilo</h3>' +
      '<details open><summary>Identità</summary><div class="details-body">' +
        '<div class="form-field"><label>Avatar</label>' +
          '<button class="btn btn-ghost btn-sm" id="prof-avatar-btn" type="button">Carica foto…</button> ' +
          (id.avatar ? '<button class="btn btn-ghost btn-sm" id="prof-avatar-clear" type="button">Rimuovi</button>' : '') +
          '<p class="text-muted text-xs mt-1">Senza foto vengono usate le iniziali del racing tag.</p>' +
        '</div>' +
        '<div class="form-grid">' +
          field('Racing tag', 'identity.tag', id.tag, { maxlength: 24, placeholder: 'RX7_GIACOMO' }) +
          selectField('Nazionalità', 'identity.nationality', id.nationality, NATIONS) +
          field('Anno di nascita', 'identity.birthYear', id.birthYear, { type: 'number', min: 1950, max: 2020, placeholder: '1999' }) +
        '</div>' +
        '<div class="form-field"><label>Bio (max 200)</label>' +
          '<textarea data-field="identity.bio" maxlength="200" rows="2" ' +
          'placeholder="Initial D, touge, RX-7 FD a lungo termine…">' + escapeHtml(id.bio) + '</textarea></div>' +
      '</div></details>' +

      '<details><summary>Postazione</summary><div class="details-body">' +
        '<div class="form-grid">' +
          field('Base sterzo', 'rig.base', rig.base) +
          field('Volante', 'rig.wheel', rig.wheel) +
          field('Pedaliera', 'rig.pedals', rig.pedals) +
          field('Tipo pedali', 'rig.pedalType', rig.pedalType, { placeholder: 'Load cell' }) +
          field('Cambio', 'rig.shifter', rig.shifter) +
          field('Freno a mano', 'rig.handbrake', rig.handbrake, { placeholder: 'Nessuno' }) +
          field('Cockpit', 'rig.cockpit', rig.cockpit) +
          selectField('Monitor', 'rig.monitorSetup', rig.monitorSetup, ['Singolo', 'Triplo', 'Ultrawide', 'VR']) +
          field('Diagonale (pollici)', 'rig.monitorInch', rig.monitorInch, { type: 'number', min: 15, max: 65, placeholder: '32' }) +
          field('Distanza occhi (cm)', 'rig.monitorDist', rig.monitorDist, { type: 'number', min: 30, max: 150, placeholder: '65' }) +
        '</div>' +
        '<p class="text-muted text-xs">Diagonale e distanza si pre-compilano dal calcolatore FOV in Postazione, se l\'hai usato.</p>' +
      '</div></details>' +

      '<details><summary>Preferenze</summary><div class="details-body">' +
        checkGroup('Simulatori', 'prefs.games', prefs.games, GAMES) +
        checkGroup('Categorie preferite', 'prefs.categories', prefs.categories, CATEGORIES) +
        '<div class="form-grid">' +
          selectField('Livello', 'prefs.level', prefs.level, LEVELS) +
          field('Obiettivo', 'prefs.goal', prefs.goal, { maxlength: 60, placeholder: 'Pista pulita a Spa in GT3' }) +
        '</div>' +
      '</div></details>';
  }

  /* ---------- Bind ---------- */
  function bind(container, profile, state, utils) {
    var saveTimer = null;
    function saveSoon() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { utils.save('profile', profile); }, 400);
    }
    function setPath(path, value) {
      var parts = path.split('.');
      profile[parts[0]][parts[1]] = value;
    }

    /* Input testuali / textarea: autosave senza re-render (mantiene il focus). */
    container.querySelectorAll('[data-field]').forEach(function (el) {
      var ev = el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, function () {
        setPath(el.dataset.field, el.value);
        saveSoon();
        if (el.dataset.field === 'identity.tag') updateAvatarLive(container, profile);
        if (ev === 'change') utils.save('profile', profile);   // select: persisti subito
      });
    });

    /* Checkbox multipli (games / categories). */
    container.querySelectorAll('[data-multi]').forEach(function (cb) {
      cb.addEventListener('change', function () {
        var parts = cb.dataset.multi.split('.');
        var arr = profile[parts[0]][parts[1]] || (profile[parts[0]][parts[1]] = []);
        var i = arr.indexOf(cb.value);
        if (cb.checked && i === -1) arr.push(cb.value);
        else if (!cb.checked && i !== -1) arr.splice(i, 1);
        utils.save('profile', profile);
        cb.closest('.tag').classList.toggle('tag-tan', cb.checked);
      });
    });

    /* Avatar upload. */
    var avatarFile = container.querySelector('#prof-avatar-file');
    var avatarBtn = container.querySelector('#prof-avatar-btn');
    if (avatarBtn && avatarFile) {
      avatarBtn.addEventListener('click', function () { avatarFile.click(); });
      avatarFile.addEventListener('change', function () {
        var f = avatarFile.files && avatarFile.files[0];
        if (!f) return;
        downscaleToDataURL(f, 256, function (dataURL) {
          profile.identity.avatar = dataURL;
          utils.save('profile', profile);
          render(container, state, utils);   // re-render: mostra foto + bottone Rimuovi
        }, function () { showErr(container, 'Immagine non valida.'); });
      });
    }
    var avatarClear = container.querySelector('#prof-avatar-clear');
    if (avatarClear) {
      avatarClear.addEventListener('click', function () {
        profile.identity.avatar = null;
        utils.save('profile', profile);
        render(container, state, utils);
      });
    }

    /* Export JSON. */
    var exJson = container.querySelector('#prof-export-json');
    if (exJson) exJson.addEventListener('click', function () {
      try {
        var blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'simracing-profilo-' + today() + '.json';
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) { showErr(container, 'Export non riuscito.'); }
    });

    /* Export PNG. */
    var exPng = container.querySelector('#prof-export-png');
    if (exPng) exPng.addEventListener('click', function () {
      try { exportPNG(profile, state, utils); }
      catch (e) { showErr(container, 'Export immagine non riuscito.'); }
    });

    /* Import JSON. */
    var imBtn = container.querySelector('#prof-import-btn');
    var imFile = container.querySelector('#prof-import-file');
    if (imBtn && imFile) {
      imBtn.addEventListener('click', function () { imFile.click(); });
      imFile.addEventListener('change', function () {
        var f = imFile.files && imFile.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          try {
            var data = JSON.parse(reader.result);
            if (!data || typeof data !== 'object' || (!data.identity && !data.rig && !data.prefs)) {
              throw new Error('shape');
            }
            var merged = mergeDefaults(data);
            utils.save('profile', merged);
            render(container, state, utils);
          } catch (e) { showErr(container, 'File non valido: serve un profilo esportato da qui.'); }
        };
        reader.onerror = function () { showErr(container, 'Lettura file non riuscita.'); };
        reader.readAsText(f);
      });
    }
  }

  function showErr(container, msg) {
    var el = container.querySelector('#prof-err');
    if (el) { el.textContent = msg; el.hidden = false; }
  }

  /* Aggiorna nome + avatar iniziali live mentre si digita il tag. */
  function updateAvatarLive(container, profile) {
    var nameEl = container.querySelector('#pilot-tag-text');
    if (nameEl) nameEl.textContent = profile.identity.tag || 'PILOTA SENZA NOME';
    if (profile.identity.avatar) return;   // foto presente: niente iniziali
    var av = container.querySelector('#pilot-avatar');
    if (av) av.innerHTML = avatarInner(profile);
  }

  /* ---------- Avatar downscale (canvas) ---------- */
  function downscaleToDataURL(file, size, onOk, onErr) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          var ctx = canvas.getContext('2d');
          /* crop centrale quadrato + cover */
          var s = Math.min(img.width, img.height);
          var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          onOk(canvas.toDataURL('image/jpeg', 0.85));
        } catch (e) { onErr(); }
      };
      img.onerror = onErr;
      img.src = reader.result;
    };
    reader.onerror = onErr;
    reader.readAsDataURL(file);
  }

  /* ---------- Export PNG (licenza condivisibile) ---------- */
  function exportPNG(profile, state, utils) {
    var W = 640, H = 360;
    var canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d');
    var id = profile.identity, prefs = profile.prefs;

    /* Sfondo + bordo (palette night telemetry). */
    ctx.fillStyle = '#0E1116'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = '#FFB454'; ctx.lineWidth = 3; ctx.strokeRect(8, 8, W - 16, H - 16);

    /* Header. */
    ctx.fillStyle = '#8B95A7';
    ctx.font = '600 16px Inter, sans-serif';
    ctx.fillText('SIM RACING ACADEMY · LICENZA PILOTA', 40, 56);

    /* Avatar box. */
    var ax = 40, ay = 90, asz = 120;
    function drawAvatarText() {
      ctx.fillStyle = tagColor(id.tag);
      ctx.fillRect(ax, ay, asz, asz);
      ctx.fillStyle = '#fff';
      ctx.font = '600 48px Inter, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(initials(id.tag), ax + asz / 2, ay + asz / 2);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      finishCard();
    }
    function finishCard() {
      var tx = ax + asz + 28;
      ctx.fillStyle = '#E7EAF0';
      ctx.font = '600 34px Georgia, serif';
      ctx.fillText((id.tag || 'PILOTA').slice(0, 18), tx, ay + 38);
      ctx.font = '20px Inter, sans-serif';
      ctx.fillStyle = '#8B95A7';
      ctx.fillText((id.nationality || '🏁') + '  ' + (prefs.level || 'Novizio'), tx, ay + 72);

      var pct = utils.globalPct();
      var sessions = (state.notebook && state.notebook.sessions) || [];
      var act = utils.computeActivity(sessions);
      ctx.fillStyle = '#4FD1C5';
      ctx.font = '600 18px JetBrains Mono, monospace';
      ctx.fillText('COMPLETAMENTO ' + pct + '%', tx, ay + 108);
      ctx.fillStyle = '#FFB454';
      ctx.fillText('STREAK ' + act.streak + ' · SESSIONI ' + sessions.length, tx, ay + 134);

      if (prefs.goal) {
        ctx.fillStyle = '#8B95A7';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('🎯 ' + prefs.goal.slice(0, 48), 40, 290);
      }

      /* Watermark. */
      ctx.fillStyle = '#8B95A7';
      ctx.font = '14px JetBrains Mono, monospace';
      ctx.fillText(WATERMARK, 40, H - 28);

      var a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'simracing-licenza-' + today() + '.png';
      a.click();
    }

    if (id.avatar) {
      var img = new Image();
      img.onload = function () { ctx.drawImage(img, ax, ay, asz, asz); finishCard(); };
      img.onerror = drawAvatarText;
      img.src = id.avatar;
    } else {
      drawAvatarText();
    }
  }

  window.SimRacing.sections.push({
    id: 'profilo',
    label: 'Profilo Pilota',
    icon: '🪪',
    render: render
  });

}());
