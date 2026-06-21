/* icons.jsx — inline SVG icon set (Material-style, filled). Offline-proof. */
const cc = 'currentColor';
const ICONS = {
  grid_view: (<g fill={cc}><rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.6"/></g>),
  settings: (<g><g fill={cc}>{[0,45,90,135,180,225,270,315].map(a=>(<rect key={a} x="10.7" y="1.6" width="2.6" height="4.2" rx="1" transform={`rotate(${a} 12 12)`}/>))}</g><circle cx="12" cy="12" r="5" fill="none" stroke={cc} strokeWidth="2.4"/><circle cx="12" cy="12" r="1.7" fill={cc}/></g>),
  add: (<path fill={cc} d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z"/>),
  close: (<path fill={cc} d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12 19 6.4 17.6 5 12 10.6z"/>),
  check: (<path fill={cc} d="M9.5 16.2 5.3 12l-1.5 1.4 5.7 5.7L20.2 7.8l-1.4-1.4z"/>),
  check_circle: (<g fill="none" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.3 2.3 4.7-4.8"/></g>),
  arrow_back: (<path fill={cc} d="M20 11H7.8l5.1-5.1L11.5 4.5 4 12l7.5 7.5 1.4-1.4L7.8 13H20z"/>),
  delete_outline: (<g fill={cc}><path d="M7 9h10l-.85 11.1A2 2 0 0 1 14.16 22H9.84a2 2 0 0 1-1.99-1.9z"/><path d="M9 4h6l1 2h4v2H4V6h4z"/></g>),
  tune: (<g><g stroke={cc} strokeWidth="2" strokeLinecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></g><g fill={cc}><circle cx="9" cy="7" r="2.5"/><circle cx="16" cy="12" r="2.5"/><circle cx="8" cy="17" r="2.5"/></g></g>),
  visibility: (<g><ellipse cx="12" cy="12" rx="9.2" ry="6" fill="none" stroke={cc} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill={cc}/></g>),
  visibility_off: (<g><ellipse cx="12" cy="12" rx="9.2" ry="6" fill="none" stroke={cc} strokeWidth="2"/><circle cx="12" cy="12" r="3" fill={cc}/><line x1="4" y1="4" x2="20" y2="20" stroke={cc} strokeWidth="2.2" strokeLinecap="round"/></g>),
  power_settings_new: (<g fill="none" stroke={cc} strokeWidth="2.1" strokeLinecap="round"><line x1="12" y1="3" x2="12" y2="12"/><path d="M7.2 6.6a8 8 0 1 0 9.6 0"/></g>),
  schedule: (<g fill="none" stroke={cc} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.6 2.1"/></g>),
  info: (<g fill="none" stroke={cc} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16.5"/><circle cx="12" cy="7.7" r="1.1" fill={cc} stroke="none"/></g>),
  bolt: (<path fill={cc} d="M13.2 2 4.5 13.4H10l-1 8.6 9.5-12.4H12.5z"/>),
  cloud_done: (<g fill="none" stroke={cc} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7.4 19a4.4 4.4 0 0 1-.4-8.78 5.5 5.5 0 0 1 10.45-1.1A4 4 0 0 1 17 19z"/><path d="m9.6 14.2 1.8 1.8 3.5-3.6"/></g>),
  cloud_off: (<g fill="none" stroke={cc} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M7.4 19a4.4 4.4 0 0 1-.4-8.78 5.5 5.5 0 0 1 10.45-1.1A4 4 0 0 1 17 19z"/><line x1="4" y1="4.5" x2="20" y2="19.5"/></g>),
  sync: (<g fill={cc}><path d="M12 5V2.5L8 6l4 3.5V7a5 5 0 0 1 4.6 7l1.5 1.1A7 7 0 0 0 12 5z"/><path d="M12 19v2.5L16 18l-4-3.5V17a5 5 0 0 1-4.6-7L5.9 8.9A7 7 0 0 0 12 19z"/></g>),
  lan: (<g><g fill={cc}><rect x="9" y="3" width="6" height="4.4" rx="1"/><rect x="2.5" y="16.6" width="6" height="4.4" rx="1"/><rect x="15.5" y="16.6" width="6" height="4.4" rx="1"/></g><g fill="none" stroke={cc} strokeWidth="1.8"><path d="M12 7.4v4.2M5.5 16.6v-2.4h13v2.4M12 11.6v2.6"/></g></g>),
  lightbulb: (<g fill={cc}><path d="M12 2.6a6.2 6.2 0 0 0-4 10.9c.7.6 1 1.1 1.1 2.1l.1.9h5.6l.1-.9c.1-1 .4-1.5 1.1-2.1A6.2 6.2 0 0 0 12 2.6z"/><rect x="9.2" y="17.6" width="5.6" height="1.9" rx=".95"/><rect x="10.2" y="20.4" width="3.6" height="1.7" rx=".85"/></g>),
  mode_fan: (<g fill={cc}><ellipse cx="12" cy="6.6" rx="2.3" ry="4.4"/><ellipse cx="12" cy="6.6" rx="2.3" ry="4.4" transform="rotate(120 12 12)"/><ellipse cx="12" cy="6.6" rx="2.3" ry="4.4" transform="rotate(240 12 12)"/><circle cx="12" cy="12" r="1.9"/></g>),
  local_fire_department: (<path fill={cc} d="M13.2 2c.6 3.8-3 5-3 8.2a2.6 2.6 0 0 0 5.05.8C16.7 12.4 18 14.4 18 16.4a6 6 0 0 1-12 0C6 9.7 10.6 7.2 13.2 2z"/>),
  water_drop: (<path fill={cc} d="M12 3.2c4.2 5.2 6.2 8.3 6.2 11.2a6.2 6.2 0 0 1-12.4 0c0-2.9 2-6 6.2-11.2z"/>),
  grass: (<g fill={cc}><path d="M3 20.5c3.2-.6 4.6-3.6 4.6-7.2-2.2 1.8-4.2 4-4.6 7.2z"/><path d="M12.4 20.5c-.2-4.3 1.2-8.4 4.6-10.6-1.6 3.6-1.8 6.8-1.4 10.6z"/><path d="M12 20.5c0-3.2-1.2-6.2-3.8-8.2 1.5 2.8 2.4 5.2 2.4 8.2z"/></g>),
  thermostat: (<g><rect x="10" y="3" width="4" height="11.2" rx="2" fill="none" stroke={cc} strokeWidth="1.9"/><circle cx="12" cy="17.2" r="3.6" fill={cc}/><rect x="11" y="8.5" width="2" height="8" rx="1" fill={cc}/></g>),
  potted_plant: (<g fill={cc}><path d="M12.4 12c-.2-4 1.8-7.2 6-8.4-.8 4.2-2.2 7.4-6 8.4z"/><path d="M11.6 12c0-3.2-2-6-6-7 .8 4 2.2 6 6 7z"/><path d="M6.6 13.4h10.8l-1.05 5.9a1.4 1.4 0 0 1-1.38 1.16H9.03a1.4 1.4 0 0 1-1.38-1.16z"/></g>),
  eco: (<path fill={cc} d="M19 4c-8 0-13 3.8-13 9.6 0 1.7.6 3.3 1.7 4.6C9.4 13 13 9.6 18 8.2c-4.3 2.3-7.3 5.6-8.6 10.4 1 .3 2 .4 3 .4 7 0 9-6.4 9-15z"/>),
  filter_vintage: (<g fill={cc}>{[0,60,120,180,240,300].map(a=>(<ellipse key={a} cx="12" cy="6.4" rx="2.1" ry="3.7" transform={`rotate(${a} 12 12)`}/>))}<circle cx="12" cy="12" r="2.4" fill="#202020"/><circle cx="12" cy="12" r="1.5"/></g>),
  water_pump: (<g fill={cc}><path d="M5 21V9l4-2v3h6V6l4 2v13z" opacity=".0"/><rect x="5" y="10" width="14" height="11" rx="1.4"/><path d="M9 10V6.5l4-1.5v2.2" fill="none" stroke={cc} strokeWidth="1.8" strokeLinejoin="round"/><circle cx="12" cy="15.5" r="2.6" fill="#202020"/></g>),
};

function renderIcon(name) { return ICONS[name] || ICONS.info; }
window.renderIcon = renderIcon;
window.ICONS = ICONS;
