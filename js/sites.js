// =====================
// SITES & TRAILS
// =====================
function renderSites() {
  const inpStyle = 'width:100%;padding:6px 9px;border:1px solid var(--border);border-radius:5px;font-size:0.85rem;box-sizing:border-box;';
  const lblStyle = 'font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:2px;';
  const secLbl = 'font-size:0.72rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin:14px 0 8px;border-top:1px solid var(--border);padding-top:10px;';

  document.getElementById('sites-list').innerHTML = SITES.map((s, si) => {
    const trailsForSite = TRAILS.filter(t => t.siteId === s.id);
    return `<div class="card" style="margin-bottom:16px;">
      <!-- Site editable fields -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px;">
        <div><label style="${lblStyle}">Site name</label>
          <input style="${inpStyle}" value="${s.name}" onchange="updateSiteField(${si},'name',this.value)">
        </div>
        <div><label style="${lblStyle}">Location</label>
          <input style="${inpStyle}" value="${s.county ? s.county+' County, '+s.state : (s.location||'')}" onchange="updateSiteField(${si},'location',this.value)">
        </div>
      </div>

      <!-- Operational Summary -->
      <div style="${secLbl}">📊 Operational Summary — manual fields</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 2fr;gap:10px;margin-bottom:4px;">
        <div><label style="${lblStyle}">Volunteers coordinated</label>
          <input type="number" min="0" style="${inpStyle}" value="${s.opsVolunteers||''}" placeholder="e.g. 15" onchange="updateSiteField(${si},'opsVolunteers',+this.value||0)">
        </div>
        <div><label style="${lblStyle}">Reports generated</label>
          <input type="number" min="0" style="${inpStyle}" value="${s.opsReports||''}" placeholder="e.g. 2" onchange="updateSiteField(${si},'opsReports',+this.value||0)">
        </div>
        <div><label style="${lblStyle}">Expansion status</label>
          <input style="${inpStyle}" value="${s.opsExpansion||''}" placeholder="e.g. Approved · Trail 2 pending" onchange="updateSiteField(${si},'opsExpansion',this.value)">
        </div>
      </div>

      <!-- Trails for this site -->
      <div style="${secLbl}">Trails</div>
      ${trailsForSite.map((t, ti) => {
        const count = MARKERS.filter(m=>m.trailId===t.id).length;
        const trailIdx = TRAILS.indexOf(t);
        return `<div style="border:1px solid var(--border);border-radius:7px;padding:10px;margin-bottom:8px;">
          <div style="display:grid;grid-template-columns:100px 1fr;gap:10px;margin-bottom:8px;">
            <div><label style="${lblStyle}">Code</label>
              <input style="${inpStyle}" value="${t.id}" maxlength="4" style="text-transform:uppercase" onchange="updateTrailField(${trailIdx},'id',this.value.toUpperCase())">
            </div>
            <div><label style="${lblStyle}">Trail name</label>
              <input style="${inpStyle}" value="${t.name}" onchange="updateTrailField(${trailIdx},'name',this.value)">
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 80px;gap:10px;margin-bottom:8px;">
            <div><label style="${lblStyle}">Marker color / type</label>
              <input style="${inpStyle}" value="${t.color||''}" onchange="updateTrailField(${trailIdx},'color',this.value)">
            </div>
            <div><label style="${lblStyle}">Status</label>
              <select style="${inpStyle}" onchange="updateTrailField(${trailIdx},'status',this.value)">
                ${['Active — surveyed & in progress','Planned — not yet surveyed','Complete','On hold'].map(opt=>`<option${(t.status||''===opt)?' selected':''}>${opt}</option>`).join('')}
              </select>
            </div>
            <div><label style="${lblStyle}">Markers</label>
              <input style="${inpStyle}background:#f8f9fa;" value="${count}" readonly>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${t.id === activeTrailId
              ? '<span style="font-size:0.72rem;color:var(--primary);font-weight:600;">★ Active trail</span>'
              : `<button onclick="setActiveTrail('${t.id}');showPage('dashboard')" style="font-size:0.78rem;padding:4px 10px;border:1px solid var(--primary);background:var(--primary);color:#fff;border-radius:5px;cursor:pointer;">⇄ Switch to this trail</button>`}
            ${t.id !== activeTrailId ? `<button onclick="removeTrail('${t.id}')" style="font-size:0.78rem;padding:4px 10px;border:1px solid #e57373;background:#fff;color:#c0392b;border-radius:5px;cursor:pointer;">🗑 Remove</button>` : ''}
          </div>
        </div>`;
      }).join('')}
      <button onclick="openAddTrailModal('${s.id}')" style="font-size:0.78rem;padding:5px 12px;border:1px solid var(--border);background:#fff;border-radius:5px;cursor:pointer;margin-top:4px;">+ Add Trail to this Site</button>
    </div>`;
  }).join('');
}

function updateSiteField(siteIdx, field, value) {
  if (!SITES[siteIdx]) return;
  SITES[siteIdx][field] = value;
  saveToStorage();
  renderSummary();
}

function updateTrailField(trailIdx, field, value) {
  if (!TRAILS[trailIdx]) return;
  TRAILS[trailIdx][field] = value;
  saveToStorage();
}

function openAddSiteModal() {
  document.getElementById('modal-site-name').value = '';
  document.getElementById('modal-site-location').value = '';
  document.getElementById('modal-site-trail-code').value = '';
  document.getElementById('modal-site-trail-name').value = '';
  document.getElementById('modal-add-site').style.display = 'flex';
}
function closeAddSiteModal() {
  document.getElementById('modal-add-site').style.display = 'none';
}
function submitAddSite() {
  const name = document.getElementById('modal-site-name').value.trim();
  if (!name) { alert('Site name is required.'); return; }
  const location = document.getElementById('modal-site-location').value.trim();
  const trailCode = (document.getElementById('modal-site-trail-code').value.trim().toUpperCase().slice(0,4)) || 'NEW';
  const trailName = document.getElementById('modal-site-trail-name').value.trim() || trailCode;
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,20) + '-' + Date.now().toString(36).slice(-4);
  SITES.push({ id, name, location, opsVolunteers:0, opsReports:0, opsExpansion:'' });
  TRAILS.push({ id: trailCode, siteId: id, name: trailName, color: '', shape: '', status: 'Planned — not yet surveyed' });
  closeAddSiteModal();
  renderSites();
  showToast('Site "' + name + '" added');
}

function openAddTrailModal(siteId) {
  document.getElementById('modal-trail-site-id').value = siteId;
  document.getElementById('modal-trail-code').value = '';
  document.getElementById('modal-trail-name').value = '';
  document.getElementById('modal-add-trail').style.display = 'flex';
}
function closeAddTrailModal() {
  document.getElementById('modal-add-trail').style.display = 'none';
}
function submitAddTrail() {
  const siteId = document.getElementById('modal-trail-site-id').value;
  const code = document.getElementById('modal-trail-code').value.trim().toUpperCase().slice(0,4);
  if (!code) { alert('Trail code is required.'); return; }
  if (TRAILS.find(t=>t.id===code && t.siteId===siteId)) { alert('Trail code already exists in this site.'); return; }
  const name = document.getElementById('modal-trail-name').value.trim() || code;
  TRAILS.push({ id: code, siteId, name, color: '', shape: '', status: 'Planned — not yet surveyed' });
  closeAddTrailModal();
  renderSites();
  showToast('Trail "' + name + '" added');
}
function removeTrail(trailId) {
  const trail = TRAILS.find(t => t.id === trailId);
  if (!trail) return;
  if (!confirm('Remove trail "' + trail.name + '"? This cannot be undone.')) return;
  const idx = TRAILS.indexOf(trail);
  TRAILS.splice(idx, 1);
  renderSites();
  renderSummary();
  showToast('Trail "' + trail.name + '" removed');
}

