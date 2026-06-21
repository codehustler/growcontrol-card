/* RoomHero.jsx - grow room climate + fan control. Visuals upgraded in Phase C. */
function RoomHero({ room, onFanToggle, onFanSpeed }) {
  if (!room) return null;
  const m = (label, val, unit, accent) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 700, color: val == null ? 'var(--text-3)' : (accent || 'var(--text)') }}>
        {val == null ? 'N/A' : val}<span style={{ fontSize: 14, color: 'var(--text-2)' }}>{val == null ? '' : unit}</span>
      </span>
    </div>
  );
  const f = room.fan;
  return (
    <div className="card" style={{ padding: 22, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{room.name}</div>
      {m('Temp', room.temp, ' °C', 'var(--warning)')}
      {m('Humidity', room.humidity, ' %', 'var(--accent)')}
      {m('VPD', room.vpd, ' kPa', 'var(--success)')}
      {room.co2 != null && m('CO2', room.co2, ' ppm')}
      <div style={{ flex: 1 }} />
      {f.entity && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Fan</span>
          {f.isSpeed && f.on && (
            <input type="range" min="0" max="100" value={f.speed} onChange={(e) => onFanSpeed(f.entity, Number(e.target.value))} style={{ width: 120 }} />
          )}
          <window.Toggle on={f.on} kind="success" onChange={() => onFanToggle(f.entity)} />
        </div>
      )}
    </div>
  );
}
window.RoomHero = RoomHero;
