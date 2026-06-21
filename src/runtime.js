// Runtime glue between Home Assistant and the prototype's React app.
//  - hassStore: the live `hass` object, pushed in by the card wrapper.
//  - appStore:  the card's state (boxes, schedules, energy), now persisted
//               server-side by the GrowControl integration over the HA
//               websocket (growcontrol/get|save|subscribe). Synced across
//               devices + included in HA backups. No more localStorage.
// Attached to window.__GC so the global-style App.jsx can reach it.

// ---- hass store ----
let _hass = null;
const hassSubs = new Set();
const hassStore = {
  set(h) { _hass = h; hassSubs.forEach((fn) => fn()); },
  get() { return _hass; },
  subscribe(fn) { hassSubs.add(fn); return () => hassSubs.delete(fn); },
};

// ---- app store (integration-backed) ----
let _state = null;          // null = loading; {__error:true} = integration missing
let _conn = null;
let _connected = false;
const appSubs = new Set();
const appNotify = () => appSubs.forEach((fn) => fn());

const appStore = {
  get() { return _state; },
  subscribe(fn) { appSubs.add(fn); return () => appSubs.delete(fn); },
  set(updater) {
    const next = typeof updater === 'function' ? updater(_state) : updater;
    _state = next;
    appNotify();
    if (_conn && next && !next.__error) {
      _conn.sendMessagePromise({
        type: 'growcontrol/save',
        data: { boxes: next.boxes, schedules: next.schedules, energy: next.energy },
      }).catch(() => { /* keep optimistic local state */ });
    }
  },
  // Connect to the integration the first time hass is available.
  async connect(hass) {
    if (_connected || !hass || !hass.connection) return;
    _connected = true;
    _conn = hass.connection;
    try {
      const data = await hass.connection.sendMessagePromise({ type: 'growcontrol/get' });
      _state = data;
      appNotify();
      hass.connection.subscribeMessage(
        (d) => { _state = d; appNotify(); },
        { type: 'growcontrol/subscribe' },
      );
    } catch (e) {
      _connected = false; // allow a retry on the next hass update
      _state = { __error: true };
      appNotify();
    }
  },
};

window.__GC = { hassStore, appStore };
