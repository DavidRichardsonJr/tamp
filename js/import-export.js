// =====================
// CSV EXPORT
// =====================
function exportCSV() {
  const headers = ['Marker ID','Trail','Lat','Lng','Existing/New','Structural','Paint Sc','Visibility','Overall','Condition','Paint Label','Action','Priority','Status','Defect','Notes'];
  const rows = filteredMarkers.map(m=>[
    m.id, m.trailId, m.lat, m.lng, m.existingNew,
    m.structuralScore, m.paintScore, m.visibilityScore, m.overall,
    m.conditionStatus, m.paintLabel, m.action, m.priority, m.completionStatus,
    m.defect, '"'+(m.notes||'').replace(/"/g,"''")+'"'
  ]);
  const csv = [headers.join(','), ...rows.map(r=>r.join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'TAMF_Torres_Trail.csv'; a.click();
}

// =====================
// JSON EXPORT / IMPORT
// =====================
function exportJSON() {
  const data = { exportedAt: new Date().toISOString(), trail: 'TOR', markers: MARKERS };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'TAMF_Torres_Trail_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
}

function importJSON(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      const incoming = Array.isArray(data) ? data : (data.markers || []);
      if (!incoming.length) { alert('No marker data found in file.'); return; }
      let updated = 0;
      incoming.forEach(imp => {
        const idx = MARKERS.findIndex(m => m.id === imp.id);
        if (idx >= 0) {
          // Merge: update every field present in the import, keep existing if not present
          Object.assign(MARKERS[idx], imp);
          updated++;
        }
      });
      filteredMarkers = [...MARKERS];
      renderInventory();
      renderDashboard();
      input.value = '';
      showToast('✅ Imported ' + updated + ' marker' + (updated!==1?'s':'') + ' from JSON');
    } catch(err) {
      alert('Failed to parse JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// =====================
// CSV IMPORT
// =====================
function importCSV(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const lines = e.target.result.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,''));
      // Map CSV headers to marker field names
      const fieldMap = {
        'Marker ID':'id','Trail':'trailId','Lat':'lat','Lng':'lng',
        'Existing/New':'existingNew','Structural':'structuralScore',
        'Paint Sc':'paintScore','Visibility':'visibilityScore','Overall':'overall',
        'Condition':'conditionStatus','Paint Label':'paintLabel','Action':'action',
        'Priority':'priority','Status':'completionStatus','Defect':'defect','Notes':'notes'
      };
      let updated = 0;
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        // Handle quoted commas
        const cols = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || lines[i].split(',');
        const row = {};
        headers.forEach((h, idx) => {
          row[fieldMap[h] || h] = (cols[idx]||'').replace(/^"|"$/g,'').trim();
        });
        if (!row.id) continue;
        const idx = MARKERS.findIndex(m => m.id === row.id);
        if (idx >= 0) {
          // Update numeric fields properly
          ['structuralScore','paintScore','visibilityScore','overall'].forEach(f => {
            if (row[f] !== undefined && row[f] !== '') MARKERS[idx][f] = parseFloat(row[f]);
          });
          // Update text fields
          ['conditionStatus','paintLabel','action','priority','completionStatus','defect','notes','existingNew'].forEach(f => {
            if (row[f] !== undefined && row[f] !== '') MARKERS[idx][f] = row[f];
          });
          updated++;
        }
      }
      filteredMarkers = [...MARKERS];
      renderInventory();
      renderDashboard();
      input.value = '';
      showToast('✅ Imported ' + updated + ' marker' + (updated!==1?'s':'') + ' from CSV');
    } catch(err) {
      alert('Failed to parse CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
}

// =====================
// TRAIL PHOTO CSV IMPORT  (Photo Number, Latitude, Longitude, Image URL)
// Creates new markers for the active trail
// =====================
function importTrailCSV(input) {
  const file = input.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const lines = e.target.result.trim().split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g,'').toLowerCase());
      const idxNum = headers.findIndex(h => h.includes('photo') || h.includes('number') || h === 'id');
      const idxLat = headers.findIndex(h => h.includes('lat'));
      const idxLng = headers.findIndex(h => h.includes('lon') || h.includes('lng'));
      const idxUrl = headers.findIndex(h => h.includes('url') || h.includes('image') || h.includes('photo url'));

      const trail = getActiveTrail();
      const trailCode = trail.code || trail.id;

      // Find existing IDs for this trail to avoid duplicates
      const existingIds = new Set(MARKERS.map(m => m.id));

      let added = 0, skipped = 0;
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g,''));
        const num = idxNum >= 0 ? cols[idxNum] : String(i);
        const lat = idxLat >= 0 ? parseFloat(cols[idxLat]) : null;
        const lng = idxLng >= 0 ? parseFloat(cols[idxLng]) : null;
        const url = idxUrl >= 0 ? cols[idxUrl] : '';
        if (!num || (!lat && !url)) { skipped++; continue; }

        // Generate marker ID: e.g. PLT-001
        const padded = String(num).padStart(3, '0');
        const markerId = trailCode + '-' + padded;

        if (existingIds.has(markerId)) {
          // Update existing marker's GPS + photo URL
          const m = MARKERS.find(x => x.id === markerId);
          if (lat) m.lat = lat;
          if (lng) m.lng = lng;
          if (url) m.urlBefore = url;
          skipped++;
        } else {
          // Create new marker with defaults
          MARKERS.push({
            id: markerId,
            trailId: trail.id,
            markerType: 'Wood Post',
            lat: lat || 0,
            lng: lng || 0,
            existingNew: 'New',
            structuralScore: 3,
            paintScore: 3,
            visibilityScore: 3,
            overall: 3,
            conditionStatus: 'Fair',
            paintLabel: 'Good',
            action: 'Paint',
            priority: 'Routine',
            completionStatus: 'Pending',
            defect: '',
            notes: '',
            urlBefore: url || '',
            urlAfter: ''
          });
          existingIds.add(markerId);
          added++;
        }
      }

      filteredMarkers = [...MARKERS];
      renderInventory();
      renderDashboard();
      input.value = '';
      showToast('✅ ' + added + ' new markers added, ' + skipped + ' updated/skipped for ' + trail.name);
    } catch(err) {
      alert('Failed to parse Trail CSV: ' + err.message);
    }
  };
  reader.readAsText(file);
}

