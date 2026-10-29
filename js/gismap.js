// =====================
// GIS MAP
// =====================
function renderMap() {
  const filter = document.getElementById('map-filter').value;
  const showLabels = document.getElementById('map-labels').checked;
  const bothTrails = filter === 'both';

  // Source markers: all trails or active trail only
  const sourceMs = bothTrails ? MARKERS : getActiveMarkers();

  let pts = sourceMs.filter(m => {
    if (bothTrails || !filter) return true;
    if (filter === 'Good' || filter === 'Fair' || filter === 'Critical') return m.conditionStatus === filter;
    if (filter === 'Paint' || filter === 'Install New') return m.action === filter;
    return true;
  });

  document.getElementById('map-count').textContent = `${pts.length} marker${pts.length !== 1 ? 's' : ''} shown${bothTrails ? ' (all trails)' : ''}`;

  const container = document.getElementById('map-container');
  const W = container.clientWidth, H = 520;
  const canvas = document.getElementById('map-canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Calculate bounds
  const lngs = pts.map(m=>m.lng), lats = pts.map(m=>m.lat);
  const minLng = Math.min(...lngs)-0.001, maxLng = Math.max(...lngs)+0.001;
  const minLat = Math.min(...lats)-0.001, maxLat = Math.max(...lats)+0.001;

  function toXY(lat, lng) {
    const pad = 40;
    const x = pad + (lng-minLng)/(maxLng-minLng)*(W-pad*2);
    const y = H - pad - (lat-minLat)/(maxLat-minLat)*(H-pad*2);
    return [x, y];
  }

  // Background
  ctx.fillStyle = '#f0f4f8';
  ctx.fillRect(0, 0, W, H);

  // Draw uploaded map image if available
  if (window._mapBgImage) {
    ctx.globalAlpha = 0.85;
    ctx.drawImage(window._mapBgImage, 0, 0, W, H);
    ctx.globalAlpha = 1.0;
  }

  // Grid (only when no background image)
  if (!window._mapBgImage) {
    ctx.strokeStyle = '#dde8f0'; ctx.lineWidth = 1;
    for (let i=0;i<=4;i++) {
      const x = 40 + i*(W-80)/4;
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
      const y = 40 + i*(H-80)/4;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
  }

  // Trail path (connect markers in order)
  if (pts.length > 1) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(45,106,79,0.3)'; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
    const [fx,fy] = toXY(pts[0].lat, pts[0].lng);
    ctx.moveTo(fx, fy);
    pts.forEach(m => { const [x,y]=toXY(m.lat,m.lng); ctx.lineTo(x,y); });
    ctx.stroke(); ctx.setLineDash([]);
  }

  // Trail accent colors for "both trails" mode
  const trailAccents = {};
  TRAILS.forEach((t, i) => {
    const palette = ['#2d6a4f','#1d6fa0','#7b2d8b','#c1440e','#5a6e00'];
    trailAccents[t.id] = t.color || palette[i % palette.length];
  });

  // Points
  function dotColor(m) {
    if (bothTrails) return trailAccents[m.trailId] || '#555';
    if (m.action === 'Install New') return '#3a86ff';
    if (m.conditionStatus === 'Good') return '#2d6a4f';
    if (m.conditionStatus === 'Fair') return '#f4a261';
    if (m.conditionStatus === 'Poor') return '#e76f51';
    return '#c1121f';
  }

  pts.forEach(m => {
    const [x,y] = toXY(m.lat, m.lng);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI*2);
    ctx.fillStyle = dotColor(m);
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
    ctx.stroke();

    if (showLabels) {
      ctx.font = '9px Arial';
      ctx.fillStyle = '#222';
      ctx.textAlign = 'center';
      ctx.fillText(m.id, x, y-10);
    }
  });

  // Both-trails legend
  if (bothTrails) {
    const trailsInView = TRAILS.filter(t => pts.some(m => m.trailId === t.id));
    const legendX = W - 16, legendY = 16;
    const lh = 22, lw = 130, pad = 10;
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.strokeStyle = '#ccc'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(legendX - lw, legendY, lw, pad*2 + trailsInView.length * lh, 6);
    ctx.fill(); ctx.stroke();
    trailsInView.forEach((t, i) => {
      const cy = legendY + pad + i * lh + lh / 2;
      const cx = legendX - lw + pad + 7;
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = trailAccents[t.id] || '#555';
      ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.font = 'bold 11px Arial';
      ctx.fillStyle = '#222';
      ctx.textAlign = 'left';
      const count = pts.filter(m => m.trailId === t.id).length;
      ctx.fillText(t.code + ' — ' + count, cx + 12, cy + 4);
    });
  }

  // Click handler
  canvas.onclick = function(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    for (const m of pts) {
      const [x,y] = toXY(m.lat, m.lng);
      if (Math.hypot(mx-x, my-y) < 12) { openModal(m.id); break; }
    }
  };
}


// =====================
// GIS MAP HELPERS
// =====================

function switchMapTab(tab) {
  const isPlot = tab === 'plot';
  document.getElementById('maptab-plot').style.display = isPlot ? '' : 'none';
  document.getElementById('maptab-geo').style.display  = isPlot ? 'none' : '';
  const plotBtn = document.getElementById('maptab-plot-btn');
  const geoBtn  = document.getElementById('maptab-geo-btn');
  if (plotBtn) {
    plotBtn.style.borderBottom = isPlot ? '3px solid var(--primary)' : '3px solid transparent';
    plotBtn.style.color        = isPlot ? 'var(--primary)' : 'var(--text-muted)';
    plotBtn.style.fontWeight   = isPlot ? '600' : '400';
  }
  if (geoBtn) {
    geoBtn.style.borderBottom = !isPlot ? '3px solid var(--primary)' : '3px solid transparent';
    geoBtn.style.color        = !isPlot ? 'var(--primary)' : 'var(--text-muted)';
    geoBtn.style.fontWeight   = !isPlot ? '600' : '400';
  }
  if (isPlot) setTimeout(renderMap, 50);
  else renderGeoMap();
}

function downloadMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const trail = getActiveTrail();
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = trail.id + '_CoordPlot.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('⬇ Coordinate plot downloaded as ' + trail.id + '_CoordPlot.png');
}

// Per-trail geographic map images, keyed by trailId
window._geoImages = {};

// Restore saved geo maps from localStorage on load
(function() {
  try {
    const saved = JSON.parse(localStorage.getItem('TAMP_geo_maps') || '{}');
    Object.keys(saved).forEach(function(trailId) {
      const img = new Image();
      img.onload = function() { window._geoImages[trailId] = img; };
      img.src = saved[trailId];
    });
  } catch(e) {}
})();

function uploadGeoMap(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = function() {
      window._geoImages[activeTrailId] = img;
      try {
        const saved = JSON.parse(localStorage.getItem('TAMP_geo_maps') || '{}');
        saved[activeTrailId] = dataUrl;
        localStorage.setItem('TAMP_geo_maps', JSON.stringify(saved));
      } catch(err) {}
      renderGeoMap();
      showToast('🗺 Trail map loaded for ' + activeTrailId);
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
  input.value = '';
}

function clearGeoMap() {
  delete window._geoImages[activeTrailId];
  try {
    const saved = JSON.parse(localStorage.getItem('TAMP_geo_maps') || '{}');
    delete saved[activeTrailId];
    localStorage.setItem('TAMP_geo_maps', JSON.stringify(saved));
  } catch(e) {}
  renderGeoMap();
  showToast('Trail map cleared for ' + activeTrailId);
}

function downloadGeoMap() {
  const canvas = document.getElementById('map-geo-canvas');
  if (!canvas) return;
  const trail = getActiveTrail();
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = trail.id + '_TrailMap.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('⬇ Trail map downloaded as ' + trail.id + '_TrailMap.png');
}

function renderGeoMap() {
  const img = window._geoImages[activeTrailId];
  const empty     = document.getElementById('map-geo-empty');
  const container = document.getElementById('map-geo-container');
  const canvas    = document.getElementById('map-geo-canvas');
  const clearBtn  = document.getElementById('map-geo-clear-btn');
  const dlBtn     = document.getElementById('map-geo-download-btn');

  if (!img) {
    if (empty)     empty.style.display = '';
    if (container) container.style.display = 'none';
    return;
  }

  if (empty)     empty.style.display = 'none';
  if (container) container.style.display = '';
  if (clearBtn)  clearBtn.style.display = '';
  if (dlBtn)     dlBtn.style.display = '';

  const W = img.naturalWidth;
  const H = img.naturalHeight;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);

  // Overlay GPS marker dots if toggle is checked
  const showMarkers = document.getElementById('geo-show-markers');
  if (!showMarkers || !showMarkers.checked) return;

  const markers = getActiveMarkers();
  const lats = markers.map(m => m.lat).filter(v => v != null && !isNaN(v));
  const lngs = markers.map(m => m.lng).filter(v => v != null && !isNaN(v));
  if (!lats.length) return;

  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const pad = 40;

  function geoToXY(lat, lng) {
    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;
    const x = pad + ((lng - minLng) / lngRange) * (W - pad * 2);
    const y = pad + ((maxLat - lat) / latRange) * (H - pad * 2);
    return { x, y };
  }

  const condColors = { 'Good': '#40916c', 'Fair': '#f4a261', 'Poor': '#e76f51', 'Critical': '#c1121f' };

  markers.forEach(function(m) {
    if (m.lat == null || m.lng == null || isNaN(m.lat) || isNaN(m.lng)) return;
    const { x, y } = geoToXY(m.lat, m.lng);
    const color = condColors[m.conditionStatus] || '#888';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}

