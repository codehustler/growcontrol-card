/* RoomHero.jsx - grow room centerpiece hero card with radial gauges + fan control. */
function RoomHero({ room, onFanToggle, onFanSpeed }) {
  if (!room) return null;

  const zone = window.GROW.vpdZone(room.vpd, 'Flowering');

  /* glass / tinted card background - blur where supported, solid fallback */
  const heroStyle = {
    position: 'relative',
    marginBottom: 18,
    borderRadius: 'var(--r-lg)',
    padding: '22px 24px 20px',
    boxShadow: 'var(--elev-2)',
    overflow: 'hidden',
    /* solid fallback */
    background: 'var(--paper)',
    /* glass tint for browsers that support backdrop-filter */
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  /* accent tint overlay pseudo-element is approximated with an absolutely
     positioned inert <div> because inline styles cannot use ::before */
  const tintStyle = {
    position: 'absolute',
    inset: 0,
    background: 'var(--grad-accent)',
    opacity: 0.07,
    pointerEvents: 'none',
    borderRadius: 'inherit',
    zIndex: 0,
  };

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '16px 28px',
  };

  const headingStyle = {
    width: '100%',
    fontSize: 17,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 4,
    letterSpacing: '-.01em',
  };

  /* VPD zone badge shown under the VPD gauge */
  const zoneBadgeStyle = {
    fontSize: 11,
    fontWeight: 700,
    color: zone.color,
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginTop: -2,
    textAlign: 'center',
  };

  /* CO2 chip */
  const co2ChipStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 14px',
    borderRadius: 'var(--r-pill)',
    background: 'var(--bg-2, rgba(0,0,0,.06))',
    border: '1px solid var(--border)',
  };

  const f = room.fan;

  return (
    <div style={heroStyle}>
      {/* accent tint overlay */}
      <div style={tintStyle} aria-hidden="true" />

      <div style={contentStyle}>
        {/* room name heading */}
        <div style={headingStyle}>{room.name}</div>

        {/* temperature gauge */}
        <window.RadialGauge
          value={room.temp}
          min={10}
          max={40}
          unit=" C"
          label="Temp"
          color="var(--warning)"
          size={124}
        />

        {/* humidity gauge */}
        <window.RadialGauge
          value={room.humidity}
          min={0}
          max={100}
          unit="%"
          label="Humidity"
          color="var(--accent)"
          size={124}
        />

        {/* VPD gauge + zone badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <window.RadialGauge
            value={room.vpd}
            min={0}
            max={2.5}
            unit=" kPa"
            label="VPD"
            color={zone.color}
            size={124}
          />
          {zone.label ? <div style={zoneBadgeStyle}>{zone.label}</div> : null}
        </div>

        {/* CO2 chip - only rendered when a value is available */}
        {room.co2 != null && (
          <div style={co2ChipStyle}>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{room.co2}</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>ppm CO2</span>
          </div>
        )}

        {/* spacer pushes fan control to the right on wider layouts */}
        <div style={{ flex: 1, minWidth: 0 }} />

        {/* fan control */}
        {f && f.entity && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Fan</span>
            <window.FanControl fan={f} onToggle={onFanToggle} onSpeed={onFanSpeed} />
          </div>
        )}
      </div>
    </div>
  );
}
window.RoomHero = RoomHero;
