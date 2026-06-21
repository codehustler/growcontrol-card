/* RoomHero.jsx - grow room centerpiece hero card with radial gauges + fan control. */
function RoomHero({ room, onFanToggle, onFanSpeed }) {
  if (!room) return null;

  const noData = room.temp == null && room.humidity == null && room.vpd == null;
  const zone = window.GROW.vpdZone(room.vpd, 'Flowering');

  /* glass / tinted card background - blur where supported, solid fallback */
  const heroStyle = {
    position: 'relative',
    marginBottom: 18,
    borderRadius: 'var(--r-lg)',
    padding: noData ? '10px 16px' : '14px 20px',
    boxShadow: 'var(--elev-2)',
    overflow: 'hidden',
    background: 'var(--paper)',
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

  const f = room.fan;

  /* slim unconfigured prompt */
  if (noData) {
    return (
      <div style={heroStyle}>
        <div style={tintStyle} aria-hidden="true" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{room.name}</span>
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Map room sensors in Settings - Room</span>
          {f && f.entity && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Fan</span>
              <window.FanControl fan={f} onToggle={onFanToggle} onSpeed={onFanSpeed} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const contentStyle = {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '8px 18px',
  };

  const headingStyle = {
    width: '100%',
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text)',
    marginBottom: 0,
    letterSpacing: '-.01em',
  };

  /* VPD zone badge shown inline next to the VPD gauge */
  const zoneBadgeStyle = {
    fontSize: 10,
    fontWeight: 700,
    color: zone.color,
    textTransform: 'uppercase',
    letterSpacing: '.06em',
    marginTop: 1,
    textAlign: 'center',
  };

  /* CO2 chip */
  const co2ChipStyle = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 1,
    padding: '4px 10px',
    borderRadius: 'var(--r-pill)',
    background: 'var(--bg-2, rgba(0,0,0,.06))',
    border: '1px solid var(--border)',
  };

  return (
    <div style={heroStyle}>
      {/* accent tint overlay */}
      <div style={tintStyle} aria-hidden="true" />

      <div style={contentStyle}>
        {/* room name heading */}
        <div style={headingStyle}>{room.name}</div>

        {/* gauges row: gauges spread evenly across available width, right side holds CO2 + fan */}
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* gauges container takes all available space and distributes them evenly */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            {/* temperature gauge */}
            <window.RadialGauge
              value={room.temp}
              min={10}
              max={40}
              unit="°C"
              label="Temp"
              color="var(--warning)"
              size={92}
            />

            {/* humidity gauge */}
            <window.RadialGauge
              value={room.humidity}
              min={0}
              max={100}
              unit="%"
              label="Humidity"
              color="var(--accent)"
              size={92}
            />

            {/* VPD gauge + zone badge stacked compactly */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <window.RadialGauge
                value={room.vpd}
                min={0}
                max={2.5}
                unit=" kPa"
                label="VPD"
                color={zone.color}
                size={92}
              />
              {zone.label ? <div style={zoneBadgeStyle}>{zone.label}</div> : null}
            </div>
          </div>

          {/* right-side accessories: CO2 chip (if present) and fan control */}
          {(room.co2 != null || (f && f.entity)) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              {room.co2 != null && (
                <div style={co2ChipStyle}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{room.co2}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>ppm CO2</span>
                </div>
              )}
              {f && f.entity && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Fan</span>
                  <window.FanControl fan={f} onToggle={onFanToggle} onSpeed={onFanSpeed} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
window.RoomHero = RoomHero;
