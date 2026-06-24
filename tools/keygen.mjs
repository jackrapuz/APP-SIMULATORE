/* ============================================================
   keygen.mjs — Genera UNA VOLTA la coppia di chiavi ECDSA P-256
   per il sistema di licenze di Sim Racing Academy.

   Uso:
     node tools/keygen.mjs

   Stampa:
     - CHIAVE PUBBLICA (SPKI, base64)  -> va incollata in app.js
       nella costante PUBLIC_KEY_SPKI. NON è segreta.
     - CHIAVE PRIVATA (PKCS8, base64)  -> da conservare al sicuro
       (gestore password / file fuori dal repo). Serve solo per
       firmare le license key con tools/genlicense.mjs. NON committarla.

   Genera la coppia una sola volta: se rigeneri le chiavi, tutte le
   license key emesse in precedenza smettono di funzionare.
   ============================================================ */

import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;

function toB64(buf) {
  return Buffer.from(buf).toString('base64');
}

const keyPair = await subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

const spki = await subtle.exportKey('spki', keyPair.publicKey);
const pkcs8 = await subtle.exportKey('pkcs8', keyPair.privateKey);

console.log('\n=== CHIAVE PUBBLICA (SPKI base64) — incolla in app.js -> PUBLIC_KEY_SPKI ===\n');
console.log(toB64(spki));
console.log('\n=== CHIAVE PRIVATA (PKCS8 base64) — TIENILA SEGRETA, non committarla ===\n');
console.log(toB64(pkcs8));
console.log('\nSalva la privata in un posto sicuro: serve a tools/genlicense.mjs per emettere le key.\n');
