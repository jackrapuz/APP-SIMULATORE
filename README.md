# 🏁 Pilota — Sim Racing Academy

App di apprendimento sim racing **da principiante a livello competitivo**, costruita su misura
per la postazione Fanatec di Giacomo. HTML/CSS/JS nativo, **nessun build step**, funziona
**offline** da file locale e salva tutto in `localStorage`.

> Lingua: italiano · Target: Assetto Corsa (primario), ACC, iRacing

---

## ✨ Caratteristiche

- **Single-page app** con router hash-based, sidebar + area contenuti
- **Tachimetro SVG** come indicatore di progresso (signature element)
- Contenuti **specifici per l'hardware reale** (valori dai manuali Fanatec ufficiali)
- **Quaderno persistente** (diario FFB, log sessioni, setup salvati) con export JSON
- Design "manuale tecnico touge / pit-wall engineer": bone/cream + rosso Mazda

---

## 🚀 Avvio

Nessuna installazione. Apri semplicemente:

```
index.html
```

con un browser moderno (Chrome / Edge / Firefox). I font sono caricati da Google Fonts
con fallback di sistema quando offline.

---

## 📂 Struttura

```
.
├── index.html          # shell: layout, sidebar, caricamento script
├── style.css           # design system completo
├── app.js              # router, stato globale, utilità localStorage
├── sections/           # una sezione = un modulo auto-registrante
│   ├── dashboard.js    # tachimetro + statistiche + prossima attività
│   ├── postazione.js   # ergonomia, schemi SVG, setup monitor, checklist
│   ├── ffb.js          # Tuning Menu Fanatec, profili AC/ACC/iRacing, diagnostica
│   ├── cambio.js       # ClubSport SQ V1.5: H↔SEQ, calibrazione, heel-toe
│   ├── teoria.js       # traiettoria, frenata, race craft, telemetria
│   ├── setup.js        # setup auto avanzato (gomme, aero, sospensioni…)
│   ├── drill.js        # piano esercizi progressivo con metriche
│   ├── giochi.js       # guide AC / ACC / iRacing + overlay
│   ├── glossario.js    # glossario ricercabile
│   └── quaderno.js     # diario persistente (localStorage)
├── MONTAGGIO - Parti non fornite.md   # checklist montaggio postazione
└── *.pdf               # manuali Fanatec ufficiali (referenziati in-app)
```

---

## 🔧 Hardware di riferimento

| Componente | Modello |
|------------|---------|
| Base | Fanatec CSL DD QR2 — 8 Nm (Boost Kit 180) |
| Volante | ClubSport Steering Wheel RS |
| Pedali | ClubSport Pedals V3 (load cell) |
| Cambio | ClubSport Shifter SQ V1.5 (H + sequenziale) |
| Cockpit | CSL Cockpit V1.5 + Seat Bundle |
| Accessori | Shifter Holder, Seat Sliders |

I valori del Tuning Menu (FF, FFS, NDP, INT, FEI, SPR, DPR, BRF, BLI…), le procedure di
calibrazione e i consigli di montaggio sono presi dai **manuali ufficiali Fanatec** inclusi nel repo.

---

## 🧩 Aggiungere una sezione

Ogni modulo in `sections/` si registra da solo:

```js
window.SimRacing.sections.push({
  id: 'nome',          // = hash della rotta (#nome)
  label: 'Etichetta',  // testo nella sidebar
  icon: '◉',           // glifo
  render: function (container, state, utils) { /* ... */ }
});
```

`utils` espone `save`, `load`, `updateProgress`, `globalPct`, `STATE`.
Aggiungi poi lo `<script>` corrispondente in `index.html` **prima** di `app.js`.

---

## 💾 Persistenza

Tutti i dati sono in `localStorage` con namespace `simracing_`
(progressi, quaderno, checklist, esercizi). Nessun dato lascia il dispositivo.

---

## 🛠️ Tecnologie

HTML5 · CSS3 (custom properties) · JavaScript vanilla (ES5-compatibile, IIFE) · SVG inline ·
zero dipendenze npm.
