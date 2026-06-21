/* Settings.jsx - the standard-HA config surface (box manager, schedules,
   appearance). All entity selectors are native ha-entity-picker. No HA
   connection config: we run inside HA and use the provided hass. */
const { useState: useStateS } = React;

const SENSOR_DOMAINS = ['sensor'];
const SWITCH_DOMAINS = ['switch', 'light', 'input_boolean', 'fan'];

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="field-label" style={{ marginBottom: 0 }}>{label}</span>
      {children}
    </div>
  );
}

function SlotRow({ slot, cfg, hass, onSet }) {
  const c = cfg[slot.key] || { entity: '', enabled: false };
  const domains = slot.kind === 'sensor' ? SENSOR_DOMAINS : SWITCH_DOMAINS;
  return (
    <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', flexShrink: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
          <window.Icon name={slot.icon} size={18} style={{ color: c.enabled ? 'var(--accent)' : 'var(--text-3)' }} />
        </div>
        <div style={{ width: 132, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{slot.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{slot.kind === 'sensor' ? 'Sensor' : 'Switch'}{slot.unit ? ' · ' + slot.unit : ''}</div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <window.HaEntityPicker hass={hass} value={c.entity} domains={domains}
            onChange={(v) => onSet(slot.key, { entity: v, enabled: v ? c.enabled : false })} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 84, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: c.enabled ? 'var(--success)' : 'var(--text-3)' }}>{c.enabled ? 'SHOWN' : 'HIDDEN'}</span>
          <window.Toggle on={c.enabled} kind="success" disabled={!c.entity} onChange={(v) => onSet(slot.key, { enabled: v })} />
        </div>
      </div>
      {slot.energyTracking && c.enabled && (
        <div style={{ margin: '12px 0 2px 48px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.Icon name="bolt" size={16} style={{ color: 'var(--warning)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-2)', width: 120, flexShrink: 0 }}>Energy sensor (kWh)</span>
            <div style={{ flex: 1 }}>
              <window.HaEntityPicker hass={hass} value={c.energySensor || ''} domains={SENSOR_DOMAINS}
                onChange={(v) => onSet(slot.key, { energySensor: v })} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.Icon name="bolt" size={16} style={{ color: 'var(--text-3)' }} />
            <span style={{ fontSize: 13, color: 'var(--text-2)', width: 120, flexShrink: 0 }}>Power sensor (W)</span>
            <div style={{ flex: 1 }}>
              <window.HaEntityPicker hass={hass} value={c.powerEntity || ''} domains={SENSOR_DOMAINS}
                onChange={(v) => onSet(slot.key, { powerEntity: v })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoxEditor({ box, hass, onRename, onDelete, onPatch, onOpen }) {
  const [open, setOpen] = useStateS(true);
  const cfg = box.config || {};
  const C = window.GROW.SLOT_CATALOG;
  const sensors = C.filter((s) => s.kind === 'sensor');
  const switches = C.filter((s) => s.kind === 'switch');
  const setSlot = (key, patch) => onPatch(box.id, { [key]: { ...(cfg[key] || {}), ...patch } });
  const setExtra = (key, val) => onPatch(box.id, { [key]: val });

  return (
    <div className="card" style={{ padding: '14px 20px 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="icon-btn" onClick={() => setOpen((o) => !o)} title={open ? 'Collapse' : 'Expand'}
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>
          <window.Icon name="arrow_back" size={18} style={{ transform: 'scaleX(-1)' }} />
        </button>
        <input className="input" value={box.name} onChange={(e) => onRename(box.id, e.target.value)}
          style={{ flex: 1, fontSize: 16, fontWeight: 700, maxWidth: 320 }} />
        <button className="btn btn--ghost btn--sm" onClick={() => onOpen(box.id)}><window.Icon name="visibility" size={16} />View</button>
        <window.IconBtn icon="delete_outline" title="Delete box" onClick={() => onDelete(box.id)} />
      </div>
      {open && (
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase', padding: '14px 0 10px' }}>Grow tracking</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <Field label="Grow phase (input_select)">
              <window.HaEntityPicker hass={hass} value={cfg.phaseEntity || ''} domains={['input_select']} onChange={(v) => setExtra('phaseEntity', v)} />
            </Field>
            <Field label="Phase start (input_datetime)">
              <window.HaEntityPicker hass={hass} value={cfg.startEntity || ''} domains={['input_datetime']} onChange={(v) => setExtra('startEntity', v)} />
            </Field>
            <Field label="Target temp (input_number)">
              <window.HaEntityPicker hass={hass} value={cfg.tempTargetEntity || ''} domains={['input_number']} onChange={(v) => setExtra('tempTargetEntity', v)} />
            </Field>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase', padding: '20px 0 2px' }}>Sensors</div>
          {sensors.map((s) => <SlotRow key={s.key} slot={s} cfg={cfg} hass={hass} onSet={setSlot} />)}
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase', padding: '20px 0 2px' }}>Controlled devices</div>
          {switches.map((s) => <SlotRow key={s.key} slot={s} cfg={cfg} hass={hass} onSet={setSlot} />)}
        </div>
      )}
    </div>
  );
}

function Settings({ hass, tab, setTab, t, setTweak, boxes, onAddBox, onDeleteBox, onRenameBox, onPatchConfig,
  schedules, onSchedulesChange, energy, onEnergyChange, onBack, onOpenBox }) {
  const tabs = [['boxes', 'Grow boxes', 'potted_plant'], ['schedules', 'Schedules', 'schedule'], ['appearance', 'Appearance', 'tune']];
  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <window.IconBtn icon="arrow_back" title="Back" onClick={onBack} />
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>Settings</h1>
      </div>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)' }}>
        {tabs.map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: tab === id ? 'var(--text)' : 'var(--text-3)',
            borderBottom: '2px solid ' + (tab === id ? 'var(--accent)' : 'transparent'), marginBottom: -1 }}>
            <window.Icon name={icon} size={18} style={{ color: tab === id ? 'var(--accent)' : 'var(--text-3)' }} />{label}
          </button>
        ))}
      </div>

      {tab === 'boxes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Add boxes and map each one's Home Assistant sensors and switches.</span>
            <button className="btn btn--primary" onClick={onAddBox}><window.Icon name="add" size={18} />Add box</button>
          </div>
          {boxes.map((b) => (
            <BoxEditor key={b.id} box={b} hass={hass} onRename={onRenameBox} onDelete={onDeleteBox} onPatch={onPatchConfig} onOpen={onOpenBox} />
          ))}
          {boxes.length === 0 && <window.AddTile label="Add your first grow box" onClick={onAddBox} />}
        </div>
      )}

      {tab === 'schedules' && (
        <window.SchedulesPanel schedules={schedules} onChange={onSchedulesChange} />
      )}

      {tab === 'appearance' && (
        <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <window.TweakSection label="Layout" />
          <window.TweakRadio label="Overview" value={t.layout} options={['grid', 'list']} onChange={(v) => setTweak('layout', v)} />
          <window.TweakRadio label="Card density" value={t.density} options={['rich', 'compact']} onChange={(v) => setTweak('density', v)} />
          <window.TweakSection label="Theme" />
          <window.TweakColor label="Accent" value={t.accentSwatch} options={['#3293FF', '#45D483', '#00C9FF']}
            onChange={(v) => { const m = { '#3293FF': 'Blue', '#45D483': 'Green', '#00C9FF': 'Cyan' }; setTweak('accentSwatch', v); setTweak('accent', m[v]); }} />
          <window.TweakSection label="Energy" />
          <Field label="Electricity price sensor (per kWh)">
            <window.HaEntityPicker hass={hass} value={energy.priceSensor || ''} domains={['sensor', 'input_number']}
              onChange={(v) => onEnergyChange({ ...energy, priceSensor: v, price: v ? (window.GROW.PRICE_VALUES[v] ?? (hass && hass.states[v] ? Number(hass.states[v].state) : null)) : null })} />
          </Field>
        </div>
      )}
    </div>
  );
}

window.Settings = Settings;
