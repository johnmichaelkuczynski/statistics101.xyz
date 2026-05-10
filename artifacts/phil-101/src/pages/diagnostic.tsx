import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/page-shell";
import {
  AlertTriangle,
  CheckCircle2,
  CircleSlash,
  Loader2,
  PlayCircle,
  XCircle,
} from "lucide-react";

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
interface DiagnosticResult {
  ok: boolean;
  summary: {
    passed: number;
    failed: number;
    warned: number;
    skipped: number;
    total: number;
    durationMs: number;
    ranAt: string;
  };
  sections: Section[];
}

export default function Diagnostic() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const base = import.meta.env.BASE_URL;
      const res = await fetch(`${base}api/diagnostic/run`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${await res.text()}`);
      }
      const data: DiagnosticResult = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  return (
    <PageShell
      title="Diagnostic"
      intro="Run a self-test of the application — verifies that all backend services, the database, the AI integration, and the core user flows are functioning. This does not evaluate the quality of any answers, grades, or content; it only verifies that the formal mechanics of the app work."
    >
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm text-stone-800">
              Press the button to run a full system + functional self-check.
              Results appear below. Total runtime: roughly 5–15 seconds.
            </p>
            <p className="mt-1 text-xs text-stone-500">
              The functional test creates a temporary "Diagnostic Bot" user
              and deletes it when finished. No real student data is touched.
            </p>
          </div>
          <Button
            onClick={run}
            disabled={running}
            data-testid="button-run-diagnostic"
          >
            {running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Diagnostic
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-start gap-3 p-4">
            <XCircle className="mt-0.5 h-5 w-5 text-red-700" />
            <div>
              <div className="font-medium text-red-900">
                Diagnostic could not run
              </div>
              <div className="mt-1 text-sm text-red-800">{error}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && <Summary result={result} />}

      {result?.sections.map((s, i) => (
        <SectionCard key={i} section={s} index={i + 1} />
      ))}
    </PageShell>
  );
}

function Summary({ result }: { result: DiagnosticResult }) {
  const { ok, summary } = result;
  return (
    <Card
      className={
        ok
          ? "border-emerald-300 bg-emerald-50"
          : "border-red-300 bg-red-50"
      }
    >
      <CardContent className="flex flex-wrap items-center gap-4 p-4">
        {ok ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-700" />
        ) : (
          <XCircle className="h-6 w-6 text-red-700" />
        )}
        <div className="flex-1">
          <div className={`font-medium ${ok ? "text-emerald-900" : "text-red-900"}`}>
            {ok
              ? "All checks passed."
              : `${summary.failed} check${summary.failed === 1 ? "" : "s"} failed.`}
          </div>
          <div className="mt-0.5 text-xs text-stone-700">
            {summary.passed} passed · {summary.failed} failed ·{" "}
            {summary.warned} warned · {summary.skipped} skipped · ran in{" "}
            {summary.durationMs} ms · {new Date(summary.ranAt).toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({ section, index }: { section: Section; index: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">
          {index}. {section.title}
        </CardTitle>
        <p className="text-sm text-stone-600">{section.description}</p>
      </CardHeader>
      <CardContent>
        <ul className="divide-y divide-stone-200">
          {section.checks.map((c, i) => (
            <CheckRow key={i} check={c} />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function CheckRow({ check }: { check: Check }) {
  return (
    <li
      className="flex items-start gap-3 py-2.5"
      data-testid={`diagnostic-check-${check.status}`}
    >
      <StatusIcon status={check.status} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-stone-900">{check.name}</div>
        <div className="mt-0.5 text-xs text-stone-600">{check.detail}</div>
      </div>
      <div className="shrink-0 text-xs tabular-nums text-stone-500">
        {check.durationMs}ms
      </div>
    </li>
  );
}

function StatusIcon({ status }: { status: CheckStatus }) {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />;
    case "fail":
      return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />;
    case "warn":
      return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />;
    case "skip":
      return <CircleSlash className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" />;
  }
}
