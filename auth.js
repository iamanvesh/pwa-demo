// Client-only passkey demo using @simplewebauthn/browser.
//
// IMPORTANT: this is a DEMO. There is no server, so the WebAuthn assertion is
// NOT verified and the challenge is generated in the page. A successful
// biometric ceremony simply sets a session flag that gates secure.html. This
// demonstrates the passkey UX only — it is not real authentication.

import {
  startRegistration,
  startAuthentication,
} from 'https://esm.sh/@simplewebauthn/browser@13';

const STORE = 'demo_passkey';     // localStorage: the registered credential
const SESSION = 'demo_unlocked';  // sessionStorage: unlocked-this-session flag
const rpId = location.hostname;   // e.g. iamanvesh.github.io / localhost
const rpName = 'DeepLink Demo PWA';

const statusEl = document.getElementById('authStatus');
const registerBtn = document.getElementById('registerBtn');
const unlockBtn = document.getElementById('unlockBtn');

function b64url(bytes) {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function randomB64url(len) {
  const a = new Uint8Array(len);
  crypto.getRandomValues(a);
  return b64url(a);
}

function getStored() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || 'null');
  } catch {
    return null;
  }
}

function refresh() {
  const stored = getStored();
  if (stored) {
    statusEl.innerHTML = 'Passkey registered ✓ — unlock to enter the secure area.';
    unlockBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    registerBtn.textContent = 'Reset passkey';
  } else {
    statusEl.textContent = 'No passkey yet. Create one to protect the secure area.';
    registerBtn.style.display = 'block';
    registerBtn.textContent = 'Create passkey';
    unlockBtn.style.display = 'none';
  }
}

async function init() {
  if (!window.PublicKeyCredential) {
    statusEl.textContent = 'Passkeys are not supported on this browser.';
    registerBtn.style.display = 'none';
    unlockBtn.style.display = 'none';
    return;
  }
  refresh();
}

registerBtn.addEventListener('click', async () => {
  if (getStored()) {
    // Acting as "Reset passkey".
    localStorage.removeItem(STORE);
    sessionStorage.removeItem(SESSION);
    refresh();
    return;
  }
  registerBtn.disabled = true;
  try {
    const optionsJSON = {
      rp: { name: rpName, id: rpId },
      user: { id: randomB64url(16), name: 'demo@user', displayName: 'Demo User' },
      challenge: randomB64url(32),
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // on-device biometrics
        residentKey: 'preferred',
        userVerification: 'required',         // forces biometric / PIN
      },
      timeout: 60000,
      attestation: 'none',
      excludeCredentials: [],
    };
    const resp = await startRegistration({ optionsJSON });
    localStorage.setItem(
      STORE,
      JSON.stringify({ id: resp.id, transports: resp.response.transports || [] })
    );
    statusEl.textContent = 'Passkey created ✓';
  } catch (e) {
    statusEl.textContent = 'Could not create passkey: ' + (e?.message || e);
  } finally {
    registerBtn.disabled = false;
    refresh();
  }
});

unlockBtn.addEventListener('click', async () => {
  const stored = getStored();
  if (!stored) return;
  unlockBtn.disabled = true;
  try {
    const optionsJSON = {
      challenge: randomB64url(32),
      rpId,
      allowCredentials: [
        { id: stored.id, type: 'public-key', transports: stored.transports },
      ],
      userVerification: 'required',
      timeout: 60000,
    };
    await startAuthentication({ optionsJSON });
    // No server to verify against — a successful ceremony unlocks the demo.
    sessionStorage.setItem(SESSION, '1');
    location.href = 'secure.html';
  } catch (e) {
    statusEl.textContent = 'Unlock failed: ' + (e?.message || e);
  } finally {
    unlockBtn.disabled = false;
  }
});

init();
