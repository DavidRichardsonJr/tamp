// =====================
// REPORT
// =====================
// ALL TRAILS OVERVIEW
// =====================
function renderAllTrails() {
  const container = document.getElementById('alltrails-content');
  if (!container) return;

  // Aggregate totals across ALL trails
  const allMs = MARKERS;
  const totalAll   = allMs.length;
  const complAll   = allMs.filter(m => m.completionStatus === 'Completed' && m.action !== 'No Action').length;
  const actionAll  = allMs.filter(m => m.action !== 'No Action').length;
  const pctAll     = actionAll > 0 ? Math.round(complAll / actionAll * 100) : 0;
  const goodAll    = allMs.filter(m => m.conditionStatus === 'Good').length;
  const critAll    = allMs.filter(m => m.conditionStatus === 'Critical').length;
  const avgAll     = totalAll > 0 ? (allMs.reduce((s,m)=>s+(+m.overall||0),0)/totalAll).toFixed(2) : '—';

  // Per-trail breakdown
  const trailCards = TRAILS.map(t => {
    const ms = MARKERS.filter(m => m.trailId === t.id);
    const tot   = ms.length;
    const comp  = ms.filter(m => m.completionStatus === 'Completed' && m.action !== 'No Action').length;
    const act   = ms.filter(m => m.action !== 'No Action').length;
    const pct   = act > 0 ? Math.round(comp / act * 100) : 0;
    const good  = ms.filter(m => m.conditionStatus === 'Good').length;
    const fair  = ms.filter(m => m.conditionStatus === 'Fair').length;
    const crit  = ms.filter(m => m.conditionStatus === 'Critical').length;
    const avg   = tot > 0 ? (ms.reduce((s,m)=>s+(+m.overall||0),0)/tot).toFixed(2) : '—';
    const site  = SITES.find(s => s.id === t.siteId) || SITES[0];
    const actionGroups = {};
    ms.forEach(m => { actionGroups[m.action] = (actionGroups[m.action]||0)+1; });
    const barW  = pct;
    const barColor = pct === 100 ? '#2d6a4f' : pct >= 50 ? '#3a86ff' : '#f77f00';
    return `
    <div class="card" style="margin-bottom:18px;border-left:4px solid ${barColor};">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
        <div>
          <div style="font-size:1.05rem;font-weight:700;">${t.name} <span style="font-size:0.78rem;color:var(--text-muted);font-weight:400;">(${t.id})</span></div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${site ? site.name : ''} · ${t.color} ${t.shape}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:2rem;font-weight:800;color:${barColor};line-height:1;">${pct}%</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">${comp}/${act} completed</div>
        </div>
      </div>
      <div style="background:#f0f0f0;border-radius:6px;height:8px;margin-bottom:14px;">
        <div style="background:${barColor};width:${barW}%;height:8px;border-radius:6px;transition:width 0.5s;"></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;text-align:center;">
        <div style="background:#f8f9fa;border-radius:8px;padding:10px;">
          <div style="font-size:1.4rem;font-weight:700;">${tot}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Total Markers</div>
        </div>
        <div style="background:#d8f3dc;border-radius:8px;padding:10px;">
          <div style="font-size:1.4rem;font-weight:700;color:#2d6a4f;">${good}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Good</div>
        </div>
        <div style="background:#fff3cd;border-radius:8px;padding:10px;">
          <div style="font-size:1.4rem;font-weight:700;color:#f77f00;">${fair}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Fair</div>
        </div>
        <div style="background:#ffe0e0;border-radius:8px;padding:10px;">
          <div style="font-size:1.4rem;font-weight:700;color:#e63946;">${crit}</div>
          <div style="font-size:0.7rem;color:var(--text-muted);">Critical</div>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px;">
        ${Object.entries(actionGroups).map(([a,n])=>`<span style="font-size:0.75rem;background:#f0f0f0;border-radius:10px;padding:2px 10px;">${a}: <strong>${n}</strong></span>`).join('')}
        <span style="font-size:0.75rem;background:#e8f4fd;border-radius:10px;padding:2px 10px;">Avg Score: <strong>${avg}</strong></span>
      </div>
      <button onclick="setActiveTrail('${t.id}');showPage('summary')" style="font-size:0.78rem;border:1px solid var(--primary);background:transparent;color:var(--primary);border-radius:6px;padding:4px 14px;cursor:pointer;">
        📑 View ${t.name} Summary →
      </button>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg,#1b4332,#2d6a4f);color:#fff;">
      <div style="font-size:0.75rem;opacity:0.7;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Site Overview — All Trails Combined</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;text-align:center;">
        <div>
          <div style="font-size:2.2rem;font-weight:800;">${totalAll}</div>
          <div style="font-size:0.72rem;opacity:0.75;">Total Markers</div>
        </div>
        <div>
          <div style="font-size:2.2rem;font-weight:800;">${TRAILS.length}</div>
          <div style="font-size:0.72rem;opacity:0.75;">Trail Networks</div>
        </div>
        <div>
          <div style="font-size:2.2rem;font-weight:800;">${pctAll}%</div>
          <div style="font-size:0.72rem;opacity:0.75;">Overall Complete</div>
        </div>
        <div>
          <div style="font-size:2.2rem;font-weight:800;">${avgAll}</div>
          <div style="font-size:0.72rem;opacity:0.75;">Avg Score</div>
        </div>
      </div>
      <div style="background:rgba(255,255,255,0.2);border-radius:6px;height:6px;margin-top:14px;">
        <div style="background:#fff;width:${pctAll}%;height:6px;border-radius:6px;transition:width 0.5s;"></div>
      </div>
      <div style="margin-top:6px;font-size:0.72rem;opacity:0.7;text-align:right;">${complAll} of ${actionAll} work orders completed across all trails</div>
    </div>
    ${trailCards}
    ${TRAILS.length === 0 ? '<div class="card" style="text-align:center;color:var(--text-muted);">No trails added yet. Go to Sites &amp; Trails to add one.</div>' : ''}
  `;
}

// =====================
function renderReport() {
  const rptMarkers = getActiveMarkers();
  const html = `
    <div class="card" style="margin-bottom:18px;">
      <h3 style="margin-bottom:8px;">${getActiveTrail().name} (${getActiveTrail().id}) — Inspection Report</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);">Royal Palm Beach Pines Natural Area · Generated ${new Date().toLocaleDateString()}</p>
    </div>
    ${rptMarkers.map(m=>{
      const sel=(f,opts)=>`<select onchange="MARKERS.find(x=>x.id==='${m.id}').${f}=this.value;renderReport();" style="border:1px solid #ddd;border-radius:4px;font-size:0.78rem;padding:2px 4px;background:#fff;">${opts.map(o=>`<option${m[f]===o?' selected':''}>${o}</option>`).join('')}</select>`;
      const numInp=(f,val)=>`<input type="number" min="1" max="5" step="0.1" value="${val}" style="width:52px;border:1px solid #ddd;border-radius:4px;font-size:0.78rem;padding:2px 4px;" onchange="MARKERS.find(x=>x.id==='${m.id}').${f}=+this.value||${val}">`;
    return `
    <div class="card" style="margin-bottom:12px;" id="rpt-${m.id}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <strong style="font-size:1rem;">${m.id}</strong>
          ${sel('conditionStatus',['Good','Fair','Critical'])}
          ${sel('completionStatus',['Pending','In Progress','Completed'])}
        </div>
        <div style="font-size:0.8rem;color:var(--text-muted);">Overall: ${numInp('overall',m.overall)}/5</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:0.78rem;margin-bottom:8px;">
        <div><span style="color:var(--text-muted);">Structural</span><br>${numInp('structuralScore',m.structuralScore)}</div>
        <div><span style="color:var(--text-muted);">Paint</span><br>${numInp('paintScore',m.paintScore)}</div>
        <div><span style="color:var(--text-muted);">Visibility</span><br>${numInp('visibilityScore',m.visibilityScore)}</div>
        <div><span style="color:var(--text-muted);">Paint Label</span><br>${sel('paintLabel',['Excellent','Good','Faded / Weathered','Peeled / Obscured','Missing'])}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.78rem;margin-bottom:8px;">
        <div><span style="color:var(--text-muted);">Action</span><br>${sel('action',['Paint','Replace','Install New','No Action'])}</div>
        <div><span style="color:var(--text-muted);">Priority</span><br>${sel('priority',['Low','Routine','Seasonal','Immediate'])}</div>
        <div><span style="color:var(--text-muted);">GPS</span><br><strong style="font-family:monospace;font-size:0.72rem;">${m.lat?.toFixed(6)}, ${m.lng?.toFixed(6)}</strong></div>
      </div>
      <div style="margin-bottom:6px;">
        <span style="font-size:0.7rem;color:var(--text-muted);">Notes:</span>
        <input value="${m.notes||''}" placeholder="Add notes…" style="width:100%;border:1px solid #ddd;border-radius:4px;font-size:0.78rem;padding:3px 6px;box-sizing:border-box;margin-top:2px;" onchange="MARKERS.find(x=>x.id==='${m.id}').notes=this.value">
      </div>
      ${m.urlBefore?`<a href="${m.urlBefore}" target="_blank" class="btn btn-outline btn-sm">📷 Before Photo</a>`:''}
    </div>`}).join('')}`;
  document.getElementById('report-content').innerHTML = html;
}

function printReport() { window.print(); }
function exportHTML() {
  const blob = new Blob([document.documentElement.outerHTML], {type:'text/html'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'TAMF_Torres_Trail_Report.html'; a.click();
}

