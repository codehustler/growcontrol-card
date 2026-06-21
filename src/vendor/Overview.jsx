/* Overview.jsx - grid/list of grow boxes */
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

  /* VPD dot: compute only when both temp and humidity are available */
  const temp = off ? null : box.live.temp;
  const humidity = off ? null : box.live.humidity;
  const vpdVal = (temp != null && humidity != null)
    ? window.GROW.vpdJs(temp, humidity, 2)
    : null;
  const vpdPhaseLabel = box.phase === 'flowering' ? 'Flowering' : 'Vegetative';
  const vpdInfo = (vpdVal != null) ? window.GROW.vpdZone(vpdVal, vpdPhaseLabel) : null;

  /* gradient for the phase ribbon */
  const phaseGrad = box.phase === 'flowering' ? 'var(--grad-flower)' : 'var(--grad-veg)';
  const phaseLabel = box.phase === 'flowering' ? 'Flowering' : 'Vegetative';
  const wd = window.GROW.weekDay(window.GROW.daysSince(box.startDate));

  /* active glow ring when master is on */
  const glowShadow = !off
    ? 'var(--elev-2), 0 0 0 2px var(--accent-border)'
    : 'var(--elev-1)';
  const hoverShadow = !off
    ? 'var(--elev-2), 0 0 0 2px var(--accent-border)'
    : 'var(--elev-2)';

  /* separate temp from other metrics for hero layout */
  const tempMetric = metrics.find((m) => m.key === 'temp');
  const otherMetrics = metrics.filter((m) => m.key !== 'temp');

  return (
    <div role="button" tabIndex={0} onClick={() => onOpen(box.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(box.id); } }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="card" style={{
        textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', outline: 'none',
        padding: rich ? 20 : 16, display: 'flex', flexDirection: 'column', gap: rich ? 14 : 10,
        background: 'var(--paper)',
        boxShadow: hover ? hoverShadow : (!off ? glowShadow : 'var(--elev-1)'),
        borderColor: hover ? 'var(--accent-border)' : (!off ? 'var(--accent-border)' : 'var(--border)'),
        transition: [
          'border-color var(--motion-fast)',
          'box-shadow var(--motion-fast)',
          'transform var(--motion-fast)',
          'opacity var(--motion-fast)',
        ].join(', '),
        transform: hover ? 'translateY(-2px)' : 'none',
        opacity: off ? 0.7 : 1,
        borderRadius: 'var(--r-lg)',
      }}>

      {/* header: name + toggle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{box.name}</span>

          {/* phase ribbon - gradient pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px',
              borderRadius: 'var(--r-pill)',
              background: off ? 'var(--disabled-bg)' : phaseGrad,
              color: off ? 'var(--text-3)' : '#fff',
              fontSize: 11, fontWeight: 700, letterSpacing: '.03em',
              textTransform: 'uppercase',
              lineHeight: 1.5,
              boxShadow: off ? 'none' : '0 1px 4px rgba(0,0,0,.18)',
            }}>
              {phaseLabel}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
              Wk {wd.week} &middot; Day {wd.day}
            </span>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>{off ? 'OFF' : 'ON'}</span>
          <window.Toggle on={box.master} kind="success" onChange={() => onToggleMaster(box.id)} />
        </div>
      </div>

      {/* metrics row: hero temp + secondary metrics + VPD dot */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>

        {/* hero temperature */}
        {tempMetric && (() => {
          const val = off ? null : box.live.temp;
          const na = val == null;
          return (
            <div key="temp" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span style={{
                  fontSize: 42, fontWeight: 800, lineHeight: 1,
                  color: na ? 'var(--text-3)' : 'var(--warning)',
                  letterSpacing: '-1px',
                }}>
                  {na ? 'N/A' : val}
                </span>
                {!na && <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 600 }}>{tempMetric.unit}</span>}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <window.Icon name={tempMetric.icon} size={12} style={{ color: 'var(--warning)' }} />
                {tempMetric.label}
              </span>
            </div>
          );
        })()}

        {/* secondary metrics (humidity, substrate) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 2 }}>
          {otherMetrics.map((m) => {
            const val = off ? null : box.live[m.key];
            const na = val == null || (val === 0 && m.key !== 'temp');
            const accent = m.key === 'humidity' ? 'var(--accent)' : 'var(--success)';
            return (
              <div key={m.key} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <window.Icon name={m.icon} size={13} style={{ color: na ? 'var(--text-3)' : accent }} />
                <span style={{ fontSize: 18, fontWeight: 700, color: na ? 'var(--text-3)' : 'var(--text)' }}>
                  {na ? 'N/A' : val}
                </span>
                {!na && <span style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600 }}>{m.unit}</span>}
                <span style={{ fontSize: 11, color: 'var(--text-3)', marginLeft: 2 }}>{m.label}</span>
              </div>
            );
          })}
        </div>

        {metrics.length === 0 && <span style={{ fontSize: 13, color: 'var(--text-3)' }}>No sensors configured</span>}

        {/* VPD zone dot */}
        {vpdInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 2, marginLeft: 'auto' }}
            title={`VPD ${vpdVal} kPa - ${vpdInfo.label}`}>
            <span style={{
              display: 'inline-block',
              width: 10, height: 10,
              borderRadius: '50%',
              background: vpdInfo.color,
              flexShrink: 0,
              boxShadow: `0 0 5px ${vpdInfo.color}`,
            }} />
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, whiteSpace: 'nowrap' }}>
              VPD {vpdInfo.label}
            </span>
          </div>
        )}
      </div>

      {/* light schedule strip */}
      {rich && lightSched && cfg.light && cfg.light.enabled && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>
              Light &middot; {window.GROW.ratio(lightSched.hours)}
            </span>
            <span style={{ fontSize: 11, color: box.live.light ? 'var(--warning)' : 'var(--text-3)', fontWeight: 700 }}>
              {off ? '-' : box.live.light ? 'ON NOW' : 'OFF NOW'}
            </span>
          </div>
          <window.TimelineStrip hours={off ? Array(24).fill(false) : lightSched.hours} type="light" height={18} />
        </div>
      )}

      {/* controls footer - cleaner rounded chips */}
      {controls.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {controls.map((c) => {
            const on = !off && c.on;
            const chipColor = on
              ? (c.key === 'light' ? 'var(--warning)' : 'var(--success)')
              : 'var(--text-3)';
            return (
              <span key={c.key} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--r-pill)',
                border: '1px solid ' + (on ? chipColor : 'var(--border)'),
                color: chipColor,
                background: on
                  ? (c.key === 'light' ? 'var(--warning-bg)' : 'var(--success-bg)')
                  : 'transparent',
                transition: 'background var(--motion-fast), border-color var(--motion-fast), color var(--motion-fast)',
                letterSpacing: '.02em',
              }}>
                <window.Icon name={c.icon} size={13} style={{ color: chipColor }} />
                {c.label.replace('Exhaust ', '')}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Overview({ boxes, schedules, energy, layout, density, onOpen, onToggleMaster }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: layout === 'list' ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
      gap: 18, alignContent: 'start', alignItems: 'start',
    }}>
      {boxes.map((b) => (
        <BoxCard key={b.id} box={b} schedules={schedules} energy={energy} density={density}
          onOpen={onOpen} onToggleMaster={onToggleMaster} />
      ))}
    </div>
  );
}

window.Overview = Overview;
