// =====================
// MODAL
// =====================
function openModal(id) {
  const m = MARKERS.find(x=>x.id===id);
  if (!m) return;
  document.getElementById('modal-title').textContent = m.id + ' — ' + m.markerType;
  const inpS = 'width:100%;padding:5px 8px;border:1px solid var(--border);border-radius:5px;font-size:0.82rem;box-sizing:border-box;';
  const lblS = 'font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:2px;';
  const condOpts = ['Good','Fair','Critical'].map(o=>`<option${m.conditionStatus===o?' selected':''}>${o}</option>`).join('');
  const paintOpts = ['Excellent','Good','Faded / Weathered','Peeled / Obscured','Missing'].map(o=>`<option${m.paintLabel===o?' selected':''}>${o}</option>`).join('');
  const actionOpts = ['Paint','Replace','Install New','No Action'].map(o=>`<option${m.action===o?' selected':''}>${o}</option>`).join('');
  const priorityOpts = ['Low','Routine','Seasonal','Immediate'].map(o=>`<option${m.priority===o?' selected':''}>${o}</option>`).join('');
  const statusOpts = ['Pending','In Progress','Completed'].map(o=>`<option${m.completionStatus===o?' selected':''}>${o}</option>`).join('');
  const existOpts = ['Existing','New'].map(o=>`<option${m.existingNew===o?' selected':''}>${o}</option>`).join('');
  document.getElementById('modal-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
      <div><label style="${lblS}">Condition</label>
        <select id="me-cond" style="${inpS}">${condOpts}</select></div>
      <div><label style="${lblS}">Paint Label</label>
        <select id="me-paint" style="${inpS}">${paintOpts}</select></div>
      <div><label style="${lblS}">Status</label>
        <select id="me-status" style="${inpS}">${statusOpts}</select></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
      <div><label style="${lblS}">Structural (1-5)</label>
        <input id="me-struct" type="number" min="1" max="5" value="${m.structuralScore}" style="${inpS}"></div>
      <div><label style="${lblS}">Paint (1-5)</label>
        <input id="me-paintscore" type="number" min="1" max="5" value="${m.paintScore}" style="${inpS}"></div>
      <div><label style="${lblS}">Visibility (1-5)</label>
        <input id="me-vis" type="number" min="1" max="5" value="${m.visibilityScore}" style="${inpS}"></div>
      <div><label style="${lblS}">Overall</label>
        <input id="me-overall" type="number" min="1" max="5" step="0.1" value="${m.overall}" style="${inpS}"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;">
      <div><label style="${lblS}">Action</label>
        <select id="me-action" style="${inpS}">${actionOpts}</select></div>
      <div><label style="${lblS}">Priority</label>
        <select id="me-priority" style="${inpS}">${priorityOpts}</select></div>
      <div><label style="${lblS}">Existing / New</label>
        <select id="me-exist" style="${inpS}">${existOpts}</select></div>
    </div>
    <div style="margin-bottom:10px;">
      <label style="${lblS}">Defect</label>
      <input id="me-defect" type="text" value="${m.defect||''}" style="${inpS}" placeholder="e.g. Weathering, Structural crack">
    </div>
    <div style="margin-bottom:10px;">
      <label style="${lblS}">Notes</label>
      <textarea id="me-notes" rows="2" style="${inpS}resize:vertical;">${m.notes||''}</textarea>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
      <div><label style="${lblS}">Before Photo URL</label>
        <input id="me-urlbefore" type="text" value="${m.urlBefore||''}" style="${inpS}" placeholder="https://...">
        ${m.urlBefore?`<a href="${m.urlBefore}" target="_blank" style="font-size:0.72rem;color:var(--primary);">📷 View</a>`:''}
      </div>
      <div><label style="${lblS}">After Photo URL</label>
        <input id="me-urlafter" type="text" value="${m.urlAfter||''}" style="${inpS}" placeholder="https://...">
        ${m.urlAfter?`<a href="${m.urlAfter}" target="_blank" style="font-size:0.72rem;color:var(--primary);">📷 View</a>`:''}
      </div>
    </div>
    <div style="font-family:monospace;font-size:0.72rem;color:var(--text-muted);margin-bottom:12px;">
      GPS: ${m.lat?.toFixed(7)}, ${m.lng?.toFixed(7)}
    </div>
    <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:12px;">
      <button onclick="closeModal()" style="padding:6px 14px;border:1px solid var(--border);background:#fff;border-radius:6px;cursor:pointer;font-size:0.85rem;">Cancel</button>
      <button onclick="saveModalEdit('${m.id}')" style="padding:6px 14px;border:none;background:var(--primary);color:#fff;border-radius:6px;cursor:pointer;font-size:0.85rem;font-weight:600;">💾 Save Changes</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}
function saveModalEdit(id) {
  const m = MARKERS.find(x=>x.id===id);
  if (!m) return;
  m.conditionStatus  = document.getElementById('me-cond').value;
  m.paintLabel       = document.getElementById('me-paint').value;
  m.completionStatus = document.getElementById('me-status').value;
  m.structuralScore  = +document.getElementById('me-struct').value || m.structuralScore;
  m.paintScore       = +document.getElementById('me-paintscore').value || m.paintScore;
  m.visibilityScore  = +document.getElementById('me-vis').value || m.visibilityScore;
  m.overall          = +document.getElementById('me-overall').value || m.overall;
  m.action           = document.getElementById('me-action').value;
  m.priority         = document.getElementById('me-priority').value;
  m.existingNew      = document.getElementById('me-exist').value;
  m.defect           = document.getElementById('me-defect').value;
  m.notes            = document.getElementById('me-notes').value;
  m.urlBefore        = document.getElementById('me-urlbefore').value;
  m.urlAfter         = document.getElementById('me-urlafter').value;
  closeModal();
  // Refresh whichever page is active
  const activePage = document.querySelector('.page.active');
  const pageId = activePage ? activePage.id.replace('page-','') : 'dashboard';
  showPage(pageId);
  showToast('Saved ' + id);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

