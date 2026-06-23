# Licensing — Sim Racing Academy PRO

Questo documento spiega come funziona il sistema di licenze PRO, come generare le
chiavi, come emettere le license key per i clienti e come collegarlo a Lemon Squeezy.

> **Branch parcheggiato.** Tutta la monetizzazione (FREE/PRO) vive su questo branch
> separato da `main`. `main` resta l'app personale. Rifinire e mergiare solo quando
> si decide di vendere.

## Come funziona (in breve)

- Ogni license key è firmata con **ECDSA P-256** (curva NIST, SHA-256).
- L'app contiene **solo la chiave pubblica** (`PUBLIC_KEY_SPKI` in `app.js`) e verifica
  la firma **offline** con la Web Crypto API (`crypto.subtle.verify`). Nessun backend.
- Formato della key: `base64url(payloadJSON).base64url(firma)`, dove il payload è
  `{ name: "<racing tag>", product: "sra", v: 1 }`.
- Il campo `name` è legato al **racing tag** del profilo del cliente: l'app rifiuta una
  key il cui `name` non corrisponde al tag impostato (anti-condivisione *soft*).

## ⚠️ Onestà: questo è soft gating, non DRM

Il gating è **client-side**: il JavaScript dell'app è in chiaro, quindi un utente tecnico
può bypassare il controllo patchando il codice. La firma asimmetrica garantisce che
**non si possano forgiare** key valide senza la chiave privata — **non** impedisce di
modificare il JS. È quindi una barriera a **bassa frizione** che fa leva sull'onestà della
maggioranza, adatta a un prodotto a basso prezzo. Va bene così: l'alternativa (DRM con
backend) non ha senso per questo scopo.

## 1. Generare la coppia di chiavi (una sola volta)

```bash
node tools/keygen.mjs
```

Stampa due valori base64:

1. **Chiave pubblica (SPKI)** → incollala in `app.js` nella costante `PUBLIC_KEY_SPKI`.
   Non è segreta.
2. **Chiave privata (PKCS8)** → **conservala al sicuro** (gestore password / file fuori
   dal repo). Serve solo a firmare le key. **Non committarla mai.**

> Se rigeneri le chiavi, **tutte le license key già emesse smettono di funzionare**.
> Genera la coppia una volta sola.

## 2. Emettere una license key per un cliente

Il `<racing tag>` deve essere quello che il cliente userà nel Profilo dell'app.

```bash
SRA_PRIVATE_KEY="<PKCS8 base64 dalla keygen>" node tools/genlicense.mjs "RX7_GIACOMO"
```

Stampa la license key da consegnare al cliente. Il cliente la incolla in
**✦ Sblocca PRO → "Hai già una license key?"** e sblocca a vita.

## 3. Configurare Lemon Squeezy (license key delivery)

Lemon Squeezy è il *merchant of record* (gestisce pagamento + IVA UE).

1. Crea il prodotto "Sim Racing Academy PRO" a 24€, pagamento unico.
2. Per la consegna della key hai due opzioni:
   - **Manuale (semplice):** dopo ogni vendita, leggi il racing tag fornito dal cliente
     (chiedilo in un campo custom al checkout), genera la key con `genlicense.mjs` e
     inviala via email.
   - **Automatica (avanzata):** usa un webhook `order_created` di Lemon Squeezy verso una
     piccola function serverless che esegue la stessa firma e restituisce/email-a la key.
     (Out of scope di questo branch: qui la firma resta uno script locale.)
3. Sostituisci il `[PLACEHOLDER_CHECKOUT]` in `sections/buy.js` (`LEMON_SQUEEZY_URL`) con il
   link/overlay di checkout reale.

## 4. Checklist prima del rilascio

- [ ] `PUBLIC_KEY_SPKI` in `app.js` sostituita con la pubblica reale.
- [ ] `LEMON_SQUEEZY_URL` in `sections/buy.js` impostato.
- [ ] Chiave privata conservata fuori dal repo.
- [ ] Slot video demo (`[PLACEHOLDER]` in `buy.js`) riempito.
- [ ] Testato: key valida sblocca e persiste dopo reload; key manomessa rifiutata; trial 7gg.
