# GrowControl

A custom Home Assistant Lovelace card: a grow-box manager UI (the "Grow Box Manager" prototype) rendered as a single web component. Shows per-box temperature/humidity/substrate, light schedules, grow phase and timeline, and switch controls, all driven by live Home Assistant state.

The React app is mounted inside a shadow root and ships as one self-contained bundle (React is bundled in). Built with esbuild.

## Layout

```
src/
  index.jsx        bundle entry + the <growcontrol-card> custom element
  globals.js       exposes React/ReactDOM as globals for the prototype's window.* pattern
  runtime.js       hass store + localStorage app store
  history.js       24h history fetch (HA REST) for the charts
  hass-adapter.js  builds window.GROW from live hass state (replaces the prototype's mock data)
  tweaks.jsx       appearance panel (localStorage-backed)
  App.jsx          shell + routing + HA wiring
  vendor/          the prototype's view components, kept close to verbatim
dist/
  growcontrol-card.js   the built bundle
```

## Build

```
npm install
node build.mjs        # -> dist/growcontrol-card.js
node build.mjs --watch
```

## Install via HACS (recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=codehustler&repository=growcontrol-card&category=plugin)

1. HACS -> three-dot menu -> Custom repositories -> add `https://github.com/codehustler/growcontrol-card` with category **Dashboard** (a.k.a. Lovelace/plugin). Or just click the badge above.
2. Download "GrowControl" from HACS. HACS copies the file to `/config/www/community/growcontrol-card/` and registers the resource for you.
3. Hard-refresh the browser (Ctrl+Shift+R), then add the card (see below).

To uninstall later: HACS -> GrowControl -> three-dot menu -> Remove.

## Manual install

1. Copy `dist/growcontrol-card.js` to `<config>/www/growcontrol/growcontrol-card.js`.
2. Add a dashboard resource (Settings -> Dashboards -> Resources):
   - URL: `/local/growcontrol/growcontrol-card.js`
   - Type: JavaScript module
3. Add the card to a dashboard (a `panel` view works best):

```yaml
type: custom:growcontrol-card
# optional:
# height: 82vh
# open_box: box1
```

The card seeds two default boxes; map your entities per box in the in-app Configure screen. Box and schedule configuration persists in browser localStorage (per device); device state (switches, phase, target temp) lives in Home Assistant.

## Config options

| Option | Default | Description |
|--------|---------|-------------|
| `height` | `82vh` | Card height |
| `open_box` | (none) | Box id to open directly in its detail view |
| `boxes` | built-in seed | Initial box definitions (overrides the default seed on first run) |
