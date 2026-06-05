// Shared client-only passkey helpers built on @simplewebauthn/browser.
//
// DEMO ONLY: there is no server, so the WebAuthn assertion is NOT verified and
// the challenge is generated in the page. A successful biometric ceremony just
// sets a session flag. This demonstrates the passkey UX, not real auth.

import {
  startRegistration,
  startAuthentication,
} from 'https://esm.sh/@simplewebauthn/browser@13';

export const STORE = 'demo_passkey';     // localStorage: registered credential
export const SESSION = 'demo_unlocked';  // sessionStorage: unlocked this session

const rpId = location.hostname;          // e.g. iamanvesh.github.io / localhost
const rpName = 'DeepLink Demo PWA';

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

export function supported() {
  return !!window.PublicKeyCredential;
}

export function getStored() {
  try {
    return JSON.parse(localStorage.getItem(STORE) || 'null');
  } catch {
    return null;
  }
}

export function hasPasskey() {
  return !!getStored();
}

export function isUnlocked() {
  return sessionStorage.getItem(SESSION) === '1';
}

export function lock() {
  sessionStorage.removeItem(SESSION);
}

export function resetPasskey() {
  localStorage.removeItem(STORE);
  sessionStorage.removeItem(SESSION);
}

export async function registerPasskey() {
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
  return true;
}

// Runs the biometric ceremony. On success, marks the session unlocked.
export async function authenticate() {
  const stored = getStored();
  if (!stored) throw new Error('No passkey registered');
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
}
