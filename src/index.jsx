/* index.jsx — bundle entry + custom-element wrapper.
   Import order matters: globals (React) -> runtime -> adapter -> tweaks ->
   vendor views -> App. Each side-effect import registers onto window.*. */
import './globals.js';
import './runtime.js';
import './history.js';
import './hass-adapter.js';
import './tweaks.jsx';
import './ha-picker.jsx';
import './vendor/icons.jsx';
import './vendor/components.jsx';
import './vendor/charts.jsx';
import './vendor/Overview.jsx';
import './vendor/BoxDetail.jsx';
import './vendor/Admin.jsx';
import './Settings.jsx';
import './App.jsx';
import themeCss from './vendor/theme.css';

window.TWEAK_DEFAULTS = { layout: 'grid', density: 'rich', nav: 'Sidebar', accent: 'Cyan', accentSwatch: '#00C9FF' };

const SPIN = '@keyframes spin { to { transform: rotate(360deg); } }';

// Scope the prototype's document-level CSS to the shadow root.
function shadowCss() {
  return themeCss
    .replace(/@import url\([^)]*Material\+Symbols[^)]*\);\n?/, '')         // unused icon font
    .replace(/:root\s*\{/, ':host {')                                      // CSS vars onto host
    .replace(/html,\s*body,\s*#root\s*\{[^}]*\}/, ':host { display: block; height: 100%; }')
    .replace(/\nbody\s*\{/, '\n:host {');                                   // body styles -> host
}

class GrowControlCard extends HTMLElement {
  setConfig(config) {
    this._config = config || {};
    const seed = {
      boxes: this._config.boxes || JSON.parse(JSON.stringify(window.GROW.DEFAULT_BOXES)),
      schedules: this._config.schedules || JSON.parse(JSON.stringify(window.GROW.SEED_SCHEDULES)),
      energy: this._config.energy || { priceSensor: '', price: null, currency: '€' },
    };
    window.__GC.appStore.init(seed);
    // optional deep-link: open straight to a box's detail view
    window.__GC.initialView = this._config.open_box
      ? { name: 'box', boxId: this._config.open_box }
      : (this._config.open_settings ? { name: 'settings', boxId: null } : { name: 'overview', boxId: null });
    if (!this._mounted) this._mount();
  }

  set hass(hass) {
    window.GROW.refresh(hass);
    // follow the HA app's light/dark setting
    const dark = !!(hass && hass.themes && hass.themes.darkMode);
    if (dark) this.setAttribute('data-dark', '');
    else this.removeAttribute('data-dark');
    window.__GC.hassStore.set(hass);
  }

  _mount() {
    const root = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = shadowCss() + '\n' + SPIN;
    root.appendChild(style);
    const mountEl = document.createElement('div');
    mountEl.style.height = this._config.height || '82vh';
    mountEl.style.width = '100%';
    root.appendChild(mountEl);
    if (window.ensureHaPicker) window.ensureHaPicker();
    window.ReactDOM.createRoot(mountEl).render(window.React.createElement(window.App));
    this._mounted = true;
  }

  getCardSize() { return 12; }
  static getStubConfig() { return { type: 'custom:growcontrol-card' }; }
}

if (!customElements.get('growcontrol-card')) {
  customElements.define('growcontrol-card', GrowControlCard);
}
window.customCards = window.customCards || [];
window.customCards.push({ type: 'growcontrol-card', name: 'GrowControl', description: 'Grow Box Manager' });
