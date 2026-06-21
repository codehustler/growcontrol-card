/* ha-picker.jsx — React wrapper around Home Assistant's native <ha-entity-picker>.
   Gives us the standard, filterable, theme-matched entity selector for the
   config UI ("standard for the non-UI parts"). HA lazy-loads that element, so
   we trigger the load via loadCardHelpers + an entities-card config element. */
const { useRef: useRp, useEffect: useEp, useState: useSp } = React;

let _loadPromise = null;
function ensureHaPicker() {
  if (customElements.get('ha-entity-picker')) return Promise.resolve();
  if (_loadPromise) return _loadPromise;
  _loadPromise = (async () => {
    try {
      const helpers = await window.loadCardHelpers();
      const el = await helpers.createCardElement({ type: 'entities', entities: [] });
      if (el && el.constructor && el.constructor.getConfigElement) {
        await el.constructor.getConfigElement();
      }
    } catch (e) { /* picker may register on its own later */ }
  })();
  return _loadPromise;
}

function HaEntityPicker({ hass, value, domains, label, disabled, onChange }) {
  const ref = useRp(null);
  const [ready, setReady] = useSp(!!customElements.get('ha-entity-picker'));
  useEp(() => { if (!ready) ensureHaPicker().then(() => setReady(true)); }, [ready]);

  useEp(() => {
    const el = ref.current;
    if (!el || !ready) return;
    el.hass = hass;
    el.value = value || '';
    el.label = label || '';
    el.disabled = !!disabled;
    el.allowCustomEntity = false;
    if (domains) el.includeDomains = domains;
    const handler = (e) => {
      e.stopPropagation();
      const v = e.detail && e.detail.value;
      if (v !== value) onChange(v || '');
    };
    el.addEventListener('value-changed', handler);
    return () => el.removeEventListener('value-changed', handler);
  });

  if (!ready) {
    return <div style={{ height: 56, display: 'flex', alignItems: 'center', color: 'var(--text-3)', fontSize: 13 }}>Loading picker…</div>;
  }
  return React.createElement('ha-entity-picker', { ref, style: { display: 'block', width: '100%' } });
}

window.HaEntityPicker = HaEntityPicker;
window.ensureHaPicker = ensureHaPicker;
