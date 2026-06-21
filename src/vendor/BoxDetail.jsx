/* BoxDetail.jsx - individual grow box view */
const { useState: useStateD } = React;

function ControlRow({ slot, box, schedules, onToggle }) {
  const cfg = box.config[slot.key];
  const off = !box.master;
  const on = !off && box.live[slot.key];
  const sched = slot.schedulable && cfg.schedule ? schedules.find((s) => s.id === cfg.schedule) : null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? (slot.key === 'light' ? 'var(--warning-bg)' : 'var(--success-bg)') : 'var(--bg-2)',
        border: '1px solid var(--border)' }}>
        <window.Icon name={slot.icon} size={20} style={{ color: on ? (slot.key === 'light' ? 'var(--warning)' : 'var(--success)') : 'var(--text-3)' }} />
      </div>
      <div style={{ minWidth: 130 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{slot.label}</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{cfg.entity}</div>
      </div>
      {sched ? (
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Schedule · {sched.name.replace(/.*-\s*/, '')}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-2)' }}>{window.GROW.ratio(sched.hours)}</span>
          </div>
          <window.TimelineStrip hours={off ? Array(24).fill(false) : sched.hours} type={slot.schedType} height={16} />
        </div>
      ) : <div style={{ flex: 1 }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, width: 30, textAlign: 'right',
          color: on ? (slot.key === 'light' ? 'var(--warning)' : 'var(--success)') : 'var(--text-3)' }}>{off ? '-' : on ? 'ON' : 'OFF'}</span>
        <window.Toggle on={on} disabled={off} kind={slot.key === 'light' ? 'light' : 'success'}
          onChange={() => onToggle(box.id, slot.key)} />
      </div>
    </div>
  );
}

function MetricCard({ slot, box }) {
  const off = !box.master;
  const val = off ? null : box.live[slot.key];
  const na = val == null || (slot.key !== 'temp' && val === 0);
  const accent = slot.key === 'humidity' ? 'var(--accent)' : 'var(--success)';
  const hist = off ? [] : (box.live[slot.key + 'Hist'] || []);
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'var(--text-3)' }}>
        <window.Icon name={slot.icon} size={16} style={{ color: accent }} />
        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.03em', textTransform: 'uppercase' }}>{slot.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-3)' }}>24h</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 6 }}>
        <span style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, color: na ? 'var(--text-3)' : 'var(--text)' }}>{na ? 'N/A' : val}</span>
        {!na && <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 600 }}>{slot.unit}</span>}
      </div>
      {!na && hist.length > 0 && (
        <div style={{ marginTop: 'auto', paddingTop: 12 }}>
          <window.TempChart data={hist} accent={accent} height={86} decimals={0} />
        </div>
      )}
    </div>
  );
}

function DurationStat({ label, days, sub, accent }) {
  const w = Math.floor(days / 7) + 1, d = (days % 7) + 1;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 124 }}>
      <span className="field-label" style={{ marginBottom: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: accent || 'var(--text)' }}>Week {w}</span>
        <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>· Day {d}</span>
      </div>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
    </div>
  );
}

function PhaseBar({ veg, flower, current }) {
  const total = Math.max(1, veg + flower);
  const rows = [
    { key: 'vegetative', label: 'Vegetative', days: veg, color: 'var(--success)', grad: 'var(--grad-veg)' },
    { key: 'flowering',  label: 'Flowering',  days: flower, color: 'var(--error)',   grad: 'var(--grad-flower)' },
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
        {rows.filter((r) => r.days > 0).map((r) => (
          <div key={r.key} title={`${r.label}: ${r.days} days`}
            style={{ width: (r.days / total * 100) + '%', background: r.grad, opacity: r.key === current ? 1 : 0.55,
              borderRight: '1px solid var(--bg-2)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 26, marginTop: 11, flexWrap: 'wrap' }}>
        {rows.map((r) => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: r.grad, opacity: r.key === current ? 1 : 0.55 }} />
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.label}</span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{Math.floor(r.days / 7)} w {r.days % 7} d</span>
            {r.key === current && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.05em', color: r.color }}>NOW</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function EStat({ label, value, unit, sub, accent }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 130 }}>
      <span className="field-label" style={{ marginBottom: 0 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
        <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: accent || 'var(--text)' }}>{value}</span>
        {unit && <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>{unit}</span>}
      </div>
      {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
    </div>
  );
}

function EnergyCard({ box, energy, onResetEnergy }) {
  const off = !box.master;
  const cfg = box.config.light;
  const kWh = box.live.lightEnergy || 0;
  const watt = box.live.lightWatt || 0;
  // measured power from the mapped power sensor (ground truth), zeroed when box is off
  const powerNow = off ? 0 : watt;
  const hasPrice = energy && energy.priceSensor && energy.price != null;
  const cost = hasPrice ? kWh * energy.price : null;
  const cur = (energy && energy.currency) || '€';
  const days = Math.max(1, window.GROW.daysSince(box.startDate));
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <window.Icon name="bolt" size={18} style={{ color: 'var(--warning)' }} />
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Light energy &amp; cost</h3>
        <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>{cfg.energySensor}</span>
        {onResetEnergy && (
          <button className="btn btn--ghost btn--sm" title="Reset consumed energy to 0" onClick={() => onResetEnergy(box.id)}>
            <window.Icon name="sync" size={15} />Reset
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 34, flexWrap: 'wrap' }}>
        <EStat label="Power now" value={powerNow} unit="W" accent={powerNow ? 'var(--warning)' : 'var(--text-3)'}
          sub={(box.live.light && !off) ? 'Light on' : 'Light off'} />
        <EStat label="Consumed since start" value={kWh.toFixed(1)} unit="kWh" sub={'≈ ' + (kWh / days).toFixed(2) + ' kWh / day'} />
        <EStat label="Cost since start" value={hasPrice ? cur + cost.toFixed(2) : '-'} accent="var(--success)"
          sub={hasPrice ? ('at ' + cur + energy.price.toFixed(2) + ' / kWh') : 'Set a price sensor in Admin'} />
      </div>
    </div>
  );
}

function TargetInput({ box, onSetTarget }) {
  const v = box.live.tempTarget;
  const [val, setVal] = useStateD(v == null ? '' : String(v));
  React.useEffect(() => { setVal(v == null ? '' : String(v)); }, [v]);
  const commit = (e) => { if (val !== '' && Number(val) !== v) onSetTarget(box.id, val); e.target.style.borderColor = 'transparent'; };
  return (
    <input type="number" step="0.1" value={val} title="Set target temperature"
      onChange={(e) => setVal(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
      onFocus={(e) => { e.target.style.borderColor = 'var(--border-2)'; }}
      style={{ width: 72, fontSize: 32, fontWeight: 700, color: 'var(--accent)', background: 'transparent',
        border: '1px solid transparent', borderRadius: 8, padding: '0 4px', fontFamily: 'inherit', outline: 'none' }} />
  );
}

function BoxDetail({ box, boxes, schedules, energy, onBack, onConfigure, onToggleMaster, onSetPhase, onToggleControl, onRename, onDelete, onSetTarget, onResetEnergy, onSwitchBox }) {
  const [editName, setEditName] = useStateD(false);
  const [nameVal, setNameVal] = useStateD(box.name);
  const off = !box.master;
  const cfg = box.config;
  const C = window.GROW.SLOT_CATALOG;
  const tempCfg = cfg.temp && cfg.temp.enabled;
  const sideMetrics = C.filter((s) => s.metric && s.key !== 'temp' && cfg[s.key] && cfg[s.key].enabled);
  const controls = C.filter((s) => s.kind === 'switch' && cfg[s.key] && cfg[s.key].enabled);
  const lightSched = schedules.find((s) => s.id === window.GROW.PHASES[box.phase].lightSchedule);
  const G = window.GROW;
  const totalDays = G.daysSince(box.startDate), totalWeek = G.weekOf(totalDays);
  const phaseDays = G.daysSince(box.phaseStart || box.startDate), phaseWeek = G.weekOf(phaseDays);
  const pt = G.phaseTotals(box);
  const phaseColor = box.phase === 'flowering' ? 'var(--error)' : 'var(--success)';
  const fmtD = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  const boxList = boxes || [];
  const boxIdx = boxList.findIndex((b) => b.id === box.id);
  const hasPrev = boxList.length > 1 && boxIdx > 0;
  const hasNext = boxList.length > 1 && boxIdx < boxList.length - 1;
  const showSwitcher = boxList.length > 1;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1100, margin: '0 auto' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <window.IconBtn icon="arrow_back" title="Back to overview" onClick={onBack} />
        {editName ? (
          <input className="input" autoFocus value={nameVal} onChange={(e) => setNameVal(e.target.value)}
            onBlur={() => { onRename(box.id, nameVal.trim() || box.name); setEditName(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { onRename(box.id, nameVal.trim() || box.name); setEditName(false); } }}
            style={{ width: 260, fontSize: 22, fontWeight: 700, padding: '4px 10px' }} />
        ) : (
          <h1 style={{ fontSize: 26, fontWeight: 700, cursor: 'text' }} onClick={() => { setNameVal(box.name); setEditName(true); }}>{box.name}</h1>
        )}
        <window.PhaseChip phase={box.phase} off={off} />
        {showSwitcher && (
          <div style={{
            display: 'flex', alignItems: 'center',
            borderRadius: 'var(--r-pill)',
            border: '1px solid var(--border)',
            background: 'var(--paper-2)',
            overflow: 'hidden',
          }}>
            <button
              title="Previous box"
              disabled={!hasPrev}
              onClick={() => hasPrev && onSwitchBox && onSwitchBox(boxList[boxIdx - 1].id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, background: 'none', border: 'none',
                cursor: hasPrev ? 'pointer' : 'default',
                opacity: hasPrev ? 1 : 0.3,
                color: 'var(--text-2)',
                borderRight: '1px solid var(--border)',
              }}>
              <window.Icon name="arrow_back" size={16} />
            </button>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)', padding: '0 8px', whiteSpace: 'nowrap' }}>
              {boxIdx + 1} / {boxList.length}
            </span>
            <button
              title="Next box"
              disabled={!hasNext}
              onClick={() => hasNext && onSwitchBox && onSwitchBox(boxList[boxIdx + 1].id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, background: 'none', border: 'none',
                cursor: hasNext ? 'pointer' : 'default',
                opacity: hasNext ? 1 : 0.3,
                color: 'var(--text-2)',
                borderLeft: '1px solid var(--border)',
              }}>
              <window.Icon name="arrow_back" size={16} style={{ transform: 'scaleX(-1)' }} />
            </button>
          </div>
        )}
        <span style={{ fontSize: 13, color: 'var(--text-3)', whiteSpace: 'nowrap' }}>Week {Math.floor(totalDays / 7) + 1} - Day {totalDays % 7 + 1}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: off ? 'var(--text-3)' : 'var(--success)' }}>{off ? 'OFF' : 'ACTIVE'}</span>
          <window.Toggle on={box.master} kind="success" onChange={() => onToggleMaster(box.id)} />
        </div>
        <button className="btn btn--secondary" onClick={() => onConfigure(box.id)}><window.Icon name="tune" size={18} />Configure</button>
        <window.IconBtn icon="delete_outline" title="Delete box" onClick={() => onDelete(box.id)} />
      </div>

      {off && (
        <div className="card" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-2)', color: 'var(--text-2)', fontSize: 13 }}>
          <window.Icon name="power_settings_new" size={18} style={{ color: 'var(--text-3)' }} />
          This box is switched off. All schedules are paused and controlled devices are forced off.
        </div>
      )}

      {/* grow timeline: phase controls + total / per-phase durations */}
      <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 28, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span className="field-label" style={{ marginBottom: 0 }}>Grow phase</span>
            <window.Select value={box.phase} onChange={(v) => onSetPhase(box.id, v)} style={{ width: 180 }}>
              <option value="vegetative">Vegetative</option>
              <option value="flowering">Flowering</option>
            </window.Select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <span className="field-label" style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Light schedule</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 38 }}>
              <window.Chip variant="accent" icon="schedule">{lightSched ? window.GROW.ratio(lightSched.hours) : '-'}</window.Chip>
              <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{lightSched ? lightSched.name.replace(/.*-\s*/, '') + ' light / dark' : 'none'}</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 16 }} />
          <DurationStat label="Total grow" days={totalDays} sub={'since ' + fmtD(box.startDate)} />
          <div style={{ width: 1, alignSelf: 'stretch', background: 'var(--border)' }} />
          <DurationStat label={'In ' + window.GROW.PHASES[box.phase].label} days={phaseDays} sub={'since ' + fmtD(box.phaseStart || box.startDate)} accent={phaseColor} />
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <span className="field-label">Time in each phase</span>
          <PhaseBar veg={pt.vegetative} flower={pt.flowering} current={box.phase} />
        </div>
      </div>

      {/* temp chart + side metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: sideMetrics.length ? '1.7fr 1fr' : '1fr', gap: 16, alignItems: 'start' }}>
        {tempCfg && (
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div>
                  <div className="field-label" style={{ marginBottom: 6 }}>Temperature · 24h</div>
                  <div style={{ display: 'flex', gap: 22, alignItems: 'flex-end' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 700, color: (off || box.live.temp == null) ? 'var(--text-3)' : 'var(--warning)' }}>{(off || box.live.temp == null) ? 'N/A' : box.live.temp}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>°C</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Current</span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <TargetInput box={box} onSetTarget={onSetTarget} />
                        <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 600 }}>°C</span>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Target</span>
                    </div>
                    {/* VPD readout - computed from live temp + humidity */}
                    {(() => {
                      const t = off ? null : box.live.temp;
                      const h = off ? null : box.live.humidity;
                      if (t == null || h == null) return null;
                      const v = window.GROW.vpdJs(t, h, 2);
                      const phaseKey = box.phase === 'flowering' ? 'Flowering' : 'Vegetative';
                      const zone = window.GROW.vpdZone(v, phaseKey);
                      return (
                        <div style={{ marginLeft: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                            <span style={{ fontSize: 28, fontWeight: 700, color: zone.color }}>{v != null ? v.toFixed(2) : 'N/A'}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>kPa</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 700, color: zone.color, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                            VPD{zone.label ? ' - ' + zone.label : ''}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
            <window.TempChart data={off ? [] : box.live.tempHist} target={box.live.tempTarget} accent="var(--warning)" height={sideMetrics.length ? 280 : 196} />
          </div>
        )}
        {sideMetrics.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {sideMetrics.map((s) => <MetricCard key={s.key} slot={s} box={box} />)}
          </div>
        )}
      </div>

      {/* light energy & cost */}
      {box.config.light && box.config.light.enabled && box.config.light.energySensor && (
        <EnergyCard box={box} energy={energy} onResetEnergy={onResetEnergy} />
      )}

      {/* controls */}
      {controls.length > 0 && (
        <div className="card" style={{ padding: '4px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0 4px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Controls</h3>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Manual override · schedules apply automatically</span>
          </div>
          {controls.map((s) => <ControlRow key={s.key} slot={s} box={box} schedules={schedules} onToggle={onToggleControl} />)}
        </div>
      )}
    </div>
  );
}

window.BoxDetail = BoxDetail;
