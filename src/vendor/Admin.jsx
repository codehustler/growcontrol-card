/* Admin.jsx — global settings: Home Assistant connection + schedules */
const { useState: useStateA } = React;

function ConnectionPanel({ conn, onChange, energy, onEnergyChange }) {
  const [status, setStatus] = useStateA(conn.connected ? 'connected' : 'idle');
  const [showToken, setShowToken] = useStateA(false);
  const test = () => {
    setStatus('testing');
    setTimeout(() => { setStatus('connected'); onChange({ ...conn, connected: true }); }, 1100);
  };
  const badge = {
    idle: { c: 'var(--text-3)', bg: 'var(--bg-2)', t: 'Not connected', i: 'cloud_off' },
    testing: { c: 'var(--accent)', bg: 'var(--accent-bg)', t: 'Testing…', i: 'sync' },
    connected: { c: 'var(--success)', bg: 'var(--success-bg)', t: 'Connected', i: 'cloud_done' },
  }[status];
  return (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="card" style={{ padding: 22, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: badge.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <window.Icon name={badge.i} size={24} style={{ color: badge.c, animation: status === 'testing' ? 'spin 1s linear infinite' : 'none' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: badge.c }}>{badge.t}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{status === 'connected' ? 'Home Assistant 2025.5 · 247 entities discovered' : 'Enter your instance details and test the connection'}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label className="field-label">Home Assistant URL</label>
          <input className="input mono" value={conn.url} placeholder="http://homeassistant.local:8123"
            onChange={(e) => { onChange({ ...conn, url: e.target.value, connected: false }); setStatus('idle'); }} />
        </div>
        <div>
          <label className="field-label">Long-lived access token</label>
          <div style={{ position: 'relative' }}>
            <input className="input mono" type={showToken ? 'text' : 'password'} value={conn.token} placeholder="eyJ0eXAiOiJKV1QiLCJhbGc…"
              onChange={(e) => { onChange({ ...conn, token: e.target.value, connected: false }); setStatus('idle'); }} style={{ paddingRight: 44 }} />
            <button className="icon-btn" onClick={() => setShowToken(!showToken)} title="Toggle visibility"
              style={{ position: 'absolute', right: 4, top: 4, height: 34, width: 34 }}>
              <window.Icon name={showToken ? 'visibility_off' : 'visibility'} size={18} />
            </button>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, display: 'block' }}>Create one under your HA profile → Security → Long-lived access tokens.</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 4 }}>
          <button className="btn btn--primary" onClick={test} disabled={!conn.url || !conn.token || status === 'testing'}>
            <window.Icon name="bolt" size={18} />Test connection
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Polling every <b style={{ color: 'var(--text-2)' }}>{conn.poll}s</b></span>
        </div>
      </div>

      <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <window.Icon name="bolt" size={20} style={{ color: 'var(--warning)' }} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Electricity price</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Used to calculate each box's energy cost</div>
          </div>
        </div>
        <div>
          <label className="field-label">Cost per kWh — sensor</label>
          <window.Select value={energy.priceSensor || ''}
            onChange={(v) => onEnergyChange({ ...energy, priceSensor: v, price: v ? window.GROW.PRICE_VALUES[v] : null })}>
            <option value="">— No price sensor —</option>
            {window.GROW.HA_ENTITIES.filter((e) => e.unit === '€/kWh').map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </window.Select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-2)',
          borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Current price</span>
          <span style={{ marginLeft: 'auto', fontSize: 18, fontWeight: 700, color: energy.priceSensor ? 'var(--success)' : 'var(--text-3)' }}>
            {energy.priceSensor ? (energy.currency + energy.price.toFixed(2) + ' / kWh') : 'not set'}
          </span>
        </div>
      </div>
    </div>
  );
}

function ScheduleCard({ sched, onChange, onDelete }) {
  const [name, setName] = useStateA(sched.name);
  const on = window.GROW.onHours(sched.hours);
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: sched.type === 'light' ? 'var(--warning-bg)' : sched.type === 'fan' ? 'var(--accent-bg)' : 'rgba(0,201,255,.14)' }}>
          <window.Icon name={sched.type === 'light' ? 'lightbulb' : sched.type === 'fan' ? 'mode_fan' : 'water_pump'} size={18}
            style={{ color: sched.type === 'light' ? 'var(--warning)' : sched.type === 'fan' ? 'var(--accent)' : 'var(--cyan)' }} />
        </div>
        <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => onChange({ ...sched, name })}
          style={{ flex: 1, background: 'transparent', border: '1px solid transparent', color: 'var(--text)', fontSize: 16, fontWeight: 700,
            fontFamily: 'inherit', padding: '5px 8px', borderRadius: 8, outline: 'none' }}
          onFocus={(e) => e.target.style.borderColor = 'var(--border-2)'}
          onMouseEnter={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = 'var(--border)'; }}
          onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = 'transparent'; }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginRight: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>{on}<span style={{ color: 'var(--text-3)' }}>/{24 - on}</span></span>
          <span style={{ fontSize: 11, color: 'var(--text-3)' }}>on / off</span>
        </div>
        <window.IconBtn icon="delete_outline" title="Delete schedule" onClick={() => onDelete(sched.id)} />
      </div>
      <window.HourGrid hours={sched.hours} type={sched.type} onChange={(h) => onChange({ ...sched, hours: h })} />
      <div style={{ display: 'flex', gap: 8 }}>
        {[['All on', Array(24).fill(true)], ['All off', Array(24).fill(false)],
          ['18 / 6', window.GROW.hoursOn(6, 24)], ['12 / 12', window.GROW.hoursOn(8, 20)], ['Cycle', window.GROW.cyclePattern(true)]].map(([lbl, h]) => (
          <button key={lbl} className="btn btn--ghost btn--sm" onClick={() => onChange({ ...sched, hours: h })}>{lbl}</button>
        ))}
      </div>
    </div>
  );
}

function SchedulesPanel({ schedules, onChange }) {
  const update = (s) => onChange(schedules.map((x) => x.id === s.id ? s : x));
  const del = (id) => onChange(schedules.filter((x) => x.id !== id));
  const add = (type) => onChange([...schedules, { id: 'sched-' + Date.now(), name: `New ${type} schedule`, type, hours: window.GROW.hoursOn(8, 20) }]);
  const groups = [['light', 'Light schedules', 'Used by grow phases (Vegetative / Flowering)'],
                  ['fan', 'Fan schedules', 'Assigned per box in its configuration']];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 820 }}>
      {groups.map(([type, title, desc]) => (
        <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>{title}</h3>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{desc}</span>
            </div>
            <button className="btn btn--secondary btn--sm" onClick={() => add(type)}><window.Icon name="add" size={16} />New</button>
          </div>
          {schedules.filter((s) => s.type === type).map((s) => (
            <ScheduleCard key={s.id} sched={s} onChange={update} onDelete={del} />
          ))}
        </div>
      ))}
    </div>
  );
}

function Admin({ tab, setTab, conn, onConnChange, energy, onEnergyChange, schedules, onSchedulesChange }) {
  const tabs = [['connection', 'Home Assistant', 'lan'], ['schedules', 'Schedules', 'schedule']];
  return (
    <div className="fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Admin</h1>
      <p style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 0 22px' }}>Global connection and schedule settings shared by all boxes.</p>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 26 }}>
        {tabs.map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: tab === id ? 'var(--text)' : 'var(--text-3)',
            borderBottom: '2px solid ' + (tab === id ? 'var(--accent)' : 'transparent'), marginBottom: -1 }}>
            <window.Icon name={icon} size={18} style={{ color: tab === id ? 'var(--accent)' : 'var(--text-3)' }} />{label}
          </button>
        ))}
      </div>
      {tab === 'connection'
        ? <ConnectionPanel conn={conn} onChange={onConnChange} energy={energy} onEnergyChange={onEnergyChange} />
        : <SchedulesPanel schedules={schedules} onChange={onSchedulesChange} />}
    </div>
  );
}

window.Admin = Admin;
window.SchedulesPanel = SchedulesPanel;
