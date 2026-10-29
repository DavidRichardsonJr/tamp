// =====================
// WORK ORDERS
// =====================
function renderWorkOrders() {
  const groups = {};
  getActiveMarkers().forEach(m => {
    if (!groups[m.action]) groups[m.action] = [];
    groups[m.action].push(m);
  });

  const order = ['Paint', 'Replace', 'Install New', 'No Action'];
  const actionColors = { 'Paint': '#f77f00', 'Replace': '#c1121f', 'Install New': '#3a86ff', 'No Action': '#2d6a4f' };

  let total = 0, done = 0;
  const woMs = getActiveMarkers();
  woMs.forEach(m => { total++; if (m.completionStatus === 'Completed') done++; });
  document.getElementById('wo-summary').textContent = `${done}/${total} completed`;

  const container = document.getElementById('wo-groups');
  container.innerHTML = order.filter(a => groups[a]).map(action => {
    const items = groups[action];
    return `<div class="wo-group">
      <div class="wo-group-title" style="background:${actionColors[action]||'#555'}">
        ${action} — ${items.length} marker${items.length>1?'s':''}
      </div>
      ${items.map(m=>`<div class="wo-item" style="${m.completionStatus==='Completed'?'background:#f0faf0;':''}">
        <span class="wo-id" style="cursor:pointer;text-decoration:underline;color:var(--primary);" onclick="openModal('${m.id}')">${m.id}</span>
        <span>${condBadge(m.conditionStatus)}</span>
        <span class="wo-notes">${m.notes||'—'}</span>
        ${statusBadge(m.completionStatus)}
        <button onclick="toggleWoComplete('${m.id}')" style="margin-left:auto;padding:3px 10px;border:1px solid ${m.completionStatus==='Completed'?'#999':'var(--primary)'};background:${m.completionStatus==='Completed'?'#f5f5f5':'var(--primary)'};color:${m.completionStatus==='Completed'?'#666':'#fff'};border-radius:5px;cursor:pointer;font-size:0.75rem;white-space:nowrap;">
          ${m.completionStatus==='Completed'?'↩ Undo':'✅ Complete'}
        </button>
      </div>`).join('')}
    </div>`;
  }).join('');
}
function removePhaseTask(pi, ti, btn) {
  if (!ANNUAL_PHASES || !ANNUAL_PHASES[pi]) return;
  if (btn && btn.dataset.confirming !== 'yes') {
    btn.dataset.confirming = 'yes';
    btn.textContent = 'Sure?';
    btn.style.color = '#e63946';
    btn.style.fontWeight = '600';
    setTimeout(() => {
      if (btn.dataset.confirming === 'yes') {
        btn.dataset.confirming = '';
        btn.textContent = '✕';
        btn.style.color = '#ccc';
        btn.style.fontWeight = '';
      }
    }, 3000);
    return;
  }
  ANNUAL_PHASES[pi].tasks.splice(ti, 1);
  renderAnnualPlan();
}
function toggleWoComplete(id) {
  const m = MARKERS.find(x=>x.id===id);
  if (!m) return;
  m.completionStatus = m.completionStatus === 'Completed' ? 'Pending' : 'Completed';
  renderWorkOrders();
  renderDashboard();
  showToast(id + ' marked ' + m.completionStatus);
}

