# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Required env vars

- `DATABASE_URL` — Postgres
- `SESSION_SECRET` — express-session
- `GPTZERO_API_KEY` — AI-detection scoring on every student submission. If absent, submissions still succeed; their `aiStatus` is recorded as `failed`.

## Architecture decisions

- AI-detection (GPTZero) runs **after** insert in a fire-and-forget background task in `routes/submissions.ts`; the POST returns immediately with `aiStatus: "pending"`. The web client polls `GET /submissions/module/:id` (and the assessments list) every 2–2.5s while any submission is still pending. If a submission carries `finalAiScore` from the live canvas, the background check is skipped. See `artifacts/api-server/src/lib/gptzero.ts` and `artifacts/phil-101/src/components/ai-score-badge.tsx`.
- **Integrity Canvas** (per assignment): two-box workflow on `/modules/:id`. Box 1 (`draft-workshop.tsx`) — single-shot AI feedback in 5 sections; once feedback is fetched the draft is locked (`assignment_drafts` table). Box 2 (`integrity-canvas.tsx`) — paste-blocked contentEditable+overlay editor, real-time GPTZero scoring (debounced ≥30 chars / 200-char bursts) with sentence-level highlighting, autosave every 5s to `canvas_sessions`, full keystroke log, traffic-light bar, and a 30-s cumulative-red warning. Submit on red prompts a confirm dialog; submission ships with `keystrokes`, `scoreHistory`, `finalAiScore`, `flaggedOnSubmit`. The server computes an `activityReport` (`lib/activityReport.ts`) on insert. Accommodated students (admin toggle) get a plain textarea and skip monitoring.
- **One-time integrity disclosure**: shown via `IntegrityDisclosureGate` modal on first module page load. `students.integrityAckAt` defaults to epoch 0; gate treats epoch as "not acked". Acknowledgment via `POST /api/integrity/ack`.
- **Course content**: Statistics 101 (`STAT 101`). Curriculum is verbatim from `attached_assets/Clean_Statistics_101_Course_Book.docx`, mirrored in two files that must stay in sync: `artifacts/phil-101/src/data/curriculum.ts` (web) and `artifacts/api-server/src/lib/curriculum.ts` (API). 13 modules totaling 800 pts: 6 discussions × 50, 5 essays × 50, D6 misuses × 50, D7 published-study critique × 50, TP outline+paper × 200.
- **Math rendering**: KaTeX is wired via `katex/contrib/auto-render` in `artifacts/phil-101/src/components/math-content.tsx`. CSS is imported once in `main.tsx`. Reading / Assignment / Model-Response blocks in `module-detail.tsx` use `<MathContent>` so `$…$` and `$$…$$` are rendered. Plain text (no delimiters) falls through unchanged. The `IntegrityCanvas` editor includes a 14-button statistics symbol palette (μ σ x̄ s Σ α β π ± ≤ ≥ ≠ √ ²) that inserts at the caret in both contentEditable and accommodated-textarea modes.
- **Admin dashboard** at `/admin/submissions` (+ `/admin/submissions/:id`): list/replay/sparkline/activity-report; accommodation toggle per student. First authenticated user can claim admin via `POST /api/admin/bootstrap`; subsequent admin status is granted only by an existing admin. `requireAdmin` middleware in `artifacts/api-server/src/middleware/requireAdmin.ts`.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
