# Election Process Education Assistant

An interactive, AI-powered web application that helps citizens, students, and first-time voters understand how elections work across the world's largest democracies.

---

## Overview

The app combines a **React frontend** with a **FastAPI backend** that uses Retrieval-Augmented Generation (RAG) — backed by Google Gemini and ChromaDB — to answer natural-language questions about election processes. A curated knowledge base of Markdown documents powers accurate, grounded responses for each supported country.

---

## Features

### Multi-Country Support
Choose from **10 of the world's largest democracies**, each with its own flag-inspired color theme, knowledge base, and context-aware AI answers:

| Country | Country | Country |
|---|---|---|
| 🇮🇳 India | 🇺🇸 United States | 🇮🇩 Indonesia |
| 🇧🇷 Brazil | 🇵🇰 Pakistan | 🇳🇬 Nigeria |
| 🇧🇩 Bangladesh | 🇯🇵 Japan | 🇲🇽 Mexico |
| 🇵🇭 Philippines | | |

Switching countries updates the entire UI — header gradient, accent colors, timeline content, topic cards, and the AI's system prompt — so every answer is scoped to the selected country.

---

### Election Timeline
A visual, phase-by-phase breakdown of the end-to-end election process for the selected country. Each phase contains expandable steps with detailed descriptions, for example:

- Announcement → Nomination → Scrutiny → Withdrawal → Campaigning → Silence Period → Polling → Counting → Government Formation (India)

Steps render as accessible `<details>`/`<summary>` accordions so users can browse at their own pace.

---

### Topic Cards
A grid of curated topic cards covering the key aspects of each country's electoral system. Example topics for India:

- 🏛️ Democracy Basics — Parliamentary system, Constitution, universal adult suffrage
- ⚖️ Election Commission — Autonomous body, CEC, cVIGIL, Voter Helpline 1950
- 🗳️ Types of Elections — Lok Sabha, Rajya Sabha, State Assembly, FPTP & STV
- 🖲️ EVM & VVPAT — How electronic voting machines work and their security features
- 📜 Model Code of Conduct — Campaign rules, enforcement, cVIGIL app
- 📖 Key Legislation — RPA 1950 & 1951, Anti-Defection Law, Delimitation Act

Each country has its own set of 10 tailored topic cards.

---

### AI Chat ("Ask")
A conversational Q&A interface powered by **Google Gemini 2.0 Flash** and a RAG pipeline:

1. The user's question is embedded using Google's `text-embedding-004` model.
2. The top-5 most relevant chunks are retrieved from a **ChromaDB** vector store built from the Markdown knowledge base.
3. Gemini generates a grounded, neutral answer using only the retrieved context.
4. Responses render with **Markdown formatting** (lists, bold, headers).
5. Country-specific **suggested questions** appear as quick-start chips.
6. The backend **caches** identical question + context + country combinations with `lru_cache` to avoid redundant API calls.

---

### Knowledge Base
A structured collection of Markdown documents covering electoral systems in depth:

| File | Content |
|---|---|
| `democracy_basics.md` | Parliamentary vs presidential systems, suffrage |
| `election_commission.md` | Role and powers of election bodies |
| `election_timeline.md` | Stage-by-stage election calendar |
| `electoral_system.md` | FPTP, proportional representation, mixed systems |
| `evm_vvpat.md` | Electronic voting machines and paper audit trails |
| `types_of_elections.md` | General, state, local, by-elections |
| `voter_registration.md` | Eligibility, registration procedures |
| `voting_process.md` | Polling day step-by-step guide |
| `model_code_of_conduct.md` | Campaign conduct rules |
| `post_election.md` | Counting, results, government formation |
| `key_legislation.md` | Major election laws and amendments |
| `*_elections.md` | Country-specific deep dives (USA, Brazil, Indonesia, etc.) |

---

## Tech Stack

### Frontend
- **React 18** with lazy-loaded components and `Suspense`
- **Tailwind CSS** for styling
- **Vite** as the build tool
- **ReactMarkdown** for rendering AI responses
- Accessibility-first: ARIA roles, skip-to-content link, keyboard navigation, screen-reader labels

### Backend
- **FastAPI** (Python) serving both the API and the built frontend static files
- **Google Gemini 2.0 Flash** — language model for answer generation
- **Google `text-embedding-004`** — embedding model for vector search
- **ChromaDB** — local persistent vector store
- **slowapi** — per-IP rate limiting (prevents abuse)
- **bleach** — input sanitization
- **GZip middleware** — response compression
- **Security headers** — CSP, HSTS, X-Frame-Options, etc.

### Deployment
- Configured for **Render** (`render.yaml`) — single service, free plan
- Build: Vite production build + pip install
- Start: `uvicorn main:app`
- Requires one environment variable: `GOOGLE_API_KEY`

---

## Security

- Rate limiting on the `/ask` endpoint (slowapi)
- HTML input sanitized with bleach before processing
- Strict Content Security Policy headers on every response
- HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff
- API key validated at startup; graceful 503 if missing

---

## Project Structure

```
election_process_edu/
├── render.yaml                  # Render deployment config
├── backend/
│   ├── main.py                  # FastAPI app, routes, middleware
│   ├── requirements.txt
│   ├── knowledge/               # Markdown knowledge base (per-country + shared)
│   │   ├── democracy_basics.md
│   │   ├── usa_elections.md
│   │   └── ...
│   ├── rag/
│   │   ├── embeddings.py        # ChromaDB index build & vector query
│   │   └── retriever.py        # RAG pipeline + Gemini generation
│   └── tests/
│       └── test_api.py
└── frontend/
    ├── src/
    │   ├── App.jsx              # Root component, country selector, tab navigation
    │   ├── components/
    │   │   ├── Chat.jsx         # AI chat interface
    │   │   ├── ElectionTimeline.jsx  # Timeline accordion
    │   │   └── TopicCards.jsx   # Topic card grid
    │   └── data/
    │       ├── countries.js     # Country config (flag, colors, id)
    │       ├── timelines.js     # Per-country timeline steps
    │       ├── topics.js        # Per-country topic cards
    │       └── suggestions.js   # Per-country suggested questions
    └── vite.config.js
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 20+
- A [Google AI Studio](https://aistudio.google.com/) API key

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # add your GOOGLE_API_KEY
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

For production, build the frontend first (`npm run build`) — the FastAPI server will serve the `dist/` folder automatically.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/ask` | Ask a question; returns `{ answer, sources }` |
| `POST` | `/index` | Rebuild the ChromaDB vector index from the knowledge base |
| `GET` | `/health` | Health check |
| `GET` | `/*` | Serves the React SPA |
