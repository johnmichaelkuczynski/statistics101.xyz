import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "@/components/page-shell";
import { integrityApi } from "@/lib/integrity-api";
import { ChevronLeft, FastForward, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface KEvent {
  t: number;
  k: "i" | "d" | "m" | "p_blocked" | "p_allowed" | "h_off" | "h_on";
  d?: string;
  // Newer rich fields (optional — legacy events may lack them)
  type?: "insert" | "delete" | "caretJump" | "focus" | "blur";
  pos?: number;
  len?: number;
  charCount?: number;
  caretBefore?: number;
  caretAfter?: number;
  text?: string;
}

const FEATURE_NOTES: Record<string, string> = {
  burstUniformity:
    "Lower = more robotic. Stdev of intra-burst keystroke gaps in ms. Humans vary; transcribers don't.",
  pauseBeforeNewSentence:
    "Median ms between sentence-end (./?/!) and the next non-whitespace char. Composers pause to think.",
  pauseBeforeNewParagraph:
    "Same as above, but only when the gap contains a paragraph break.",
  deletionRatio:
    "Deleted chars / inserted chars. Healthy human range ~15–40%. Transcription has near-zero deletions.",
  structuralEditCount:
    "Large (≥30 chars) or far-back (caret < docLen/2) deletes. Composers restructure; transcribers don't.",
  caretBacktrackCount:
    "Backward caret jumps > 100 chars — going back to revise a prior section.",
  abandonedStartCount:
    "Bursts of ≥30 chars where ≥80% gets deleted within 60s and the next insert lands within 10 chars of the original start. Classic 'try, scrap, retry' human pattern.",
  burstLengthCV:
    "Coefficient of variation of burst lengths. Low = uniform = transcription-like.",
  frontToBackLinearity:
    "Fraction of inserts at end-of-doc. High = text grew straight through with no revisions.",
  totalActiveSeconds:
    "Sum of inter-event gaps capped at 30s/gap — context only, not scored.",
  charsPerSecond:
    "Final length / total active seconds. Sustained >5 cps over a long session is transcription-grade.",
};

function fmtFeature(key: string, v: number | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  if (
    key === "burstUniformity" ||
    key === "pauseBeforeNewSentence" ||
    key === "pauseBeforeNewParagraph"
  ) {
    return `${Math.round(v)} ms`;
  }
  if (key === "deletionRatio" || key === "frontToBackLinearity") {
    return `${(v * 100).toFixed(1)}%`;
  }
  if (key === "totalActiveSeconds") return `${v.toFixed(1)} s`;
  if (key === "charsPerSecond") return `${v.toFixed(2)} cps`;
  if (key === "burstLengthCV") return v.toFixed(2);
  return String(Math.round(v));
}

export default function AdminSubmissionDetail() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const q = useQuery({
    queryKey: ["admin", "submission", id],
    queryFn: () => integrityApi.getSubmission(id),
  });

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-stone-600">
        Loading…
      </div>
    );
  }
  const sub = q.data?.submission;
  if (!sub) {
    return (
      <PageShell title="Not found" intro="">
        <Link href="/admin/submissions" className="underline">
          Back to submissions
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title={`Submission #${sub.id}`}
      intro={`${sub.studentName ?? ""} — module ${sub.moduleId}`}
    >
      <div className="-mt-4">
        <Link href="/admin/submissions">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Back to all submissions
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-stone-700">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">module {sub.moduleId}</Badge>
            <Badge variant="outline">
              GPTZero{" "}
              {sub.aiScore != null
                ? `${(sub.aiScore * 100).toFixed(0)}%`
                : "—"}
            </Badge>
            <Badge variant="outline">class: {sub.aiClass ?? "—"}</Badge>
            {sub.flaggedOnSubmit && (
              <Badge variant="destructive">flagged on submit</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {sub.reviewStatus}
            </Badge>
          </div>
          <div>Submitted: {new Date(sub.createdAt).toLocaleString()}</div>
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                integrityApi
                  .review(sub.id, "reviewed")
                  .then(() => {
                    toast.success("Marked reviewed");
                    q.refetch();
                  })
                  .catch((e) => toast.error(e.message))
              }
            >
              Mark as reviewed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                integrityApi
                  .review(sub.id, "flagged")
                  .then(() => {
                    toast.success("Flagged for follow-up");
                    q.refetch();
                  })
                  .catch((e) => toast.error(e.message))
              }
            >
              Flag for follow-up
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Final submitted text
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 font-sans text-sm text-stone-800">
            {sub.content}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Activity report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sub.activityReport ? (
            <ActivityReportView report={sub.activityReport} />
          ) : (
            <p className="text-sm text-stone-500">
              No activity report available (legacy submission).
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Writing-process forensics{" "}
            <span className="ml-1 text-xs font-normal text-stone-500">
              (2nd-layer detector — process shape, not text)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProcessForensicsView
            processScore={sub.processScore}
            processClass={sub.processClass}
            processFeatures={sub.processFeatures}
            processFlags={sub.processFlags}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">
            Keystroke replay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Replay events={(sub.keystrokes as KEvent[] | null) ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Score history</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreSparkline
            samples={
              (sub.scoreHistory as { t: number; score: number }[] | null) ?? []
            }
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}

function ActivityReportView({
  report,
}: {
  report: Record<string, unknown>;
}) {
  const r = report as {
    redMs?: number;
    sustainedRed?: boolean;
    peakWpm30s?: number;
    burstTyping?: boolean;
    pasteishBursts?: number;
    pastesBlocked?: number;
    greenToRedTransitions?: number;
    highlightingOffWhileFlagged?: boolean;
    totalDurationMs?: number;
    totalInserts?: number;
    totalDeletes?: number;
  };
  const items = [
    [
      "Sustained time in red (>2 min)",
      r.sustainedRed ? "YES" : "no",
      Math.round((r.redMs ?? 0) / 1000) + "s total in red",
    ],
    [
      "Burst typing (>120 WPM for 30s+)",
      r.burstTyping ? "YES" : "no",
      `peak ${r.peakWpm30s ?? 0} WPM`,
    ],
    [
      "Long-pause→burst events",
      String(r.pasteishBursts ?? 0),
      "60s pause followed by 200+ chars in 30s",
    ],
    [
      "Paste-from-outside blocks",
      String(r.pastesBlocked ?? 0),
      "external pastes attempted",
    ],
    [
      "Green→red transitions",
      String(r.greenToRedTransitions ?? 0),
      "score crossed into red",
    ],
    [
      "Highlighting hidden while flagged",
      r.highlightingOffWhileFlagged ? "yes" : "no",
      "",
    ],
    [
      "Total duration",
      Math.round((r.totalDurationMs ?? 0) / 1000) + "s",
      `${r.totalInserts ?? 0} chars typed, ${r.totalDeletes ?? 0} deletes`,
    ],
  ];
  return (
    <table className="w-full text-sm" data-testid="activity-report">
      <tbody>
        {items.map(([label, value, hint]) => (
          <tr key={label} className="border-t border-stone-100">
            <td className="py-1.5 pr-3 text-stone-600">{label}</td>
            <td className="py-1.5 pr-3 font-medium text-stone-900">{value}</td>
            <td className="py-1.5 text-xs text-stone-500">{hint}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ProcessForensicsView({
  processScore,
  processClass,
  processFeatures,
  processFlags,
}: {
  processScore: number | null;
  processClass: "human" | "mixed" | "likelyAI" | null;
  processFeatures: Record<string, unknown> | null;
  processFlags: string[] | null;
}) {
  if (processScore == null || !processFeatures) {
    return (
      <p className="text-sm text-stone-500" data-testid="process-no-data">
        No writing-process analysis available (legacy submission, accommodated
        student, or fewer than 20 keystroke events / 80 chars).
      </p>
    );
  }
  const adjusted = processFeatures.__baselineAdjustedScore as
    | number
    | null
    | undefined;
  const baselineN = (processFeatures.__baselineN as number | undefined) ?? 0;
  const baselineSnap =
    (processFeatures.__baselineSnapshot as Record<string, number> | null) ??
    null;
  const flags = Array.isArray(processFlags) ? processFlags : [];

  const classColor =
    processClass === "likelyAI"
      ? "destructive"
      : processClass === "mixed"
        ? "default"
        : "secondary";

  const featureKeys = Object.keys(processFeatures).filter(
    (k) => !k.startsWith("__") && k !== "_hasData",
  );

  // Burst length timeline — pulled from features._hasData? No — recompute
  // from displayed keys. Burst chart shown only if we can derive a sequence
  // (we don't persist per-burst lengths separately).
  return (
    <div className="space-y-4" data-testid="process-forensics">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={classColor === "destructive" ? "destructive" : "outline"}>
          process score: {processScore}
        </Badge>
        <Badge variant="outline">class: {processClass ?? "—"}</Badge>
        {baselineN > 0 ? (
          <Badge variant="outline">
            vs. this student's baseline (n={baselineN}):{" "}
            {adjusted != null ? adjusted : "—"}
          </Badge>
        ) : (
          <Badge variant="outline">No baseline yet (1st submission)</Badge>
        )}
      </div>

      {flags.length > 0 ? (
        <div>
          <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
            Findings
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm text-stone-800">
            {flags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-stone-500">
          No individual features crossed the suspicion threshold.
        </p>
      )}

      <div>
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Feature breakdown
        </div>
        <table className="w-full text-sm" data-testid="process-feature-table">
          <thead>
            <tr className="border-b border-stone-200 text-left text-xs text-stone-500">
              <th className="py-1.5 pr-3 font-normal">Feature</th>
              <th className="py-1.5 pr-3 font-normal">This submission</th>
              <th className="py-1.5 pr-3 font-normal">Student baseline</th>
              <th className="py-1.5 font-normal">Notes</th>
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((k) => {
              const v = processFeatures[k];
              const baseV = baselineSnap?.[k];
              return (
                <tr key={k} className="border-t border-stone-100 align-top">
                  <td className="py-1.5 pr-3 font-mono text-xs text-stone-700">
                    {k}
                  </td>
                  <td className="py-1.5 pr-3 font-medium text-stone-900">
                    {fmtFeature(
                      k,
                      typeof v === "number" ? v : undefined,
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-stone-600">
                    {baselineN > 0
                      ? fmtFeature(k, baseV)
                      : <span className="text-stone-400">—</span>}
                  </td>
                  <td className="py-1.5 text-xs text-stone-500">
                    {FEATURE_NOTES[k] ?? ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <BurstLengthChart features={processFeatures} />
    </div>
  );
}

function BurstLengthChart({
  features,
}: {
  features: Record<string, unknown>;
}) {
  // We don't persist per-burst lengths — show the summary stats we do have.
  const cv = features.burstLengthCV as number | undefined;
  if (cv == null) return null;
  // Synthesize a representative band so admin sees uniformity at a glance.
  const w = 600;
  const h = 60;
  // Visual: solid stripe whose variation height = CV.
  const stripeH = Math.max(2, Math.min(h - 4, cv * h));
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
        Burst-length variation
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-14 w-full"
        data-testid="burst-chart"
      >
        <rect x={0} y={0} width={w} height={h} fill="#fafaf9" />
        <rect
          x={0}
          y={(h - stripeH) / 2}
          width={w}
          height={stripeH}
          fill={cv < 0.2 ? "#fecaca" : cv < 0.5 ? "#fde68a" : "#bbf7d0"}
        />
      </svg>
      <p className="mt-1 text-xs text-stone-500">
        CV = {cv.toFixed(2)} — narrow red stripe = transcription-uniform; wide
        green stripe = varied human bursts.
      </p>
    </div>
  );
}

function Replay({ events }: { events: KEvent[] }) {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Reconstruct text up to pos by replaying inserts/deletes.
  const text = useMemo(() => {
    let s = "";
    for (let i = 0; i < pos && i < events.length; i++) {
      const e = events[i];
      if (e.k === "i") s += e.d ?? "";
      else if (e.k === "d") s = s.slice(0, -1);
    }
    return s;
  }, [events, pos]);

  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    lastTickRef.current = performance.now();
    const tick = (now: number) => {
      const dt = now - lastTickRef.current;
      lastTickRef.current = now;
      setPos((p) => {
        if (p >= events.length) {
          setPlaying(false);
          return p;
        }
        // Advance by elapsed (scaled) virtual ms
        const virtual = dt * speed;
        let np = p;
        const target = (events[p]?.t ?? 0) + virtual;
        while (
          np < events.length &&
          (events[np]?.t ?? 0) <= target
        ) {
          np++;
        }
        return Math.max(p + 1, np);
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, speed, events]);

  if (events.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        No keystroke log available for this submission.
      </p>
    );
  }

  const totalSec = Math.round((events[events.length - 1]?.t ?? 0) / 1000);
  const curSec = Math.round((events[Math.max(0, pos - 1)]?.t ?? 0) / 1000);

  return (
    <div className="space-y-3" data-testid="replay">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPlaying((p) => !p)}
          data-testid="button-replay-play"
        >
          {playing ? (
            <>
              <Pause className="mr-1 h-3.5 w-3.5" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-1 h-3.5 w-3.5" />
              Play
            </>
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setPlaying(false);
            setPos(0);
          }}
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Reset
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSpeed((s) => (s >= 32 ? 1 : s * 2))}
        >
          <FastForward className="mr-1 h-3.5 w-3.5" />
          {speed}× speed
        </Button>
        <span className="text-xs text-stone-500">
          {curSec}s / {totalSec}s — event {pos}/{events.length}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={events.length}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="w-full"
        aria-label="Replay scrubber"
      />
      <pre className="min-h-[180px] whitespace-pre-wrap rounded-md border border-stone-200 bg-stone-50 p-3 font-sans text-sm text-stone-800">
        {text || "(empty)"}
      </pre>
    </div>
  );
}

function ScoreSparkline({
  samples,
}: {
  samples: { t: number; score: number }[];
}) {
  if (samples.length === 0) {
    return (
      <p className="text-sm text-stone-500">No score samples recorded.</p>
    );
  }
  const w = 600;
  const h = 80;
  const maxT = samples[samples.length - 1].t || 1;
  const pts = samples
    .map((s) => `${(s.t / maxT) * w},${h - s.score * h}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-20 w-full"
      data-testid="score-sparkline"
    >
      <rect x={0} y={0} width={w} height={h * 0.3} fill="#fee2e2" />
      <rect x={0} y={h * 0.3} width={w} height={h * 0.4} fill="#fef3c7" />
      <rect x={0} y={h * 0.7} width={w} height={h * 0.3} fill="#d1fae5" />
      <polyline
        points={pts}
        fill="none"
        stroke="#1c1917"
        strokeWidth={1.5}
      />
    </svg>
  );
}
