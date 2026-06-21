# GrowControl Card

A custom Home Assistant Lovelace card for managing grow boxes and a grow room. Rendered as a single self-contained web component (React bundled in, built with esbuild).

## Prerequisites

**Install the GrowControl integration first.** The card reads and writes all state through it over a websocket connection. Without the integration the card will not function.

- Integration repo: [codehustler/growcontrol](https://github.com/codehustler/growcontrol)
- Then install this card (see below).

## Features

- Grow box cards with per-box temperature, humidity, substrate moisture, light schedule, grow phase and timeline, switch controls, fan control, and energy tracking with reset.
- Grow room hero with radial gauges for temperature, humidity, and VPD, with zone coloring that reflects optimal/warning/danger ranges.
- Live 24-hour history charts for all sensor readings.
- Energy tracking per box with manual reset.
- Light and dark theme aware.
- All configuration done in-app via Settings using native `ha-entity-picker`. No manual `input_*` helpers needed; the integration provides phase, start date, and target temperature as native entities.

## Install via HACS (recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=codehustler&repository=growcontrol-card&category=plugin)

1. Click the badge above, or go to HACS, open the three-dot menu, choose **Custom repositories**, and add `https://github.com/codehustler/growcontrol-card` with category **Dashboard** (Lovelace/plugin).
2. Download "GrowControl" from HACS. HACS copies the file to `/config/www/community/growcontrol-card/` and registers the resource automatically.
3. Hard-refresh the browser (Ctrl+Shift+R), then add the card to a dashboard (a `panel` view works best).

To uninstall: HACS -> GrowControl -> three-dot menu -> Remove.

## Manual install

1. Copy `dist/growcontrol-card.js` to `<config>/www/growcontrol/growcontrol-card.js`.
2. Add a dashboard resource (Settings -> Dashboards -> Resources):
   - URL: `/local/growcontrol/growcontrol-card.js`
   - Type: JavaScript module
3. Add the card to a dashboard:

```yaml
type: custom:growcontrol-card
# optional:
# height: 82vh
# open_box: box1
```

## Card options

| Option | Default | Description |
|--------|---------|-------------|
| `height` | `82vh` | Card height |
| `open_box` | (none) | Box id to open directly in its detail view |

## Build

```
npm install
node build.mjs        # -> dist/growcontrol-card.js
node build.mjs --watch
```

## Source layout

```
src/
  index.jsx        bundle entry + the <growcontrol-card> custom element
  globals.js       exposes React/ReactDOM as globals
  runtime.js       hass store + HA .storage app store (via integration websocket)
  history.js       24h history fetch (HA REST) for the charts
  hass-adapter.js  builds window.GROW from live hass state
  tweaks.jsx       appearance panel
  App.jsx          shell + routing + HA wiring
  vendor/          view components
dist/
  growcontrol-card.js   the built bundle
```
