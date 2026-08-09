"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Timer, Play } from "lucide-react";
import { subjectCodeDirectory } from "@/data/subjects";
import { buildPaperId, parsePaperId, toSelection, type PaperSelection } from "@/lib/paper-descriptor";
import { usePracticeSession } from "@/lib/local-hooks";
import { newSessionId } from "@/lib/practice";
import type { Session } from "@/lib/types";

const SESSIONS: Session[] = ["Feb/March", "May/June", "Oct/Nov"];

function parseDuration(h: string, min: string, s: string): number | null {
  const hours = Number(h) || 0;
  const minutes = Number(min) || 0;
  const seconds = Number(s) || 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  const total = (hours * 3600 + minutes * 60 + seconds) * 1000;
  return total > 0 ? total : null;
}

interface PracticeSetupModalProps {
  open: boolean;
  onClose: () => void;
  /** When opened from a specific paper, paper fields are pre-filled/locked. */
  initialPaperId?: string | null;
}

export function PracticeSetupModal({ open, onClose, initialPaperId }: PracticeSetupModalProps) {
  const router = useRouter();
  const [, setSession] = usePracticeSession();

  const [code, setCode] = useState("");
  const [year, setYear] = useState("");
  const [examSession, setExamSession] = useState<Session>("May/June");
  const [variant, setVariant] = useState("");
  const [h, setH] = useState("");
  const [m, setM] = useState("");
  const [s, setS] = useState("");
  const [error, setError] = useState<string | null>(null);

  const initialPaper: PaperSelection | null = useMemo(
    () => (initialPaperId ? parsePaperId(initialPaperId) : null),
    [initialPaperId]
  );

  if (!open) return null;

  function selected(): PaperSelection | { error: string } {
    if (initialPaper) return initialPaper;
    if (!code) return { error: "Enter a subject code." };
    const subject = subjectCodeDirectory[code.trim()];
    if (!subject) return { error: `"${code}" isn't a subject code we recognise.` };
    if (!/^\d{4}$/.test(year)) return { error: "Enter a 4-digit year, e.g. 2025." };
    if (!/^\d{1,2}$/.test(variant)) return { error: "Enter the combined paper + variant, e.g. 12." };
    return toSelection({ code: code.trim(), subject, year, session: examSession, variant });
  }

  function start() {
    const resolved = selected();
    if ("error" in resolved) {
      setError(resolved.error);
      return;
    }
    const durationMs = parseDuration(h, m, s);
    if (durationMs === null) {
      setError("Enter a time limit above zero.");
      return;
    }
    const paper = resolved;
    const paperId = buildPaperId(paper);
    setSession({
      id: newSessionId(),
      paperId,
      paperTitle: paper.paperName,
      subjectCode: paper.code,
      subjectName: paper.subject.name,
      session: paper.session,
      year: Number(paper.year),
      startedAt: Date.now(),
      durationMs,
      elapsedMs: 0,
      running: true,
    });
    onClose();
    router.push(`/past-papers/${paperId}?mode=qp`);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-softLg"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={16} />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Timer size={20} strokeWidth={1.8} />
        </span>
        <h2 id="practice-title" className="mt-3 font-display text-xl font-semibold tracking-tight text-ink">
          Practice Mode
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {initialPaper
            ? "Practise this past paper under timed conditions. The mark scheme stays hidden until you finish."
            : "Pick a past paper, set a time limit, and answer it under exam conditions. The mark scheme stays hidden until you finish."}
        </p>

        <div className="mt-5 space-y-3">
          {!initialPaper && (
            <div className="grid grid-cols-2 gap-2">
              <Field
                label="Subject Code"
                value={code}
                onChange={(v) => {
                  setCode(v);
                }}
                placeholder="e.g. 9709"
                maxLength={4}
              />
              <Field label="Year" value={year} onChange={setYear} placeholder="e.g. 2025" maxLength={4} />
              <select
                aria-label="Session"
                value={examSession}
                onChange={(e) => setExamSession(e.target.value as Session)}
                className="col-span-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                {SESSIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <Field
                label="Paper + Variant"
                value={variant}
                onChange={setVariant}
                placeholder="e.g. 12"
                maxLength={2}
              />
            </div>
          )}

          {initialPaper && (
            <div className="rounded-xl border border-border bg-surface/60 p-3.5 text-sm">
              <p className="font-medium text-ink">
                {initialPaper.subject.name} · {initialPaper.code}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {initialPaper.session} {initialPaper.year} · {initialPaper.paperName}
              </p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Time allowed</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <DurationField label="Hours" value={h} onChange={setH} maxLength={2} />
              <DurationField label="Minutes" value={m} onChange={setM} maxLength={2} />
              <DurationField label="Seconds" value={s} onChange={setS} maxLength={2} />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <button
            onClick={start}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
          >
            <Play size={16} />
            Start Practice Session
          </button>
          <p className="text-center text-[11px] leading-relaxed text-muted">
            You&apos;ll be able to review the mark scheme in split or single view after you submit.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder={placeholder}
        aria-label={label}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}

function DurationField({
  label,
  value,
  onChange,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength: number;
}) {
  return (
    <div>
      <label className="text-[11px] font-medium text-muted">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="0"
        aria-label={label}
        className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-center font-mono text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
    </div>
  );
}