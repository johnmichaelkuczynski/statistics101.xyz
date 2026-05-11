/**
 * Diachronic process forensics — second-layer AI detector.
 *
 * Pure module: no I/O, no DB, no HTTP. Deterministic. The submissions route
 * and the live `processScore` endpoint both call into this. The diagnostic
 * suite tests it with synthetic streams.
 *
 * Design: GPTZero scores the *output*. This scores the *process*. A student
 * who reads AI text on a side monitor and retypes it leaves a distinctive
 * fingerprint — uniform burst timing, near-zero deletions, no backtracking,
 * no abandoned-and-restarted starts. We measure that shape and combine it
 * with a per-student baseline so each student is judged against their own
 * normal writing behavior.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProcessEventType =
  | "insert"
  | "delete"
  | "caretJump"
  | "focus"
  | "blur";

export interface ProcessEvent {
  /** ms since session start (or epoch — we only use deltas). */
  t: number;
  type: ProcessEventType;
  /** Caret position at the moment of the event (best-effort). */
  pos?: number;
  /** Chars affected by this event (0 for caret/focus/blur). */
  len: number;
  /** For inserts: actual char count (alias of len). */
  charCount?: number;
  caretBefore?: number;
  caretAfter?: number;
  /** Optional inserted text (kept short — first ~32 chars). */
  text?: string;
  /** LEGACY field — old keystroke logs. */
  k?: string;
  /** LEGACY field — old keystroke logs. */
  d?: string;
}

export interface ProcessFeatures {
  burstUniformity: number;          // stdev of inter-keystroke gaps inside bursts (ms)
  pauseBeforeNewSentence: number;   // median ms between sentence-end and next non-ws char
  pauseBeforeNewParagraph: number;  // median ms before \n\n boundaries
  deletionRatio: number;            // deletedChars / insertedChars
  structuralEditCount: number;      // large or far-back deletes
  caretBacktrackCount: number;      // backward caret jumps > 100 chars
  abandonedStartCount: number;      // ≥30-char bursts mostly deleted then restarted
  burstLengthCV: number;            // coefficient of variation of burst lengths
  frontToBackLinearity: number;     // fraction of inserts at end-of-doc
  totalActiveSeconds: number;       // sum of inter-event gaps, capped at 30s/gap
  charsPerSecond: number;           // final length / totalActiveSeconds
  /** Internal: which features had usable data this submission. */
  _hasData: Partial<Record<keyof Omit<ProcessFeatures, "_hasData">, boolean>>;
}

export type ProcessClass = "human" | "mixed" | "likelyAI";

export interface ProcessBaseline {
  n: number;
  features: Record<string, number>;
}

export interface ProcessAnalysis {
  processScore: number;
  processClass: ProcessClass;
  features: ProcessFeatures;
  flags: string[];
  baselineAdjustedScore?: number | null;
  baselineDeviation?: Record<string, number> | null;
}

// ---------------------------------------------------------------------------
// Tunable constants
// ---------------------------------------------------------------------------

/** Max gap between consecutive insert events still considered the same burst. */
const BURST_GAP_MS = 1500;

/** Cap on a single inter-event gap counted toward "active time". */
const ACTIVE_GAP_CAP_MS = 30_000;

/**
 * Per-feature weights in the score (0–100). A feature contributes only if
 * the submission produced usable data for it. Weights for features without
 * data are dropped from the denominator. Tune here, re-run diagnostic tests.
 */
export const WEIGHTS: Record<keyof Omit<ProcessFeatures, "_hasData">, number> = {
  burstUniformity: 1.5,
  deletionRatio: 1.5,
  burstLengthCV: 1.0,
  abandonedStartCount: 1.0,
  caretBacktrackCount: 1.0,
  structuralEditCount: 1.0,
  frontToBackLinearity: 0.8,
  charsPerSecond: 0.8,
  pauseBeforeNewSentence: 0.7,
  pauseBeforeNewParagraph: 0.5,
  totalActiveSeconds: 0, // context only, not scored
};

const HUMAN_THRESHOLD = 35;
const AI_THRESHOLD = 65;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / xs.length;
  return Math.sqrt(v);
}

function isInsert(e: ProcessEvent): boolean {
  // If the new typed field is present, trust it exclusively. Legacy `k:"m"`
  // is now reused for caretJump/focus/blur and must NEVER be classified as
  // an insert when typed events are in play.
  if (e.type) return e.type === "insert";
  // Pure-legacy event (older submissions without `type`): `k:"i"` only.
  // We deliberately drop legacy `k:"m"` from the insert bucket — at worst
  // this slightly under-counts inserts on ancient rows.
  return e.k === "i";
}

function isDelete(e: ProcessEvent): boolean {
  if (e.type) return e.type === "delete";
  return e.k === "d";
}

function eventCharCount(e: ProcessEvent): number {
  // Non-text events have no char weight. Critical: caretJump/focus/blur
  // were previously falling through to the default `1` and inflating every
  // count downstream.
  if (e.type === "caretJump" || e.type === "focus" || e.type === "blur") {
    return 0;
  }
  if (typeof e.charCount === "number" && e.charCount > 0) return e.charCount;
  if (typeof e.len === "number" && e.len > 0) return e.len;
  if (typeof e.text === "string" && e.text.length > 0) return e.text.length;
  // Legacy: {d: "abc"} on insert, {d: "5"} on delete (count as string).
  if (typeof e.d === "string") {
    const n = Number(e.d);
    if (Number.isFinite(n) && n > 0) return n;
    return e.d.length || 1;
  }
  // Legacy `k:"m"` with no payload — treat as 0-weight rather than 1.
  if (e.k === "m" && !e.type) return 0;
  return 1;
}

// ---------------------------------------------------------------------------
// Feature extraction
// ---------------------------------------------------------------------------

export function extractFeatures(
  events: ProcessEvent[],
  finalText: string,
): ProcessFeatures {
  const _hasData: ProcessFeatures["_hasData"] = {};

  // Group inserts into bursts.
  const inserts = events.filter(isInsert);
  const deletes = events.filter(isDelete);

  const bursts: { events: ProcessEvent[]; chars: number; intraGaps: number[] }[] = [];
  for (const e of inserts) {
    const last = bursts[bursts.length - 1];
    if (last && e.t - last.events[last.events.length - 1].t <= BURST_GAP_MS) {
      const prev = last.events[last.events.length - 1];
      last.intraGaps.push(e.t - prev.t);
      last.events.push(e);
      last.chars += eventCharCount(e);
    } else {
      bursts.push({ events: [e], chars: eventCharCount(e), intraGaps: [] });
    }
  }

  // 1. burstUniformity: stdev of intra-burst gaps across all bursts.
  const allIntraGaps = bursts.flatMap((b) => b.intraGaps);
  const burstUniformity = stdev(allIntraGaps);
  if (allIntraGaps.length >= 3) _hasData.burstUniformity = true;

  // 2/3. Pauses before new sentence / paragraph.
  // Build a per-char timestamp series from inserts only (deletes excluded).
  const charSeries: { t: number; ch: string }[] = [];
  for (const e of inserts) {
    const text = typeof e.text === "string" ? e.text : (e.d ?? "");
    const count = eventCharCount(e);
    if (text.length === count && text.length > 0) {
      // Distribute timestamps evenly across the inserted run (best effort).
      for (let i = 0; i < text.length; i++) charSeries.push({ t: e.t, ch: text[i] });
    } else {
      // No text payload — synthesize as `count` neutral chars at this t.
      for (let i = 0; i < count; i++) charSeries.push({ t: e.t, ch: "x" });
    }
  }

  const sentencePauses: number[] = [];
  const paragraphPauses: number[] = [];
  for (let i = 0; i < charSeries.length - 1; i++) {
    const ch = charSeries[i].ch;
    if (ch !== "." && ch !== "?" && ch !== "!") continue;
    // Find next non-whitespace char after i.
    let j = i + 1;
    let containsDoubleNewline = false;
    let prevWasNewline = false;
    while (j < charSeries.length && /\s/.test(charSeries[j].ch)) {
      if (charSeries[j].ch === "\n") {
        if (prevWasNewline) containsDoubleNewline = true;
        prevWasNewline = true;
      } else {
        prevWasNewline = false;
      }
      j++;
    }
    if (j >= charSeries.length) continue;
    const gap = charSeries[j].t - charSeries[i].t;
    if (gap >= 0) {
      sentencePauses.push(gap);
      if (containsDoubleNewline) paragraphPauses.push(gap);
    }
  }
  const pauseBeforeNewSentence = median(sentencePauses);
  const pauseBeforeNewParagraph = median(paragraphPauses);
  if (sentencePauses.length >= 1) _hasData.pauseBeforeNewSentence = true;
  if (paragraphPauses.length >= 1) _hasData.pauseBeforeNewParagraph = true;

  // 4. deletionRatio.
  const insertedChars = inserts.reduce((s, e) => s + eventCharCount(e), 0);
  const deletedChars = deletes.reduce((s, e) => s + eventCharCount(e), 0);
  const deletionRatio = insertedChars > 0 ? deletedChars / insertedChars : 0;
  if (insertedChars > 0) _hasData.deletionRatio = true;

  // 5. structuralEditCount.
  let structuralEditCount = 0;
  // Estimate doc length over time by walking events.
  let docLen = 0;
  for (const e of events) {
    if (isInsert(e)) {
      docLen += eventCharCount(e);
    } else if (isDelete(e)) {
      const dlen = eventCharCount(e);
      const isLarge = dlen >= 30;
      const farBack =
        typeof e.caretBefore === "number" &&
        docLen > 0 &&
        e.caretBefore < docLen / 2;
      if (isLarge || farBack) structuralEditCount++;
      docLen = Math.max(0, docLen - dlen);
    }
  }
  _hasData.structuralEditCount = events.length >= 5;

  // 6. caretBacktrackCount: backward caret jumps > 100 chars.
  let caretBacktrackCount = 0;
  let lastCaret: number | null = null;
  for (const e of events) {
    if (e.type === "caretJump") {
      if (
        typeof e.caretBefore === "number" &&
        typeof e.caretAfter === "number" &&
        e.caretBefore - e.caretAfter > 100
      ) {
        caretBacktrackCount++;
      }
      lastCaret = e.caretAfter ?? lastCaret;
      continue;
    }
    if (typeof e.caretAfter === "number") {
      if (lastCaret != null && lastCaret - e.caretAfter > 100) {
        caretBacktrackCount++;
      }
      lastCaret = e.caretAfter;
    } else if (typeof e.caretBefore === "number") {
      lastCaret = e.caretBefore;
    }
  }
  _hasData.caretBacktrackCount = events.some(
    (e) => typeof e.caretBefore === "number" || typeof e.caretAfter === "number",
  );

  // 7. abandonedStartCount.
  let abandonedStartCount = 0;
  for (let i = 0; i < bursts.length; i++) {
    const b = bursts[i];
    if (b.chars < 30) continue;
    const startEvt = b.events[0];
    const endEvt = b.events[b.events.length - 1];
    const startCaret = startEvt.caretBefore;
    // Sum deletes within 60s of burst end.
    const windowEnd = endEvt.t + 60_000;
    let deletedSoon = 0;
    let nextInsert: ProcessEvent | null = null;
    for (let j = events.indexOf(endEvt) + 1; j < events.length; j++) {
      const e = events[j];
      if (e.t > windowEnd) break;
      if (isDelete(e)) deletedSoon += eventCharCount(e);
      if (isInsert(e) && !nextInsert) nextInsert = e;
    }
    if (deletedSoon < 0.8 * b.chars) continue;
    if (!nextInsert) continue;
    // Caret guard: if startCaret was unrecorded, *continue* — don't break.
    if (typeof startCaret !== "number") {
      // Without caret data, accept the abandoned-start signal on size+delete alone.
      abandonedStartCount++;
      continue;
    }
    const ni = nextInsert.caretBefore ?? nextInsert.caretAfter;
    if (typeof ni !== "number") continue;
    if (Math.abs(ni - startCaret) <= 10) abandonedStartCount++;
  }
  _hasData.abandonedStartCount = bursts.length >= 1;

  // 8. burstLengthCV.
  const burstLens = bursts.map((b) => b.chars);
  const burstMean = mean(burstLens);
  const burstLengthCV = burstMean > 0 ? stdev(burstLens) / burstMean : 0;
  if (burstLens.length >= 3) _hasData.burstLengthCV = true;

  // 9. frontToBackLinearity.
  let docLen2 = 0;
  let endOfDocInserts = 0;
  let totalInsertEvents = 0;
  for (const e of events) {
    if (isInsert(e)) {
      totalInsertEvents++;
      const caret = e.caretBefore ?? e.caretAfter;
      if (typeof caret === "number") {
        if (Math.abs(caret - docLen2) <= 1) endOfDocInserts++;
      } else {
        // No caret data → assume end-of-doc (legacy logs).
        endOfDocInserts++;
      }
      docLen2 += eventCharCount(e);
    } else if (isDelete(e)) {
      docLen2 = Math.max(0, docLen2 - eventCharCount(e));
    }
  }
  const frontToBackLinearity =
    totalInsertEvents > 0 ? endOfDocInserts / totalInsertEvents : 0;
  if (totalInsertEvents >= 3) _hasData.frontToBackLinearity = true;

  // 10. totalActiveSeconds.
  let activeMs = 0;
  for (let i = 1; i < events.length; i++) {
    const dt = events[i].t - events[i - 1].t;
    if (dt > 0) activeMs += Math.min(dt, ACTIVE_GAP_CAP_MS);
  }
  const totalActiveSeconds = activeMs / 1000;
  _hasData.totalActiveSeconds = events.length >= 2;

  // 11. charsPerSecond.
  const finalLen = finalText.length;
  const charsPerSecond =
    totalActiveSeconds > 0 ? finalLen / totalActiveSeconds : 0;
  if (totalActiveSeconds > 1) _hasData.charsPerSecond = true;

  return {
    burstUniformity,
    pauseBeforeNewSentence,
    pauseBeforeNewParagraph,
    deletionRatio,
    structuralEditCount,
    caretBacktrackCount,
    abandonedStartCount,
    burstLengthCV,
    frontToBackLinearity,
    totalActiveSeconds,
    charsPerSecond,
    _hasData,
  };
}

// ---------------------------------------------------------------------------
// Per-feature suspicion scoring (each returns 0–100 where 100 = AI-like).
// ---------------------------------------------------------------------------

function piecewise(x: number, points: [number, number][]): number {
  // points = [[xVal, scoreAtX], …] in ascending x. Linear interp + clamp.
  if (x <= points[0][0]) return points[0][1];
  if (x >= points[points.length - 1][0]) return points[points.length - 1][1];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return 0;
}

const SUSPICION: Record<
  keyof Omit<ProcessFeatures, "_hasData" | "totalActiveSeconds">,
  (v: number) => number
> = {
  burstUniformity: (v) =>
    piecewise(v, [
      [0, 100], [20, 100], [50, 80], [100, 50], [200, 10], [400, 0],
    ]),
  pauseBeforeNewSentence: (v) =>
    piecewise(v, [
      [0, 100], [200, 100], [500, 70], [1000, 30], [2000, 5], [5000, 0],
    ]),
  pauseBeforeNewParagraph: (v) =>
    piecewise(v, [
      [0, 100], [500, 90], [1500, 50], [3000, 15], [8000, 0],
    ]),
  deletionRatio: (v) =>
    piecewise(v, [
      [0, 100], [0.02, 90], [0.05, 70], [0.10, 40], [0.15, 10], [0.25, 0],
    ]),
  structuralEditCount: (v) =>
    piecewise(v, [[0, 80], [1, 50], [2, 20], [3, 5], [5, 0]]),
  caretBacktrackCount: (v) =>
    piecewise(v, [[0, 80], [1, 40], [2, 10], [4, 0]]),
  abandonedStartCount: (v) =>
    piecewise(v, [[0, 70], [1, 5], [2, 0]]),
  burstLengthCV: (v) =>
    piecewise(v, [
      [0, 100], [0.1, 95], [0.3, 70], [0.5, 40], [0.8, 15], [1.2, 0],
    ]),
  frontToBackLinearity: (v) =>
    piecewise(v, [
      [0, 0], [0.6, 10], [0.8, 30], [0.9, 60], [0.95, 80], [1.0, 100],
    ]),
  charsPerSecond: (v) =>
    piecewise(v, [[0, 0], [2, 10], [3, 40], [5, 70], [8, 100]]),
};

const SUSPICION_THRESHOLD = 60;

const FLAG_TEXT: Record<
  keyof typeof SUSPICION,
  (v: number, susp: number) => string
> = {
  burstUniformity: (v) =>
    `burstUniformity is ${v.toFixed(0)} ms (transcription-like — typing rhythm too uniform)`,
  pauseBeforeNewSentence: (v) =>
    `pauseBeforeNewSentence is ${v.toFixed(0)} ms (no thinking pause between sentences)`,
  pauseBeforeNewParagraph: (v) =>
    `pauseBeforeNewParagraph is ${v.toFixed(0)} ms (no thinking pause between paragraphs)`,
  deletionRatio: (v) =>
    `deletionRatio is ${(v * 100).toFixed(1)}% (very few corrections — humans normally edit 15–40%)`,
  structuralEditCount: (v) =>
    `structuralEditCount is ${v} (no large or far-back edits — text was produced linearly)`,
  caretBacktrackCount: (v) =>
    `caretBacktrackCount is ${v} (no significant backward caret jumps)`,
  abandonedStartCount: (v) =>
    `abandonedStartCount is ${v} (no false starts — humans normally try, delete, retry)`,
  burstLengthCV: (v) =>
    `burstLengthCV is ${v.toFixed(2)} (typing bursts are unusually uniform in length)`,
  frontToBackLinearity: (v) =>
    `frontToBackLinearity is ${(v * 100).toFixed(0)}% (text grew straight from front to back)`,
  charsPerSecond: (v) =>
    `charsPerSecond is ${v.toFixed(2)} (sustained transcription-grade typing speed)`,
};

// ---------------------------------------------------------------------------
// Scoring + classification
// ---------------------------------------------------------------------------

function classify(score: number): ProcessClass {
  if (score < HUMAN_THRESHOLD) return "human";
  if (score >= AI_THRESHOLD) return "likelyAI";
  return "mixed";
}

function rawScore(features: ProcessFeatures): number {
  let weighted = 0;
  let usedWeight = 0;
  for (const [key, weight] of Object.entries(WEIGHTS) as [
    keyof Omit<ProcessFeatures, "_hasData">,
    number,
  ][]) {
    if (weight === 0) continue;
    if (!features._hasData[key]) continue;
    if (key === "totalActiveSeconds") continue;
    const fn = SUSPICION[key as keyof typeof SUSPICION];
    if (!fn) continue;
    const v = features[key] as number;
    const susp = fn(v);
    weighted += susp * weight;
    usedWeight += weight;
  }
  if (usedWeight === 0) return 0;
  return Math.round(weighted / usedWeight);
}

function buildFlags(features: ProcessFeatures): string[] {
  const flags: string[] = [];
  for (const key of Object.keys(SUSPICION) as (keyof typeof SUSPICION)[]) {
    if (!features._hasData[key]) continue;
    const v = features[key] as number;
    const susp = SUSPICION[key](v);
    if (susp >= SUSPICION_THRESHOLD) flags.push(FLAG_TEXT[key](v, susp));
  }
  return flags;
}

export function analyzeProcess(
  events: ProcessEvent[],
  finalText: string,
): ProcessAnalysis {
  const features = extractFeatures(events, finalText);
  const score = rawScore(features);
  return {
    processScore: score,
    processClass: classify(score),
    features,
    flags: buildFlags(features),
    baselineAdjustedScore: null,
    baselineDeviation: null,
  };
}

// ---------------------------------------------------------------------------
// Baseline math
// ---------------------------------------------------------------------------

const BASELINE_KEYS: (keyof Omit<ProcessFeatures, "_hasData">)[] = [
  "burstUniformity",
  "pauseBeforeNewSentence",
  "pauseBeforeNewParagraph",
  "deletionRatio",
  "structuralEditCount",
  "caretBacktrackCount",
  "abandonedStartCount",
  "burstLengthCV",
  "frontToBackLinearity",
  "totalActiveSeconds",
  "charsPerSecond",
];

export function foldIntoBaseline(
  baseline: ProcessBaseline | null,
  features: ProcessFeatures,
): ProcessBaseline {
  const prevN = baseline?.n ?? 0;
  const prev = baseline?.features ?? {};
  const out: Record<string, number> = {};
  for (const k of BASELINE_KEYS) {
    if (!features._hasData[k]) {
      // Carry old value if we have it; otherwise leave undefined.
      if (prev[k] != null) out[k] = prev[k];
      continue;
    }
    const v = features[k] as number;
    out[k] = prevN > 0 && prev[k] != null
      ? (prev[k] * prevN + v) / (prevN + 1)
      : v;
  }
  return { n: prevN + 1, features: out };
}

export function compareToBaseline(
  features: ProcessFeatures,
  baseline: ProcessBaseline | null,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!baseline || baseline.n === 0) return out;
  for (const k of BASELINE_KEYS) {
    if (!features._hasData[k]) continue;
    const b = baseline.features[k];
    if (b == null) continue;
    const v = features[k] as number;
    if (Math.abs(b) < 1e-6) {
      out[k] = v === 0 ? 0 : 1;
    } else {
      out[k] = (v - b) / Math.max(1e-6, Math.abs(b));
    }
  }
  return out;
}

/**
 * If a feature deviates strongly *toward* the AI direction relative to the
 * student's baseline, the absolute score's verdict stands. If the feature is
 * just unusual but in either direction relative to baseline, we soften by
 * up to 15 points: a student whose baseline burstUniformity is 12 ms isn't
 * "robotic" *for them*.
 */
export function analyzeProcessWithBaseline(
  events: ProcessEvent[],
  finalText: string,
  baseline: ProcessBaseline | null,
): ProcessAnalysis {
  const base = analyzeProcess(events, finalText);
  if (!baseline || baseline.n === 0) {
    return { ...base, baselineAdjustedScore: null, baselineDeviation: null };
  }
  const dev = compareToBaseline(base.features, baseline);
  // For each scored feature, if this submission is *close* to the student's
  // baseline (|dev| < 0.5), soften that feature's contribution toward 50.
  let weighted = 0;
  let usedWeight = 0;
  for (const [key, weight] of Object.entries(WEIGHTS) as [
    keyof Omit<ProcessFeatures, "_hasData">,
    number,
  ][]) {
    if (weight === 0) continue;
    if (!base.features._hasData[key]) continue;
    if (key === "totalActiveSeconds") continue;
    const fn = SUSPICION[key as keyof typeof SUSPICION];
    if (!fn) continue;
    const v = base.features[key] as number;
    let susp = fn(v);
    const d = dev[key];
    if (typeof d === "number" && Math.abs(d) < 0.5) {
      // Pull suspicion toward neutral 50 (proportional to closeness).
      const closeness = 1 - Math.abs(d) / 0.5; // 0..1
      susp = susp + (50 - susp) * 0.6 * closeness;
    }
    weighted += susp * weight;
    usedWeight += weight;
  }
  const adjusted =
    usedWeight === 0 ? base.processScore : Math.round(weighted / usedWeight);
  return {
    ...base,
    baselineAdjustedScore: adjusted,
    baselineDeviation: dev,
  };
}
