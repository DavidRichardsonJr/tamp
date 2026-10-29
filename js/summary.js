// =====================
// SUMMARY
// =====================
function renderSummary() {
  const ms = getActiveMarkers();
  const total = ms.length;

  // Scope actions (use 'action' field — maps to scopeAction in old app)
  const scopeReplace  = ms.filter(m=>m.action==='Replace').length;
  const scopeRepaint  = ms.filter(m=>m.action==='Paint').length;
  const scopeInstall  = ms.filter(m=>m.action==='Install New').length;
  const scopeNoAction = ms.filter(m=>m.action==='No Action').length;
  const workOrders    = scopeReplace + scopeRepaint + scopeInstall;

  // Completion — only count markers that have a work order (exclude No Action)
  const completed        = ms.filter(m=>m.completionStatus==='Completed'&&m.action!=='No Action').length;
  const completedInstall = ms.filter(m=>m.completionStatus==='Completed'&&m.action==='Install New').length;
  const pctMaint  = workOrders>0 ? Math.round(completed/workOrders*100) : 0;

  // Inspection coverage (has an overall score > 0)
  const inspected = ms.filter(m=>m.overall!=null&&m.overall>0).length;
  const pctInsp   = total>0 ? Math.round(inspected/total*100) : 0;

  // Nav gaps closed (completed new installs)
  const gapsClosed = completedInstall;
  const pctGaps    = scopeInstall>0 ? Math.round(gapsClosed/scopeInstall*100) : 0;

  // Manual fields — editable via Sites & Trails page
  const site0 = SITES[0] || {};
  const volunteers = site0.opsVolunteers || '—';
  const reports    = site0.opsReports    || '—';
  const expansion  = site0.opsExpansion  || 'Active';
  const trails     = TRAILS.length;

  // Hero — reflect active trail
  const _at = getActiveTrail();
  const _site = SITES.find(s => s.id === _at.siteId) || SITES[0];
  const titleEl = document.getElementById('summary-title');
  if(titleEl) titleEl.textContent = _at.name + ' (' + _at.id + ') · ' + (_site ? _site.id : 'RPBPNA');
  const metaEl = document.getElementById('summary-meta');
  if(metaEl) metaEl.textContent = _at.id + ' · ' + (_site ? _site.name : 'Royal Palm Beach Pines Natural Area') + ' · ' + total + ' markers surveyed';
  const expEl = document.getElementById('summary-expansion');
  if(expEl) expEl.textContent = expansion;

  // Primary metric cards
  const metrics = [
    {icon:'🗂',  label:'Assets Managed',         val:total,          sub:workOrders+' active work orders',         color:'#1b4332'},
    {icon:'🔍',  label:'Inspection Coverage',     val:pctInsp+'%',    sub:inspected+' / '+total+' scored',          color:pctInsp===100?'#2d6a4f':'#f4a261'},
    {icon:'✅',  label:'Maintenance Completed',   val:pctMaint+'%',   sub:completed+' / '+workOrders+' work orders',color:pctMaint===100?'#2d6a4f':'#f4a261'},
    {icon:'🧭',  label:'Navigation Gaps Closed',  val:pctGaps+'%',    sub:gapsClosed+' / '+scopeInstall+' installs',color:pctGaps===100?'#2d6a4f':'#f4a261'},
    {icon:'👥',  label:'Volunteers Coordinated',  val:volunteers,     sub:'across all sessions',                    color:'#0077b6'},
    {icon:'📄',  label:'Reports Generated',       val:reports,        sub:'inspection & work order',                color:'#0077b6'},
    {icon:'🌐',  label:'Trail Networks',          val:trails,         sub:getActiveTrail().id+' · '+SITES.length+' site'+(SITES.length!==1?'s':''),  color:'#1b4332'},
  ];

  const mEl = document.getElementById('summary-metrics');
  if(mEl) mEl.innerHTML = metrics.map(m=>
    '<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:1.1rem 1.25rem;'
    +'display:flex;flex-direction:column;gap:4px;box-shadow:0 1px 4px rgba(0,0,0,0.05);'
    +'transition:box-shadow 0.15s" onmouseover="this.style.boxShadow=\'0 3px 12px rgba(0,0,0,0.1)\'"'
    +' onmouseout="this.style.boxShadow=\'0 1px 4px rgba(0,0,0,0.05)\'">'
    +'<div style="font-size:18px;margin-bottom:2px">'+m.icon+'</div>'
    +'<div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em">'+m.label+'</div>'
    +'<div style="font-size:28px;font-weight:800;color:'+m.color+';line-height:1.1">'+m.val+'</div>'
    +'<div style="font-size:11px;color:#64748b">'+m.sub+'</div>'
    +'</div>'
  ).join('');

  // Work scope breakdown bars
  const scEl = document.getElementById('summary-scope');
  if(scEl){
    const rows=[
      ['Replace (critical)', '#A0392B','#F5C6C0', scopeReplace],
      ['Repaint (faded)',     '#B07A1A','#F5DFA0', scopeRepaint],
      ['Install new',        '#1A6B35','#B8DFC0', scopeInstall],
      ['No action needed',   '#6B6760','#EDEAE3', scopeNoAction],
    ];
    scEl.innerHTML = rows.map(([l,c,bg,n])=>
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">'
      +'<div style="width:10px;height:10px;border-radius:50%;background:'+c+';flex-shrink:0"></div>'
      +'<span style="font-size:12px;color:#64748b;min-width:160px">'+l+'</span>'
      +'<div style="flex:1;height:18px;background:#e9ecef;border-radius:4px;overflow:hidden">'
      +'<div style="height:100%;width:'+(total>0?Math.round(n/total*100):0)+'%;background:'+c+';border-radius:4px"></div>'
      +'</div>'
      +'<span style="font-size:13px;font-weight:700;color:'+c+';min-width:28px">'+n+'</span>'
      +'</div>'
    ).join('');
  }

  // Completion progress rings (SVG)
  const prEl = document.getElementById('summary-progress');
  if(prEl){
    const rings = [
      ['Inspection',   '#2d6a4f', pctInsp],
      ['Maintenance',  '#f4a261', pctMaint],
      ['Gap Closure',  '#52b788', pctGaps],
    ];
    const r=36, circ=2*Math.PI*r;
    prEl.innerHTML = '<div style="display:flex;justify-content:space-around;align-items:center;padding:1rem 0;flex-wrap:wrap;gap:1rem">'
      + rings.map(function(ring){
          var label=ring[0], color=ring[1], pct=ring[2];
          var dash=circ*(pct/100), gap=circ-dash;
          return '<div style="display:flex;flex-direction:column;align-items:center;gap:8px">'
            +'<svg width="90" height="90" viewBox="0 0 90 90">'
            +'<circle cx="45" cy="45" r="'+r+'" fill="none" stroke="#e9ecef" stroke-width="8"/>'
            +'<circle cx="45" cy="45" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="8"'
            +' stroke-dasharray="'+dash.toFixed(1)+' '+gap.toFixed(1)+'"'
            +' stroke-dashoffset="'+((circ/4)).toFixed(1)+'"'
            +' stroke-linecap="round" transform="rotate(-90 45 45)"/>'
            +'<text x="45" y="49" text-anchor="middle" font-size="15" font-weight="800" fill="'+color+'">'+pct+'%</text>'
            +'</svg>'
            +'<div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.06em">'+label+'</div>'
            +'</div>';
        }).join('')
      +'</div>';
  }
}
