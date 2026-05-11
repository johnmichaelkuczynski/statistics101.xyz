import { Router, type IRouter, type Request, type Response } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db, studentsTable, submissionsTable } from "@workspace/db";
import {
  ListSubmissionsResponseItem as SubmissionZ,
  GetSubmissionForModuleResponse as SubmissionOrNullZ,
} from "@workspace/api-zod";
import { attachSession, requireStudent } from "../middlewares/session";
import { moduleById, modules } from "../lib/curriculum";
import { checkWithGPTZero } from "../lib/gptzero";
import { computeActivityReport } from "../lib/activityReport";
import {
  analyzeProcessWithBaseline,
  foldIntoBaseline,
  type ProcessBaseline,
  type ProcessEvent,
} from "../lib/processForensics";
import { logger } from "../lib/logger";

const router: IRouter = Router();
router.use(attachSession);

const MIN_EVENTS_FOR_PROCESS = 20;
const MIN_CHARS_FOR_PROCESS = 80;
const BASELINE_FREEZE_AT = 2;

router.get(
  "/submissions",
  requireStudent,
  async (req: Request, res: Response) => {
    const studentId = req.studentId as number;
    const rows = await db
      .select()
      .from(submissionsTable)
      .where(eq(submissionsTable.studentId, studentId))
      .orderBy(desc(submissionsTable.createdAt));
    // SubmissionZ.parse() strips unknown keys (zod default), so the new
    // process* columns are not exposed to the student.
    res.json(rows.map((r) => SubmissionZ.parse(r)));
  },
);

router.post(
  "/submissions",
  requireStudent,
  async (req: Request, res: Response) => {
    const body = req.body as {
      moduleId?: unknown;
      content?: unknown;
      keystrokes?: unknown;
      scoreHistory?: unknown;
      finalAiScore?: unknown;
      finalAiClass?: unknown;
      flaggedOnSubmit?: unknown;
    };
    const moduleId = String(body.moduleId ?? "");
    const content = String(body.content ?? "");
    if (!moduleId) {
      res.status(400).json({ error: "Invalid body" });
      return;
    }
    const targetModule = moduleById(moduleId);
    if (!targetModule) {
      res.status(400).json({ error: "Unknown module" });
      return;
    }
    if (!content.trim()) {
      res.status(400).json({ error: "Content cannot be empty" });
      return;
    }
    const studentId = req.studentId as number;

    // Server-side sequential gating
    const targetIdx = modules.findIndex((m) => m.id === targetModule.id);
    if (targetIdx > 0) {
      const priorIds = modules.slice(0, targetIdx).map((m) => m.id);
      const priorSubs = await db
        .select({ moduleId: submissionsTable.moduleId })
        .from(submissionsTable)
        .where(eq(submissionsTable.studentId, studentId));
      const submitted = new Set(priorSubs.map((s) => s.moduleId));
      const missing = priorIds.filter((id) => !submitted.has(id));
      if (missing.length > 0) {
        res.status(403).json({
          error: `Module ${targetModule.number} is locked. Submit prior modules first: ${missing.join(", ")}`,
        });
        return;
      }
    }

    const keystrokes = Array.isArray(body.keystrokes) ? body.keystrokes : null;
    const scoreHistory = Array.isArray(body.scoreHistory)
      ? body.scoreHistory
      : null;
    const flaggedOnSubmit = !!body.flaggedOnSubmit;

    const activityReport =
      keystrokes && scoreHistory
        ? computeActivityReport(keystrokes, scoreHistory)
        : null;

    // ---- Process forensics (2nd-layer detection) -----------------------
    // Sparse-data guard: <20 events OR <80 chars → skip entirely. Otherwise
    // small/empty streams score as likelyAI (no human signals = robotic).
    let processScore: number | null = null;
    let processClass: string | null = null;
    let processFeatures: Record<string, unknown> | null = null;
    let processFlags: string[] | null = null;
    let nextBaseline: ProcessBaseline | null = null;
    const baselineFrozenAfterThisSubmission =
      (await loadBaseline(studentId)) ?? null;

    if (
      keystrokes &&
      keystrokes.length >= MIN_EVENTS_FOR_PROCESS &&
      content.length >= MIN_CHARS_FOR_PROCESS
    ) {
      try {
        const baseline = baselineFrozenAfterThisSubmission;
        const analysis = analyzeProcessWithBaseline(
          keystrokes as ProcessEvent[],
          content,
          baseline,
        );
        processScore = analysis.processScore;
        processClass = analysis.processClass;
        processFlags = analysis.flags;
        // Stash baseline-adjusted info under `__` keys so the admin feature
        // loop can ignore them — avoids a second migration.
        processFeatures = {
          ...(analysis.features as unknown as Record<string, unknown>),
          __baselineAdjustedScore: analysis.baselineAdjustedScore ?? null,
          __baselineDeviation: analysis.baselineDeviation ?? null,
          __baselineSnapshot: baseline?.features ?? null,
          __baselineN: baseline?.n ?? 0,
        };
        // Fold into baseline only if n<2 — frozen after that, deliberately,
        // to prevent slow-drift attacks where a cheater trains the baseline.
        if ((baseline?.n ?? 0) < BASELINE_FREEZE_AT) {
          nextBaseline = foldIntoBaseline(baseline, analysis.features);
        }
      } catch (err) {
        logger.error({ err, studentId }, "processForensics analysis failed");
      }
    }

    const inserted = await db
      .insert(submissionsTable)
      .values({
        studentId,
        moduleId,
        content,
        aiScore: null,
        aiClass: null,
        aiCheckedAt: null,
        aiStatus: "pending",
        keystrokes: keystrokes ?? undefined,
        scoreHistory: scoreHistory ?? undefined,
        activityReport: activityReport ?? undefined,
        flaggedOnSubmit,
        processScore,
        processClass,
        processFeatures: processFeatures ?? undefined,
        processFlags: processFlags ?? undefined,
      })
      .returning();

    if (nextBaseline) {
      // Optimistic concurrency: only persist if the row's current
      // baseline.n still matches what we read. Two simultaneous submissions
      // both seeing n=0 would otherwise both write n=1; the second would
      // win and we'd "lose" an increment, delaying the n=2 freeze and
      // weakening baseline integrity.
      const expectedN = baselineFrozenAfterThisSubmission?.n ?? 0;
      const updated = await db
        .update(studentsTable)
        .set({ processBaseline: nextBaseline })
        .where(
          and(
            eq(studentsTable.id, studentId),
            // Drizzle jsonb path equality. If `processBaseline` is null and
            // expectedN is 0, the path returns null which won't equal '0',
            // so fall back to checking for null in that case.
            expectedN === 0
              ? sql`(${studentsTable.processBaseline} IS NULL OR (${studentsTable.processBaseline}->>'n')::int = 0)`
              : sql`(${studentsTable.processBaseline}->>'n')::int = ${expectedN}`,
          ),
        )
        .returning({ id: studentsTable.id })
        .catch((err) => {
          logger.error({ err, studentId }, "failed to update processBaseline");
          return [] as { id: number }[];
        });
      if (updated.length === 0) {
        logger.warn(
          { studentId, expectedN },
          "processBaseline update skipped: concurrent submission won the race",
        );
      }
    }

    const row = inserted[0];
    // SubmissionZ.parse() strips unknown keys → process* not leaked.
    res.status(201).json(SubmissionZ.parse(row));

    void runAICheck(row.id, content);
  },
);

router.get(
  "/submissions/module/:moduleId",
  requireStudent,
  async (req: Request<{ moduleId: string }>, res: Response) => {
    const studentId = req.studentId as number;
    const rows = await db
      .select()
      .from(submissionsTable)
      .where(
        and(
          eq(submissionsTable.studentId, studentId),
          eq(submissionsTable.moduleId, req.params.moduleId),
        ),
      )
      .orderBy(desc(submissionsTable.createdAt))
      .limit(1);
    res.json(SubmissionOrNullZ.parse({ submission: rows[0] ?? null }));
  },
);

async function loadBaseline(
  studentId: number,
): Promise<ProcessBaseline | null> {
  const rows = await db
    .select({ baseline: studentsTable.processBaseline })
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId))
    .limit(1);
  const b = rows[0]?.baseline as ProcessBaseline | null | undefined;
  if (!b || typeof b !== "object" || typeof b.n !== "number") return null;
  return b;
}

async function runAICheck(submissionId: number, content: string): Promise<void> {
  try {
    const result = await checkWithGPTZero(content);
    if (result) {
      await db
        .update(submissionsTable)
        .set({
          aiScore: result.aiScore,
          aiClass: result.aiClass,
          aiCheckedAt: new Date(),
          aiStatus: "completed",
        })
        .where(eq(submissionsTable.id, submissionId));
    } else {
      await db
        .update(submissionsTable)
        .set({ aiCheckedAt: new Date(), aiStatus: "failed" })
        .where(eq(submissionsTable.id, submissionId));
    }
  } catch (err) {
    logger.error({ err, submissionId }, "Background AI check crashed");
    await db
      .update(submissionsTable)
      .set({ aiCheckedAt: new Date(), aiStatus: "failed" })
      .where(eq(submissionsTable.id, submissionId))
      .catch(() => {});
  }
}

export default router;
