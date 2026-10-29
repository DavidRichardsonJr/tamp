# 🌿 TAMP — Trail Asset Management Platform

Single-file (or multi-file) web app for trail marker inventory, inspection, and maintenance planning.  
**Royal Palm Beach Pines Natural Area · Palm Beach County, FL**

---

## Quick start

**Single-file version (simplest):**
Open `TAMF_v4.html` in any browser. No install, no server.

**Multi-file version:**
```
cd TAMP_project
python3 -m http.server 8080
# open http://localhost:8080
```
Or just double-click `index.html` (works in Chrome; other browsers may restrict local JS imports).

---

## Project layout

```
TAMP_project/
├── index.html            Main app shell
├── README.md             This file
├── css/
│   └── tamp.css          All styles
├── js/
│   ├── data.js           Seed data (MARKERS, SITES, TRAILS)
│   ├── helpers.js        Shared utilities + trail switching
│   ├── storage.js        localStorage persistence
│   ├── dashboard.js      Dashboard KPIs
│   ├── inventory.js      Inventory table + add/delete
│   ├── gismap.js         GIS coordinate plot + geo map upload
│   ├── workorders.js     Work order groups
│   ├── report.js         Inspection report + All Trails
│   ├── sites.js          Sites & Trails management
│   ├── modal.js          Marker detail modal
│   ├── import-export.js  CSV/JSON import & export
│   ├── summary.js        Summary page
│   ├── inspection.js     Inspection form
│   ├── scoreedit.js      Bulk score editor
│   ├── priority.js       Priority matrix
│   └── annualplan.js     Annual maintenance plan
```
---

## Docs

| File | How to use |
|------|-----------|
| `docs/TUTORIAL.html` | Open in a browser — 15-chapter illustrated guide |
| `docs/README.docx` | Open in Word — full reference with tables and scoring guide |

---

## Trails

| Code | Name | Marker |
|------|------|--------|
| TOR | Torres Trail | Red Square |
| PLT | Pine Lily Trail | Yellow Circle |

---

