// =====================
// PRIORITY MATRIX
// =====================
function renderPriority() {
  const sorted = [...getActiveMarkers()].sort((a,b)=>a.overall-b.overall);
  // Group by overall score
  const byScore = {};
  sorted.forEach(m=>{ (byScore[m.overall]=byScore[m.overall]||[]).push(m); });
  const colors = {1:'#ffe0e0',2:'#fde8e0',3:'#fff3cd',4:'#d8f3dc',5:'#b7e4c7'};
  document.getElementById('priority-matrix-content').innerHTML = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;">
      ${[1,2,3,4,5].map(score=>{
        const group = byScore[score]||[];
        return `<div style="flex:1;min-width:140px;background:${colors[score]};border-radius:8px;padding:12px;">
          <div style="font-weight:700;font-size:0.9rem;margin-bottom:6px;">Score ${score} <span style="font-weight:400;font-size:0.78rem;">(${group.length})</span></div>
          ${group.slice(0,8).map(m=>`<div style="font-size:0.75rem;font-family:monospace;padding:2px 0;">${m.id}</div>`).join('')}
          ${group.length>8?`<div style="font-size:0.72rem;color:#666;">+${group.length-8} more</div>`:''}
        </div>`;
      }).join('')}
    </div>`;

  document.getElementById('priority-full-tbody').innerHTML = sorted.map((m,i)=>`
    <tr onclick="openModal('${m.id}')" style="cursor:pointer;">
      <td style="color:var(--text-muted);font-size:0.78rem;">${i+1}</td>
      <td><span class="marker-id">${m.id}</span></td>
      <td style="font-weight:700;color:${scoreColor(m.overall)}">${m.overall}</td>
      <td>${condBadge(m.conditionStatus)}</td>
      <td style="font-size:0.82rem;">${m.action}</td>
      <td>${statusBadge(m.completionStatus)}</td>
    </tr>`).join('');
}

