// =====================
// =====================
// LOCALSTORAGE PERSISTENCE
// =====================
const STORAGE_KEY = 'TAMP_v4_data';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      MARKERS,
      SITES,
      TRAILS,
      activeTrailId,
      ANNUAL_PHASES,
      SUPPLY_ITEMS
    }));
  } catch(e) { /* storage full or unavailable */ }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (data.MARKERS  && Array.isArray(data.MARKERS))  { MARKERS.length = 0;  MARKERS.push(...data.MARKERS); }
    if (data.SITES    && Array.isArray(data.SITES))    { SITES.length = 0;    SITES.push(...data.SITES); }
    if (data.TRAILS   && Array.isArray(data.TRAILS))   { TRAILS.length = 0;   TRAILS.push(...data.TRAILS); }
    if (data.ANNUAL_PHASES && Array.isArray(data.ANNUAL_PHASES)) { ANNUAL_PHASES.length = 0; ANNUAL_PHASES.push(...data.ANNUAL_PHASES); }
    if (data.SUPPLY_ITEMS  && Array.isArray(data.SUPPLY_ITEMS))  { SUPPLY_ITEMS.length = 0;  SUPPLY_ITEMS.push(...data.SUPPLY_ITEMS); }
    if (data.activeTrailId) activeTrailId = data.activeTrailId;
    return true;
  } catch(e) { return false; }
}

function clearStorage() {
  if (!confirm('Reset all data to factory defaults? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

// Patch all mutating functions to auto-save after any change
const _patchSave = (fn) => function() { const r = fn.apply(this, arguments); saveToStorage(); return r; };
['saveModalEdit','toggleWoComplete','removePhaseTask','submitAddSite','submitAddTrail','removeTrail',
 'updateSiteField','updateTrailField','updateField','updateScore','submitInspectionForm',
 'importCSV','importJSON','importTrailCSV'].forEach(name => {
  if (typeof window[name] === 'function') window[name] = _patchSave(window[name]);
});

// Also save after renderSites (catches inline field edits via onchange)
const _origRenderSites = renderSites;
renderSites = function() { _origRenderSites(); };

// Intercept onchange edits that call updateField / updateSiteField directly
// by auto-saving after any inventory or sites render
const _origRenderInventory = renderInventory;
renderInventory = function() { _origRenderInventory.apply(this, arguments); };

// =====================
// INIT
// =====================
loadFromStorage();
filteredMarkers = [...MARKERS];
updateTrailBadge();
renderDashboard();
</script>
