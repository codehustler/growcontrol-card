/* App.jsx - shell + routing + live HA wiring.
   Proper dashboard view: no sidebar, no floating tweaks popup. Custom UI for
   the grow visuals (overview + detail); a standard Settings view holds the box
   manager (native ha-entity-picker config), schedules, and appearance. */
const { useState: useS, useEffect: useE, useRef: useR } = React;

const GC = () => window.__GC;

function App() {
  const [t, setTweak] = window.useTweaks(window.TWEAK_DEFAULTS);

  const hass = React.useSyncExternalStore(GC().hassStore.subscribe, GC().hassStore.get);
  const appState = React.useSyncExternalStore(GC().appStore.subscribe, GC().appStore.get);
  const ready = !!appState && !appState.__error;
  const storeBoxes = ready ? (appState.boxes || []) : [];
  const schedules = ready ? (appState.schedules || []) : [];
  const energy = ready ? (appState.energy || {}) : {};
  const rooms = ready ? (appState.rooms || []) : [];
  const connected = !!hass;

  const [hist, setHist] = useS({});
  const hassRef = useR(hass); hassRef.current = hass;

  const boxes = React.useMemo(
    () => storeBoxes.map((b) => window.GROW.deriveBox(b, hass, hist)),
    [storeBoxes, hass, hist],
  );

  const idsKey = React.useMemo(() => {
    const ids = new Set();
    storeBoxes.forEach((b) => ['temp', 'humidity', 'substrate'].forEach((k) => {
      if (b.config[k] && b.config[k].enabled && b.config[k].entity) ids.add(b.config[k].entity);
    }));
    return [...ids].sort().join(',');
  }, [storeBoxes]);

  useE(() => {
    const ids = idsKey ? idsKey.split(',') : [];
    if (!ids.length) return;
    let cancelled = false;
    const run = () => { const h = hassRef.current; if (h) GC().fetchHistory(h, ids).then((r) => { if (!cancelled) setHist(r); }); };
    run();
    const timer = setInterval(run, 300000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [idsKey, connected]);

  // Auto-zero energy: when a box has an energy sensor but no baseline yet, set
  // the baseline to the current reading (so it shows 0 instead of the lifetime total).
  useE(() => {
    const h = hassRef.current; if (!h) return;
    storeBoxes.forEach((b) => {
      const l = b.config.light;
      if (!l || !l.enabled || !l.energySensor) return;
      const patch = {};
      // auto-zero: baseline = current reading on first sight
      if (l.energyBaseline === undefined || l.energyBaseline === null) {
        const s = h.states[l.energySensor];
        const cur = s ? Number(s.state) : null;
        if (Number.isFinite(cur)) patch.energyBaseline = cur;
      }
      // auto-detect the matching power sensor (..._energy -> ..._power) if unset
      if (!l.powerEntity) {
        const guess = l.energySensor.replace(/_energy$/, '_power');
        if (guess !== l.energySensor && h.states[guess]) patch.powerEntity = guess;
      }
      if (Object.keys(patch).length) patchConfig(b.id, { light: { ...l, ...patch } });
    });
  }, [storeBoxes, connected]);

  const [view, setView] = useS(() => GC().initialView || { name: 'overview', boxId: null });
  const [settingsTab, setSettingsTab] = useS('boxes');
  const [confirm, setConfirm] = useS(null);
  const [toast, setToast] = useS(null);
  const rootRef = useR(null);

  useE(() => {
    const map = { Blue: ['#3293FF', '#4ea2ff', 'rgba(50,147,255,.14)', 'rgba(50,147,255,.45)'],
                  Green: ['#45D483', '#5fe098', 'rgba(69,212,131,.14)', 'rgba(69,212,131,.45)'],
                  Cyan: ['#00C9FF', '#3ad6ff', 'rgba(0,201,255,.14)', 'rgba(0,201,255,.45)'] };
    const [a, h, bg, bd] = map[t.accent] || map.Blue;
    const r = rootRef.current; if (!r) return;
    r.style.setProperty('--accent', a); r.style.setProperty('--accent-hover', h);
    r.style.setProperty('--accent-bg', bg); r.style.setProperty('--accent-border', bd);
  }, [t.accent]);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  // Integrate browser/mouse Back with in-app navigation: entering a sub-view
  // pushes a history entry (one at most), Back pops it -> popstate -> overview,
  // instead of leaving the dashboard entirely.
  const navOpen = (next) => {
    const inSub = view.name !== 'overview';
    setView(next);
    try { inSub ? window.history.replaceState({ gcSub: true }, '') : window.history.pushState({ gcSub: true }, ''); } catch (e) { /* ignore */ }
  };
  const navBack = () => {
    if (window.history.state && window.history.state.gcSub) window.history.back();
    else setView({ name: 'overview', boxId: null });
  };
  useE(() => {
    const onPop = () => setView((v) => (v.name === 'overview' ? v : { name: 'overview', boxId: null }));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // ---- HA service helpers ----
  const callSvc = (entity, service, extra) => {
    const h = GC().hassStore.get();
    if (!h || !entity) return;
    const domain = entity.split('.')[0];
    h.callService(domain, service, { entity_id: entity, ...(extra || {}) });
  };

  // ---- structural mutations (app store, localStorage) ----
  const patchStoreBox = (id, fn) => GC().appStore.set((s) => ({ ...s, boxes: s.boxes.map((b) => (b.id === id ? fn(b) : b)) }));
  const toggleMaster = (id) => patchStoreBox(id, (b) => ({ ...b, master: !b.master }));
  const rename = (id, name) => patchStoreBox(id, (b) => ({ ...b, name }));
  const patchConfig = (id, partial) => patchStoreBox(id, (b) => ({ ...b, config: { ...b.config, ...partial } }));
  const setSchedules = (next) => GC().appStore.set((s) => ({ ...s, schedules: typeof next === 'function' ? next(s.schedules) : next }));
  const setEnergy = (next) => GC().appStore.set((s) => ({ ...s, energy: typeof next === 'function' ? next(s.energy) : next }));

  const patchRoom = (roomId, partial) => GC().appStore.set((s) => ({
    ...s, rooms: (s.rooms || []).map((r) => (r.id === roomId ? { ...r, ...partial } : r)),
  }));
  const patchRoomSensors = (roomId, partial) => patchRoom(roomId, { sensors: { ...((rooms.find((r) => r.id === roomId) || {}).sensors || {}), ...partial } });
  const patchRoomControls = (roomId, partial) => patchRoom(roomId, { controls: { ...((rooms.find((r) => r.id === roomId) || {}).controls || {}), ...partial } });

  const addBox = () => {
    const id = 'box-' + Date.now();
    const blank = {}; window.GROW.SLOT_CATALOG.forEach((s) => { blank[s.key] = { entity: '', enabled: false }; });
    blank.phaseEntity = ''; blank.startEntity = ''; blank.tempTargetEntity = '';
    const n = (GC().appStore.get().boxes.length || 0) + 1;
    GC().appStore.set((s) => ({ ...s, boxes: [...s.boxes, { id, name: 'Growbox ' + n, master: true, startDate: new Date().toISOString().slice(0, 10), config: blank }] }));
    flash('Box added - map its entities below');
  };

  // ---- device actions (HA services) ----
  const toggleControl = (id, key) => {
    const b = storeBoxes.find((x) => x.id === id);
    const ent = b && b.config[key] && b.config[key].entity;
    callSvc(ent, 'toggle');
  };
  const setPhase = (id, phase) => {
    const b = storeBoxes.find((x) => x.id === id);
    const ent = b && b.config.phaseEntity;
    const option = window.GROW.PHASES[phase] ? window.GROW.PHASES[phase].label : phase;
    callSvc(ent, 'select_option', { option });
  };
  const setTarget = (id, value) => {
    const b = storeBoxes.find((x) => x.id === id);
    const ent = b && b.config.tempTargetEntity;
    const num = Number(value);
    if (ent && Number.isFinite(num)) callSvc(ent, 'set_value', { value: num });
  };
  // Zero the per-box energy counter by setting its baseline to the current reading.
  const resetEnergy = (id) => {
    const b = storeBoxes.find((x) => x.id === id);
    const ent = b && b.config.light && b.config.light.energySensor;
    const h = GC().hassStore.get();
    const cur = (ent && h && h.states[ent]) ? Number(h.states[ent].state) : 0;
    if (b) patchConfig(id, { light: { ...b.config.light, energyBaseline: Number.isFinite(cur) ? cur : 0 } });
    flash('Energy counter reset');
  };

  const fanToggle = (entity) => callSvc(entity, 'toggle');
  const fanSpeed = (entity, pct) => callSvc(entity, 'set_percentage', { percentage: pct });

  const roomViews = React.useMemo(() => rooms.map((r) => window.GROW.deriveRoom(r, hass)), [rooms, hass]);

  const delBox = (id) => setConfirm({ id, name: (storeBoxes.find((b) => b.id === id) || {}).name });
  const openSettings = (tab) => { setSettingsTab(tab || 'boxes'); navOpen({ name: 'settings', boxId: null }); };

  const current = boxes.find((b) => b.id === view.boxId);

  if (!appState) {
    return <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)', fontSize: 14 }}>Loading…</div>;
  }
  if (appState.__error) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-2)', textAlign: 'center', padding: 24 }}>
        <window.Icon name="cloud_off" size={28} style={{ color: 'var(--text-3)' }} />
        <div style={{ fontWeight: 700 }}>GrowControl integration not found</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)' }}>Add the GrowControl integration in Settings → Devices &amp; Services, then reload.</div>
      </div>
    );
  }

  const SettingsGear = () => (
    <window.IconBtn icon="settings" title="Settings" onClick={() => openSettings('boxes')} />
  );

  return (
    <div ref={rootRef} style={{ height: '100%', position: 'relative', background: 'var(--bg)', color: 'var(--text)' }}>
      <main className="scroll-y" style={{ height: '100%', overflowY: 'auto', padding: view.name === 'overview' ? '26px 32px 48px' : '24px 32px 56px' }}>
        {view.name === 'overview' && (
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700 }}>Grow Boxes</h1>
                <p style={{ color: 'var(--text-3)', fontSize: 13, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: connected ? 'var(--success)' : 'var(--text-3)' }} />
                  {boxes.length} box{boxes.length !== 1 ? 'es' : ''} · {boxes.filter((b) => b.master).length} active
                </p>
              </div>
              <SettingsGear />
            </div>
            {roomViews.map((r) => <window.RoomHero key={r.id} room={r} onFanToggle={fanToggle} onFanSpeed={fanSpeed} />)}
            {boxes.length > 0 ? (
              <window.Overview boxes={boxes} schedules={schedules} energy={energy} layout={t.layout} density={t.density}
                onOpen={(id) => navOpen({ name: 'box', boxId: id })} onToggleMaster={toggleMaster} />
            ) : (
              <window.AddTile label="Add your first grow box in Settings" onClick={() => openSettings('boxes')} />
            )}
          </div>
        )}

        {view.name === 'box' && current && (
          <window.BoxDetail box={current} schedules={schedules} energy={energy}
            onBack={navBack}
            onConfigure={() => openSettings('boxes')}
            onToggleMaster={toggleMaster} onSetPhase={setPhase} onToggleControl={toggleControl}
            onRename={rename} onDelete={delBox} onSetTarget={setTarget} onResetEnergy={resetEnergy} />
        )}

        {view.name === 'settings' && (
          <window.Settings hass={hass} tab={settingsTab} setTab={setSettingsTab} t={t} setTweak={setTweak}
            boxes={storeBoxes} onAddBox={addBox} onDeleteBox={delBox} onRenameBox={rename} onPatchConfig={patchConfig}
            schedules={schedules} onSchedulesChange={setSchedules} energy={energy} onEnergyChange={setEnergy}
            rooms={rooms} onRoom={patchRoom} onRoomSensors={patchRoomSensors} onRoomControls={patchRoomControls}
            onBack={navBack} onOpenBox={(id) => navOpen({ name: 'box', boxId: id })} />
        )}
      </main>

      <window.Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete box" width={420}
        footer={<>
          <button className="btn btn--ghost" onClick={() => setConfirm(null)}>Cancel</button>
          <button className="btn btn--danger" onClick={() => { GC().appStore.set((s) => ({ ...s, boxes: s.boxes.filter((b) => b.id !== confirm.id) })); if (view.boxId === confirm.id) setView({ name: 'overview', boxId: null }); setConfirm(null); flash('Box deleted'); }}>
            <window.Icon name="delete_outline" size={18} />Delete
          </button>
        </>}>
        {confirm && <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 14 }}>Remove <b style={{ color: 'var(--text)' }}>{confirm.name}</b> and its entity mapping? This won't change anything in Home Assistant.</p>}
      </window.Modal>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 300,
          background: 'var(--paper-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--r-md)',
          padding: '11px 18px', fontSize: 14, fontWeight: 600, boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', gap: 9,
          animation: 'fade-in .2s ease both' }}>
          <window.Icon name="check_circle" size={18} style={{ color: 'var(--success)' }} />{toast}
        </div>
      )}
    </div>
  );
}

window.App = App;
