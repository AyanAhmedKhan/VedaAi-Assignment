<div align="center">

<img src="public/figma/screen1/logo-mark.svg" alt="VedaAI" width="64" height="64" />

# VedaAI — Hiring Assignment Submission

### AI Assessment Creator

**Submitted to:** Veda AI  
**Submitted by:** Ayan Ahmed Khan · [LinkedIn](https://www.linkedin.com/in/ayan-ahmed-khan-95978620a/) · ayan.ahmedkhan591@gmail.com

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

## 1. Submission Overview

This repository is my submission for the **VedaAI AI Assessment Creator** hiring assignment.

The brief asked for a system where a teacher can:
1. Create an assignment via a designed form
2. Generate a structured question paper using an LLM (no raw model output)
3. View the generated output in a clean, exam-style layout

I have delivered the **full system**: the pixel-perfect Figma-based frontend, a strict structured-output AI pipeline, a complete Node.js + Express + MongoDB + Redis + BullMQ + Socket.IO backend, and a self-contained Next.js fallback so the project runs end-to-end with **a single `npm run dev`** — without any external infrastructure — for fast review.

> **TL;DR for the reviewer:** open the repo, run `npm install && npm run dev`, click **Generate**. Everything works.

---

## 2. Spec compliance checklist

Every required item from the brief is implemented:

### 2.1 Assignment Creation (Frontend)
| Requirement | Status |
|---|:-:|
| Pixel-perfect Figma implementation | ✅ |
| File upload (PDF / TXT / image, optional) | ✅ |
| Due date field | ✅ |
| Question types (preset dropdown + custom) | ✅ |
| Number of questions + marks (steppers) | ✅ |
| Additional instructions | ✅ |
| Validation (no empty / negative) — Zod | ✅ |
| State management — **Zustand** | ✅ |
| WebSocket management — Socket.IO client | ✅ |

### 2.2 AI Question Generation
| Requirement | Status |
|---|:-:|
| Inputs → structured prompt | ✅ |
| Sections (A, B, ...) | ✅ |
| Questions with text | ✅ |
| Difficulty (Easy / Moderate / Hard) | ✅ |
| Per-question marks | ✅ |
| **Does not render raw LLM response** | ✅ (JSON schema + Zod re-validation) |

### 2.3 Backend System
| Requirement | Status |
|---|:-:|
| Node.js + Express + TypeScript | ✅ |
| MongoDB (Mongoose) | ✅ |
| Redis caching + job state | ✅ |
| BullMQ background jobs (generation, PDF) | ✅ |
| WebSocket real-time updates | ✅ Socket.IO + Redis pub/sub bridge |
| Flow: API → queue → worker → store → notify FE | ✅ |

### 2.4 Output Page (Enhanced)
| Requirement | Status |
|---|:-:|
| Student info inputs (Name / Roll / Section) | ✅ |
| Sections with titles + instructions | ✅ |
| Question text + difficulty tag + marks | ✅ |
| Real-exam visual hierarchy (bordered tables) | ✅ |
| Mobile responsive | ✅ |

### 2.5 Bonus Features
| Bonus | Status |
|---|:-:|
| Download as PDF (proper formatting, not HTML print) | ✅ `@react-pdf/renderer` |
| Action bar (Regenerate) | ✅ Full **and** per-question |
| Difficulty badges/tags | ✅ Colour-coded pills |

### 2.6 Pitfalls explicitly avoided
- ❌ Rendering raw AI response → ✅ schema-locked JSON + Zod
- ❌ Poor formatting / misaligned sections → ✅ bordered table layout per section
- ❌ Single block of text → ✅ proper banner, notes, student row, sectioned tables

---

## 3. Beyond the spec

Features I built to demonstrate end-to-end product thinking:

| Feature | Why it matters |
|---|---|
| **Per-question regenerate** | Click any sparkle icon → only that question is regenerated. Strict `avoidTexts` so it differs from siblings. Native AI workflow. |
| **Inline edit** | Click any question → in-place textarea → ⌘+Enter to save. Marks recalc automatically. Teachers always tweak AI output. |
| **Answer key toggle** | Gemini also emits a model `answerKey` per question; toggle shows them inline as emerald sub-rows. |
| **Copy as Markdown** | One-click clipboard export (with or without answers) for Docs / WhatsApp. |
| **Public share link** | `/share/<id>` read-only page gated behind a public API that exposes only safe fields. |
| **Print-friendly layout** | `@media print` hides chrome, paper goes edge-to-edge, table borders forced. |
| **Duplicate assignment** | One-click deep clone from the assignments list. |
| **Deep search in library** | Searches inside question text, highlights matches, ranked by hit count. |
| **Command palette** | ⌘/Ctrl+K global navigator with fuzzy search across pages + recent papers. |
| **Notifications + Profile + Settings + Analytics + Library + Groups** | Six additional pages, fully wired with API routes. |
| **Animated AI "thinking" UX** | Claude-style cycling status messages, gradient text, shimmer skeleton paper preview. |
| **Graceful Gemini fallback** | If Gemini fails (quota, network, anything) an offline question bank with realistic Class-8 questions kicks in, with a friendly amber banner — the demo never crashes. |
| **Dual runtime** | Same UI runs against internal Next.js Route Handlers (zero infra) OR the full Express + Mongo + Redis + BullMQ stack — toggled by one env var. |

---

## 4. Architecture

Two runtimes share the same UI. Flip between them with a single env variable.

### Mode A — self-contained (used for the live demo)
```
Next.js UI ─▶ /api/* (Route Handlers, Node runtime)
        │              │
        │ poll 1.5s    ▼
        └── In-memory store + notifications ─▶ Gemini (JSON mode)
                                                      │
                                                      └─ Zod re-validation
```

### Mode B — full architecture (spec-grade)
```
Next.js ──HTTP──▶ Express API ──▶ MongoDB
   │                  │
   │ Socket.IO       │ enqueue
   │  events         ▼
   │            Redis (BullMQ)
   │                  │
   │                  ▼
   │            BullMQ Worker ──▶ Gemini
   │                  │ Redis pub/sub
   └──────────────────┘
```

**Switch:** set `NEXT_PUBLIC_API_BASE=http://localhost:4000` to use Mode B; leave it blank for Mode A.

### Why structured output

The Gemini call uses:
```ts
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: { /* typed schema */ },
}
```

This forces Gemini to return JSON matching our schema (sections, questions, difficulty, marks, typeId, answerKey). Zod re-validates server-side. The frontend renders from typed data — **never** raw model text. A model swap is one line; rendering is untouched.

---

## 5. Tech stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 15 (App Router) · TypeScript · Tailwind · Zustand (3 stores: form, assignment, profile) · Zod · `@react-pdf/renderer` · Socket.IO client (Mode B) |
| **Internal API (Mode A)** | Next.js Route Handlers · in-memory store (HMR-safe via `globalThis`) · Zod request validation · `@google/generative-ai` |
| **Backend (Mode B)** | Node.js · Express · TypeScript · Mongoose · ioredis · BullMQ · Socket.IO + Redis pub/sub |
| **AI** | Google Gemini 2.5 Flash with native JSON-schema response mode |
| **Persistence (client)** | Zustand `persist` middleware → localStorage for profile / settings |

---

## 6. Quick start

### A. Zero-infra demo (recommended for review)
```bash
git clone https://github.com/AyanAhmedKhan/VedaAi-Assignment
cd VedaAi-Assignment
cp .env.local.example .env.local      # already has a Gemini free-tier key
npm install
npm run dev
```
Open <http://localhost:3000>, fill the form, click **Generate**.

### B. Full backend (Mode B)
```bash
docker compose up -d                  # Mongo + Redis

cd server
cp .env.example .env
npm install
npm run dev                           # Express + Socket.IO :4000
npm run worker                        # BullMQ worker (new terminal)

cd ..
echo "NEXT_PUBLIC_API_BASE=http://localhost:4000" >> .env.local
npm run dev                           # Next.js :3000
```

---

## 7. Environment variables

### Root `.env.local`
| Var | Notes |
|---|---|
| `GEMINI_API_KEY` | Gemini AI key. Leave empty → automatic offline mode. |
| `GEMINI_MODEL` | Default `gemini-2.5-flash`. |
| `AI_DAILY_LIMIT` | Max AI generations per IP per UTC day. Default **5**. Beyond this, the offline question bank is used. |
| `UPSTASH_REDIS_REST_URL` | **Recommended on Vercel.** Free Redis at upstash.com. Without it the in-memory store is used (won't survive serverless cold starts). |
| `UPSTASH_REDIS_REST_TOKEN` | Companion to the URL. |
| `NEXT_PUBLIC_API_BASE` | Empty (Mode A) or Express URL (Mode B). |

### `server/.env`
| Var | Default |
|---|---|
| `PORT` | `4000` |
| `CORS_ORIGIN` | `http://localhost:3000` |
| `MONGO_URI` | `mongodb://localhost:27017/vedaai` |
| `REDIS_URL` | `redis://localhost:6379` |
| `GEMINI_API_KEY` | _empty → mock_ |
| `GEMINI_MODEL` | `gemini-2.5-flash` |

---

## 8. API surface (internal `/api/*`)

| Method | Path | Purpose |
|---|---|---|
| `GET / POST` | `/api/assignments` | List · Create |
| `GET / DELETE` | `/api/assignments/:id` | Read · Delete |
| `POST` | `/api/assignments/:id/regenerate` | Full re-generation |
| `POST` | `/api/assignments/:id/duplicate` | Deep clone |
| `PATCH` | `/api/assignments/:id/questions/:section/:q` | Inline-edit one question |
| `POST` | `/api/assignments/:id/questions/:section/:q` | Regenerate one question |
| `GET / POST` | `/api/notifications` | List · Mark all read |
| `GET` | `/api/analytics` | KPIs, by-status / subject / grade, difficulty mix, 7-day histogram |
| `GET` | `/api/share/:id` | Public read-only payload for `/share/<id>` |

**WebSocket events (Mode B):** `assignment:status`, `assignment:ready`, `assignment:failed`.

---

## 9. Project layout

```
VedaAI/
├─ src/app/
│  ├─ page.tsx                     Create form
│  ├─ assignments/                 List + empty state
│  ├─ output/                      Generated paper (live)
│  ├─ analytics/                   KPIs + charts
│  ├─ library/                     Deep search across questions
│  ├─ profile/  settings/  groups/ Workspace pages
│  ├─ share/[id]/                  Public read-only share view
│  ├─ api/                         Route Handlers (Mode A)
│  ├─ icon.svg  apple-icon.svg     Favicons
│  └─ globals.css                  Tailwind + print + thinking animations
├─ src/components/                 ~25 components — all typed, mobile-aware
├─ src/server/                     Server-only modules (Gemini + mock + store)
├─ src/store/                      Zustand stores
├─ src/hooks/useAssignmentSocket   Socket / polling abstraction
├─ src/lib/                        api client · pdf · markdown export · socket
├─ server/                         Mode B — Express + BullMQ + Mongo + Redis
├─ docker-compose.yml              Mongo + Redis
├─ .vercelignore                   Excludes /server from Vercel builds
└─ next.config.ts
```

---

## 10. Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘/Ctrl + K` | Open command palette |
| `⌘/Ctrl + Enter` | Submit the create form |
| `Esc` | Close any dropdown / dialog / palette |
| `↑ / ↓ / Enter` | Palette navigation |

---

## 11. Deployment

The repository is **Vercel-ready**. The Mode-A pipeline runs entirely inside Next.js Route Handlers, so a single click deploys the full Generate → render → PDF → share flow.

**Quick deploy:**
1. Push to GitHub (already done — <https://github.com/AyanAhmedKhan/VedaAi-Assignment>)
2. Import on Vercel → framework auto-detects Next.js
3. Set `GEMINI_API_KEY` and `GEMINI_MODEL` env vars
4. Deploy

For the full Mode-B architecture, deploy `/server` to Railway / Render / Fly, point a managed Mongo Atlas + Upstash Redis at it, and set `NEXT_PUBLIC_API_BASE` on Vercel — same UI, real WebSockets and BullMQ.

---

## 12. What I'd build next (if hired)

- Student-side fillable mode + AI auto-grading
- Rubric-based grading for long-answer questions
- OCR an existing worksheet → generate similar questions (Gemini vision)
- Version history per assignment with diff
- Real-time multi-teacher collab (WS infrastructure already in place)
- Difficulty-mix slider & Bloom's Taxonomy tagging

---

## 13. Author

<div align="center">

### Built end-to-end by **Ayan Ahmed Khan**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ayan%20Ahmed%20Khan-0A66C2?logo=linkedin&logoColor=fff)](https://www.linkedin.com/in/ayan-ahmed-khan-95978620a/)
[![Email](https://img.shields.io/badge/Email-ayan.ahmedkhan591%40gmail.com-EA4335?logo=gmail&logoColor=fff)](mailto:ayan.ahmedkhan591@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-AyanAhmedKhan-181717?logo=github&logoColor=fff)](https://github.com/AyanAhmedKhan)

Thank you for the opportunity to work on this assignment for **Veda AI**.

</div>
