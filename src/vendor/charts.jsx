/* charts.jsx — hand-rolled SVG charts + 24h schedule visuals */
const { useState: useStateC, useRef: useRefC } = React;

/* Area chart with optional target line. data = array of numbers. */
function TempChart({ data, target, height, accent, decimals }) {
  const H = height || 180, W = 600, pad = { l: 34, r: 12, t: 12, b: 22 };
  const acc = accent || 'var(--accent)';
  const dec = decimals == null ? 1 : decimals;
  const gid = useRefC('grad-' + Math.random().toString(36).slice(2)).current;
  if (!data || !data.length) {
    return <div style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 13 }}>No history available</div>;
  }
  const min = Math.min(...data, target ?? Infinity) - 0.8;
  const max = Math.max(...data, target ?? -Infinity) + 0.8;
  const span = max - min || 1;
  const x = (i) => pad.l + (i / (data.length - 1)) * (W - pad.l - pad.r);
  const y = (v) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
  const linePts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const areaPts = `${pad.l},${y(min)} ${linePts} ${x(data.length - 1)},${y(min)}`;
  // y gridlines
  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => min + (span * i) / ticks);
  const last = data[data.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: H, display: 'block' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={acc} stopOpacity="0.32" />
          <stop offset="100%" stopColor={acc} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {gridVals.map((v, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 4" />
          <text x={pad.l - 7} y={y(v) + 3} textAnchor="end" fontSize="10" fill="var(--text-3)">{v.toFixed(dec)}</text>
        </g>
      ))}
      {target != null && (
        <line x1={pad.l} x2={W - pad.r} y1={y(target)} y2={y(target)} stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.9" />
      )}
      <polygon points={areaPts} fill={`url(#${gid})`} />
      <polyline points={linePts} fill="none" stroke={acc} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(data.length - 1)} cy={y(last)} r="3.5" fill={acc} stroke="var(--paper)" strokeWidth="2" />
    </svg>
  );
}

/* 24h on/off timeline strip. hours = bool[24]. color by type. */
function TimelineStrip({ hours, type, height, showLabels }) {
  const colorOn = type === 'light' ? 'var(--warning)' : type === 'fan' ? 'var(--accent)' : type === 'pump' ? 'var(--cyan)' : 'var(--success)';
  const h = height || 26;
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', height: h, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {hours.map((on, i) => (
          <div key={i} title={`${String(i).padStart(2, '0')}:00 — ${on ? 'On' : 'Off'}`}
            style={{ flex: 1, background: on ? colorOn : 'var(--bg-2)',
              borderRight: i < 23 ? '1px solid rgba(0,0,0,.25)' : 'none', transition: 'background .15s' }} />
        ))}
      </div>
      {showLabels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 10, color: 'var(--text-3)' }}>
          {[0, 6, 12, 18, 24].map((t) => <span key={t}>{String(t % 24).padStart(2, '0')}:00</span>)}
        </div>
      )}
    </div>
  );
}

/* Editable 24h hour grid — click or drag to paint on/off. */
function HourGrid({ hours, onChange, type }) {
  const paintRef = useRefC(null);
  const colorOn = type === 'light' ? 'var(--warning)' : type === 'fan' ? 'var(--accent)' : type === 'pump' ? 'var(--cyan)' : 'var(--success)';
  const set = (i, val) => {
    const next = hours.slice(); next[i] = val; onChange(next);
  };
  const end = () => { paintRef.current = null; };
  return (
    <div onMouseLeave={end} onMouseUp={end} style={{ userSelect: 'none' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: 3 }}>
        {hours.map((on, i) => (
          <button key={i}
            onMouseDown={() => { const v = !on; paintRef.current = v; set(i, v); }}
            onMouseEnter={() => { if (paintRef.current !== null) set(i, paintRef.current); }}
            title={`${String(i).padStart(2, '0')}:00`}
            style={{
              aspectRatio: '1 / 1.5', borderRadius: 5, cursor: 'pointer',
              border: '1px solid ' + (on ? 'transparent' : 'var(--border)'),
              background: on ? colorOn : 'var(--bg-2)',
              color: on ? '#1a1a1a' : 'var(--text-3)', fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              transition: 'background .1s',
            }}>{i}</button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-3)' }}>
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
      </div>
    </div>
  );
}

Object.assign(window, { TempChart, TimelineStrip, HourGrid });
