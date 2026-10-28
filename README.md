# PDF-Doc — Modern Web-Based PDF Toolkit

📦 **GitHub Repository:** [https://github.com/Vishnu-000/pdf-doc](https://github.com/Vishnu-000/pdf-doc)  
📋 **Implementation & Roadmap Tracker:** See [PROGRESS.md](PROGRESS.md) for full phase breakdown, test matrices, and roadmap.

> **Current Status:** 🚀 **Phase 2 Complete + Phase 3 Active — 16 Active Tools**  
> 12 Pure Client-Side Tools + 4 Hybrid/Server Tools (Compress, Sign, Protect, Unlock, Repair, AI Document Chat) and FastAPI Job Queue.

---

**PDF-Doc** is a professional, privacy-first, all-in-one PDF utility suite inspired by iLovePDF's intuitive UX. Document processing operations prioritize **client-side in-browser execution** using `pdf-lib` and `pdf.js`, complemented by a high-throughput **FastAPI + RQ asynchronous jobs engine** for advanced operations.

## 🚀 Key Highlights & Architecture

- **Tool-Registry Pattern:** Every tool is self-contained in `frontend/src/tools/<id>/` with metadata (`id`, `name`, `category`, `icon`, `mode: client | server`). The dynamic Homepage Grid, Category Filter Pills, and Header Mega-Menu are automatically generated from this registry.
- **Universal ToolShell Wizard:** Standardized 4-step workflow:
  1. **Upload:** Responsive drag-and-drop zone with format validation.
  2. **Workspace & Options:** Interactive page thumbnail grid (with drag-and-drop reordering, rotation, deletion, duplication) and a dedicated parameter sidebar.
  3. **Progress:** Deterministic real-time progress bar.
  4. **Result:** Success banner, download button with custom filenames, and file size statistics.
- **Client-Side Privacy:** In-browser execution for organizing, editing, signing, lightweight compression, document repair, and document intelligence.
- **Asynchronous Jobs API:** FastAPI `/api/jobs` pipeline with Redis queue for heavy server compression, repair, and encryption tasks, featuring automated file expiration cleanup.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v3
- **PDF Engines:** `pdf-lib` (PDF manipulation, merging, splitting, drawing, image embedding, report generation) + `pdfjs-dist` (canvas thumbnail rendering, PDF to JPG, and in-browser text extraction) + `jszip` (batch exports)
- **Backend API & Queue:** FastAPI (Python 3.12) + Uvicorn + `pypdf` + Redis 7 + RQ Worker
- **Orchestration:** Docker Compose

---

## 📂 Active Tools Catalog (16 Tools)

| Tool | Category | Mode | Features |
| :--- | :--- | :---: | :--- |
| **Merge PDF** | Organize PDF | Client | Drag-and-drop multi-file ordering, merge into a single PDF |
| **Split PDF** | Organize PDF | Client | Split by custom page ranges or extract all pages into a ZIP archive |
| **Remove Pages** | Organize PDF | Client | Visual page selection grid; click pages to delete |
| **Extract Pages** | Organize PDF | Client | Visual thumbnail selection; export as one PDF or separate PDFs in a ZIP |
| **Organize PDF** | Organize PDF | Client | Drag-and-drop thumbnail reordering, per-page rotation, page duplication & deletion |
| **Rotate PDF** | Edit PDF | Client | Rotate 90°, 180°, or 270° clockwise / counter-clockwise across all or custom pages |
| **Page Numbers** | Edit PDF | Client | Add page numbers with 6 placement anchors, customizable typography, and formats |
| **Add Watermark** | Edit PDF | Client | Add text watermarks with custom rotation angle (-90° to 90°), opacity, font size, and color |
| **JPG to PDF** | Convert to PDF | Client | Convert JPG, PNG, and WebP images with orientation, page sizes, and margins |
| **PDF to JPG** | Convert from PDF | Client | Render PDF pages to high-res JPG or PNG (150 or 300 DPI); download as image or ZIP |
| **Compress PDF** | Optimize PDF | Client/Server | 3 compression presets (*Extreme*, *Recommended*, *Low*) with file size telemetry |
| **Sign PDF** | Edit PDF | Client | Draw, Type, or Upload digital signature with interactive positioning and page targeting |
| **Protect PDF** | PDF Security | Server | Industry standard AES-256 document password encryption |
| **Unlock PDF** | PDF Security | Server | Decrypt and remove password restrictions from protected documents |
| **Repair PDF** | Optimize PDF | Client/Server | Dual-tier recovery: standard xref/trailer rebuild + deep visual stream reconstruction |
| **AI Document Chat** | PDF Intelligence | Client | Statistical text analysis, executive summary, key findings, and interactive Q&A citations |

---

## 💻 Getting Started

### 1. Prerequisites
- **Node.js:** v18+ (tested on Node v20/v24)
- **Python:** 3.10+ (for backend)
- **Docker & Docker Compose** (optional, for full-stack containerization)

---

### 2. Running Locally (Development Mode)

#### Run Frontend:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Run Backend (FastAPI):
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API docs available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Running with Docker Compose

To launch the complete stack (Frontend + Backend + Redis + RQ Worker):

```bash
docker compose up --build
```
- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **Redis:** `localhost:6379`

---

## 🧪 Running Unit Tests

Each tool’s core logic is thoroughly tested using **Vitest** with synthesized PDF buffers:

```bash
cd frontend
npm run test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

---

## 📁 Project Structure

```
Pdf-Doc-Tool/
├── docker-compose.yml             # Orchestration for Frontend, Backend, Redis, Worker
├── README.md                      # Documentation
├── backend/                       # FastAPI backend & RQ worker
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py                # Healthcheck & API routes
│       └── workers/tasks.py       # RQ background task workers
└── frontend/                      # React + Vite + TypeScript + Tailwind CSS
    ├── public/
    │   ├── pdf.worker.min.mjs     # Standalone PDF.js worker
    │   └── favicon.svg            # Brand icon
    ├── src/
    │   ├── components/
    │   │   ├── common/            # Dropzone, FileList, PageGrid, ProgressBar, Icon
    │   │   ├── layout/            # Header, MegaMenu, Footer
    │   │   └── shell/             # ToolShell 4-step wizard
    │   ├── registry/              # Central registry & category definitions
    │   ├── tools/                 # Self-contained tool modules
    │   │   ├── merge/             # metadata, logic, logic.test, Component
    │   │   ├── split/
    │   │   ├── remove-pages/
    │   │   ├── extract-pages/
    │   │   ├── organize/
    │   │   ├── rotate/
    │   │   ├── page-numbers/
    │   │   ├── watermark/
    │   │   ├── jpg-to-pdf/
    │   │   └── pdf-to-jpg/
    │   ├── lib/                   # pdf-renderer, zip-utils, file-utils
    │   ├── pages/                 # HomePage, ToolPage
    │   └── App.tsx                # Client hash router & state
    └── vite.config.ts
```

---

## 🔒 Privacy & Security
All Phase 1 PDF modifications are performed strictly in the user's browser memory using WebAssembly and Web Workers. No file content is logged, analyzed, or sent over the internet.
