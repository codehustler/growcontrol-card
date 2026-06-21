/* FanControl.jsx - compact fan on/off + optional speed control.
   Props: { fan, onToggle, onSpeed }
   fan shape: { entity, on, isSpeed, speed, domain } */
function FanControl({ fan, onToggle, onSpeed }) {
  if (!fan || !fan.entity) return null;

  const speedTrackStyle = {
    WebkitAppearance: 'none',
    appearance: 'none',
    width: 110,
    height: 6,
    borderRadius: 3,
    outline: 'none',
    cursor: 'pointer',
    background: fan.on
      ? `linear-gradient(to right, var(--grad-accent, var(--accent)) 0%, var(--grad-accent, var(--accent)) ${fan.speed}%, var(--ring-track, rgba(0,0,0,.1)) ${fan.speed}%, var(--ring-track, rgba(0,0,0,.1)) 100%)`
      : 'var(--ring-track, rgba(0,0,0,.1))',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {fan.on && (
          <window.Icon
            name="mode_fan"
            size={22}
            color="var(--accent)"
            style={{ animation: 'spin 2s linear infinite' }}
          />
        )}
        <window.Toggle on={fan.on} kind="success" onChange={() => onToggle(fan.entity)} />
      </div>
      {fan.isSpeed && fan.on && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="range"
            min="0"
            max="100"
            value={fan.speed}
            onChange={(e) => onSpeed(fan.entity, Number(e.target.value))}
            style={speedTrackStyle}
          />
          <span style={{ fontSize: 11, color: 'var(--text-2)', minWidth: 28, textAlign: 'right' }}>
            {fan.speed}%
          </span>
        </div>
      )}
    </div>
  );
}
window.FanControl = FanControl;
