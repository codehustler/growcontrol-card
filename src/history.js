// 24h history via the HA REST API, downsampled for the hand-rolled SVG charts.
// Attached to window.__GC so App can call it without imports.
function downsample(arr, n) {
  if (arr.length <= n) return arr;
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor((i * (arr.length - 1)) / (n - 1))]);
  return out;
}

async function fetchHistory(hass, ids) {
  if (!hass || !hass.callApi || !ids || !ids.length) return {};
  const start = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const path = `history/period/${start}?filter_entity_id=${ids.join(',')}&minimal_response&no_attributes&significant_changes_only`;
  let data;
  try { data = await hass.callApi('GET', path); } catch (e) { return {}; }
  const out = {};
  (data || []).forEach((series) => {
    if (!series || !series.length || !series[0].entity_id) return;
    const nums = series.map((s) => Number(s.state)).filter((n) => Number.isFinite(n));
    if (nums.length) out[series[0].entity_id] = downsample(nums, 48);
  });
  return out;
}

window.__GC.fetchHistory = fetchHistory;
