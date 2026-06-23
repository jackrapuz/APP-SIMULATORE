# Design System — Sim Racing Academy

Identità visiva **"Night telemetry"**: il quadro strumenti di un abitacolo di notte incontra il
taccuino di un ingegnere. Crisp, strutturato, data-forward (flight-ops), scaldato da un serif con
personalità e da una luce-segnale ambra (taccuino / fattore umano).

L'app è **HTML standalone** (nessun build step, nessun npm). Tutto il sistema vive in `style.css`
(token + componenti) più tre font Google caricati in `index.html`. I componenti sono generati come
stringhe HTML dai moduli in `sections/*.js` e dal router `app.js`.

---

## 1. Color token

Definiti in `:root` (`style.css`). Tema scuro. Evita esplicitamente i due abbinamenti vietati
(niente verde acido su nero, niente cream + terracotta).

| Token | Valore | Ruolo |
|-------|--------|-------|
| `--bg` | `#0E1116` | Base — quasi-nero con sottotono blu freddo (abitacolo di notte) |
| `--surface` | `#161B22` | Pannello / card |
| `--surface-2` | `#212834` | Pannello rialzato, header tabella, input |
| `--ink` | `#E7EAF0` | Testo primario (off-white, non bianco puro) |
| `--ink-muted` | `#8B95A7` | Testo secondario, label |
| `--signal` | `#FFB454` | **Accento primario** — ambra strumento (CTA, nav attiva, brand) |
| `--signal-dim` | `#D98E2B` | Ambra hover / press |
| `--trace` | `#4FD1C5` | **Accento dati** — teal telemetria (barre progresso, success) |
| `--danger` | `#FF6B6B` | Errori, stato "no" |
| `--border` | `rgba(231,234,240,0.09)` | Hairline |

Ambra = motivazione/accensione + calore del taccuino; teal = la linea-dati della telemetria. Il
sistema a due accenti tiene il "progresso" (teal) visivamente distinto dall'"azione" (ambra).

**Alias legacy** — per non rompere i ~50 riferimenti `var(--red/--red-dark/--tan/--surface2)` già
presenti, sono definiti come alias dei nuovi nomi:
`--red → --signal`, `--red-dark → --signal-dim`, `--tan → --trace`, `--surface2 → --surface-2`.
Nel codice nuovo usa i nomi canonici.

> Nota SVG: `var()` **non** viene risolto negli attributi di presentazione SVG (`fill="..."`). Gli
> schemi inline in `postazione.js` / `teoria.js` / `cambio.js` usano quindi i **valori hex letterali**
> della palette, non i token. Se cambi un colore di token, aggiorna a mano anche questi tre file.

---

## 2. Tipografia

Tre famiglie caricate da Google Fonts (`index.html`), con fallback di sistema.

- **Display (header, con parsimonia)** — `Fraunces` (serif variabile, ottico, caratteriale): la "voce taccuino". `--font-display`
- **Body (default, leggibile a piccole dimensioni)** — `Inter`. `--font-body`
- **Dati / mono (readout, label, tabelle)** — `JetBrains Mono`: la "voce flight-ops". `--font-mono`

| Ruolo | Font | Size | Peso | Note |
|-------|------|------|------|------|
| h1 | Fraunces | `--text-4xl` 2.25rem | 600 | line-height 1.15 |
| h2 | Fraunces | `--text-2xl` 1.5rem | 600 | line-height 1.2 |
| h3 | Inter | `--text-lg` 1.125rem | 600 | |
| body | Inter | `--text-base` 1rem | 400 | line-height 1.6 |
| caption | Inter | `--text-sm` 0.875rem | 400 | |
| label | JetBrains Mono | `--text-xs` 0.75rem | 500 | uppercase, tracking 0.08–0.12em |
| data | JetBrains Mono | varia | 500 | `font-variant-numeric: tabular-nums` (classe `.mono-data`) |

Scala testo: `--text-xs` … `--text-4xl` (vedi `:root`).

---

## 3. Spazio, raggio, elevazione

- **Spacing (base 4px)**: `--sp-1:4px --sp-2:8 --sp-3:12 --sp-4:16 --sp-6:24 --sp-8:32 --sp-12:48 --sp-16:64`.
  (Le utility storiche `.mt-*` / `.mb-*` in rem restano valide.)
- **Raggio (instrument-crisp)**: `--radius:3px`, `--radius-lg:6px`, `--radius-pill:999px` (solo chip/badge).
- **Elevazione**: `--elev-1` (lift sottile pannelli), `--elev-2` (hover/modal).
- **Glow accento** (equivalente dark-theme della profondità): `--glow-signal`, `--glow-trace`, usati su
  nav attiva, cella di testa della shift-strip, hover delle card/azioni.

---

## 4. Elemento firma — "Shift-light progress strip"

Sostituisce la barra di progresso arrotondata generica con una **striscia di LED segmentati**: 10–18
celle che si accendono in `--trace`, con la cella di testa (`.lead`) dotata di soft glow, affiancata da
un **readout monospace tabular-nums** (es. `068%`).

**Perché** (vive come commento in `style.css`): richiama direttamente i LED shift-light degli RPM sul
volante ClubSport di Giacomo, legge come strumentazione cockpit / flight-ops ed è l'antitesi della
barra a gradiente arrotondata di ogni altra app di apprendimento. Il **tachimetro SVG** della dashboard
è l'istanza "hero" dello stesso linguaggio; la sidebar e le barre per-sezione sono strip compatte.

Markup generato da `app.js`:
- `shiftStripCells(pct, cells)` → solo le `<span class="shift-cell">` (da inserire in un contenitore `.shift-strip`).
- `shiftStripHTML(pct, { cells, sm, readout })` → blocco completo `.shift` (strip + readout `.shift-readout`).

Esposti sia via l'oggetto `utils` passato a `section.render`, sia come `window.SimRacing.shiftStripHTML/shiftStripCells`.

Classi: `.shift` (wrapper flex), `.shift-strip` (`.sm` = celle più basse), `.shift-cell`, `.shift-cell.lit`,
`.shift-cell.lead` (glow).

---

## 5. Componenti

Card (`.card`, `--elev-1`, hover-lift se `a.card`/`.is-interactive`), bottoni (`.btn` ambra con testo
`--bg`, `.btn-ghost`, `.btn-sm`), badge/tag (`.badge`, `.tag`, `.tag-red`→ambra, `.tag-tan`→teal),
tabelle (`.data-table`, `.table-wrap` con scroll-x), accordion (`details`/`summary`), tab (`.tab-switcher`/`.tab-btn`),
form (`.form-field`, stati `.is-invalid` + `.field-error`/`.field-ok`), checklist, step-list, code block
(`.code-block` sfondo scuro dedicato + `.code-copy-btn`), callout (`.callout` teal / `.callout-red` danger),
wizard postazione (`.wizard*`, dot navigabili), calcolatore FOV (`.fov-calc`/`.fov-result`, stato `.is-invalid`),
diagnostica (`.diag-selectors`/`.solution-card`), badge livello (`.level-base/-intermedio/-avanzato`),
tachimetro SVG (`.tacho-*`), shift-strip (§4), empty state (`.empty-state`).

---

## 6. Micro-interazioni (solo CSS)

- Card / next-activity / link-card: hover-lift (`translateY(-1px)` + `--elev-2`).
- Shift-cell: transizione di riempimento + glow sulla cella di testa.
- Nav attiva: barra laterale con `--glow-signal`.
- Bottoni: glow ambra in hover, press `translateY(1px)`.
- Navigazione sezioni: `.section-fade` (keyframe `sectionFadeIn`).
- Wizard: transizione direzionale step (`.wizard-body.step-anim`, keyframe `wizardStepIn`).
- Tutto rispetta `@media (prefers-reduced-motion: reduce)`.

---

## 7. Accessibilità

- **Focus**: anello `:focus-visible` ambra (2px, offset 2px) su ogni elemento interattivo.
- **Label icona**: `aria-label` su bottoni icona-only — hamburger ("Apri menu"), delete quaderno
  ("Elimina voce"), copy FFB ("Copia configurazione…"), dot wizard ("Passo N: titolo").
- **Stato corrente**: `aria-current="page"` sulla nav attiva (impostato in `app.js navigate()`),
  `aria-current="step"` sul dot wizard attivo.
- **Landmark**: `role="navigation"` sulla sidebar list, `role="main"` sul contenuto.
- **Strumenti**: tachimetro `<svg role="img" aria-label="Progresso… livello…">`; shift-strip globale
  `role="progressbar"` con `aria-valuemin/max/now`.
- **Errori**: messaggi di validazione con `role="alert"` (FOV fuori range, export fallito).

---

## 8. Responsive

- Layout grid `sidebar (220px) + 1fr`; contenuto max-width 920px.
- Breakpoint principale **768px**: sidebar off-canvas (hamburger + overlay), grid a colonna singola.
- Breakpoint **560px**: `.fov-calc` e `.diag-selectors` a colonna singola.
- Pass di sicurezza **≤400px (≈375)**: padding ridotto, h1 più piccola, `.cards-grid` 2 colonne,
  completion-bar in colonna, tab-switcher a piena larghezza. Le tabelle scrollano via `.table-wrap`.
