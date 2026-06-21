/* BoxConfig.jsx — map a box's slots to Home Assistant entities */
const { useState: useStateBC } = React;

function ConfigRow({ slot, draft, schedules, onSet }) {
  const c = draft[slot.key] || { entity: '', enabled: false };
  const opts = window.GROW.HA_ENTITIES.filter((e) => e.domain === (slot.kind === 'sensor' ? 'sensor' : 'switch'));
  const schedOpts = schedules.filter((s) => s.type === slot.schedType);
  const energyOpts = window.GROW.HA_ENTITIES.filter((e) => e.domain === 'sensor' && e.unit === 'kWh');
  return (
    <div style={{ padding: '13px 0', borderBottom: '1px solid var(--border)', opacity: c.enabled ? 1 : 0.62, transition: 'opacity .15s' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        <window.Icon name={slot.icon} size={20} style={{ color: c.enabled ? 'var(--accent)' : 'var(--text-3)' }} />
      </div>
      <div style={{ width: 150, flexShrink: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{slot.label}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{slot.kind === 'sensor' ? 'Sensor' : 'Switch'}{slot.unit ? ' · ' + slot.unit : ''}</div>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 10, minWidth: 0 }}>
        <window.Select value={c.entity} onChange={(v) => onSet(slot.key, { entity: v, enabled: v ? c.enabled : false })} style={{ flex: 2 }}>
          <option value="">— Not mapped —</option>
          {opts.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </window.Select>
        {slot.schedulable && (
          <window.Select value={c.schedule || ''} onChange={(v) => onSet(slot.key, { schedule: v })} style={{ flex: 1 }}>
            <option value="">No schedule</option>
            {schedOpts.map((s) => <option key={s.id} value={s.id}>{s.name.replace(/.*—\s*/, '')} ({window.GROW.ratio(s.hours)})</option>)}
          </window.Select>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, width: 92, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: c.enabled ? 'var(--success)' : 'var(--text-3)' }}>{c.enabled ? 'SHOWN' : 'HIDDEN'}</span>
        <window.Toggle on={c.enabled} kind="success" disabled={!c.entity}
          onChange={(v) => onSet(slot.key, { enabled: v })} />
      </div>
    </div>
    {slot.energyTracking && c.enabled && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 2px 54px',
        padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
        <window.Icon name="bolt" size={16} style={{ color: 'var(--warning)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-2)', width: 138, flexShrink: 0 }}>Energy sensor (kWh)</span>
        <window.Select value={c.energySensor || ''} onChange={(v) => onSet(slot.key, { energySensor: v })} style={{ flex: 1 }}>
          <option value="">— None (no energy tracking) —</option>
          {energyOpts.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </window.Select>
      </div>
    )}
    </div>
  );
}

function BoxConfig({ box, schedules, onBack, onSave }) {
  const [draft, setDraft] = useStateBC(() => JSON.parse(JSON.stringify(box.config)));
  const set = (key, patch) => setDraft((d) => ({ ...d, [key]: { ...(d[key] || {}), ...patch } }));
  const C = window.GROW.SLOT_CATALOG;
  const sensors = C.filter((s) => s.kind === 'sensor');
  const switches = C.filter((s) => s.kind === 'switch');
  const enabledCount = Object.values(draft).filter((c) => c.enabled).length;

  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <window.IconBtn icon="arrow_back" title="Back" onClick={onBack} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Configure · {box.name}</h1>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Map Home Assistant entities. Only entities switched to <b style={{ color: 'var(--text-2)' }}>Shown</b> appear in the normal view.</span>
        </div>
        <div style={{ flex: 1 }} />
        <window.Chip icon="visibility">{enabledCount} shown</window.Chip>
        <button className="btn btn--primary" onClick={() => onSave(box.id, draft)}><window.Icon name="check" size={18} />Save</button>
      </div>

      <div className="card" style={{ padding: '4px 22px 16px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase', padding: '18px 0 2px' }}>Sensors</div>
        {sensors.map((s) => <ConfigRow key={s.key} slot={s} draft={draft} schedules={schedules} onSet={set} />)}
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', letterSpacing: '.05em', textTransform: 'uppercase', padding: '20px 0 2px' }}>Controlled devices</div>
        {switches.map((s) => <ConfigRow key={s.key} slot={s} draft={draft} schedules={schedules} onSet={set} />)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn--ghost" onClick={onBack}>Cancel</button>
        <button className="btn btn--primary" onClick={() => onSave(box.id, draft)}><window.Icon name="check" size={18} />Save configuration</button>
      </div>
    </div>
  );
}

window.BoxConfig = BoxConfig;
