# Specifica funzionale

## Sezioni richieste

### 1. Dashboard
- Overview progresso
- Sessione corrente
- Statistiche

### 2. Postazione (meccanica)
- Schemi SVG: vista laterale, mani 9-3, vista dall'alto
- Checklist regolazione step-by-step
- Riferimenti angoli e distanze
- Test di verifica (4 test)

### 3. FFB & Tuning Menu
- Spiegazione di ogni sigla (SEN, FF, FFS, NDP, NFR, NIN, INT, FEI, SPR, DPR, BLI)
- Profili pronti per AC, ACC, iRacing
- Diagnostica sintomi → regolazione

### 4. Cambio (H + Sequenziale)
- Specifico per ClubSport Shifter SQ V1.5
- Come switchare modalità
- Calibrazione marce
- Quando usare H vs sequenziale per categoria auto
- Heel-toe tutorial

### 5. Teoria sim racing
- Traiettoria ideale (entry, apex, exit)
- Frenata e trail braking
- Trasferimento di carico
- Sovrasterzo / sottosterzo (cause e correzioni)
- Race craft: sorpassi, difesa, gestione gara
- Gestione gomme (temperature, pressioni, usura)
- Telemetria: come leggere grafici, MoTeC, AC apps

### 6. Setup auto (livello avanzato)
- Pressioni gomme (cold/hot, target IMO/IR)
- Bilanciamento freni
- Ali / aero (downforce vs drag)
- Molle e ARB
- Camber, caster, toe
- Differenziale (preload, power, coast)
- Bump/rebound damping
- Workflow setup completo per pista

### 7. Drill / Esercizi progressivi
- Settimana 1-2: basi (frenata, traiettoria)
- Mese 1: consistenza, trail braking
- Mese 2-3: time attack, gare brevi
- Esercizi specifici con metrica di successo

### 8. Guida ai giochi
- Assetto Corsa: setup, mod essenziali, Content Manager
- ACC: differenze, safety rating
- iRacing: license system, come iniziare

### 9. Glossario sigle/termini
- Tutte le sigle FFB
- Termini setup
- Termini race craft
- Cerca rapidamente

### 10. Quaderno (persistente)
- Diario FFB (cambiamenti nel tempo)
- Log sessioni
- Setup salvati per auto/pista
- Note personali

## Design

- Direzione visiva: "manuale tecnico touge / pit wall engineer", non generico AI
- Palette: cream/bone background + accent rosso Mazda
- Tipografia: serif personality + sans body + mono per dati
- Mai look "dashboard nera neon" o "broadsheet"
- Schemi SVG inline (no librerie pesanti)
- Animazioni discrete, no flash

## Tecnico

- File singolo HTML con CSS/JS inline OPPURE struttura modulare con import (la seconda preferita)
- Storage: localStorage con namespace `simracing_`
- Nessuna dipendenza npm
- Fonts da Google Fonts con system fallback
- Compatibilità: Chrome/Firefox/Edge moderni