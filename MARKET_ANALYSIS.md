# Market Analysis — Sim Racing Academy

> Analisi di commercializzazione per **Sim Racing Academy**, un'app standalone (HTML/CSS/JS, offline,
> localStorage) che fa da percorso di onboarding e progress-tracker per il sim racing: postazione,
> FFB & tuning, cambio, teoria di guida, setup auto, drill progressivi, guida ai giochi, glossario e
> un quaderno persistente. Italiano-first, con guida specifica per hardware Fanatec.
> Documento strategico: il prodotto attuale è single-user e locale; le opzioni sotto valutano cosa
> servirebbe per portarlo sul mercato.

---

## 1. Product definition

**Cos'è.** Un "manuale di bordo + diario di allenamento" guidato per chi entra nel sim racing. A
differenza di un corso video o di un wiki, combina **contenuto didattico strutturato**, **strumenti
interattivi** (calcolatore FOV, wizard di regolazione postazione, diagnostica sintomo→soluzione FFB e
setup) e **tracciamento del progresso** (tachimetro di completamento, streak, quaderno di sessioni e
setup salvati). È pensato per essere consultato accanto al simulatore.

**Job-to-be-done.** "Sono appena entrato nel sim racing con hardware serio: dimmi nell'ordine giusto
cosa configurare, perché, e dammi un modo per misurare se sto migliorando — in italiano, senza dover
spulciare 40 video e thread Reddit in inglese."

### Personas

1. **Il principiante con hardware (Giacomo).** Ha appena comprato base DD + pedali load-cell + shifter.
   Sopraffatto da sigle (SEN, FFB, NDP…) e impostazioni. Vuole un percorso ordinato e validazione di
   stare facendo le cose giuste. *Disposto a pagare per togliere l'incertezza, non per "contenuti".*
2. **Il migratore da arcade/console.** Ha già guidato in modo casual, ora prende il sim sul serio.
   Conosce le basi di guida ma non setup, telemetria, FFB tuning. Cerca approfondimento mirato e
   strumenti, salta l'onboarding hardware. *Sensibile al valore, confronta con YouTube gratis.*
3. **Il coach / creator di community (B2B2C).** Gestisce un Discord o un canale, fa da punto di
   riferimento per nuovi arrivati. Vuole materiale strutturato e in lingua da consigliare o
   white-labellare per la propria community/team. *Paga per licenza/strumento, non per uso personale.*

---

## 2. Market landscape

| Concorrente | Cosa fa | Sovrapposizione | Limite vs noi |
|---|---|---|---|
| **Notion / Obsidian** | Note e knowledge base personali | Quaderno, organizzazione | Zero contenuto sim-racing, zero strumenti, tutto da costruire a mano |
| **Anki** | Ripasso a memoria spaziata | Memorizzazione sigle/termini | Nessun contenuto curato, nessun onboarding, UX ostica per non-nerd |
| **Coach Dave Academy** | Setup pro, dati telemetria, corsi (focus ACC/iRacing) | Setup, telemetria | Inglese, livello intermedio-pro, costoso, non guida l'onboarding hardware del principiante |
| **Driver61 / sim-coaching 1:1** | Coaching personale e corsi tecnica di guida | Teoria di guida, race craft | Caro, sincrono, inglese, non copre configurazione hardware/FFB |
| **Trello / generic project tools** | Liste e board | Tracciamento attività/progresso | Generico, nessun dominio, nessuna didattica |
| **LMS generici (Teachable, Udemy)** | Hosting di corsi | Struttura a moduli | Contenuto di terzi variabile, no strumenti interattivi, no progress di dominio |
| **YouTube tutorial (Boosted Media, GamerMuscle, ecc.)** | Video FFB/setup/recensioni | Tutto il contenuto, gratis | Frammentato, inglese, non strutturato in percorso, niente tracking né strumenti, qualità incostante |
| **Sim Racing Telemetry / MoTeC** | Analisi telemetria post-sessione | Lettura dati | Strumenti per chi è già avanti, non didattica per principianti |

**Sintesi.** Il mercato è polarizzato: da un lato **contenuto gratuito ma caotico** (YouTube/Reddit),
dall'altro **strumenti/coaching avanzati e costosi in inglese** (Coach Dave, Driver61, MoTeC). Manca un
**onboarding strutturato, in italiano, hardware-aware, con strumenti leggeri e tracking** per la fascia
0→competente. Questo è il vuoto.

---

## 3. Differenziazione e posizionamento

Tre leve difendibili:
1. **Percorso ordinato + tracking di dominio** (tachimetro, streak, completamento), non un mucchio di video.
2. **Strumenti interattivi integrati** (FOV, wizard postazione, diagnostica FFB/setup) che traducono la
   teoria in azione immediata — assenti nei concorrenti di contenuto.
3. **Italiano-first e hardware-specifico** (Fanatec CSL DD, ClubSport): istruzioni concrete, non generiche.

> **Positioning statement** — *Per il neofita del sim racing che ha investito in hardware serio, Sim
> Racing Academy è il percorso guidato in italiano che trasforma il caos di video e forum in passi
> ordinati, strumenti pratici e progresso misurabile — dalla postazione alla guida competitiva.*

---

## 4. Modelli di monetizzazione

Premessa: oggi l'app è offline/localStorage. Qualsiasi modello SaaS richiede investimento (account,
sync, hosting). ARPU = ricavo medio annuo per utente pagante, stime prudenti per nicchia.

### A. Freemium SaaS (abbonamento)
Base gratis (onboarding postazione, glossario, quaderno locale); Pro a pagamento (diagnostica avanzata,
profili FFB per più giochi, telemetria guidata, sync multi-device, nuovi contenuti).
- **Prezzo**: ~4–6 €/mese o ~39 €/anno. **ARPU**: ~30–40 €/anno (al netto di churn e mensili).
- **Pro**: ricavo ricorrente, finanzia contenuti continui. **Contro**: serve backend, churn alto se il
  contenuto non cresce; il valore è front-loaded (l'onboarding si "finisce").

### B. One-time / acquisto unico (o "lifetime")
Pagamento una tantum per sbloccare tutto (es. app desktop/PWA o licenza).
- **Prezzo**: ~19–29 € una tantum. **ARPU**: ~19–29 € (no ricorrenza; eventuale upsell major-version).
- **Pro**: allineato al fatto che l'onboarding è un percorso con fine; bassa frizione, niente churn;
  coerente con prodotto offline attuale. **Contro**: niente ricavo ricorrente, dipende da flusso costante
  di nuovi utenti.

### C. Content-licensing / B2B2C (white-label)
Licenza a scuole sim, team esports, rivenditori hardware (Fanatec & co.), community/coach che vogliono
materiale brandizzato in lingua.
- **Prezzo**: 200–1.000+ €/anno per licenza, o bundle co-marketing con un retailer. **ARPU (per cliente
  B2B)**: centinaia di €/anno. **Pro**: pochi clienti, ricavo alto, canale di distribuzione incluso.
  **Contro**: vendita lunga, serve maturità di prodotto e brand.

### Raccomandazione
**Partire con (B) acquisto unico** a basso prezzo per validare la disponibilità a pagare con il minimo
investimento (resta offline, niente backend), **mentre si semina (C) il licensing** con 1–2 partner di
community/retailer come canale e prova sociale. Spostarsi a **(A) freemium SaaS solo dopo** aver dimostrato
retention e un flusso di contenuti aggiornati che giustifichi la ricorrenza (es. supporto multi-gioco,
sync, contenuti stagionali). Vendere ricorrenza su un onboarding "che finisce" è il rischio principale da
evitare all'inizio.

---

## 5. Go-to-market (sketch)

- **Community sim racing**: presenza nei Discord/forum italiani e nei subreddit (r/simracing,
  r/assettocorsa); rispondere alle domande ricorrenti da principiante linkando lo strumento giusto.
- **YouTube / SEO**: contenuti "come configurare il FFB Fanatec CSL DD", "FOV corretto monitor singolo",
  "H vs sequenziale" — esattamente le query che l'app già risolve; l'app come destinazione/lead magnet.
- **Reddit / Discord**: AMA, post di valore (non spam), partnership con creator italiani; programma di
  referral per coach (lega al modello C).
- **Co-marketing hardware**: schede e guide specifiche per modello → naturale fit con un rivenditore
  Fanatec come canale (bundle "hardware + percorso di apprendimento").

---

## 6. Rischi

1. **Concorrenza gratuita (YouTube/Reddit).** Il contenuto base esiste già gratis in inglese.
   *Mitigazione*: il valore non è il contenuto ma struttura + strumenti + italiano + tracking; restare
   sul "percorso ordinato e azionabile", non competere su volume di contenuto.
2. **Nicchia ristretta e front-loaded.** Pochi nuovi entranti/anno e onboarding che "si completa".
   *Mitigazione*: estendere oltre l'onboarding (setup avanzato, telemetria, contenuti multi-gioco e
   stagionali) per dare ragioni di ritorno; valutare licensing B2B per ricavo non legato al singolo neofita.
3. **Costo/complessità del passaggio a SaaS.** Account, sync e hosting introducono backend, costi e
   superficie di manutenzione che oggi non esistono. *Mitigazione*: monetizzare prima offline (modello B),
   introdurre backend solo quando i dati di retention lo giustificano.

---

## 7. Raccomandazione finale

Esiste un vuoto reale e difendibile: **onboarding sim-racing strutturato, italiano-first,
hardware-aware, con strumenti e tracking** — tra il caos gratuito e gli strumenti pro costosi in inglese.
La strada a minor rischio è **monetizzare il prodotto offline attuale con un acquisto unico a basso
prezzo**, validare la disponibilità a pagare, e in parallelo **chiudere 1–2 accordi di licensing/co-marketing**
(community o retailer Fanatec) come canale e prova sociale. Solo dopo aver dimostrato retention e una
pipeline di contenuti aggiornati ha senso evolvere verso il **freemium SaaS** con sync multi-device e
supporto multi-gioco. Prossimo passo concreto: estendere copertura giochi (ACC, iRacing già in roadmap)
e aggiungere account/sync **dietro** la validazione, non prima.
