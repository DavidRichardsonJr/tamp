// =====================
// ANNUAL PLAN
// =====================
function renderAnnualPlan() {
  const phases = ANNUAL_PHASES;
  // Update heading to reflect active trail
  const _apt = getActiveTrail();
  const _apsite = SITES.find(s => s.id === _apt.siteId) || SITES[0];
  const _hd = document.getElementById('annual-plan-heading');
  if (_hd) _hd.textContent = 'Annual Maintenance Plan — ' + _apt.name;
  const _sh = document.getElementById('annual-plan-subhead');
  if (_sh) _sh.textContent = (_apsite ? _apsite.name : '') + ' · FY 2025–2026';

  const byAction = {};
  const apMs = getActiveMarkers();
  apMs.forEach(m=>{ (byAction[m.action]=byAction[m.action]||[]).push(m); });
  const completed = apMs.filter(m=>m.completionStatus==='Completed').length;
  const pct = apMs.length>0 ? Math.round(completed/apMs.length*100) : 0;

  document.getElementById('annual-plan-content').innerHTML = `
    <div class="card" style="margin-bottom:18px;background:linear-gradient(135deg,#1b4332,#2d6a4f);color:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:0.78rem;opacity:0.7;margin-bottom:4px;">OVERALL PROJECT COMPLETION</div>
          <div style="font-size:2.5rem;font-weight:700;">${pct}%</div>
          <div style="font-size:0.85rem;opacity:0.85;">${completed} of ${apMs.length} markers completed</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:0.78rem;opacity:0.7;">SCOPE SUMMARY</div>
          <div style="margin-top:6px;">
            ${Object.entries(byAction).map(([a,ms])=>`<div style="font-size:0.82rem;">${a}: <strong>${ms.length}</strong></div>`).join('')}
          </div>
        </div>
      </div>
    </div>
    ${phases.map((p,pi)=>`
    <div class="card" style="margin-bottom:14px;border-left:4px solid ${p.color};">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;gap:10px;">
        <input value="${p.phase}" style="flex:1;font-size:0.92rem;font-weight:700;color:${p.color};border:none;background:transparent;outline:none;"
          onchange="ANNUAL_PHASES[${pi}].phase=this.value" onfocus="this.style.background='#fafafa';this.style.border='1px solid #ddd'" onblur="this.style.background='transparent';this.style.border='none'">
        <input value="${p.weeks}" style="width:90px;font-size:0.75rem;border:1px solid ${p.color}44;background:${p.color}10;color:${p.color};border-radius:10px;padding:2px 8px;text-align:center;outline:none;"
          onchange="ANNUAL_PHASES[${pi}].weeks=this.value">
      </div>
      <ul style="list-style:none;padding:0;" id="phase-tasks-${pi}">
        ${p.tasks.map((t,ti)=>'<li style="font-size:0.83rem;padding:4px 0;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:6px;">'
          +'<span style="color:'+p.color+';">▸</span>'
          +'<input value="'+t.replace(/"/g,'&quot;')+'" style="flex:1;border:none;background:transparent;font-size:0.83rem;outline:none;padding:0;"'
          +' onchange="ANNUAL_PHASES['+pi+'].tasks['+ti+']=this.value"'
          +' onfocus="this.style.background=\'#fafafa\';this.style.border=\'1px solid #ddd\';this.style.borderRadius=\'4px\';this.style.padding=\'2px 4px\'"'
          +' onblur="this.style.background=\'transparent\';this.style.border=\'none\';this.style.padding=\'0\'">'
          +'<button onclick="removePhaseTask('+pi+','+ti+',this)" style="border:none;background:none;color:#ccc;cursor:pointer;font-size:0.8rem;" title="Remove task">✕</button>'
          +'</li>').join('')}
      </ul>
      <button onclick="ANNUAL_PHASES[${pi}].tasks.push('New task');renderAnnualPlan()" style="margin-top:6px;font-size:0.75rem;border:1px dashed #bbb;background:none;border-radius:4px;padding:3px 10px;cursor:pointer;color:#888;">+ Add task</button>
    </div>`).join('')}
    <div class="card" style="margin-bottom:14px;">
      <div class="card-title" style="margin-bottom:10px;">Estimated Supply List</div>
      <table style="width:100%;font-size:0.82rem;border-collapse:collapse;">
        <thead><tr style="background:#f8f9fa;"><th style="padding:7px;text-align:left;">Item</th><th style="padding:7px;text-align:right;">Qty</th><th style="padding:7px;text-align:right;">Est. Unit Cost</th><th style="padding:7px;text-align:right;">Total</th></tr></thead>
        <tbody id="supply-tbody">
        </tbody>
      </table>
    </div>`;
  // Populate editable supply table
  const cellS = 'border:none;background:transparent;font-size:0.82rem;padding:7px;width:100%;outline:none;';
  const tbody = document.getElementById('supply-tbody');
  if (tbody) {
    tbody.innerHTML = SUPPLY_ITEMS.map((row,ri)=>`
      <tr style="border-bottom:1px solid #f0f0f0;">
        <td><input style="${cellS}" value="${row.item}" onchange="SUPPLY_ITEMS[${ri}].item=this.value"></td>
        <td><input style="${cellS}text-align:right;" value="${row.qty}" onchange="SUPPLY_ITEMS[${ri}].qty=this.value"></td>
        <td><input style="${cellS}text-align:right;" value="${row.unit}" onchange="SUPPLY_ITEMS[${ri}].unit=this.value"></td>
        <td><input style="${cellS}text-align:right;" value="${row.total}" onchange="SUPPLY_ITEMS[${ri}].total=this.value"></td>
        <td style="width:28px;"><button onclick="SUPPLY_ITEMS.splice(${ri},1);renderAnnualPlan()" style="border:none;background:none;color:#ccc;cursor:pointer;">✕</button></td>
      </tr>`).join('') +
    `<tr style="background:#f8f9fa;font-weight:700;">
      <td style="padding:7px;" colspan="3">Estimated Total</td>
      <td style="padding:7px;text-align:right;">${SUPPLY_ITEMS.reduce((s,r)=>{const v=parseFloat(r.total?.replace(/[^0-9.]/g,''))||0;return s+v;},0).toLocaleString('en-US',{style:'currency',currency:'USD'})}</td>
      <td><button onclick="SUPPLY_ITEMS.push({item:'New item',qty:'1',unit:'$0',total:'$0'});renderAnnualPlan()" style="border:none;background:none;color:#888;cursor:pointer;font-size:0.8rem;" title="Add row">+</button></td>
    </tr>`;
  }
}

// Update showPage to call new renders
const _origShowPage = showPage;
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#sidebar nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === id);
  });
  const pageEl = document.getElementById('page-' + id);
  if (pageEl) pageEl.classList.add('active');
  const titles = {
    dashboard: 'Dashboard', summary: 'Summary', alltrails: 'All Trails Overview', inventory: 'Inventory', gismap: 'GIS Map',
    workorders: 'Work Orders', inspection: 'Inspection Form', scoreedit: 'Score / Edit',
    priority: 'Priority Matrix', annualplan: 'Annual Plan',
    report: 'Inspection Report', sites: 'Sites & Trails'
  };
  document.getElementById('page-title').textContent = titles[id] || id;
  if (id === 'gismap') setTimeout(renderMap, 50);
  if (id === 'dashboard') renderDashboard();
  if (id === 'summary') renderSummary();
  if (id === 'inventory') renderInventory();
  if (id === 'workorders') renderWorkOrders();
  if (id === 'inspection') renderInspection();
  if (id === 'scoreedit') renderScoreEdit();
  if (id === 'priority') renderPriority();
  if (id === 'annualplan') renderAnnualPlan();
  if (id === 'report') renderReport();
  if (id === 'sites') renderSites();
  if (id === 'alltrails') renderAllTrails();
}

const PAGE_TITLES_EXT = { alltrails: 'All Trails Overview' };

