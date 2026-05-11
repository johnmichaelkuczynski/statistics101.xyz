import { Router, type IRouter, type Request, type Response } from "express";
import { and, eq, sql } from "drizzle-orm";
import { db, canvasSessionsTable, studentsTable } from "@workspace/db";
import { attachSession, requireStudent } from "../middlewares/session";
import { checkWithGPTZero } from "../lib/gptzero";
import {
  analyzeProcessWithBaseline,
  type ProcessBaseline,
  type ProcessEvent,
} from "../lib/processForensics";

const router: IRouter = Router();
router.use(attachSession);

async function isAccommodated(studentId: number): Promise<boolean> {
  const rows = await db
    .select({ accommodated: studentsTable.accommodated })
    .from(studentsTable)
    .where(eq(studentsTable.id, studentId))
    .limit(1);
  return !!rows[0]?.accommodated;
}

router.get(
  "/canvas/:moduleId",
  requireStudent,
  async (req: Request<{ moduleId: string }>, res: Response) => {
    const studentId = req.studentId as number;
    const rows = await db
      .select()
      .from(canvasSessionsTable)
      .where(
        and(
          eq(canvasSessionsTable.studentId, studentId),
          eq(canvasSessionsTable.moduleId, req.params.moduleId),
        ),
      )
      .limit(1);
    res.json({ session: rows[0] ?? null });
  },
);

router.post(
  "/canvas/:moduleId/autosave",
  requireStudent,
  async (req: Request<{ moduleId: string }>, res: Response) => {
    const studentId = req.studentId as number;
    const moduleId = req.params.moduleId;
    const body = req.body as {
      content?: unknown;
      keystrokes?: unknown;
      scoreHistory?: unknown;
    };
    const content = typeof body.content === "string" ? body.content : "";
    const keystrokes = Array.isArray(body.keystrokes) ? body.keystrokes : [];
    const scoreHistory = Array.isArray(body.scoreHistory)
      ? body.scoreHistory
      : [];

    await db
      .insert(canvasSessionsTable)
      .values({
        studentId,
        moduleId,
        content,
        keystrokes,
        scoreHistory,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [canvasSessionsTable.studentId, canvasSessionsTable.moduleId],
        set: {
          content,
          keystrokes,
          scoreHistory,
          updatedAt: sql`now()`,
        },
      });
    res.status(204).end();
  },
);

router.post(
  "/canvas/:moduleId/score",
  requireStudent,
  async (req: Request<{ moduleId: string }>, res: Response) => {
    const studentId = req.studentId as number;
    if (await isAccommodated(studentId)) {
      // Accommodated students never see scores; return neutral.
      res.json({
        aiScore: null,
        aiClass: null,
        sentences: [],
        accommodated: true,
      });
      return;
    }
    const text = String((req.body as { text?: unknown })?.text ?? "").trim();
    if (text.length < 30) {
      res.json({
        aiScore: null,
        aiClass: null,
        sentences: [],
        accommodated: false,
      });
      return;
    }
    const result = await checkWithGPTZero(text);
    if (!result) {
      res.json({
        aiScore: null,
        aiClass: null,
        sentences: [],
        accommodated: false,
      });
      return;
    }
    res.json({
      aiScore: result.aiScore,
      aiClass: result.aiClass,
      sentences: result.sentences,
      accommodated: false,
    });
  },
);

/**
 * Live process-forensics signal. Returns ONLY {score, class}. No features,
 * no flags — leaking those names would give sophisticated cheaters a tuning
 * oracle. Throttled by the client (≥60s between calls).
 */
router.post(
  "/canvas/:moduleId/processScore",
  requireStudent,
  async (req: Request<{ moduleId: string }>, res: Response) => {
    const studentId = req.studentId as number;
    if (await isAccommodated(studentId)) {
      // Accommodation removes the live UI signal — server-side logging still
      // happens elsewhere; we just don't surface anything to the student.
      res.json({ score: null, class: null, accommodated: true });
      return;
    }
    const body = req.body as { events?: unknown; content?: unknown };
    const events = Array.isArray(body.events) ? (body.events as ProcessEvent[]) : [];
    const content = typeof body.content === "string" ? body.content : "";
    if (events.length < 20 || content.length < 80) {
      res.json({ score: null, class: null, accommodated: false });
      return;
    }
    const baselineRows = await db
      .select({ baseline: studentsTable.processBaseline })
      .from(studentsTable)
      .where(eq(studentsTable.id, studentId))
      .limit(1);
    const b = baselineRows[0]?.baseline as ProcessBaseline | null | undefined;
    const baseline =
      b && typeof b === "object" && typeof b.n === "number" ? b : null;
    const analysis = analyzeProcessWithBaseline(events, content, baseline);
    res.json({
      score: analysis.processScore,
      class: analysis.processClass,
      accommodated: false,
    });
  },
);

export default router;
