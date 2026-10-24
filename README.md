# SIM Group Medical Portal

A responsive static portal built with HTML, CSS, and vanilla JavaScript, including a medical requisition and stock-management module.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. There is no build step or package install.

## Files

- `index.html` — cover / landing page
- `dashboard.html` — live-clock dashboard and hexagon directory
- `medical_requisition.html` — requisition, stock report, product catalog, Excel export, and print views
- `styles.css` — shared responsive styles
- `app.js` — Bangladesh-time clock, placeholder notices, and smooth page transitions
- The SIM Group logo is loaded from the supplied Google-hosted image URL.

The Google Font, Bootstrap Icons, supplied Google-hosted logo, Tailwind CDN, and styled SheetJS-compatible Excel library (xlsx-js-style) require an internet connection. Product, requisition, and stock data are stored in the current browser's local storage.
