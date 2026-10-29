// =====================
// DASHBOARD
// =====================
function renderDashboard() {
  const ms = getActiveMarkers();
  const total = ms.length;
  const byCondition = {};
  const byAction = {};
  const byStatus = {};
  ms.forEach(m => {
    byCondition[m.conditionStatus] = (byCondition[m.conditionStatus]||0)+1;
    byAction[m.action] = (byAction[m.action]||0)+1;
    byStatus[m.completionStatus] = (byStatus[m.completionStatus]||0)+1;
  });

  const avgOverall = total>0 ? (ms.reduce((s,m)=>s+m.overall,0)/total).toFixed(1) : '0';
  const completed = byStatus['Completed']||0;

  const grid = document.getElementById('stat-grid');
  grid.innerHTML = `
    <div class="card"><div class="card-title">Total Markers</div><div class="card-value">${total}</div></div>
    <div class="card"><div class="card-title">Avg Overall Score</div><div class="card-value" style="color:${scoreColor(+avgOverall)}">${avgOverall}</div></div>
    <div class="card"><div class="card-title">Good Condition</div><div class="card-value" style="color:var(--good)">${byCondition['Good']||0}</div></div>
    <div class="card"><div class="card-title">Completed</div><div class="card-value" style="color:var(--completed)">${completed}</div></div>
    <div class="card"><div class="card-title">Paint Work</div><div class="card-value" style="color:var(--accent)">${byAction['Paint']||0}</div></div>
    <div class="card"><div class="card-title">New Installs</div><div class="card-value" style="color:var(--new)">${byAction['Install New']||0}</div></div>
  `;

  // Progress ring
  const pct = total>0 ? Math.round(completed/total*100) : 0;
  document.getElementById('prog-pct').textContent = pct+'%';
  const cvs = document.getElementById('prog-canvas');
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0,0,90,90);
  ctx.beginPath(); ctx.arc(45,45,35,0,Math.PI*2);
  ctx.strokeStyle='#e9ecef'; ctx.lineWidth=8; ctx.stroke();
  ctx.beginPath(); ctx.arc(45,45,35,-Math.PI/2,-Math.PI/2+Math.PI*2*(pct/100));
  ctx.strokeStyle='#2d6a4f'; ctx.lineWidth=8; ctx.lineCap='round'; ctx.stroke();

  document.getElementById('completion-breakdown').innerHTML = Object.entries(byStatus).map(([k,v])=>
    `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:0.82rem;border-bottom:1px solid #f0f0f0;">
      <span>${k}</span><strong>${v}</strong></div>`
  ).join('');

  document.getElementById('action-summary').innerHTML = Object.entries(byAction).map(([k,v])=>{
    const pct2 = Math.round(v/total*100);
    const color = k==='Install New'?'#3a86ff':k==='Paint'?'#f77f00':k==='Replace'?'#c1121f':'#2d6a4f';
    return `<div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:3px;"><span>${k}</span><span style="font-weight:600;">${v}</span></div>
      <div style="height:6px;background:#e9ecef;border-radius:3px;"><div style="height:6px;width:${pct2}%;background:${color};border-radius:3px;"></div></div>
    </div>`;
  }).join('');

  // Priority table — show all markers sorted by overall asc
  const sorted = [...ms].sort((a,b)=>a.overall-b.overall).slice(0,15);
  document.querySelector('#priority-table tbody').innerHTML = sorted.map(m=>
    `<tr onclick="openModal('${m.id}')" style="cursor:pointer;">
      <td><span class="marker-id">${m.id}</span></td>
      <td>${condBadge(m.conditionStatus)}</td>
      <td>${m.action}</td>
      <td>${statusBadge(m.completionStatus)}</td>
      <td style="font-weight:700;color:${scoreColor(m.overall)}">${m.overall}</td>
    </tr>`
  ).join('');
}

// =====================
// INVENTORY
