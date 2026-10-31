# Version 4 — Final Save — 2026-10-31 Dhaka

## Branch: v3.1-portal (tag v4.0) — Commit 5d075b2

### Included
- **SIM Fabrics Ltd.** `sim-fabrics-preview.html` (139K) — Main
  - Maternity Risk Management: 2-page A4 (Page1 Rows 1-4, Page2 Rows 5-8), font 12px, padding 8px
  - Column widths: 4% / 14% / 15% / 34% / 10% / 12% / 12% + table-layout:fixed + word-break:keep-all for নতুন রিস্ক
  - Control Panel: 3 inputs (অ্যাসেসমেন্ট তারিখ, পরবর্তী এসেসমেন্ট তারিখ, নতুন রিস্কের অবস্থা) grid-cols-3 gap-4 items-end h-10 + responsible-person tags (add/edit/remove)
  - RCA: Dyeing/Printing/Weaving tabs, bi-monthly Start-to-End + Year, editable injury table
  - Notice: bullet removed (list-style:none), contagious agendas fixed (? no dari)
  - Pictorial: freestyle crop, centered header

- **Mozaffar Hossain Spinning Mills Ltd.** `mozaffar-preview.html` (139K) — Clone of SIM with:
  - Header: `মোজাফ্ফর হোসেন স্পিনিং মিলস লিঃ` (correct spelling, double ফ্ফ)
  - Address: same Thakurbari Tek (per user)
  - Pictorial hardcoded header MOZAFFAR HOSSAIN SPINNING MILLS LTD center-aligned
  - All 6 notice bodies updated from সিম ফেব্রিক্স → মোজাফ্ফর

- **Dashboard** `dashboard.html` — tiles: SIM Fabrics → sim-fabrics-preview.html, Mozaffar → mozaffar-preview.html

- **Design Lock 100%**: SolaimanLipi, centered header logo 55px, divider 2px, borders 1px #000000, Bengali serials ১-৮, dates Bengali digits, signatures intact

## Git
- Branch: v3.1-portal, Tag: v4.0 (commit 5d075b2)
- Previous: v2.1, v3.1-portal (origin), v4.0 now local
- Untracked (not in version, can be cleaned): notice-inline.html, pictorial-inline.html, sim-fabrics-main.html backup, package.json

## Next
- Push to GitHub when ready: git push origin v4.0 && git push origin v3.1-portal --tags
