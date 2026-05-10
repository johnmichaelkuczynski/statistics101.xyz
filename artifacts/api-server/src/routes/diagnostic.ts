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

export default router;
