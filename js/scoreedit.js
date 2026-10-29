// =====================
// SCORE / EDIT
// =====================
let seFiltered = [...MARKERS];
function filterScoreEdit() {
  const q = document.getElementById('se-search').value.toLowerCase();
  seFiltered = getActiveMarkers().filter(m=>m.id.toLowerCase().includes(q));
  renderScoreEditTable();
}
function renderScoreEdit() { seFiltered = [...getActiveMarkers()]; renderScoreEditTable(); }
function renderScoreEditTable() {
  document.getElementById('se-tbody').innerHTML = seFiltered.map(m=>`
    <tr>
      <td><span class="marker-id">${m.id}</span></td>
      <td>
        <select onchange="updateField('${m.id}','conditionStatus',this.value)" style="font-size:0.78rem;padding:3px;border:1px solid var(--border);border-radius:4px;">
          ${['Good','Fair','Poor','Critical'].map(c=>`<option ${m.conditionStatus===c?'selected':''}>${c}</option>`).join('')}
        </select>
      </td>
      <td>
        <select onchange="updateField('${m.id}','paintLabel',this.value)" style="font-size:0.78rem;padding:3px;border:1px solid var(--border);border-radius:4px;">
          ${['Excellent','Faded-Weathered','Peeled-Obscured','Missing-Illegible'].map(p=>`<option ${m.paintLabel===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </td>
      <td><input type="number" min="1" max="5" value="${m.structuralScore}" onchange="updateScore('${m.id}','structuralScore',this.value)" style="width:44px;padding:3px;font-size:0.78rem;border:1px solid var(--border);border-radius:4px;text-align:center;"></td>
      <td><input type="number" min="1" max="5" value="${m.paintScore}" onchange="updateScore('${m.id}','paintScore',this.value)" style="width:44px;padding:3px;font-size:0.78rem;border:1px solid var(--border);border-radius:4px;text-align:center;"></td>
      <td><input type="number" min="1" max="5" value="${m.visibilityScore}" onchange="updateScore('${m.id}','visibilityScore',this.value)" style="width:44px;padding:3px;font-size:0.78rem;border:1px solid var(--border);border-radius:4px;text-align:center;"></td>
      <td style="font-weight:700;color:${scoreColor(m.overall)}">${m.overall}</td>
      <td>
        <select onchange="updateField('${m.id}','action',this.value)" style="font-size:0.78rem;padding:3px;border:1px solid var(--border);border-radius:4px;">
          ${['Paint','Replace','Install New','No Action'].map(a=>`<option ${m.action===a?'selected':''}>${a}</option>`).join('')}
        </select>
      </td>
      <td>
        <select onchange="updateField('${m.id}','completionStatus',this.value)" style="font-size:0.78rem;padding:3px;border:1px solid var(--border);border-radius:4px;">
          ${['Completed','In Progress','Not Started'].map(s=>`<option ${m.completionStatus===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </td>
      <td><button class="btn btn-sm btn-outline" onclick="openModal('${m.id}')">👁</button></td>
    </tr>`).join('');
}
function updateField(id, field, val) {
  const m = MARKERS.find(x=>x.id===id);
  if (m) { m[field] = val; saveToStorage(); }
}
function updateScore(id, field, val) {
  const m = MARKERS.find(x=>x.id===id);
  if (!m) return;
  m[field] = parseInt(val);
  m.overall = Math.round(m.structuralScore*0.5 + m.paintScore*0.3 + m.visibilityScore*0.2);
  const condMap = {5:'Good',4:'Good',3:'Fair',2:'Poor',1:'Critical'};
  m.conditionStatus = condMap[m.overall]||'Fair';
  saveToStorage();
  renderScoreEditTable();
}

