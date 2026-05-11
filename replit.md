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
- **Admin dashboard** at `/admin/submissions` (+ `/admin/submissions/:id`): list/replay/sparkline/activity-report + writing-process forensics panel; accommodation toggle per student. First authenticated user can claim admin via `POST /api/admin/bootstrap`; subsequent admin status is granted only by an existing admin. `requireAdmin` middleware in `artifacts/api-server/src/middleware/requireAdmin.ts`.

## Two-layer AI detection

**Layer 1 — text (synchronic):** GPTZero scores the *output*. Runs in the background after submission and during typing (`POST /api/canvas/:moduleId/score`). Stored on `submissions` as `aiScore`/`aiClass`/`aiStatus`.

**Layer 2 — process (diachronic):** Writing-process forensics scores the *shape of the writing session*. Catches "transcription cheating": a student reads AI text on a side monitor and retypes it. The output looks human to GPTZero, but the process leaves a fingerprint — uniform burst timing, near-zero deletions, no caret backtracking, no abandoned-and-restarted starts. See `artifacts/api-server/src/lib/processForensics.ts` (pure module, no I/O).

- **11 features** computed per submission: `burstUniformity`, `pauseBeforeNewSentence`, `pauseBeforeNewParagraph`, `deletionRatio`, `structuralEditCount`, `caretBacktrackCount`, `abandonedStartCount`, `burstLengthCV`, `frontToBackLinearity`, `totalActiveSeconds`, `charsPerSecond`. Each contributes a 0–100 suspicion sub-score; weighted average → `processScore`. Class thresholds: `<35` human, `35–65` mixed, `≥65` likelyAI.
- **Sparse-data guard:** if a session has fewer than 20 events or fewer than 80 chars of content, *all* process columns are stored as `null`. This avoids the failure mode where small/empty streams ("no human signals present") get scored as `likelyAI` for the same reason a robotic stream would.
- **Per-student baseline (`students.processBaseline` jsonb).** A student whose normal `burstUniformity` is 12 ms is not "robotic" *for them*. The submission pipeline computes `analyzeProcessWithBaseline()`, which softens the absolute score wherever this submission is close to the student's own baseline. The softened number is stashed under `processFeatures.__baselineAdjustedScore` (along with `__baselineDeviation`, `__baselineSnapshot`, `__baselineN`) — double-underscore keys so the admin feature loop can ignore them; this avoids a second migration for the baseline metadata.
- **n=2 freeze rule (deliberate).** The baseline is updated only on submissions 1 and 2. After that it is frozen. This prevents slow-drift attacks where a student gradually cheats more and more, training the baseline toward their cheating profile so that the deviation never crosses a threshold.
- **Live signal:** `POST /api/canvas/:moduleId/processScore` returns *only* `{score, class}` — no features, no flags. Leaking feature names would give sophisticated cheaters a tuning oracle. The frontend throttles to one call per 60 s and renders a second traffic-light bar next to the GPTZero one. Skipped entirely for accommodated students. The accommodated input still emits the same rich event log server-side; accommodation removes the live UI signal, not the underlying logging.
- **Student-facing endpoints** (`GET /submissions`, `GET /submissions/module/:moduleId`) parse rows through `SubmissionZ` (zod), which strips unknown keys by default — so process columns are *never* returned to students.
- **Admin panel:** `ProcessForensicsView` in `artifacts/phil-101/src/pages/admin-submission-detail.tsx` shows a class badge, the baseline-adjusted-score badge with the snapshot's `n` (or "No baseline yet" on first submission), the findings list, a 4-column feature table (Feature / This submission / Student baseline / Notes), and a burst-uniformity stripe chart. Legacy submissions and rows that hit the sparse-data guard render "No writing-process analysis available."

**Generic disclosure (intentional).** The integrity-disclosure modal says only "your work is monitored." It does *not* mention process forensics, baseline tracking, burst timing, deletion ratio, or any feature names. The threat-model rationale: naming the signals creates a curriculum for evading them. A cheater who knows the analyzer measures `pauseBeforeNewSentence` will paste artificial pauses; one who doesn't will not.

**Weight-tuning workflow.** Tunable `WEIGHTS` constant lives at the top of `processForensics.ts`. Two synthetic event streams in `routes/diagnostic.ts` lock in the calibration: a perfectly uniform 4-char/180 ms transcription stream must score `≥70 / likelyAI`, and a varied composition stream with abandoned starts, backtracks, and structural deletes must score `<35 / human`. Run them via `POST /api/diagnostic/run` (or visit `/diagnostic` in the web UI) — both must remain green after any weight change.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
