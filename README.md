![Stack](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-blue)
![Data](https://img.shields.io/badge/data-Excel%20(xlsx)-orange)
![Category](https://img.shields.io/badge/domain-Academic%20Reporting-red)
![Rendering](https://img.shields.io/badge/rendering-client--side-green)

# ADYPU Academic Report Dashboard

## Overview

A single-page dashboard that turns the university's monthly chairman report (raw Excel) into KPI cards, school-wise breakdowns, and printable reports — no backend, no database. The workbook is fetched, parsed, and rendered entirely in the browser.

## Why Client-Side Excel Parsing

The source of truth is an Excel file someone in the office edits every month. Rather than standing up a server to ingest and store that data, the dashboard reads the raw `.xlsx` directly via [SheetJS](https://sheetjs.com/) on page load — the report file *is* the database. Drop in a new month's file with the same structure and the dashboard picks it up automatically, no redeploy needed.

## How It Works

1. **Load.** `data-loader.js` fetches the month's workbook and parses every sheet with SheetJS.
2. **Adapt.** `june-adapter.js` normalizes the raw chairman-report layout (column-position based) into a flat record format the rest of the app expects. Per-school overrides (e.g. faculty-confirmed admission numbers) are applied here.
3. **Transform.** `config.js` and `reports.js` compute KPIs — totals, highest package, averages — from the normalized records.
4. **Render.** `dashboard.js` and `schools.js` populate KPI cards and per-school tiles; `modals.js` drives detail views; `carousel.js` runs the banner/highlights strip.
5. **Export.** Reports print via `@media print` CSS — no PDF library involved.

## Structure

```
index.html            # shell + layout
css/dashboard.css      # all styling
js/
  data-loader.js       # fetch + parse workbook(s)
  june-adapter.js       # raw-report → normalized record adapter
  config.js             # shared helpers, KPI extraction (packages, LPA, etc.)
  dashboard.js           # main KPI + tile rendering
  reports.js              # detailed report views, per-school breakdowns
  schools.js               # school tile logic
  modals.js                 # detail modals
  carousel.js                # banner carousel
```

## Running Locally

No build step. Serve the folder over HTTP (fetch of local `.xlsx` won't work over `file://`):

```bash
git clone https://github.com/Adypuacademic/adypuacademicreport.git
cd adypuacademicreport
python -m http.server 8000
```

Open `http://localhost:8000`.

## Adding a New Month

Drop the new raw report `.xlsx` in the root with the expected filename, matching the prior file's sheet/column structure. The adapter picks it up automatically on next load.
