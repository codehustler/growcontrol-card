/* tweaks.jsx — HA-friendly replacement for the prototype's design-host tweaks.
   Same window.* API the App expects (useTweaks, TweaksPanel, TweakSection,
   TweakRadio, TweakColor) but: values persist to localStorage and the panel is
   opened by its own floating gear button (no claude.ai host messaging). */
const { useState: useTwS, useEffect: useTwE } = React;

const TW_LS = 'growcontrol-tweaks-v1';
function loadTweaks(defaults) {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(TW_LS)) || {}) }; }
  catch { return { ...defaults }; }
}

function useTweaks(defaults) {
  const [values, setValues] = useTwS(() => loadTweaks(defaults));
  const setTweak = (keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null ? keyOrEdits : { [keyOrEdits]: val };
    setValues((prev) => {
      const next = { ...prev, ...edits };
      try { localStorage.setItem(TW_LS, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };
  return [values, setTweak];
}

const PANEL_STYLE = {
  position: 'absolute', right: 16, bottom: 16, zIndex: 50, width: 256,
  background: 'var(--paper)', color: 'var(--text)', border: '1px solid var(--border-2)',
  borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-pop)', padding: '14px 16px',
  display: 'flex', flexDirection: 'column', gap: 10, font: '12px/1.4 var(--font)',
};

function TweaksPanel({ title = 'Appearance', children }) {
  const [open, setOpen] = useTwS(false);
  return (
    <>
      <button title="Appearance" onClick={() => setOpen((o) => !o)}
        style={{ position: 'absolute', right: 16, bottom: 16, zIndex: 49, width: 42, height: 42,
          borderRadius: '50%', border: '1px solid var(--border-2)', background: 'var(--paper)',
          color: 'var(--text-2)', cursor: 'pointer', display: open ? 'none' : 'flex',
          alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-pop)' }}>
        <window.Icon name="tune" size={20} />
      </button>
      {open && (
        <div style={PANEL_STYLE}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <b style={{ fontSize: 13, fontWeight: 700 }}>{title}</b>
            <button className="icon-btn" style={{ width: 26, height: 26 }} onClick={() => setOpen(false)} title="Close">
              <window.Icon name="close" size={16} />
            </button>
          </div>
          {children}
        </div>
      )}
    </>
  );
}

function TweakSection({ label }) {
  return <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
    color: 'var(--text-3)', paddingTop: 6 }}>{label}</div>;
}

function TweakRadio({ label, value, options, onChange }) {
  const opts = options.map((o) => (typeof o === 'object' ? o : { value: o, label: o }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', padding: 2, borderRadius: 8, background: 'var(--bg-2)', gap: 2 }}>
        {opts.map((o) => {
          const on = o.value === value;
          return (
            <button key={o.value} onClick={() => onChange(o.value)} style={{
              flex: 1, border: 'none', borderRadius: 6, padding: '5px 6px', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: on ? 700 : 500, textTransform: 'capitalize',
              background: on ? 'var(--paper-2)' : 'transparent', color: on ? 'var(--text)' : 'var(--text-3)' }}>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TweakColor({ label, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', gap: 6 }}>
        {(options || []).map((c) => {
          const on = String(c).toLowerCase() === String(value).toLowerCase();
          return (
            <button key={c} onClick={() => onChange(c)} title={c} style={{
              flex: 1, height: 30, borderRadius: 7, cursor: 'pointer', background: c,
              border: on ? '2px solid var(--text)' : '1px solid var(--border-2)' }} />
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor });
