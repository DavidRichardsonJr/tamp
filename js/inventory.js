// =====================
// INVENTORY
// =====================
let filteredMarkers = [...MARKERS];
function filterInventory() {
  const q = document.getElementById('inv-search').value.toLowerCase();
  const c = document.getElementById('inv-filter-cond').value;
  const a = document.getElementById('inv-filter-action').value;
  const s = document.getElementById('inv-filter-status').value;
  filteredMarkers = getActiveMarkers().filter(m => {
    if (q && !m.id.toLowerCase().includes(q) && !m.notes.toLowerCase().includes(q)) return false;
    if (c && m.conditionStatus !== c) return false;
    if (a && m.action !== a) return false;
    if (s && m.completionStatus !== s) return false;
    return true;
  });
  renderInventoryTable();
}
function renderInventory() { filteredMarkers = [...getActiveMarkers()]; renderInventoryTable(); }
function renderInventoryTable() {
  document.getElementById('inv-tbody').innerHTML = filteredMarkers.map(m => {
    const photoHtml = m.urlBefore
      ? `<a href="${m.urlBefore}" target="_blank" style="font-size:0.75rem;color:var(--primary);">📷 View</a>`
      : '<span style="color:#ccc;font-size:0.75rem;">—</span>';
    return `<tr>
      <td onclick="openModal('${m.id}')" style="cursor:pointer;"><span class="marker-id">${m.id}</span></td>
      <td style="font-size:0.78rem;" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.markerType}</td>
      <td onclick="openModal('${m.id}')" style="cursor:pointer;">${condBadge(m.conditionStatus)}</td>
      <td style="font-size:0.78rem;" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.paintLabel}</td>
      <td style="text-align:center;font-weight:600;color:${scoreColor(m.structuralScore)}" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.structuralScore}</td>
      <td style="text-align:center;font-weight:600;color:${scoreColor(m.paintScore)}" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.paintScore}</td>
      <td style="text-align:center;font-weight:600;color:${scoreColor(m.visibilityScore)}" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.visibilityScore}</td>
      <td style="text-align:center;font-weight:700;color:${scoreColor(m.overall)}" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.overall}</td>
      <td style="font-size:0.78rem;" onclick="openModal('${m.id}')" style="cursor:pointer;">${m.action}</td>
      <td onclick="openModal('${m.id}')" style="cursor:pointer;">${statusBadge(m.completionStatus)}</td>
      <td>${photoHtml}</td>
      <td><button onclick="deleteMarker('${m.id}',this)" style="border:none;background:none;color:#ccc;cursor:pointer;font-size:1rem;padding:2px 6px;" title="Delete marker">🗑</button></td>
    </tr>`;
  }).join('');
  document.getElementById('inv-count').textContent = `Showing ${filteredMarkers.length} of ${getActiveMarkers().length} markers`;
}

// =====================
// GIS MAP

// =====================
// ADD / DELETE MARKER
// =====================
function showAddMarkerModal() {
  const trail = getActiveTrail();
  const trailMarkers = MARKERS.filter(m => m.trailId === activeTrailId);
  const nums = trailMarkers.map(m => parseInt(m.id.replace(/[^\d]/g,''))||0);
  const nextNum = (nums.length ? Math.max(...nums) : 0) + 1;
  document.getElementById('am-id').value = trail.code + '-' + String(nextNum).padStart(3,'0');
  document.getElementById('am-lat').value = '';
  document.getElementById('am-lng').value = '';
  document.getElementById('am-notes').value = '';
  document.getElementById('am-photo').value = '';
  document.getElementById('am-error').textContent = '';
  document.getElementById('am-action').value = 'Paint';
  document.getElementById('am-existing').value = 'Existing';
  document.getElementById('am-type').value = 'Wood Post';
  document.getElementById('add-marker-overlay').style.display = 'flex';
}
function closeAddMarkerModal() {
  document.getElementById('add-marker-overlay').style.display = 'none';
}
function submitAddMarker() {
  const id = document.getElementById('am-id').value.trim();
  if (!id) { document.getElementById('am-error').textContent = 'Marker ID is required.'; return; }
  if (MARKERS.find(m => m.id === id)) { document.getElementById('am-error').textContent = 'Marker ID "' + id + '" already exists.'; return; }
  const trail = getActiveTrail();
  const lat = parseFloat(document.getElementById('am-lat').value) || 0;
  const lng = parseFloat(document.getElementById('am-lng').value) || 0;
  const newMarker = {
    id, trailId: activeTrailId, siteId: trail.siteId || SITES[0].id,
    lat, lng,
    existingNew: document.getElementById('am-existing').value,
    photoId: '', urlBefore: document.getElementById('am-photo').value.trim(), urlAfter: '',
    structuralScore: 3, paintScore: 3, visibilityScore: 3, overall: 3,
    conditionStatus: 'Fair', paintLabel: 'Faded-Weathered',
    defect: 'None', action: document.getElementById('am-action').value,
    priority: 'Medium', completionStatus: 'Not Started',
    notes: document.getElementById('am-notes').value.trim(),
    markerType: document.getElementById('am-type').value, location: ''
  };
  MARKERS.push(newMarker);
  filteredMarkers = [...getActiveMarkers()];
  saveToStorage();
  renderInventory();
  renderDashboard();
  closeAddMarkerModal();
  showToast('✅ ' + id + ' added to inventory');
}
function deleteMarker(id, btn) {
  if (btn && btn.dataset.confirming !== 'yes') {
    btn.dataset.confirming = 'yes';
    btn.textContent = '❓';
    btn.title = 'Click again to confirm delete';
    btn.style.color = '#c1121f';
    setTimeout(() => {
      if (btn.dataset.confirming === 'yes') {
        btn.dataset.confirming = '';
        btn.textContent = '🗑';
        btn.style.color = '#ccc';
        btn.title = 'Delete marker';
      }
    }, 3000);
    return;
  }
  const idx = MARKERS.findIndex(m => m.id === id);
  if (idx === -1) return;
  MARKERS.splice(idx, 1);
  filteredMarkers = filteredMarkers.filter(m => m.id !== id);
  saveToStorage();
  renderInventory();
  renderDashboard();
  showToast('🗑 ' + id + ' deleted');
}

