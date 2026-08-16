# AI Financial Intelligence

An AI-powered financial analysis platform that extracts structured insights and generates standard financial reports directly from raw data — no accounting knowledge required.

Designed for individuals, micro-businesses (warung/toko), and SMEs (UMKM) in Indonesia.

---

## Features

### Core Analysis
- **3-Statement Generator** — automatically produces Income Statement, Balance Sheet, and Cash Flow Statement from uploaded data
- **BI Dashboard** — revenue breakdown, expense analysis, category drilldown, and profitability charts
- **Confidence Review** — extraction confidence score with flagged rows before data enters the analysis pipeline

### Analysis Modes
| Mode | Description |
|------|-------------|
| **Personal** | 50/30/20 budgeting framework, health score, spending breakdown, personalized recommendations |
| **Toko/Warung** | Simplified view for micro-businesses — busiest day, top-earning categories, restock signals, plain-language tips |
| **Bisnis/UMKM** | Full business analysis with 3 statements, BI insight, investment readiness, and benchmark comparison |

### Multi-Period & Forecasting
- Groups transactions by month automatically
- Linear regression forecast 3 months ahead
- Month-over-month comparison table
- Automatic warnings: declining revenue, cash-tight months, rising costs

### Investment Readiness Score *(Bisnis/UMKM)*
- 0–100 score across 4 dimensions: consistency, profitability, growth, cash flow health
- Grade A–D with strengths and risk indicators
- One-page printable/PDF-exportable summary ready for loan or investor proposals

### Benchmark *(Bisnis/UMKM)*
- Compare your business against Indonesian UMKM sector averages
- Sectors: F&B, Retail/Toko, Jasa/Services, Pertanian/Agribusiness
- Plain-language delta descriptions ("your margin is 8% higher than the sector average")

### File Support
- **CSV** — auto column detection, rule-based parser with AI fallback
- **Excel (.xlsx / .xls)** — smart sheet and header detection
- **PDF** — text extraction via PDF.js + structured parsing via Google Gemini AI
- **Downloadable templates** — Personal and UMKM Excel templates included

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| PDF Extraction | pdfjs-dist |
| Excel Read/Write | SheetJS (xlsx) |
| CSV Parsing | PapaParse |
| AI Extraction | Google Gemini API (`gemini-2.5-flash`) |
| Styling | Custom CSS with CSS variables (dark/light theme) |
| State | React `useState` + `useMemo` — no external state library |
| Backend | None — fully client-side |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A free [Google Gemini API key](https://aistudio.google.com/apikey) (required for PDF parsing only)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd "AI Financial Intellegence"

# Install dependencies
cd frontend
npm install
```

### Running Locally

```bash
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables (optional)

You can pre-load a Gemini API key via environment variable instead of entering it in the UI:

```bash
# frontend/.env.local
VITE_GEMINI_API_KEY=your_api_key_here
```

If not set, the app will prompt you to enter the key through the in-app settings panel. The key is stored in `localStorage` and never sent anywhere except directly to the Google Gemini API.

### Build for Production

```bash
cd frontend
npm run build
# Output in frontend/dist/
```

---

## Project Structure

```
AI Financial Intellegence/
├── frontend/
│   ├── src/
│   │   ├── components/       # React UI components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ConfidenceReview.jsx
│   │   │   ├── FinancialStatements.jsx
│   │   │   ├── BIDashboard.jsx
│   │   │   ├── MultiPeriodView.jsx
│   │   │   ├── PersonalFinanceView.jsx
│   │   │   ├── MikroView.jsx
│   │   │   ├── InvestmentView.jsx
│   │   │   └── BenchmarkView.jsx
│   │   └── utils/            # Business logic & engines
│   │       ├── parser.js           # CSV/Excel rule-based parser
│   │       ├── pdfParser.js        # PDF extraction + Gemini API
│   │       ├── statementGenerator.js
│   │       ├── multiPeriodEngine.js
│   │       ├── personalFinanceEngine.js
│   │       ├── mikroEngine.js
│   │       ├── investmentEngine.js
│   │       ├── benchmarkEngine.js
│   │       └── templateGenerator.js
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── v3-roadmap.md
└── README.md
```

---

## Notes

- **No backend, no database** — all computation happens client-side in the browser. No financial data is stored or transmitted to any server (except to the Gemini API for PDF parsing).
- **PDF parsing requires a Gemini API key** — the free tier (1,500 requests/day) is sufficient for normal personal use.
- **Benchmark data** is based on representative Indonesian UMKM statistics (BPS, Bank Indonesia, Kemenkop UKM) and is intended as a general reference, not a formal financial assessment.

---

## Status

> **This project is under active development.**

The core platform (V1–V3) is functional. Planned work includes additional data source integrations, improved categorization accuracy, and potential monetization features for power users. See `v3-roadmap.md` for the full roadmap.

---

## License

Private project — not licensed for public distribution.
