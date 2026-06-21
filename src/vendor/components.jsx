/* components.jsx - shared UI primitives for Grow Box Manager */
const { useState, useEffect, useRef } = React;

function Icon({ name, size, style, className }) {
  const s = size || 20;
  return (
    <svg className={className} width={s} height={s} viewBox="0 0 24 24" fill="none"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}>
      {window.renderIcon(name)}
    </svg>
  );
}

function IconBtn({ icon, title, onClick, size, style }) {
  return (
    <button className="icon-btn" title={title} onClick={onClick} style={style}>
      <Icon name={icon} size={size} />
    </button>
  );
}

function Toggle({ on, onChange, kind, disabled }) {
  return (
    <button className="tgl" data-on={!!on} data-kind={kind || ''} disabled={disabled}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onChange(!on); }}
      aria-pressed={!!on} />
  );
}

function Chip({ children, variant, icon }) {
  return (
    <span className={'chip' + (variant ? ' chip--' + variant : '')}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

/* Phase chip with the right colour */
function PhaseChip({ phase, off }) {
  if (off) return <Chip variant="off" icon="power_settings_new">Off</Chip>;
  const p = window.GROW.PHASES[phase];
  return <Chip variant={phase === 'flowering' ? 'flower' : 'veg'} icon={phase === 'flowering' ? 'filter_vintage' : 'eco'}>{p.label}</Chip>;
}

/* labelled select */
function Select({ value, onChange, children, style }) {
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)} style={style}>
      {children}
    </select>
  );
}

/* Modal / dialog */
function Modal({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onMouseDown={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'fade-in .15s ease both',
    }}>
      <div onMouseDown={(e) => e.stopPropagation()} className="card" style={{
        width: width || 480, maxWidth: '100%', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: 'var(--shadow-pop)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <IconBtn icon="close" onClick={onClose} title="Close" />
        </div>
        <div className="scroll-y" style={{ padding: '20px 22px', overflowY: 'auto' }}>{children}</div>
        {footer && <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 22px', borderTop: '1px solid var(--border)' }}>{footer}</div>}
      </div>
    </div>
  );
}

/* Big metric tile */
function Metric({ icon, label, value, unit, accent, sub }) {
  const na = value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)', marginBottom: 4 }}>
        <Icon name={icon} size={16} style={{ color: accent || 'var(--text-3)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1,
          color: na ? 'var(--text-3)' : 'var(--text)' }}>{na ? 'N/A' : value}</span>
        {!na && unit && <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</span>}
    </div>
  );
}

/* Empty / dashed add tile */
function AddTile({ onClick, label }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        border: `2px dashed ${hover ? 'var(--accent)' : 'var(--border-2)'}`, background: hover ? 'var(--accent-bg)' : 'transparent',
        borderRadius: 'var(--r-lg)', cursor: 'pointer', color: hover ? 'var(--accent-hover)' : 'var(--text-3)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: 180, transition: 'all .15s', fontFamily: 'inherit', width: '100%',
      }}>
      <Icon name="add" size={30} />
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

Object.assign(window, { Icon, IconBtn, Toggle, Chip, PhaseChip, Select, Modal, Metric, AddTile });
