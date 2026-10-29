// =====================
// INSPECTION FORM
// =====================
function renderInspection() {
  // Populate marker dropdown
  const sel = document.getElementById('form-marker');
  sel.innerHTML = '<option value="">— Select Marker —</option>' +
    getActiveMarkers().map(m=>`<option value="${m.id}">${m.id}</option>`).join('');
  document.getElementById('form-date').value = new Date().toISOString().split('T')[0];

  function radioCards(containerId, options, name) {
    const div = document.getElementById(containerId);
    div.innerHTML = options.map((o,i)=>`
      <label style="cursor:pointer;">
        <input type="radio" name="${name}" value="${o.val}" ${i===0?'checked':''} style="display:none;">
        <div class="radio-card" style="padding:8px 14px;border:2px solid var(--border);border-radius:8px;font-size:0.8rem;font-weight:600;transition:all 0.15s;background:#fff;"
          onclick="selectRadio(this,'${name}')">
          ${o.label}
        </div>
      </label>`).join('');
  }
  radioCards('radio-structural',[
    {val:'5',label:'5 — Excellent'},{val:'4',label:'4 — Good'},
    {val:'3',label:'3 — Fair'},{val:'2',label:'2 — Poor'},{val:'1',label:'1 — Critical'}
  ],'structural');
  radioCards('radio-paint',[
    {val:'Excellent',label:'Excellent'},{val:'Faded-Weathered',label:'Faded / Weathered'},
    {val:'Peeled-Obscured',label:'Peeled / Obscured'},{val:'Missing-Illegible',label:'Missing / Illegible'}
  ],'paint');
  radioCards('radio-visibility',[
    {val:'5',label:'5 — Clear'},{val:'4',label:'4 — Good'},
    {val:'3',label:'3 — Fair'},{val:'2',label:'2 — Partial'},{val:'1',label:'1 — Hidden'}
  ],'visibility');
  radioCards('radio-action',[
    {val:'Paint',label:'Paint'},{val:'Replace',label:'Replace'},
    {val:'Install New',label:'Install New'},{val:'No Action',label:'No Action'}
  ],'action');
}

function selectRadio(el, name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach(r=>r.closest('label').querySelector('.radio-card').style.cssText='padding:8px 14px;border:2px solid var(--border);border-radius:8px;font-size:0.8rem;font-weight:600;transition:all 0.15s;background:#fff;');
  el.style.background='#d8f3dc'; el.style.borderColor='var(--primary)'; el.style.color='var(--primary)';
  el.closest('label').querySelector('input').checked = true;
}

function submitInspection() {
  const mid = document.getElementById('form-marker').value;
  if (!mid) { document.getElementById('form-msg').textContent='Please select a marker.'; return; }
  const m = MARKERS.find(x=>x.id===mid);
  const strVal = parseInt(document.querySelector('input[name="structural"]:checked')?.value||3);
  const paintLabel = document.querySelector('input[name="paint"]:checked')?.value||'Faded-Weathered';
  const visVal = parseInt(document.querySelector('input[name="visibility"]:checked')?.value||3);
  const action = document.querySelector('input[name="action"]:checked')?.value||'Paint';
  const notes = document.getElementById('form-notes').value;
  const photoUrl = document.getElementById('form-photo').value;

  const paintScore = {Excellent:5,'Faded-Weathered':3,'Peeled-Obscured':2,'Missing-Illegible':1}[paintLabel]||3;
  const overall = Math.round(strVal*0.5 + paintScore*0.3 + visVal*0.2);
  const condMap = {5:'Good',4:'Good',3:'Fair',2:'Poor',1:'Critical'};

  m.structuralScore = strVal; m.paintScore = paintScore; m.visibilityScore = visVal;
  m.paintLabel = paintLabel; m.overall = overall; m.conditionStatus = condMap[overall]||'Fair';
  m.action = action; m.notes = notes;
  if (photoUrl) m.urlBefore = photoUrl;
  m.completionStatus = 'In Progress';

  document.getElementById('form-msg').innerHTML = `<span style="color:var(--good);">✓ ${mid} updated — Overall: ${overall}/5, Condition: ${m.conditionStatus}</span>`;
}

