# SIM Group Medical Portal

A fully offline static portal built with HTML, CSS and vanilla JavaScript, including a
medical requisition / stock engine and a per-sector notice board.

There is **no build step, no package install and no internet requirement**. Every font,
icon, image and library is bundled in this folder.

## Run locally

Open `index.html` directly in a browser, **or** serve the folder with any static web
server for the full experience (installable PWA + service worker):

```powershell
# any static server works, e.g. Python
python -m http.server 8000
```

Then visit <http://localhost:8000/>.

> Opening the files with `file://` works for everything except the service worker.
> The portal still runs completely offline either way; the service worker only adds
> installability and a cache layer when served over http(s).

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Cover / landing page |
| `dashboard.html` | Live Dhaka clock, hexagon directory |
| `medical_requisition.html` | Requisition, stock report, catalog, KPI cards, backup/restore, Excel, print |
| `notice_board.html` | Per-sector notice board (`?sector=sim-fabrics`, `central`, `mozaffar`, `archive`) |

## Offline asset layout

```
assets/
  css/
    inter.css             Local @font-face declarations for Inter
    utilities.css         Local replacement for the Tailwind Play CDN
    requisition.css       Extracted v2 requisition stylesheet
    requisition-extras.css v3 components, KPIs, dialogs, print layer
    notices.css           Notice board module
  fonts/                  Inter .woff2 files (7 subsets)
  icons/
    bootstrap-icons.css   Bootstrap Icons 1.11.3 (local)
    fonts/                bootstrap-icons.woff2 / .woff
  img/
    icon-32/48/64/180/192/512.png   Favicons + PWA icons generated from logo.png
  js/
    requisition.js        v3 application logic
    notices.js            Notice board logic
    requisition.legacy.js v2 script kept for reference only (not loaded)
  vendor/
    xlsx.bundle.js        xlsx-js-style 1.2.0 (local)
```

`logo.png` in the project root is the only image used by the pages.

## Data storage

Everything is stored in this browser's `localStorage`:

| Key | Contents |
| --- | --- |
| `simMedical_v3` | Full v3 database: products, factories, months, movement log, settings |
| `simNotices_v1` | Notice board entries per sector |
| `simProducts_v2`, `simAppState_v2` | Legacy v2 keys — migrated automatically on first load, then left untouched |

### v3 database shape

```js
{
  app: 'sim-medical-portal',
  version: 3,
  lang: 'en' | 'bn',
  activeFactory: 'sim-fabrics' | 'mozaffar' | 'sim-group',
  activeMonth: 'YYYY-MM',
  syncIssue: true,
  products: [{ id, name, unit, pieces, rate, minStock, expiry }],
  factories: {
    'sim-fabrics': {
      name: 'SIM Fabrics Ltd.',
      months: {
        '2026-10': {
          requisition: { [productId]: { qty } },
          stock: [{ productId, name, opening, received, issue, remarks, issueLocked }],
          approval: 'draft' | 'approved' | 'issued',
          reportNo: 'SF-REQ-2026-10-001',
          signature: { name, title },
          createdAt, updatedAt
        }
      }
    }
  },
  movement: [{ t, factory, month, kind, text, qty, direction }]
}
```

### First run

1. The product catalog is seeded with the supplied medicine list.
2. The September 2026 stock report is recreated from the supplied figures.
3. The current month is created automatically with **Opening = September closing**.

## Features

- **Auto-save** — every change is written to `localStorage` after a short delay; `Ctrl+S` saves immediately.
- **Backup / Restore** — download a complete JSON backup and restore it later. Always take a backup before clearing browser data.
- **Month archives** — each month is stored separately. Use History to jump between months.
- **Auto issue sync** — typing a quantity in the requisition fills the matching stock `Issue` cell. Editing `Issue` manually locks that row (`Manual`) until the toggle is switched off and on again.
- **Roll forward** — one click copies last month's closing stock into this month's opening stock.
- **Low-stock and expiry intelligence** — per-product minimum level and expiry date, with KPI counters and alert banners.
- **Multi-factory** — SIM Fabrics, Mozaffar Hossain Spinning Mills and the SIM Group central hub keep separate month archives.
- **Report numbering and approval status** — e.g. `SF-REQ-2026-10-001`, Draft → Approved → Issued.
- **English / বাংলা** interface toggle.
- **Excel export** — styled requisition and stock sheets via the bundled `xlsx-js-style`.
- **Print / PDF** — A4 layout with report number, status, generation timestamp and signature block.
- **Movement log** — the last 400 stock / approval / backup events, visible in the History dialog.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+S` | Save now |
| `Ctrl+P` | Print the active report |
| `Esc` | Close the open dialog |

## Versioning

`git` is not used in this folder. Before each change, copy the affected files into a
timestamped folder:

```
backups/<yyyyMMdd-HHmmss>/
```

## Footer

Every page ends with:

- left: `© 2026 SIM Group. All rights reserved.`
- right: `Developed by: Siratkhanbd` linking to <https://www.facebook.com/siratkhanbd> with `target="_blank"`.
