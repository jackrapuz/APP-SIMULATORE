/* ============================================================
   genlicense.mjs — Firma una license key per Sim Racing Academy.

   Uso:
     SRA_PRIVATE_KEY="<PKCS8 base64 dalla keygen>" node tools/genlicense.mjs "RACING_TAG"

   In alternativa puoi incollare la privata nella costante qui sotto
   (sconsigliato: non committarla mai).

   Output: la license key da consegnare al cliente, nel formato
     base64url(payloadJSON).base64url(firma)
   dove payload = { name:<tag>, product:'sra', v:1 }.

   Il <tag> deve corrispondere al "racing tag" del profilo del cliente
   (anti-condivisione soft): la verifica nell'app confronta il name firmato
   con il tag del profilo.
   ============================================================ */

import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;

const PRIVATE_KEY_PKCS8 = process.env.SRA_PRIVATE_KEY || '[INCOLLA_QUI_LA_PRIVATA_OPPURE_USA_SRA_PRIVATE_KEY]';

const name = process.argv[2];
if (!name) {
  console.error('Uso: node tools/genlicense.mjs "RACING_TAG"');
  process.exit(1);
}
if (PRIVATE_KEY_PKCS8.startsWith('[')) {
  console.error('Chiave privata mancante. Passa SRA_PRIVATE_KEY o incolla la PKCS8 base64 nel file.');
  process.exit(1);
}

function fromB64(b64) {
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

/* base64 standard -> base64url (senza padding) */
function toB64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const privateKey = await subtle.importKey(
  'pkcs8',
  fromB64(PRIVATE_KEY_PKCS8),
  { name: 'ECDSA', namedCurve: 'P-256' },
  false,
  ['sign']
);

const payload = { name: name, product: 'sra', v: 1 };
const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));

const sig = await subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  privateKey,
  payloadBytes
);

const key = toB64url(payloadBytes) + '.' + toB64url(sig);

console.log('\nLicense key per "' + name + '":\n');
console.log(key);
console.log('');
