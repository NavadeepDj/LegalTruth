# LegalTruth — Evidence-First Legal Document Assistant

> **Ask your legal documents. See exactly where the answer comes from. When the document doesn't answer, get clearly separated external guidance.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.0%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![uv](https://img.shields.io/badge/Package%20Manager-uv-DE5FE9?logo=python&logoColor=white)](https://astral.sh/uv)

---

## 1. The Core Problem

When individuals and businesses receive agreements (employment contracts, NDAs, leases, service terms, vendor agreements), they often ask general AI tools questions like:
- *"What is my notice period?"*
- *"Can I terminate this agreement early?"*
- *"Can my employer withhold my salary?"*

A generic LLM answers these questions, but introduces two critical risks:
1. **Unverifiable Hallucination**: The user cannot easily tell if a clause actually exists or if the model fabricated it.
2. **Silent Gap Filling**: When a document is silent, general AI models quietly substitute general knowledge or jurisdiction assumptions without warning.

### Core Principle
> **The uploaded document is the authority for what the document says. It is not automatically the authority for what the law says.**

LegalTruth bridges this gap by enforcing strict **evidence-first generation**:
- Every material claim is tied to an exact **Page Number**, **Section Heading**, and **Verbatim Quote**.
- Clicking an evidence card jumps directly to that page in the document viewer and highlights the clause.
- When the document lacks relevant information, LegalTruth **explicitly declines to guess**, explains why the document cannot answer, and triggers a clearly demarcated **Google Search grounding fallback**.

---

## 2. Architecture & Workflow

```text
               USER UPLOADS PDF
                      │
                      ▼
         PyMuPDF Text & Section Extractor
                      │
                      ▼
              Session Store
                      │
                      ▼
           User Asks a Question
                      │
                      ▼
      Gemini Evidence-Constrained Engine
                      │
           ┌──────────┴──────────┐
           │                     │
    Evidence Found         Not In Document
           │                     │
           ▼                     ▼
    Answer + Citations     Coverage Gap Explainer
   (Page · Section · Quote)      │
           │                     ▼
           │             [Mode: Doc + Web?]
           │                     │
           │                     ▼
           │             Google Search Grounding
           │                     │
           │                     ▼
           │             Authoritative External
           │             Guidance & Action Steps
           │                     │
           └──────────┬──────────┘
                      ▼
        Dual-Pane Interactive Viewer
    (PDF Highlighter + Evidence Panel)
```

---

## 3. Key Innovations & Features

### 🛡️ Dual Answer Modes
- **Document Only (🔒)**: Strict contractual confinement. If the clause isn't in your document, it returns `NOT_FOUND` with a gap explanation. No hallucinations, period.
- **Document + Web (🌐)**: Answers from the document first. If silent, searches authoritative external public sources (government/regulatory agencies) with strict visual source boundaries.

### 🎯 Pinpoint Evidence Cards
- Every claim includes a clickable card showing the verbatim citation, section hint, and page number.
- Clicking the card scrolls the PDF viewport directly to the page with a glowing animated highlight.

### 🔍 Interactive Clause Inspector
- Highlight any obscure or complex clause directly on the PDF.
- A floating context menu appears: **"Explain this clause"**.
- Gemini breaks down the clause in plain English: obligations created, potential risks, and next steps.

### ⚠️ Explainable Coverage Gaps
- When an answer is missing, LegalTruth does not output a generic refusal.
- It details:
  1. What the question required.
  2. What the document lacks.
  3. Recommended actionable steps (e.g. asking HR for an employee handbook addendum).

---

## 4. Prompt Engineering Architecture

LegalTruth uses a multi-stage prompt engineering strategy with structured JSON output:

1. **System Prompt**: Enforces evidence citation rules (`SUPPORTED`, `NOT_FOUND`, `PARTIAL`), requires verbatim quotes, and bans legal outcome guarantees.
2. **Clause Explanation Prompt**: Translates highlighted legalese into Plain English obligations without declaring enforceability.
3. **Google Search Grounding**: Leverages Gemini with the `GoogleSearch` tool for fallback, strictly separating external sources from contractual terms.
4. **Adversarial Resilience**: Defends against prompt injection attempts trying to force unsupported legal advice or override constraints.

---

## 5. Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Vanilla CSS design tokens (Dark glassmorphism, responsive split-pane, Inter font).
- **Backend**: FastAPI, Uvicorn, PyMuPDF (fitz), `google-genai` SDK, Pydantic v2.
- **Package Management**: `uv` (Astral) for ultra-fast, reproducible Python virtual environments.
- **AI Models & Grounding**: Google Gemini 2.0 Flash (`gemini-2.0-flash`) with Google Search tool integration.
- **Testing**: `pytest` (backend unit, integration, adversarial tests) and Playwright/Jest ready.

---

## 6. Getting Started Locally

### Prerequisites
- Node.js ≥ 18
- Python ≥ 3.11
- `uv` (or standard Python venv)
- Gemini API Key ([Google AI Studio](https://aistudio.google.com/))

### 1. Clone & Configure Environment
```bash
git clone https://github.com/NavadeepDj/LegalTruth.git
cd LegalTruth

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env to set your GEMINI_API_KEY
```

### 2. Run the Backend
```bash
# Run backend directly using uv (automatically uses the virtual environment)
cd backend
uv run uvicorn app.main:app --reload --port 8000
```
Backend API will be running on `http://localhost:8000` (Health check: `http://localhost:8000/health`).

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 7. Demo Walkthrough

1. Navigate to `http://localhost:3000/workspace`.
2. Click **"Load Sample Agreement →"** (or append `?demo=true` to the URL).
3. Try asking:
   - **"What is my notice period?"** → Returns 90 days, citing **Page 3, Section 7.2**, with a clickable jump button.
   - **"Can I terminate this agreement early?"** → Returns notice requirements and termination conditions.
   - **"Can my employer withhold my salary?"** → Document is silent! LegalTruth flags `NOT_FOUND`, explains why, and provides external California labor guidance via Google Search grounding.
4. Select any sentence on the PDF viewer to trigger **"Explain this clause"**.

---

## 8. Alignment with Prompt Wars Challenge

| Criteria | LegalTruth Implementation |
|---|---|
| **Code Quality & Architecture** | Clean decoupled architecture (FastAPI backend + Next.js App Router frontend), typed interfaces, dependency isolation via `uv`. |
| **Use of Google Services** | Gemini 2.0 Flash structured JSON outputs + Gemini Google Search tool grounding for real-time external web citations. |
| **Prompt Engineering** | Evidence-constrained system prompt, source boundary enforcement, clause analysis prompt, and adversarial safety tests. |
| **User Experience & Design** | Dark glassmorphism aesthetics, dynamic split-pane, clickable evidence citations with PDF scrolling and highlighting. |
| **Security & Privacy** | Session-based ephemeral storage, file size/type sanitization, adversarial prompt injection tests. |
