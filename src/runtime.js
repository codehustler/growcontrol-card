// Runtime glue between Home Assistant and the prototype's React app.
// Two tiny external stores (so React can subscribe via useSyncExternalStore):
//   - hassStore: the live `hass` object, pushed in by the card wrapper.
//   - appStore:  structural app state (boxes, schedules, energy) persisted to
//                localStorage. Device state itself lives in HA, not here.
// Attached to window.__GC so the global-style App.jsx can reach it without imports.

// ---- hass store ----
let _hass = null;
const hassSubs = new Set();
const hassStore = {
  set(h) { _hass = h; hassSubs.forEach((fn) => fn()); },
  get() { return _hass; },
  subscribe(fn) { hassSubs.add(fn); return () => hassSubs.delete(fn); },
};

// ---- app store (localStorage-backed) ----
// ponytail: localStorage, not the Lovelace config. Single-user grow setup, and
// config-changed only persists in dashboard edit mode. Per-device is fine here;
// move to a HA helper/integration if cross-device sync is ever needed.
const LS_KEY = 'growcontrol-store-v1';
function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; }
}
function persist(s) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch { /* quota / private mode */ }
}

let _state = null;
const appSubs = new Set();
const appStore = {
  // Seed on first run only; later loads use the persisted store.
  init(seed) { if (_state === null) _state = load() || seed; return _state; },
  get() { return _state; },
  set(updater) {
    _state = typeof updater === 'function' ? updater(_state) : updater;
    persist(_state);
    appSubs.forEach((fn) => fn());
  },
  subscribe(fn) { appSubs.add(fn); return () => appSubs.delete(fn); },
};

window.__GC = { hassStore, appStore };
