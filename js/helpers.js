// =====================
// NAVIGATION (handled below near Annual Plan)
// =====================

// =====================
// HELPERS
// =====================
function condBadge(c) {
  const map = { Good: 'good', Fair: 'fair', Poor: 'poor', Critical: 'critical' };
  return `<span class="badge badge-${map[c]||'fair'}">${c}</span>`;
}
function statusBadge(s) {
  const map = { 'Completed': 'completed', 'In Progress': 'inprogress', 'Not Started': 'notstarted' };
  const cls = map[s] || 'notstarted';
  return `<span class="badge badge-${cls}">${s}</span>`;
}
function scoreColor(v) {
  if (v >= 4.5) return '#2d6a4f';
  if (v >= 3.5) return '#74c69d';
  if (v >= 2.5) return '#f4a261';
  if (v >= 1.5) return '#e76f51';
  return '#c1121f';
}


// =====================
// TOAST NOTIFICATION
// =====================
function showToast(msg) {
  let t = document.getElementById('toast-msg');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-msg';
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#2d6a4f;color:#fff;padding:10px 24px;border-radius:8px;font-size:0.9rem;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:opacity 0.4s;';
    document.body.appendChild(t);
  }
  t.textContent = msg; t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}

