// Index-page passkey UI. Logic lives in passkey.js (shared with profile.html).
import {
  supported,
  hasPasskey,
  registerPasskey,
  resetPasskey,
  authenticate,
} from './passkey.js';

const statusEl = document.getElementById('authStatus');
const registerBtn = document.getElementById('registerBtn');
const unlockBtn = document.getElementById('unlockBtn');

function refresh() {
  if (hasPasskey()) {
    statusEl.innerHTML = 'Passkey registered ✓ — unlock to enter the secure area.';
    unlockBtn.style.display = 'block';
    registerBtn.style.display = 'block';
    registerBtn.textContent = 'Reset passkey';
  } else {
    statusEl.textContent = 'No passkey yet. Create one to protect the secure area & deep link.';
    registerBtn.style.display = 'block';
    registerBtn.textContent = 'Create passkey';
    unlockBtn.style.display = 'none';
  }
}

if (!supported()) {
  statusEl.textContent = 'Passkeys are not supported on this browser.';
  registerBtn.style.display = 'none';
  unlockBtn.style.display = 'none';
} else {
  refresh();
}

registerBtn.addEventListener('click', async () => {
  if (hasPasskey()) {
    resetPasskey();
    refresh();
    return;
  }
  registerBtn.disabled = true;
  try {
    await registerPasskey();
    statusEl.textContent = 'Passkey created ✓';
  } catch (e) {
    statusEl.textContent = 'Could not create passkey: ' + (e?.message || e);
  } finally {
    registerBtn.disabled = false;
    refresh();
  }
});

unlockBtn.addEventListener('click', async () => {
  unlockBtn.disabled = true;
  try {
    await authenticate();
    location.href = 'secure.html';
  } catch (e) {
    statusEl.textContent = 'Unlock failed: ' + (e?.message || e);
  } finally {
    unlockBtn.disabled = false;
  }
});
