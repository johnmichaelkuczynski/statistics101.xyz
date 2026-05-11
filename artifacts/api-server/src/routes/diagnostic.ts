import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db,
  studentsTable,
  assignmentDraftsTable,
  canvasSessionsTable,
  submissionsTable,
} from "@workspace/db";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { modules as curriculum } from "../lib/curriculum";
import {
  analyzeProcess,
  type ProcessEvent,
} from "../lib/processForensics";

const router: IRouter = Router();

type CheckStatus = "pass" | "fail" | "warn" | "skip";
interface Check {
  name: string;
  status: CheckStatus;
  detail: string;
  durationMs: number;
}
interface Section {
  title: string;
  description: string;
  checks: Check[];
}

async function timed<T>(
  name: string,
  fn: () => Promise<{ status: CheckStatus; detail: string }>,
): Promise<Check> {
  const t0 = Date.now();
  try {
    const r = await fn();
    return { name, ...r, durationMs: Date.now() - t0 };
  } catch (e) {
    return {
      name,
      status: "fail",
      detail: e instanceof Error ? e.message : String(e),
      durationMs: Date.now() - t0,
    };
  }
}

function envCheck(name: string, optional = false): Check {
  const v = process.env[name];
  if (v && v.length > 0) {
    return { name: `Environment: ${name}`, status: "pass", detail: "set", durationMs: 0 };
  }
  return {
    name: `Environment: ${name}`,
    status: optional ? "warn" : "fail",
    detail: optional ? "not set (optional)" : "missing",
    durationMs: 0,
  };
}

router.post("/diagnostic/run", async (_req, res) => {
  const sections: Section[] = [];
  const startedAt = Date.now();

  // ---- 1. System Check ----
  const systemChecks: Check[] = [
    envCheck("DATABASE_URL"),
    envCheck("SESSION_SECRET"),
    envCheck("AI_INTEGRATIONS_ANTHROPIC_BASE_URL"),
    envCheck("AI_INTEGRATIONS_ANTHROPIC_API_KEY"),
    envCheck("GPTZERO_API_KEY", true),
    {
      name: "Curriculum loaded",
      status: curriculum.length === 13 ? "pass" : "fail",
      detail: `${curriculum.length} modules (expected 13)`,
      durationMs: 0,
    },
    {
      name: "Curriculum point total",
      status:
        curriculum.reduce((s, m) => s + m.points, 0) === 800 ? "pass" : "fail",
      detail: `${curriculum.reduce((s, m) => s + m.points, 0)} pts (expected 800)`,
      durationMs: 0,
    },
  ];
  sections.push({
    title: "System Check",
    description:
      "Verifies environment variables, configuration, and that the in-memory curriculum is fully loaded.",
    checks: systemChecks,
  });

  // ---- 2. Database Check ----
  const dbChecks: Check[] = [];
  dbChecks.push(
    await timed("Database connectivity (SELECT 1)", async () => {
      const r = await db.execute(sql`select 1 as ok`);
      const rows = (r as unknown as { rows?: Array<{ ok: number }> }).rows ?? [];
      return rows[0]?.ok === 1
        ? { status: "pass", detail: "connected" }
        : { status: "fail", detail: "unexpected response" };
    }),
  );
  const expectedTables = [
    "students",
    "assignment_drafts",
    "canvas_sessions",
    "submissions",
    "conversations",
    "messages",
    "tutor_conversations",
    "tutor_messages",
  ];
  dbChecks.push(
    await timed("Schema: all expected tables present", async () => {
      const r = await db.execute(
        sql`select table_name from information_schema.tables where table_schema='public'`,
      );
      const present = new Set(
        ((r as unknown as { rows?: Array<{ table_name: string }> }).rows ?? [])
          .map((row) => row.table_name),
      );
      const missing = expectedTables.filter((t) => !present.has(t));
      return missing.length === 0
        ? { status: "pass", detail: `${expectedTables.length} tables present` }
        : { status: "fail", detail: `missing: ${missing.join(", ")}` };
    }),
  );
  dbChecks.push(
    await timed("Read: count students", async () => {
      const rows = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(studentsTable);
      return { status: "pass", detail: `${rows[0]?.c ?? 0} rows` };
    }),
  );
  dbChecks.push(
    await timed("Read: count submissions", async () => {
      const rows = await db
        .select({ c: sql<number>`count(*)::int` })
        .from(submissionsTable);
      return { status: "pass", detail: `${rows[0]?.c ?? 0} rows` };
    }),
  );
  sections.push({
    title: "Database Check",
    description: "Confirms the API can reach the database and the schema matches what the app expects.",
    checks: dbChecks,
  });

  // ---- 3. AI Integration ----
  const aiChecks: Check[] = [];
  aiChecks.push(
    await timed("Anthropic round-trip (claude-sonnet-4-5)", async () => {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 16,
        messages: [
          {
            role: "user",
            content:
              'Reply with exactly the two characters: OK. No punctuation, no explanation.',
          },
        ],
      });
      const text = msg.content
        .filter((b) => b.type === "text")
        .map((b) => (b as { type: "text"; text: string }).text)
        .join("")
        .trim();
      return /OK/i.test(text)
        ? { status: "pass", detail: `replied: "${text}"` }
        : { status: "warn", detail: `replied: "${text}"` };
    }),
  );
  if (process.env.GPTZERO_API_KEY) {
    aiChecks.push(
      await timed("GPTZero reachable", async () => {
        const r = await fetch("https://api.gptzero.me/v2/predict/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.GPTZERO_API_KEY!,
          },
          body: JSON.stringify({
            document:
              "This is a short diagnostic ping to verify GPTZero is reachable.",
          }),
        });
        return r.ok
          ? { status: "pass", detail: `HTTP ${r.status}` }
          : { status: "fail", detail: `HTTP ${r.status}` };
      }),
    );
  } else {
    aiChecks.push({
      name: "GPTZero reachable",
      status: "skip",
      detail: "GPTZERO_API_KEY not set",
      durationMs: 0,
    });
  }
  sections.push({
    title: "AI Integration",
    description: "Sends a real round-trip request to each AI provider used by the app.",
    checks: aiChecks,
  });

  // ---- 4. Functional Flow (create bot, exercise tables, delete bot) ----
  const flowChecks: Check[] = [];
  let botId: number | null = null;
  const botEmail = `diagnostic-bot-${Date.now()}@statistics-101.test`;

  flowChecks.push(
    await timed("Create temporary Diagnostic Bot user", async () => {
      const inserted = await db
        .insert(studentsTable)
        .values({ email: botEmail, name: "Diagnostic Bot" })
        .returning();
      botId = inserted[0]?.id ?? null;
      return botId
        ? { status: "pass", detail: `student id=${botId}` }
        : { status: "fail", detail: "insert returned no row" };
    }),
  );

  if (botId) {
    flowChecks.push(
      await timed("Write + lock an assignment draft", async () => {
        await db.insert(assignmentDraftsTable).values({
          studentId: botId!,
          moduleId: "d1",
          content: "Diagnostic draft.",
          feedback: "Diagnostic feedback.",
          feedbackAt: new Date(),
          locked: true,
        });
        return { status: "pass", detail: "module d1, locked" };
      }),
    );

    flowChecks.push(
      await timed("Write a canvas session with keystrokes", async () => {
        await db.insert(canvasSessionsTable).values({
          studentId: botId!,
          moduleId: "d1",
          content: "Diagnostic canvas content.",
          keystrokes: [{ t: 0, k: "i", d: "Diagnostic" }],
          scoreHistory: [{ t: 0, score: 0.05, cls: "human" }],
        });
        return { status: "pass", detail: "1 keystroke + 1 score sample" };
      }),
    );

    flowChecks.push(
      await timed("Insert a submission and read it back", async () => {
        const ins = await db
          .insert(submissionsTable)
          .values({
            studentId: botId!,
            moduleId: "d1",
            content: "Diagnostic submission body.",
            aiStatus: "completed",
            aiScore: 0.05,
            aiClass: "human",
            aiCheckedAt: new Date(),
            keystrokes: [],
            scoreHistory: [],
            flaggedOnSubmit: false,
          })
          .returning();
        const subId = ins[0]?.id;
        if (!subId) return { status: "fail", detail: "no row returned" };
        const back = await db
          .select()
          .from(submissionsTable)
          .where(eq(submissionsTable.id, subId))
          .limit(1);
        return back[0]?.id === subId
          ? { status: "pass", detail: `submission id=${subId} round-trip ok` }
          : { status: "fail", detail: "round-trip mismatch" };
      }),
    );

    flowChecks.push(
      await timed("Delete bot (cascades drafts, canvas, submissions)", async () => {
        await db.delete(studentsTable).where(eq(studentsTable.id, botId!));
        const rows = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(submissionsTable)
          .where(eq(submissionsTable.studentId, botId!));
        return rows[0]?.c === 0
          ? { status: "pass", detail: "bot + cascading rows removed" }
          : { status: "fail", detail: `${rows[0]?.c} submissions still present` };
      }),
    );
  } else {
    flowChecks.push({
      name: "Functional flow steps skipped",
      status: "skip",
      detail: "bot user could not be created",
      durationMs: 0,
    });
  }
  sections.push({
    title: "Functional Flow",
    description:
      'Creates a temporary "Diagnostic Bot" user, exercises the draft → canvas → submission tables end-to-end, then deletes the bot. No real student data is touched.',
    checks: flowChecks,
  });

  // ---- 5. Process Forensics (synthetic streams) ----
  const procChecks: Check[] = [];
  procChecks.push(
    await timed("Synthetic transcription → likelyAI (≥70)", async () => {
      const events = buildTranscriptionStream();
      const finalText = events
        .filter((e) => e.type === "insert")
        .map((e) => e.text ?? "")
        .join("");
      const a = analyzeProcess(events, finalText);
      const ok = a.processScore >= 70 && a.processClass === "likelyAI";
      return {
        status: ok ? "pass" : "fail",
        detail: `score=${a.processScore} class=${a.processClass}`,
      };
    }),
  );
  procChecks.push(
    await timed(
      "Non-text events (focus/blur/caretJump) do not inflate insert counts",
      async () => {
        // Same composition stream, but with 200 extra k:"m" focus/blur/jump
        // events sprinkled in. The classification must not flip — these
        // are non-text and used to leak through as inserts (k:"m" → insert,
        // default charCount=1).
        const { events: base, finalText } = buildCompositionStream();
        const noisy: ProcessEvent[] = [...base];
        for (let i = 0; i < 200; i++) {
          noisy.splice(
            Math.min(noisy.length, 5 + i * 2),
            0,
            {
              t: 100 + i * 50,
              type: i % 3 === 0 ? "focus" : i % 3 === 1 ? "blur" : "caretJump",
              k: "m",
              len: 0,
              caretBefore: 0,
              caretAfter: 0,
            } as ProcessEvent,
          );
        }
        const cleanScore = analyzeProcess(base, finalText).processScore;
        const noisyScore = analyzeProcess(noisy, finalText).processScore;
        const drift = Math.abs(noisyScore - cleanScore);
        const noisyClass = analyzeProcess(noisy, finalText).processClass;
        // The class must remain `human` and the noisy score must not have
        // jumped UPWARD (toward AI) — real caret/focus events legitimately
        // pull the score further into the human range, which is fine.
        const ok = noisyClass === "human" && noisyScore <= cleanScore + 5;
        return {
          status: ok ? "pass" : "fail",
          detail: `clean=${cleanScore} noisy=${noisyScore} drift=${drift} class=${noisyClass}`,
        };
      },
    ),
  );
  procChecks.push(
    await timed("Synthetic composition → human (<35)", async () => {
      const { events, finalText } = buildCompositionStream();
      const a = analyzeProcess(events, finalText);
      const ok = a.processScore < 35 && a.processClass === "human";
      return {
        status: ok ? "pass" : "fail",
        detail: `score=${a.processScore} class=${a.processClass}`,
      };
    }),
  );
  sections.push({
    title: "Process Forensics",
    description:
      "Runs the writing-process analyzer over two synthetic event streams: a perfectly uniform transcription pattern (must classify as likelyAI) and a varied human-composition pattern with abandoned starts and backtracks (must classify as human).",
    checks: procChecks,
  });

  const allChecks = sections.flatMap((s) => s.checks);
  const failed = allChecks.filter((c) => c.status === "fail").length;
  const warned = allChecks.filter((c) => c.status === "warn").length;
  const skipped = allChecks.filter((c) => c.status === "skip").length;
  const passed = allChecks.filter((c) => c.status === "pass").length;

  res.json({
    ok: failed === 0,
    summary: {
      passed,
      failed,
      warned,
      skipped,
      total: allChecks.length,
      durationMs: Date.now() - startedAt,
      ranAt: new Date().toISOString(),
    },
    sections,
  });
});

// ---------------------------------------------------------------------------
// Synthetic event streams for process-forensics tests
// ---------------------------------------------------------------------------

/**
 * Perfect transcription: uniform 4-char insert events at 180 ms intervals,
 * caret always at end-of-doc, no deletes, no caret jumps, no abandoned
 * starts. Must score ≥70 and classify as likelyAI.
 */
function buildTranscriptionStream(): ProcessEvent[] {
  const events: ProcessEvent[] = [];
  const chars = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
  let pos = 0;
  let t = 0;
  for (let i = 0; i < 60; i++) {
    const text = chars.substring((i * 4) % 48, (i * 4) % 48 + 4);
    events.push({
      t,
      type: "insert",
      pos,
      len: 4,
      charCount: 4,
      caretBefore: pos,
      caretAfter: pos + 4,
      text,
    });
    pos += 4;
    t += 180;
  }
  return events;
}

/**
 * Realistic composition: varied burst lengths, an abandoned-and-restarted
 * start (write 60 chars, delete 55, restart near same caret), 3 caret
 * backtracks > 100 chars, 2 large/structural deletes, generous pauses
 * between sentences and paragraphs. Must score <35 and classify as human.
 */
function buildCompositionStream(): {
  events: ProcessEvent[];
  finalText: string;
} {
  const events: ProcessEvent[] = [];
  let t = 0;
  let pos = 0;

  function ins(text: string, gapMs: number) {
    t += gapMs;
    events.push({
      t,
      type: "insert",
      pos,
      len: text.length,
      charCount: text.length,
      caretBefore: pos,
      caretAfter: pos + text.length,
      text,
    });
    pos += text.length;
  }
  function del(n: number, gapMs: number) {
    t += gapMs;
    const before = pos;
    events.push({
      t,
      type: "delete",
      pos: pos - n,
      len: n,
      caretBefore: before,
      caretAfter: pos - n,
    });
    pos -= n;
  }
  function jumpTo(newPos: number, gapMs: number) {
    t += gapMs;
    const before = pos;
    events.push({
      t,
      type: "caretJump",
      len: 0,
      caretBefore: before,
      caretAfter: newPos,
      pos: newPos,
    });
    pos = newPos;
  }

  // Abandoned start: write 60 chars, delete 55 in one structural delete.
  ins("The first thing I want to argue is that nothing actually w", 800); // 58 chars
  del(55, 4_000); // structural delete, big

  // Restart near same caret (within 10 chars of original start = 0).
  ins("Let me try this differently. ", 5_000);
  ins("Statistics is fundamentally about uncertainty", 600);
  ins(", and I think most students miss that.", 400);
  ins(" The mean alone tells you very little.", 350);

  // Long pause + new sentence + new paragraph.
  ins("\n\n", 6_000);
  ins("Consider variance: a class with average 75 and stdev 5 is wildly different from one with average 75 and stdev 25.", 1_200);

  // Backtrack #1: jump back 200 chars to revise.
  jumpTo(40, 3_500);
  ins(" really", 600);
  pos = 40 + 7;

  // Jump to end and continue (this restores the linear flow but not at end-of-doc).
  jumpTo(220, 1_200);
  ins(". The variance is what tells you whether the average means anything.", 800);

  // Backtrack #2.
  jumpTo(80, 3_000);
  ins(" subtle but important", 700);
  pos = 80 + 21;

  // Jump back to end.
  jumpTo(330, 900);

  // Another big structural delete.
  ins("\n\nI used to think averages were enough, but the more examples I see, the less I trust them on their own.", 5_500);
  del(40, 4_000); // structural

  // Backtrack #3 + revision.
  jumpTo(50, 2_500);
  ins(" actually", 500);
  pos = 50 + 9;

  jumpTo(events.reduce((s, e) => s + (e.type === "insert" ? (e.charCount ?? 0) : e.type === "delete" ? -(e.len) : 0), 0), 800);
  ins(" Statistical reasoning takes time and care; you can't shortcut it with a formula alone.", 1_500);

  // Reconstruct final text by replaying inserts + deletes + jumps.
  let text = "";
  let cursor = 0;
  for (const e of events) {
    if (e.type === "insert" && e.text) {
      text = text.slice(0, cursor) + e.text + text.slice(cursor);
      cursor += e.text.length;
    } else if (e.type === "delete") {
      const n = e.len;
      const start = Math.max(0, cursor - n);
      text = text.slice(0, start) + text.slice(cursor);
      cursor = start;
    } else if (e.type === "caretJump") {
      cursor = Math.max(0, Math.min(text.length, e.caretAfter ?? cursor));
    }
  }

  return { events, finalText: text };
}

export default router;
