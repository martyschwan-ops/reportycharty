# ReportyCharty

A local-first Excel analytics platform. Upload Excel spreadsheets, visualize data with interactive charts, and generate statistical reports — all running on your Mac with no cloud dependency.

## Features

- **Upload & Manage** — Drag-and-drop Excel uploads (.xlsx, .xls, .xlsm), rename, refresh, and delete
- **Table View** — Paginated, sortable, filterable data table with CSV export
- **Chart Builder** — 9 chart types: bar, stacked bar, line, area, pie, doughnut, scatter, radar, polar area
- **Statistics Report** — Automatic column analysis: min/max/mean/median/std dev for numeric, top values for categorical
- **AI Insights** — Pattern detection: trends, outliers, data quality, cardinality
- **Saved Charts** — Save and reload chart configurations per data source
- **Dark Mode** — Full dark/light theme support
- **Local Storage** — All data stays on your Mac (SQLite + local filesystem)

## Requirements

- **Node.js** 18+ (install via `brew install node` or [nodejs.org](https://nodejs.org))
- **npm** 9+

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start both server and client
npm run dev
```

Then open **http://localhost:5173** in your browser.

## Project Structure

```
reportycharty/
├── client/                   # React + TypeScript frontend
│   └── src/
│       ├── components/
│       │   ├── layout/       # Sidebar, Header, Layout
│       │   ├── datasources/  # Upload zone, source cards
│       │   ├── charts/       # ChartBuilder (Chart.js)
│       │   ├── reports/      # DataTable, StatsReport, InsightsPanel
│       │   └── ui/           # Button, Modal, Select, Input, Badge
│       ├── hooks/            # useDataSources, useTheme
│       ├── pages/            # Dashboard, DataSources, DataSourceView, Charts, Reports, Settings
│       ├── types/            # TypeScript interfaces
│       └── utils/            # API client, formatters
│
├── server/                   # Node.js + Express backend
│   └── src/
│       ├── routes/           # datasources, data, charts, insights
│       ├── services/         # database (SQLite), excel (SheetJS)
│       └── middleware/       # multer file upload
│
├── server/uploads/           # Stored Excel files (gitignored)
├── server/data/              # SQLite database (gitignored)
└── package.json              # Root scripts with concurrently
```

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Backend | Node.js + Express |
| Excel parsing | SheetJS (xlsx) |
| Database | better-sqlite3 (SQLite) |
| File upload | Multer |

## Individual Commands

```bash
# Server only (port 3001)
cd server && npm run dev

# Client only (port 5173)
cd client && npm run dev

# Build for production
npm run build
```

## Data Storage

All your data stays local:
- **Excel files**: `server/uploads/` — original files kept on disk
- **Metadata & chart configs**: `server/data/reportycharty.db` — SQLite database
- No telemetry, no cloud sync, no external APIs

## Supported Excel Formats

- `.xlsx` — Excel 2007+ (recommended)
- `.xls` — Excel 97-2003
- `.xlsm` — Excel with macros
- `.xlsb` — Excel binary (limited support)

Max file size: **50 MB**
