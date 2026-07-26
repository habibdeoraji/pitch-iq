# PitchIQ

Next.js (App Router) + TypeScript.

## Setup

```bash
cp .env.example .env.local   # fill in API keys
docker compose up -d         # local Postgres + pgvector
npm install
npm run dev
```

## Stack

- **Framework**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **LLM access**: `ai` (Vercel AI SDK) with `@ai-sdk/anthropic` / `@ai-sdk/openai`, plus the raw `@anthropic-ai/sdk` and `openai` SDKs
- **Database**: Postgres + pgvector (`docker-compose.yml`, client in `src/lib/db.ts`)
- **Tracing**: Langfuse, wired up via OpenTelemetry in `src/instrumentation.ts` — wrap new LLM routes with `observe()` from `@langfuse/tracing` (see the [langfuse skill](.claude/skills/langfuse) for the instrumentation pattern)
- **CI**: GitHub Actions runs lint + build on every push/PR to `main`

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — lint
