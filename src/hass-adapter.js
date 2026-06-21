/* hass-adapter.js - replaces the prototype's mock data.jsx.
   Builds window.GROW from live Home Assistant state instead of seed data.
   - SLOT_CATALOG / PHASES / helpers: same shapes the views expect.
   - HA_ENTITIES / PRICE_VALUES: recomputed from hass on every update.
   - deriveBox(): overlays a stored box's entity map with live hass values,
     producing the { phase, startDate, phaseStart, live } shape the views read. */

/* slot catalog - adds a 'pump' switch slot (the prototype lacked one; the real
   grow has a water pump). Views iterate the catalog generically, so it renders. */
const SLOT_CATALOG = [
  { key: 'temp',      label: 'Temperature',        kind: 'sensor', unit: '°C', icon: 'thermostat',  metric: true },
  { key: 'humidity',  label: 'Humidity',           kind: 'sensor', unit: '%',  icon: 'water_drop',  metric: true },
  { key: 'substrate', label: 'Substrate Moisture', kind: 'sensor', unit: '%',  icon: 'grass',       metric: true },
  { key: 'light',     label: 'Light',              kind: 'switch', icon: 'lightbulb',      schedulable: true, schedType: 'light', energyTracking: true },
  { key: 'fan',       label: 'Exhaust Fan',        kind: 'switch', icon: 'mode_fan',       schedulable: true, schedType: 'fan' },
  { key: 'heating',   label: 'Heating',            kind: 'switch', icon: 'local_fire_department' },
  { key: 'pump',      label: 'Water Pump',         kind: 'switch', icon: 'water_pump' },
];

const PHASES = {
  vegetative: { id: 'vegetative', label: 'Vegetative', lightSchedule: 'veg-light' },
  flowering:  { id: 'flowering',  label: 'Flowering',  lightSchedule: 'flower-light' },
};

function hoursOn(start, end) {
  const a = Array(24).fill(false);
  for (let h = 0; h < 24; h++) {
    if (start <= end) a[h] = h >= start && h < end;
    else a[h] = h >= start || h < end;
  }
  return a;
}
function cyclePattern(everyOn) {
  return Array.from({ length: 24 }, (_, h) => h % 2 === (everyOn ? 0 : 1));
}

const SEED_SCHEDULES = [
  { id: 'veg-light',    name: 'Vegetative - Light',  type: 'light', hours: hoursOn(6, 24) },
  { id: 'flower-light', name: 'Flowering - Light',   type: 'light', hours: hoursOn(8, 20) },
  { id: 'fan-day',      name: 'Fan - Continuous Day', type: 'fan',  hours: hoursOn(0, 24) },
  { id: 'fan-cycle',    name: 'Fan - Hourly Cycle',  type: 'fan',   hours: cyclePattern(true) },
];

/* Real two-box default, mirroring dashboard-weed exactly (quirks included:
   box 1 reads growbox_2 sensors and vice versa; "Heating" is a Lufter / 3D
   printer plug). User remaps later in the in-app Config screen. */
const DEFAULT_BOXES = [
  {
    id: 'box1', name: 'Growbox 1', master: true, startDate: '2026-06-18',
    config: {
      temp:      { entity: 'sensor.temperatur_growbox_2_temperature', enabled: true },
      humidity:  { entity: 'sensor.temperatur_growbox_2_humidity', enabled: true },
      substrate: { entity: 'sensor.pflanzensensor_01_soil_moisture', enabled: true },
      light:     { entity: 'switch.steckdose_grow_light_1', enabled: true, schedule: null, energySensor: 'sensor.steckdose_grow_light_1_energy', powerEntity: 'sensor.steckdose_grow_light_1_power' },
      fan:       { entity: '', enabled: false },
      heating:   { entity: 'switch.steckdose_grow_lufter_1', enabled: true },
      pump:      { entity: 'switch.steckdose_grow_waterpump', enabled: true },
      // extras (not edited via the slot UI; baked / set in card config)
      phaseEntity: 'input_select.grow_cycle',
      startEntity: 'input_datetime.grow_start_date',
      tempTargetEntity: 'input_number.grow_1_target_temp',
    },
  },
  {
    id: 'box2', name: 'Growbox 2', master: true, startDate: '2026-06-18',
    config: {
      temp:      { entity: 'sensor.temperatur_growbox_1_temperature', enabled: true },
      humidity:  { entity: 'sensor.temperatur_growbox_1_humidity', enabled: true },
      substrate: { entity: '', enabled: false },
      light:     { entity: 'switch.steckdose_grow_light_2', enabled: true, schedule: null, energySensor: 'sensor.steckdose_grow_light_2_energy', powerEntity: 'sensor.steckdose_grow_light_2_power' },
      fan:       { entity: '', enabled: false },
      heating:   { entity: 'switch.steckdose_3d_drucker', enabled: true },
      pump:      { entity: '', enabled: false },
      phaseEntity: 'input_select.grow_2_phase',
      startEntity: 'input_datetime.grow_2_start_date',
      tempTargetEntity: 'input_number.grow_2_target_temp',
    },
  },
];

// ---- hass readers ----
function st(hass, id) { return id && hass && hass.states ? hass.states[id] : null; }
function numState(hass, id) {
  const s = st(hass, id);
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}
function onState(hass, id) {
  const s = st(hass, id);
  return !!s && s.state === 'on';
}
function mapPhase(raw) {
  return raw && String(raw).toLowerCase().includes('flow') ? 'flowering' : 'vegetative';
}
function parseDate(raw) {
  if (!raw) return null;
  const d = new Date(String(raw).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : raw;
}

function deriveBox(box, hass, hist) {
  const cfg = box.config || {};
  const ent = (k) => (cfg[k] && cfg[k].enabled ? cfg[k].entity : null);
  const h = hist || {};
  const phase = mapPhase(st(hass, cfg.phaseEntity)?.state);
  const startDate = parseDate(st(hass, cfg.startEntity)?.state) || box.startDate || new Date().toISOString().slice(0, 10);
  const live = {
    temp: numState(hass, ent('temp')),
    humidity: numState(hass, ent('humidity')),
    substrate: numState(hass, ent('substrate')) ?? 0,
    tempTarget: numState(hass, cfg.tempTargetEntity),
    light: onState(hass, ent('light')),
    fan: onState(hass, ent('fan')),
    heating: onState(hass, ent('heating')),
    pump: onState(hass, ent('pump')),
    lightWatt: numState(hass, cfg.light && cfg.light.powerEntity) ?? 0,
    // Consumed = current kWh reading minus the per-box baseline (set on first
    // sight / on Reset), so it counts from zero instead of the plug's lifetime total.
    lightEnergy: (() => {
      const raw = numState(hass, cfg.light && cfg.light.enabled ? cfg.light.energySensor : null);
      const base = cfg.light ? cfg.light.energyBaseline : null;
      if (raw == null || base == null) return 0;
      return Math.max(0, Math.round((raw - base) * 1000) / 1000);
    })(),
    // 24h history fetched by App and keyed by entity id (empty => chart shows
    // "No history available" gracefully).
    tempHist: h[ent('temp')] || [],
    humidityHist: h[ent('humidity')] || [],
    substrateHist: h[ent('substrate')] || [],
  };
  return { ...box, phase, startDate, phaseStart: startDate, phaseLog: [], live };
}

function computeEntities(hass) {
  if (!hass || !hass.states) return [];
  return Object.values(hass.states)
    .map((s) => ({
      id: s.entity_id,
      name: (s.attributes && s.attributes.friendly_name) || s.entity_id,
      domain: s.entity_id.split('.')[0],
      unit: (s.attributes && s.attributes.unit_of_measurement) || '',
    }))
    .filter((e) => e.domain === 'sensor' || e.domain === 'switch')
    .sort((a, b) => a.name.localeCompare(b.name));
}
function computePrices(hass) {
  const out = {};
  if (hass && hass.states) {
    for (const s of Object.values(hass.states)) {
      if (s.attributes && s.attributes.unit_of_measurement === '€/kWh') {
        const n = Number(s.state);
        out[s.entity_id] = Number.isFinite(n) ? n : 0;
      }
    }
  }
  return out;
}

window.GROW = {
  SLOT_CATALOG, PHASES, SEED_SCHEDULES, DEFAULT_BOXES,
  HA_ENTITIES: [],
  PRICE_VALUES: {},
  hoursOn, cyclePattern,
  deriveBox,
  // recomputed by the card wrapper whenever hass changes
  refresh(hass) {
    window.GROW.HA_ENTITIES = computeEntities(hass);
    window.GROW.PRICE_VALUES = computePrices(hass);
  },
  ratio: (hours) => { const on = hours.filter(Boolean).length; return `${on}/${24 - on}`; },
  onHours: (hours) => hours.filter(Boolean).length,
  daysSince: (dateStr) => Math.max(0, Math.floor((Date.now() - new Date(String(dateStr).replace(' ', 'T'))) / 864e5)),
  daysBetween: (a, b) => Math.max(0, Math.round((new Date(b) - new Date(a)) / 864e5)),
  weekOf: (days) => Math.floor(days / 7) + 1,
  weekDay: (days) => ({ week: Math.floor(days / 7) + 1, day: (days % 7) + 1 }),
  phaseTotals: (box) => {
    const out = { vegetative: 0, flowering: 0 };
    const cur = Math.max(0, Math.floor((Date.now() - new Date(String(box.phaseStart || box.startDate).replace(' ', 'T'))) / 864e5));
    out[box.phase] = (out[box.phase] || 0) + cur;
    return out;
  },
};
