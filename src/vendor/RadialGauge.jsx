/* RadialGauge.jsx - animated 270-degree SVG arc gauge. */
function RadialGauge({ value, min = 0, max = 100, unit = '', label = '', color = 'var(--accent)', size = 132 }) {
  const r = size / 2 - 12, cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r, sweep = 0.75; // 270deg
  const na = value == null || (typeof value === 'number' && isNaN(value));
  const pct = na ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
  const dash = circ * sweep;
  const offset = dash * (1 - pct);
  const rot = 135; // start at lower-left
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: `rotate(${rot}deg)` }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ring-track)" strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset var(--motion-med) ease' }} />
      </svg>
      <div style={{ marginTop: -size * 0.62, marginBottom: size * 0.30, textAlign: 'center', pointerEvents: 'none' }}>
        <div style={{ fontSize: size * 0.22, fontWeight: 700, color: na ? 'var(--text-3)' : 'var(--text)' }}>
          {na ? 'N/A' : value}<span style={{ fontSize: size * 0.12, color: 'var(--text-2)' }}>{na ? '' : unit}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</div>
      </div>
    </div>
  );
}
window.RadialGauge = RadialGauge;
