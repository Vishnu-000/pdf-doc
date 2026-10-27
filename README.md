# PDF-Doc — Modern Web-Based PDF Toolkit

📦 **GitHub Repository:** [https://github.com/Vishnu-000/pdf-doc](https://github.com/Vishnu-000/pdf-doc)  
📋 **Implementation & Roadmap Tracker:** See [PROGRESS.md](PROGRESS.md) for full phase breakdown, test matrices, and roadmap.

> **Current Status (Phase 1):** ✅ **10/10 Client-Side Tools Complete**  
> All 10 tools operate 100% in the user's browser with zero server uploads or storage.

---

**PDF-Doc** is a professional, privacy-first, all-in-one PDF utility suite inspired by iLovePDF's intuitive UX. In **Phase 1**, all document processing operations execute **100% in the client's browser** using `pdf-lib` and `pdf.js` — your sensitive documents never touch a remote server.

## 🚀 Key Highlights & Architecture

- **Tool-Registry Pattern:** Every tool is self-contained in `frontend/src/tools/<id>/` with metadata (`id`, `name`, `category`, `icon`, `mode: client | server`). The dynamic Homepage Grid, Category Filter Pills, and Header Mega-Menu are automatically generated from this registry.
- **Universal ToolShell Wizard:** Standardized 4-step workflow:
  1. **Upload:** Responsive drag-and-drop zone with format validation.
  2. **Workspace & Options:** Interactive page thumbnail grid (with drag-and-drop reordering, rotation, deletion, duplication) and a dedicated parameter sidebar.
  3. **Progress:** Deterministic real-time progress bar.
  4. **Result:** Success banner, download button with custom filenames, and file size statistics.
- **100% Client-Side Privacy:** Zero server uploads for Phase 1 client tools.
- **Future-Ready Backend:** Pre-scaffolded FastAPI service, Redis connection, and RQ task queue ready for Phase 2/3 server-side conversions, OCR, and compression jobs.

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v3
- **PDF Engines:** `pdf-lib` (PDF manipulation, merging, splitting, drawing, image embedding) + `pdfjs-dist` (canvas thumbnail rendering & PDF to JPG) + `jszip` (batch exports)
- **Backend Scaffold:** FastAPI (Python 3.12) + Uvicorn
- **Task Queue & Cache:** Redis 7 + RQ Worker
- **Orchestration:** Docker Compose

---

## 📂 Phase 1 Active Client Tools

| Tool | Category | Features |
| :--- | :--- | :--- |
| **Merge PDF** | Organize PDF | Drag-and-drop multi-file ordering, merge into a single PDF |
| **Split PDF** | Organize PDF | Split by custom page ranges or extract all pages into a ZIP archive |
| **Remove Pages** | Organize PDF | Visual page selection grid; click pages to delete |
| **Extract Pages** | Organize PDF | Visual thumbnail selection; export as one PDF or separate PDFs in a ZIP |
| **Organize PDF** | Organize PDF | Drag-and-drop thumbnail reordering, per-page rotation, page duplication & deletion |
| **Rotate PDF** | Edit PDF | Rotate 90°, 180°, or 270° clockwise / counter-clockwise across all or custom pages |
| **Page Numbers** | Edit PDF | Add page numbers with 6 placement anchors, customizable typography, and formats |
| **Add Watermark** | Edit PDF | Add text watermarks with custom rotation angle (-90° to 90°), opacity, font size, and color |
| **JPG to PDF** | Convert to PDF | Convert JPG, PNG, and WebP images with orientation (Portrait/Landscape/Auto), page sizes (A4, Letter, Fit), and margins |
| **PDF to JPG** | Convert from PDF | Render PDF pages to high-res JPG or PNG (150 or 300 DPI); download as image or ZIP |

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
