# 📊 STATISTICS 101

https://statistics-101.replit.app

Course Shell for Introductory Statistics with AI-Aware Academic Integrity

## 🧩 Overview

Statistics 101 is a fully online, asynchronous college course delivered as a self-contained web app. Thirteen modules cover the standard 101 sequence — levels of measurement, center and spread, visualization, probability, the normal distribution, sampling and the Central Limit Theorem, confidence intervals, hypothesis testing, correlation vs. causation, common misuses of statistics, and reading published research — culminating in a five-claim term paper.

Unlike a generic LMS shell, the app is built around a strict operating principle: students should learn to write, not learn to launder AI output. Every assignment runs through a two-box workflow that pairs a single-shot AI feedback drafting station with an integrity-monitored submission canvas. Real-time AI-detection scoring, sentence-level highlighting, paste blocking, and a full keystroke audit trail give instructors evidence — not guesses — about how a piece of writing was actually produced.

## 👥 Who It's For

- **Community-college and first-year undergraduates** -- need a clean, calm, jargon-free first encounter with statistics
- **Returning adult learners** -- need an asynchronous, self-paced format with embedded tutoring
- **Instructors of record** -- need a course shell that enforces academic-integrity policy without manually policing every paragraph
- **Departments piloting AI policy** -- need real keystroke and AI-detection data on student submissions, not vibes
- **Anyone** -- who has ever wondered what "p < 0.05" actually means and wanted to find out properly

## ⚙️ Core Capabilities

- **Verbatim Course Content** -- 13 modules totaling 800 points, ingested verbatim from the open-source course book. Each module ships with reading, assignment, and a model response unlocked after submission.
- **Two-Box Submission Workflow** -- Box 1 is a draft workshop with single-shot AI feedback in 5 sections; once feedback is fetched the draft is locked. Box 2 is the live submission canvas where the actual graded work is typed.
- **Real-Time AI Detection** -- Every burst of typing is scored by GPTZero with sentence-level highlighting, a green-yellow-red traffic-light bar, and a 30-second cumulative-red warning. Submissions ship with the final score and flag.
- **Full Keystroke Audit Trail** -- Insertions, deletions, paste attempts (allowed and blocked), and highlighting toggles are recorded with timestamps and replayed in the admin dashboard.
- **Paste-Blocked Editor** -- ContentEditable surface with overlay highlighting. External paste is intercepted; internal copy/cut is allowed. Drag-and-drop is rejected.
- **KaTeX Math Rendering** -- Inline `$…$` and display `$$…$$` formulas render natively in readings, assignments, and model responses. Plain Unicode notation falls through unchanged.
- **Statistics Symbol Palette** -- A 14-button toolbar (μ σ x̄ s Σ α β π ± ≤ ≥ ≠ √ ²) inserts at the caret in both standard and accommodated editors without breaking the keystroke pipeline.
- **Socratic AI Tutor** -- Anthropic Claude Sonnet, configured to teach in the instructor's voice. Asks questions before giving answers; refuses to write the assignment for the student.
- **Accommodated Mode** -- Admin-toggled per student. Replaces the monitored canvas with a plain textarea and skips AI scoring while still recording submissions normally.
- **Admin Dashboard** -- List, filter, replay, sparkline, and activity report for every submission. Per-student accommodation toggles. First authenticated user can claim admin; subsequent admin status is granted only by an existing admin.
- **One-Time Integrity Disclosure** -- A modal on first module load explains exactly what is monitored, what is recorded, and what flagging means for grades. Acknowledgment is recorded server-side.

## 🎯 What Makes It Different

- **It treats AI honestly** -- Students are told upfront what is detected and what is not. Nothing is hidden, nothing is theater.
- **It evaluates writing as a process, not a product** -- A red AI-detection score on a paragraph that was typed character by character over 40 minutes tells a different story than the same score on text that appeared in one keystroke. The replay shows the difference.
- **The model responses are real essays, not rubric bullets** -- Each module ships with a 600-to-2,500-word example response demonstrating what an A submission actually looks like, including the analytic moves that earn the grade.
- **The curriculum is verbatim** -- No paraphrasing, no AI summarization of the source text. Students read what the instructor wrote.
- **The math notation is correct** -- Unicode symbols and KaTeX-rendered formulas, not images or ASCII approximations.
- **The integrity tooling supports accommodation** -- Students with documented needs get a plain editor and full credit, with no second-class workflow.
- **Every design decision is documented** -- Architecture notes, data-flow contracts, and the model-response unlock rule live in `replit.md`, not in someone's head.
