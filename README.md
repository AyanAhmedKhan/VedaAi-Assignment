<div align="center">

<img src="public/figma/screen1/logo-mark.svg" alt="VedaAI" width="64" height="64" />

# VedaAI

### AI Assessment Creator for K-12 teachers

Generate **exam-ready question papers** in seconds — sections, difficulty, marks, answer keys, and a downloadable PDF.

[![Next.js](https://img.shields.io/badge/Next.js-15-000?logo=next.js&logoColor=fff)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=fff)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-3a3a3a)](https://github.com/pmndrs/zustand)
[![Gemini](https://img.shields.io/badge/Gemini%202.5-Flash-4285F4?logo=google&logoColor=fff)](https://ai.google.dev/)
[![Express](https://img.shields.io/badge/Express-5-000)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb&logoColor=fff)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=fff)](https://redis.io/)
[![BullMQ](https://img.shields.io/badge/BullMQ-5-fff?logo=redis&logoColor=DC382D)](https://docs.bullmq.io/)

</div>

---

## ✨ What it does

A teacher fills a single form (subject, class, question types, marks, instructions), hits **Generate**, and watches an AI build a complete, exam-style question paper in real time — with proper sections, bordered tables, difficulty tags, answer keys, and a clean PDF.

The output isn't a raw LLM dump — it's a **typed JSON document** the model is forced to return, validated server-side with Zod, then rendered with the same care you'd give an HTML report.

## 🎯 Highlights

- 🧠 **Gemini 2.5 Flash** with native JSON-schema response mode — the model *must* return data matching our schema
- 🛡️ **Zod re-validates server-side** — never renders raw model text
- ⚡ **End-to-end live updates** — WebSocket (full stack) or polling (zero-infra demo)
- 🎨 **Pixel-perfect Figma implementation** — every screen matches the design spec
- 📱 **Fully mobile-responsive** — separate optimized layouts under `lg`
- 🖨️ **Print-friendly + React-PDF export** — both options ship
- 🧩 **Dual runtime** — runs standalone on Vercel **or** with full Express + Mongo + Redis + BullMQ + Socket.IO

## 🚀 Feature tour

### Create flow
- **Smart form** with subject/grade dropdowns + "Add custom" option (11 subject presets, 12 grades)
- **Question-type picker** with 10 presets (MCQ, T/F, Fill-in-the-Blanks, Short, Long, Diagram, Numerical, Case Study, Match, Essay) — custom labels supported
- **Number steppers** for counts and marks
- **File upload** (PDF / TXT / image) for reference material
- **Validation** with Zod — no empty / negative values, max bounds, friendly inline errors
- **⌘/Ctrl+Enter** submits from anywhere on the page

### Generation (the AI bit)
- **Strict prompt** — schema-locked output. The model returns sections / questions / difficulty / marks / **answerKey** as JSON.
- **Animated "thinking" UX** — Claude-style cycling status messages with brand-orange gradient text, pulsing dot, and shimmer skeleton mimicking the real paper layout
- **Graceful fallback** — if Gemini fails (429 quota, network, anything), an **offline question bank** with realistic Class-8 questions kicks in and a soft amber banner appears: *"Gemini free-tier quota exceeded — used the offline generator."*
- **No crash modes** — every job either succeeds or fails cleanly

### Output paper
- **Exam-paper layout** — uppercase banner, Note section, bordered Student-info row, **per-section tables** with No. / Question / Marks / Type / Difficulty
- **Color-coded difficulty pills** — Easy 🟢 / Moderate 🟡 / Hard 🔴
- **Per-question regenerate** ✨ — click the sparkle on any row, only that question is regenerated via Gemini (with `avoidTexts` so it doesn't duplicate siblings)
- **Inline edit** — click any question text → in-place textarea with ⌘+Enter save / Esc cancel. Marks recalculate automatically.
- **Answer key toggle** 👁️ — show/hide model answers under each question (emerald sub-row)
- **Copy as Markdown** — paste into Google Docs, WhatsApp, anywhere. Includes answers if toggled on.
- **Share link** 🔗 — `/share/<id>` public read-only page, link auto-copied to clipboard
- **Print** 🖨️ — `@media print` styles hide chrome and render the paper edge-to-edge
- **Download PDF** 📥 — proper A4 layout via `@react-pdf/renderer`, **not** HTML print; bordered tables, zebra rows, color-coded difficulty pills

### Lists & search
- **Assignments page** — live list (auto-refresh 3s), search box, status filter, status pills (pending / processing / ready / failed), per-card menu (View / **Duplicate** / Delete)
- **Library page** — searches **inside question text**, ranked by hit count, with `<mark>` highlight on matches and snippet previews per card

### Workspace
- **Notifications** 🔔 — bell icon with unread badge, modern glass dropdown, "Mark all read", clicking jumps to the paper. Auto-refreshes every 5s.
- **Profile menu** — avatar header card with online-status ring, role pill, grouped sections (Account / Workspace), per-item icon tiles, hover chevrons
- **Profile page** — editable name / email / role / school / bio, persisted to `localStorage`
- **Settings page** — defaults for new papers (subject / grade / school), theme preference, notification toggles
- **Analytics page** — KPIs (total assignments / questions / marks / subjects), 4 bar-chart cards (status, difficulty mix, by subject, by grade), 7-day spark histogram
- **Groups page** + **Library page** with full styling

### Power-user
- **Command palette** ⌘/Ctrl+K — fuzzy-searchable global navigator with three groups (Actions / Navigate / Library). Recent papers appear directly as commands.
- **⌘/Ctrl+Enter** to submit forms
- **Esc** closes any open dropdown / palette / dialog

## 🧱 Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) · TypeScript · Tailwind · Zustand (form + assignment + profile stores) · Zod (validation) · `@react-pdf/renderer` (PDF) · Socket.IO client (when external backend is configured) |
| Internal API | Next.js Route Handlers · in-memory store (survives HMR via `globalThis`) · Zod (request validation) · `@google/generative-ai` |
| External backend | Node.js · Express · TypeScript · Mongoose (MongoDB) · ioredis + BullMQ (queue + cache) · Socket.IO server + Redis pub/sub bridge |
| AI | Google Gemini 2.5 Flash with `responseMimeType: "application/json"` + typed `responseSchema` — strict JSON output |
| Auth-lite | Zustand `persist` middleware for profile + settings (localStorage) |

## 🏗️ Architecture

Two runtimes live in the same repo. Both use the **same UI** — the only difference is whether the API and worker run in-process (Next.js Route Handlers) or as a separate Node service.

```
┌────────────────────────────────────────────────────────┐
│ Mode A — self-contained (Vercel / npm run dev)        │
│                                                        │
│  Next.js App ──▶ /api/* (Route Handlers, Node runtime) │
│         ▲                  │                           │
│         │  poll 1.5s       ▼                           │
│         └────── In-memory Map  ──▶  Gemini (JSON mode) │
│                  + Notifications              │        │
│                                               └─ Zod ──┘
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Mode B — full architecture (matches spec)              │
│                                                        │
│  Next.js  ──HTTP──▶  Express API  ──▶  MongoDB         │
│      │                    │                            │
│      │ Socket.IO          │ enqueue                    │
│      │ events             ▼                            │
│      │              Redis (BullMQ)                     │
│      │                    │                            │
│      │                    ▼                            │
│      │              BullMQ Worker  ──▶  Gemini         │
│      │                    │ Redis pub/sub              │
│      └────────────────────┘                            │
└────────────────────────────────────────────────────────┘
```

Toggle is **one env var**: set `NEXT_PUBLIC_API_BASE=http://localhost:4000` to use Mode B; leave it blank for Mode A.

## ⚡ Quick start (Mode A — zero infra)

```bash
git clone <repo>
cd VedaAI
cp .env.local.example .env.local   # already has a Gemini free-tier key
npm install
npm run dev
```

Open <http://localhost:3000>. Fill the form, click **Generate**, watch the paper appear.

## 🏭 Full stack (Mode B)

```bash
# 1. infra
docker compose up -d                # Mongo + Redis

# 2. backend (2 terminals)
cd server
cp .env.example .env
npm install
npm run dev                         # Express + Socket.IO on :4000
npm run worker                      # BullMQ worker

# 3. frontend (repo root)
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000" >> .env.local
npm run dev                         # Next.js on :3000
```

## 🔐 Environment

### Root `.env.local`
| Var | Notes |
|---|---|
| `GEMINI_API_KEY` | Gemini AI key (free tier works). Leave empty → automatic offline-mode |
| `GEMINI_MODEL` | Default `gemini-2.5-flash` |
| `NEXT_PUBLIC_API_BASE` | Leave empty (Mode A) or set to the Express URL (Mode B) |

### `server/.env`
| Var | Default |
|---|---|
| `PORT` | `4000` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `MONGO_URI` | `mongodb://localhost:27017/vedaai` |
| `REDIS_URL` | `redis://localhost:6379` |
| `GEMINI_API_KEY` | _empty → mock_ |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

## 🛣️ API surface (internal `/api/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET / POST` | `/api/assignments` | List · Create (validated with Zod) |
| `GET / DELETE` | `/api/assignments/:id` | Read · Delete |
| `POST` | `/api/assignments/:id/regenerate` | Full re-generation of a paper |
| `POST` | `/api/assignments/:id/duplicate` | Deep clone an assignment |
| `PATCH` | `/api/assignments/:id/questions/:section/:q` | Inline-edit one question (text / difficulty / marks / answerKey) |
| `POST` | `/api/assignments/:id/questions/:section/:q` | Regenerate one question via Gemini |
| `GET / POST` | `/api/notifications` | List · Mark all read |
| `GET` | `/api/analytics` | KPIs, by-status / by-subject / by-grade, difficulty mix, 7-day histogram |
| `GET` | `/api/share/:id` | Public read-only payload for `/share/<id>` |

### WebSocket events (Mode B)
- Client → `subscribe(assignmentId)`
- Server → `assignment:status`, `assignment:ready`, `assignment:failed`

## 🗂️ Project layout

```
VedaAI/
├─ src/app/
│  ├─ page.tsx                     Create form
│  ├─ assignments/                 List + empty state
│  ├─ output/                      Generated paper (live)
│  ├─ analytics/                   KPIs + charts
│  ├─ library/                     Deep search across questions
│  ├─ profile/  settings/  groups/ Workspace pages
│  ├─ share/[id]/                  Public share view
│  ├─ api/                         Route Handlers (Mode A backend)
│  │  ├─ assignments/route.ts
│  │  ├─ assignments/[id]/route.ts
│  │  ├─ assignments/[id]/regenerate/route.ts
│  │  ├─ assignments/[id]/duplicate/route.ts
│  │  ├─ assignments/[id]/questions/[section]/[q]/route.ts
│  │  ├─ notifications/route.ts
│  │  ├─ analytics/route.ts
│  │  └─ share/[id]/route.ts
│  ├─ icon.svg  apple-icon.svg     Favicons
│  └─ globals.css                  Tailwind + print + thinking animations
├─ src/components/
│  ├─ AssignmentForm + Mobile      Validated multi-field form
│  ├─ AssignmentOutput             Live paper, inline edit, regenerate
│  ├─ PaperSkeleton                Shimmer loading
│  ├─ ThinkingIndicator            Animated cycling status
│  ├─ DifficultyBadge
│  ├─ PresetCombobox               Subject / Grade dropdown with custom
│  ├─ QuestionTypeSelect           10 preset question types
│  ├─ TopBar                       Notifications + profile dropdowns
│  ├─ Sidebar                      Nav + CTA
│  ├─ CommandPalette               ⌘/Ctrl+K global navigator
│  ├─ AnalyticsPanel · ProfilePanel · SettingsPanel · LibraryPanel
│  └─ SharePaper                   Public read-only view
├─ src/server/                     Server-only modules (Node runtime)
│  ├─ llm.ts                       Gemini call · single-question regenerate · mock
│  ├─ mockBank.ts                  Realistic Class-8 question bank
│  ├─ store.ts                     In-memory assignments + notifications
│  └─ validate.ts                  Zod request schemas
├─ src/store/                      Zustand (form, assignment, profile/settings)
├─ src/hooks/useAssignmentSocket   Socket / polling abstraction
├─ src/lib/
│  ├─ api.ts                       Typed client
│  ├─ pdf.tsx                      React-PDF document
│  ├─ paper-export.ts              Markdown + clipboard
│  └─ socket.ts                    Socket.IO client (Mode B)
├─ server/                         Mode B — Express + BullMQ + Mongo + Redis
│  └─ src/{index,worker,routes,models,services,lib}.ts
├─ docker-compose.yml              Mongo + Redis
└─ next.config.ts
```

## ⌨️ Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + K` | Open command palette |
| `⌘/Ctrl + Enter` | Submit the create form from anywhere |
| `Esc` | Close any dropdown / dialog / palette |
| `↑ / ↓` | Navigate within the palette |
| `Enter` | Select highlighted result |

## 🧪 Why structured output (and not raw model text)

The Gemini call uses:
```ts
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: { /* typed schema */ },
}
```

This forces Gemini to return JSON that conforms to our schema (sections, questions, difficulty, marks, typeId, answerKey). On top of that, Zod re-validates server-side, so any malformed output is rejected cleanly. The frontend renders from typed data — **never** from raw model text — which means:

- Layout, badges, totals, and PDF stay consistent regardless of which model is used
- The same render path works for Gemini output, the offline mock, and inline-edited data
- A model upgrade swaps one line — no rendering changes

## ☁️ Deployment

**Mode A (recommended for demo):** Push to GitHub → import to Vercel → set `GEMINI_API_KEY` env var → deploy. Done.

**Mode B (full architecture):** Vercel for frontend + Railway / Render / Fly for backend + worker + managed Mongo (Atlas) + Redis (Upstash). Set `NEXT_PUBLIC_API_BASE` on the frontend and the same UI starts using real WebSockets and BullMQ.

## 🗺️ Roadmap ideas (not built)

- Student-side fillable mode + AI auto-grading
- Assign papers to groups (use `/groups`)
- Rubric-based grading for long-answer questions
- OCR an existing worksheet → generate similar questions (Gemini vision)
- Version history & diff per assignment
- Real-time multi-teacher collaborative editing (WS infra already in place)
- Difficulty-mix slider on the form (Easy / Moderate / Hard %)
- Bloom's Taxonomy tag column

## 📜 License

MIT.

---

<div align="center">

**Built with ❤️ by [Ayan Ahmadkhan](mailto:tech@discoverventures.in)**

_Designed end-to-end: pixel-perfect UI, structured AI prompts, dual-runtime architecture, full feature suite._

</div>
