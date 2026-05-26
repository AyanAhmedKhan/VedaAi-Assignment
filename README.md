# VedaAI — AI Assessment Creator

An AI-powered assessment creator that lets teachers create assignments, generate structured question papers with an LLM, and view / download them as a clean exam-style PDF.

## Stack

**Frontend** — Next.js 15 (App Router) + TypeScript, Tailwind, Zustand, Zod (validation), Socket.IO client, `@react-pdf/renderer` (PDF export).

**Backend** — Node.js + Express + TypeScript, MongoDB (Mongoose), Redis, BullMQ (background generation jobs), Socket.IO (real-time status), Google Gemini (`gemini-2.0-flash`, free tier) with native JSON-schema response mode, Zod (server-side validation of the LLM output).

## Architecture

```
┌──────────────┐  POST /api/assignments     ┌──────────────┐
│  Next.js UI  │ ─────────────────────────▶ │  Express API │
│ (form +      │  GET /api/assignments/:id  │              │
│  output)     │                            │  Mongo       │
│              │                            │  Redis cache │
│  Socket.IO   │ ◀─────── ws events ──────▶ │  Socket.IO   │
└──────────────┘                            └──────┬───────┘
                                                   │ enqueue
                                                   ▼
                                            ┌──────────────┐
                                            │   BullMQ     │
                                            │   queue      │
                                            └──────┬───────┘
                                                   │ job
                                                   ▼
                                            ┌──────────────┐
                                            │   Worker     │
                                            │  LLM call    │
                                            │  Zod parse   │
                                            │  Mongo write │
                                            └──────┬───────┘
                                                   │ Redis pub/sub
                                                   ▼
                                            ┌──────────────┐
                                            │  API process │
                                            │  emits WS    │
                                            │  to client   │
                                            └──────────────┘
```

### Flow

1. Teacher fills the form, hits **Generate**.
2. Frontend validates with Zod, POSTs to `/api/assignments`.
3. API persists the assignment in Mongo with `status="pending"` and enqueues a BullMQ job.
4. Frontend navigates to `/output?id=<assignmentId>` and subscribes to the assignment's Socket.IO room.
5. Worker picks the job up, sets `status="processing"`, calls Gemini with `responseMimeType: "application/json"` and a typed `responseSchema` so the model returns structured data (sections / questions / difficulty / marks), Zod re-validates server-side, saves the structured result, sets `status="ready"`.
6. Worker publishes an `assignment:ready` event over Redis pub/sub; API broadcasts it via Socket.IO; the output page swaps from skeleton/spinner to the rendered paper.
7. Teacher can **Download as PDF** (rendered with `@react-pdf/renderer`, not raw HTML print) or **Regenerate**.

### Why structured output (not raw LLM HTML)

- The LLM returns JSON conforming to a strict schema (sections / questions / difficulty / marks / typeId).
- Zod validates the JSON server-side. Invalid outputs are rejected and the job is failed cleanly.
- The frontend renders from typed data — never from raw model text — so layout, badges, totals, and PDF stay consistent regardless of which model is used.

## Local setup

### 1. Start Mongo + Redis

```bash
docker compose up -d
```

### 2. Backend

```bash
cd server
cp .env.example .env
# .env.example already has a working Gemini free-tier key for local testing
# (set your own GEMINI_API_KEY for production)
npm install
npm run dev          # API (port 4000)
# in another terminal:
npm run worker       # BullMQ worker
```

### 3. Frontend

```bash
# from repo root
cp .env.local.example .env.local
npm install
npm run dev          # http://localhost:3000
```

Open http://localhost:3000, fill the form, click **Generate**. You'll be navigated to `/output?id=...` which shows a spinner, then live-updates to the generated paper via WebSocket.

## Environment

**`server/.env`**

| Var | Default | Notes |
|---|---|---|
| `PORT` | `4000` | Express |
| `CORS_ORIGIN` | `http://localhost:3000` | Frontend origin |
| `MONGO_URI` | `mongodb://localhost:27017/vedaai` | |
| `REDIS_URL` | `redis://localhost:6379` | Used by BullMQ + pub/sub |
| `GEMINI_API_KEY` | _empty_ | Empty → mock generator |
| `GEMINI_MODEL` | `gemini-2.0-flash` | Free tier |

**`.env.local`** (frontend)

| Var | Default |
|---|---|
| `NEXT_PUBLIC_API_BASE` | `http://localhost:4000` |

## API

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/assignments` | Create — body validated server-side with Zod, returns `{ id, jobId, status }` |
| `GET`  | `/api/assignments/:id` | Read — cached in Redis (1h) once `status="ready"` |
| `POST` | `/api/assignments/:id/regenerate` | Re-runs generation for an existing assignment |
| `GET`  | `/api/assignments` | List (most recent 50) |

### WebSocket events (`socket.io`)

- Client → `subscribe`, payload = assignmentId
- Server → `assignment:status`, `assignment:ready`, `assignment:failed`

## Features delivered

- ✅ Assignment form (file upload, due date, subject/grade/school, question types with steppers, instructions)
- ✅ Form validation (Zod) — no empty / non-positive values, max counts
- ✅ Zustand store for form + current assignment
- ✅ Express + TypeScript backend, MongoDB, Redis, BullMQ
- ✅ WebSocket real-time status updates
- ✅ Structured prompt + strict JSON schema; LLM output validated, never rendered as raw text
- ✅ Difficulty badges (Easy / Moderate / Hard)
- ✅ Section-grouped output with instructions and per-question marks
- ✅ Student info (Name / Roll / Section) with input lines
- ✅ Mobile responsive (separate mobile components)
- ✅ PDF download (proper formatted PDF, not HTML print)
- ✅ Regenerate action
- ✅ Redis caching of completed assignments
- ✅ Mock generator so the app runs end-to-end without any LLM key

## Project layout

```
/                       Next.js frontend
├─ src/app/             routes (/, /assignments, /assignments/empty, /output)
├─ src/components/      UI (incl. DifficultyBadge, AssignmentForm, AssignmentOutput)
├─ src/store/           Zustand stores
├─ src/hooks/           useAssignmentSocket
├─ src/lib/             api client, socket, pdf
└─ src/types/           shared types

/server                 backend
├─ src/index.ts         Express + Socket.IO entry
├─ src/worker.ts        BullMQ worker
├─ src/routes/          REST endpoints
├─ src/models/          Mongoose models
├─ src/services/llm.ts  Gemini integration (JSON schema mode) + mock fallback
├─ src/lib/schemas.ts   Zod input/output schemas
├─ src/lib/publish.ts   Redis pub/sub bridge
├─ src/queue.ts         BullMQ queue
├─ src/socket.ts        Socket.IO + Redis subscriber
├─ src/db.ts            Mongo connection
└─ src/redis.ts         Redis client
```
"# VedaAi-Assignment" 
