/* Overview.jsx — grid/list of grow boxes */
const { useState: useStateO } = React;

function liveControls(box) {
  const cat = window.GROW.SLOT_CATALOG.filter((s) => s.kind === 'switch');
  return cat.filter((s) => box.config[s.key] && box.config[s.key].enabled)
    .map((s) => ({ ...s, on: box.live[s.key] }));
}

function BoxCard({ box, schedules, energy, density, onOpen, onToggleMaster }) {
  const [hover, setHover] = useStateO(false);
  const off = !box.master;
  const cfg = box.config;
  const metrics = window.GROW.SLOT_CATALOG.filter((s) => s.metric && cfg[s.key] && cfg[s.key].enabled);
  const lightSched = schedules.find((s) => s.id === window.GROW.PHASES[box.phase].lightSchedule);
  const controls = liveControls(box);
  const rich = density === 'rich';

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(box.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(box.id); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="card" style={{
        textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', outline: 'none',
        padding: rich ? 20 : 16, display: 'flex', flexDirection: 'column', gap: rich ? 16 : 12,
        borderColor: hover ? 'var(--border-strong)' : 'var(--border)',
        background: hover ? 'var(--paper-2)' : 'var(--paper)',
        transition: 'border-color .15s, background .15s, transform .15s',
        transform: hover ? 'translateY(-2px)' : 'none', opacity: off ? 0.72 : 1,
      }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{box.name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
            <window.PhaseChip phase={box.phase} off={off} />
            <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Wk {window.GROW.weekDay(window.GROW.daysSince(box.startDate)).week} · Day {window.GROW.weekDay(window.GROW.daysSince(box.startDate)).day}</span>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{off ? 'OFF' : 'ON'}</span>
          <window.Toggle on={box.master} kind="success" onChange={() => onToggleMaster(box.id)} />
        </div>
      </div>

      {/* metrics */}
      <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
        {metrics.map((m) => {
          const val = off ? null : box.live[m.key];
          const accent = m.key === 'temp' ? 'var(--warning)' : m.key === 'humidity' ? 'var(--accent)' : 'var(--success)';
          return (
            <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: (val == null || val === 0 && m.key !== 'temp') ? 'var(--text-3)' : 'var(--text)' }}>
                  {val == null ? 'N/A' : (m.key !== 'temp' && val === 0) ? 'N/A' : val}
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>{m.unit}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <window.Icon name={m.icon} size={13} style={{ color: accent }} />{m.label}
              </span>
            </div>
          );
        })}
        {metrics.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No sensors configured</span>}
      </div>

      {/* light schedule strip */}
      {rich && lightSched && cfg.light && cfg.light.enabled && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>Light · {lightSched.name.split('—')[0].trim() === box.name ? '' : ''}{window.GROW.ratio(lightSched.hours)}</span>
            <span style={{ fontSize: 11, color: box.live.light ? 'var(--warning)' : 'var(--text-3)', fontWeight: 700 }}>{off ? '—' : box.live.light ? 'ON NOW' : 'OFF NOW'}</span>
          </div>
          <window.TimelineStrip hours={off ? Array(24).fill(false) : lightSched.hours} type="light" height={18} />
        </div>
      )}

      {/* controls footer */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 'auto' }}>
        {controls.map((c) => {
          const on = !off && c.on;
          return (
            <span key={c.key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600,
              padding: '4px 9px', borderRadius: 999,
              border: '1px solid ' + (on ? 'var(--border-2)' : 'var(--border)'),
              color: on ? (c.key === 'light' ? 'var(--warning)' : 'var(--text)') : 'var(--text-3)',
              background: on ? 'var(--paper-2)' : 'transparent',
            }}>
              <window.Icon name={c.icon} size={14} style={{ color: on ? (c.key === 'light' ? 'var(--warning)' : 'var(--success)') : 'var(--text-3)' }} />
              {c.label.replace('Exhaust ', '')}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Overview({ boxes, schedules, energy, layout, density, onOpen, onToggleMaster }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: layout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 18, alignContent: 'start',
    }}>
      {boxes.map((b) => (
        <BoxCard key={b.id} box={b} schedules={schedules} energy={energy} density={density}
          onOpen={onOpen} onToggleMaster={onToggleMaster} />
      ))}
    </div>
  );
}

window.Overview = Overview;
