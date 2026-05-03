# Election Process Education Assistant

> **Problem Statement:** *Create an assistant that helps users understand the election process, timelines, and steps in an interactive and easy-to-follow way.*

An interactive, AI-powered web application that makes election processes accessible to everyone — citizens, students, first-time voters, and researchers — across the world's largest democracies. The app breaks down complex electoral systems into clear, step-by-step timelines, visual topic guides, and a conversational AI that answers questions in plain language, with support for native-language translation and audio playback.

---

## Problem This Solves

Understanding how elections work is fundamental to a functioning democracy — yet the information is often scattered across government websites, buried in legal texts, or presented in ways that are hard to follow for ordinary citizens. First-time voters especially struggle to answer basic questions:

- *When do I register? By what deadline?*
- *What happens between voting day and the new government taking office?*
- *How does the Electoral College / proportional representation / FPTP actually work?*
- *What is the Model Code of Conduct and why does it matter?*

This assistant answers all of these — clearly, neutrally, and in the user's own language — for 10 of the world's largest democracies.

---

## How It Works

The app has three complementary learning modes, designed for different types of users:

### 1. Election Timeline (Step-by-Step)
A structured, phase-by-phase breakdown of the complete election cycle for the selected country. Each phase (e.g. Pre-Election → Nomination → Campaigning → Polling → Counting → Government Formation) expands to reveal detailed explanations of each step. Users can navigate at their own pace, opening only the steps they want to understand. An interactive **Google Maps embed** gives geographic context, and **YouTube election explainer videos** are surfaced automatically for each country.

**Why it matters:** Many people know there's a "voting day" but have no mental model of the months-long process surrounding it. The timeline makes the full arc visible and navigable.

### 2. Topic Cards (Guided Exploration)
A curated grid of 10 topic cards per country, each summarising a key pillar of that country's electoral system — from how the election body works, to the specific voting technology used, to the major laws that govern campaigns. Cards are tailored per country: India's cards cover EVMs and the Model Code of Conduct; the USA's cover the Electoral College and campaign finance; Indonesia's cover the KPU and multi-party system.

**Why it matters:** Users who don't know what they don't know can browse structured starting points rather than having to formulate a search query.

### 3. AI Chat (Ask Anything)
A conversational interface powered by **Google Gemini 2.0 Flash** and a Retrieval-Augmented Generation (RAG) pipeline. The user types any question in natural language; the system retrieves the most relevant passages from a curated knowledge base and asks Gemini to synthesise a grounded, neutral answer. Responses are formatted with bullet points and headings for easy reading.

**Why it matters:** Timelines and cards cover what we anticipate — the chat handles everything else. A voter in the Philippines who wants to know specifically about overseas absentee voting, or a student who wants to compare FPTP vs proportional representation, gets an accurate answer in seconds.

Additional accessibility features on every AI answer:
- 🔈 **Listen** — Google Cloud Text-to-Speech reads the answer aloud in the country's language
- 🌐 **Translate** — Google Cloud Translation renders the answer in the country's native script (Hindi, Bahasa Indonesia, Portuguese, Urdu, Yoruba, Bengali, Japanese, Spanish, Filipino)

---

## Supported Countries

| Country | Electoral System | Key Body |
|---|---|---|
| 🇮🇳 India | First-Past-The-Post (FPTP) | Election Commission of India |
| 🇺🇸 United States | Electoral College + FPTP | Federal Election Commission |
| 🇮🇩 Indonesia | Proportional representation | KPU (General Elections Commission) |
| 🇧🇷 Brazil | Two-round system + proportional | TSE (Superior Electoral Court) |
| 🇵🇰 Pakistan | FPTP | Election Commission of Pakistan |
| 🇳🇬 Nigeria | FPTP | INEC (Independent National Electoral Commission) |
| 🇧🇩 Bangladesh | FPTP | Bangladesh Election Commission |
| 🇯🇵 Japan | Mixed: FPTP + proportional | Ministry of Internal Affairs |
| 🇲🇽 Mexico | Two-round + proportional | INE (National Electoral Institute) |
| 🇵🇭 Philippines | FPTP + party-list | COMELEC |

---

## Features at a Glance

| Feature | Description |
|---|---|
| **Interactive Timeline** | Phase-by-phase accordion breakdown of the full election cycle |
| **Topic Cards** | 10 curated cards per country on key electoral concepts |
| **AI Chat** | Natural-language Q&A grounded in a curated knowledge base |
| **Suggested Questions** | Country-specific quick-start prompts in the chat |
| **Listen (TTS)** | Audio playback of AI answers via Google Cloud Text-to-Speech |
| **Translate** | One-click translation to the country's native language |
| **Country Map** | Google Maps embed showing the selected country |
| **YouTube Videos** | Curated election explainer videos per country |
| **Multi-country theming** | Flag-inspired color scheme, updated per country |
| **Accessible UI** | ARIA roles, skip-to-content, keyboard navigation, screen-reader labels |

---

## Knowledge Base

A structured collection of Markdown documents, each covering a specific aspect of electoral systems. The RAG pipeline chunks and embeds these at startup, then retrieves the most relevant passages for each question.

| Document | Content |
|---|---|
| `democracy_basics.md` | Parliamentary vs presidential systems, suffrage, separation of powers |
| `election_commission.md` | Role, powers, and independence of election management bodies |
| `election_timeline.md` | Stage-by-stage calendar: announcement → government formation |
| `electoral_system.md` | FPTP, proportional representation, mixed systems, ranked choice |
| `evm_vvpat.md` | Electronic voting machines, VVPAT audit trails, security features |
| `types_of_elections.md` | General, state, local, by-elections, referendums |
| `voter_registration.md` | Eligibility criteria, registration procedures, deadlines |
| `voting_process.md` | Polling day step-by-step: arrival → casting → counting |
| `model_code_of_conduct.md` | Campaign conduct rules, enforcement, cVIGIL app |
| `post_election.md` | Vote counting, result declaration, government formation |
| `key_legislation.md` | Major laws: RPA, BCRA, anti-defection, delimitation |
| `*_elections.md` | Country-specific deep dives (one per supported country) |

---

## Google Services Used

| Service | How It's Used |
|---|---|
| **Gemini 2.0 Flash** | Generates grounded answers from retrieved knowledge base context |
| **text-embedding-004** | Embeds questions and knowledge chunks for semantic vector search |
| **Google Cloud Translation API** | Translates AI answers into the country's native language on demand |
| **Google Cloud Text-to-Speech API** | Reads AI answers aloud in the country's language/accent |
| **Google Maps Embed API** | Shows an interactive map of the selected country on the Timeline page |
| **YouTube Data API v3** | Fetches relevant election explainer videos per country |
| **Google Analytics 4** | Tracks engagement: questions asked, country switches, tab changes, translate/listen usage |
| **Google Cloud Logging** | Structured server-side logging for monitoring and debugging |

---

## Tech Stack

### Frontend
- **React 18** with lazy-loaded components and `Suspense`
- **Tailwind CSS** for styling
- **Vite 5** as the build tool
- **ReactMarkdown** for rendering AI responses
- Accessibility-first: ARIA roles, skip-to-content link, keyboard navigation, screen-reader labels

### Backend
- **FastAPI** (Python) — serves both the API and the built frontend static files
- **Google Gemini 2.0 Flash** — LLM for answer generation (`google-genai` SDK)
- **Google `text-embedding-004`** — embedding model for RAG vector search
- **ChromaDB** — local persistent vector store
- **httpx** — async HTTP client for YouTube API calls
- **slowapi** — per-IP rate limiting on all endpoints
- **bleach** — input sanitisation (XSS prevention)
- **GZip middleware** — response compression
- **Security headers** — CSP, HSTS, X-Frame-Options, CORP, COOP, etc.

### Deployment
- Configured for **Render** (`render.yaml`) — single web service, free plan
- Build: Vite production build + `pip install -r requirements.txt`
- Start: `uvicorn main:app`

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Google AI Studio key — powers Gemini + embeddings |
| `GOOGLE_CLOUD_API_KEY` | Recommended | GCP API key — enables Translation, TTS, YouTube (falls back to `GOOGLE_API_KEY`) |
| `YOUTUBE_API_KEY` | Optional | YouTube Data API v3 key (falls back to `GOOGLE_CLOUD_API_KEY`) |
| `INDEX_ADMIN_TOKEN` | Optional | Protects the `/index` rebuild endpoint |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | Optional | GA4 Measurement ID (e.g. `G-XXXXXXXXXX`) |
| `VITE_GOOGLE_MAPS_API_KEY` | Optional | Maps Embed API key (keyless fallback works without it) |

All Google services degrade gracefully — the app remains fully functional even without optional keys.

---

## Security

- Rate limiting on all endpoints via slowapi (per-IP)
- All user inputs sanitised with bleach before processing
- Strict Content Security Policy on every response (allows only known Google domains)
- `country` and `language` fields validated against explicit whitelists — no arbitrary strings reach the AI or external APIs
- YouTube `video_id` validated (11-char alphanumeric) before embedding in iframes
- Path traversal protection on static file serving: `resolve()` + `is_relative_to()` check
- FastAPI docs/schema endpoints (`/docs`, `/redoc`, `/openapi.json`) disabled in production
- HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, CORP, COOP, X-Permitted-Cross-Domain-Policies: none

---

## Project Structure

```
election_process_edu/
├── render.yaml                       # Render deployment config
├── backend/
│   ├── main.py                       # FastAPI app, routes, middleware, security
│   ├── requirements.txt
│   ├── .env.example
│   ├── knowledge/                    # Markdown knowledge base (per-country + shared)
│   │   ├── democracy_basics.md
│   │   ├── election_timeline.md
│   │   ├── india_elections.md        # (via state_elections/ folder)
│   │   ├── usa_elections.md
│   │   └── ...
│   ├── rag/
│   │   ├── embeddings.py             # ChromaDB index build & vector query
│   │   └── retriever.py             # RAG pipeline + Gemini generation
│   └── tests/
│       └── test_api.py              # 65 backend tests, 94% coverage
└── frontend/
    ├── index.html                    # GA4 script
    ├── src/
    │   ├── App.jsx                   # Root: country selector, tab navigation
    │   ├── components/
    │   │   ├── Chat.jsx              # AI chat with Listen + Translate
    │   │   ├── ElectionTimeline.jsx  # Timeline accordion + Google Map + YouTube
    │   │   ├── TopicCards.jsx        # Topic card grid
    │   │   └── YouTubeVideos.jsx     # YouTube video cards with per-country fallbacks
    │   ├── utils/
    │   │   └── analytics.js          # GA4 event helpers
    │   ├── data/
    │   │   ├── countries.js          # Country config (flag, colors, language, mapQuery)
    │   │   ├── timelines.js          # Per-country timeline phases and steps
    │   │   ├── topics.js             # Per-country topic cards
    │   │   └── suggestions.js        # Per-country suggested questions
    │   └── test/                     # 58 frontend tests (Vitest + Testing Library)
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
cp .env.example .env        # fill in GOOGLE_API_KEY and optional keys
python3 -m uvicorn main:app --reload --app-dir .
```

### Frontend

```bash
cd frontend
cp .env.example .env.local  # fill in optional keys
npm install
npm run dev
```

For production, build the frontend first (`npm run build`) — the FastAPI server will serve the `dist/` folder automatically.

### Running Tests

```bash
# Backend (65 tests)
cd backend && python3 -m pytest tests/ -v --cov=main --cov=rag

# Frontend (58 tests)
cd frontend && npm test
```

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/ask` | Ask a question; returns `{ answer, sources }` |
| `POST` | `/translate` | Translate text to target language; returns `{ translated_text, source_language, target_language }` |
| `POST` | `/tts` | Convert text to speech; returns `{ audio_base64, language_code }` |
| `GET` | `/youtube/{country}` | Fetch election explainer videos for a country via YouTube Data API v3 |
| `POST` | `/index` | Rebuild the ChromaDB vector index from the knowledge base |
| `GET` | `/health` | Health check — returns `{ status: "ok" }` |
| `GET` | `/*` | Serves the React SPA (production only) |
