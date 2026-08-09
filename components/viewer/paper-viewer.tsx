"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Download,
  FileText,
  ClipboardCheck,
  FileSearch,
  BarChart3,
  Highlighter,
  Maximize2,
  Minimize2,
  NotebookPen,
  PanelRight,
  Timer,
  Flag,
  Columns2,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { PastPaper, PaperKind } from "@/lib/types";
import { cn } from "@/lib/utils";
import { HIGHLIGHT_COLORS } from "@/lib/highlight-colors";
import { PdfDocumentViewer } from "./pdf-document";
import { SplitViewer } from "./split-viewer";
import { useStudyTools } from "@/components/tools/study-tools-provider";
import { PracticeSetupModal } from "@/components/practice/practice-setup-modal";
import { FilterForm, usePaperFilterForm } from "@/components/past-papers/paper-filter-form";
import {
  useActiveTimeTracker,
  useBookmarks,
  useOpenCounter,
  usePracticeRecords,
  usePracticeReview,
  usePracticeSession,
  useRecent,
  removeBookmark,
  upsertBookmark,
  upsertRecent,
  prependPracticeRecord,
} from "@/lib/local-hooks";
import { finalizeRecord, isReviewFor, isSessionActive, practiceRemainingMs } from "@/lib/practice";
import { formatClock, formatDuration } from "@/lib/format";

type ViewerMode = "qp" | "ms" | "gt" | "split" | "notes";

const KIND_META: Record<PaperKind, { label: string; icon: typeof FileText }> = {
  "question-paper": { label: "Question Paper", icon: FileText },
  "mark-scheme": { label: "Mark Scheme", icon: ClipboardCheck },
  "grade-threshold": { label: "Grade Threshold", icon: BarChart3 },
};

const VALID_MODES: ViewerMode[] = ["qp", "ms", "gt", "split", "notes"];

interface PaperViewerProps {
  paper: PastPaper;
}

export function PaperViewer({ paper }: PaperViewerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const availableKinds = paper.files.map((f) => f.kind);
  const hasKind = (k: PaperKind) => availableKinds.includes(k);

  const [mode, setMode] = useState<ViewerMode>(() => {
    const param = searchParams.get("mode");
    const doc = searchParams.get("doc");
    if (param !== null && (VALID_MODES as string[]).includes(param)) return param as ViewerMode;
    if (doc === "mark-scheme" && hasKind("mark-scheme")) return "ms";
    if (doc === "grade-threshold" && hasKind("grade-threshold")) return "gt";
    return "qp";
  });

  const [pages, setPages] = useState<Partial<Record<PaperKind, number>>>({});
  const [numPages, setNumPages] = useState<Partial<Record<PaperKind, number>>>({});
  const [scales, setScales] = useState<Partial<Record<PaperKind, number>>>({});
  const [focus, setFocus] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [reviewDismissed, setReviewDismissed] = useState(false);
  const [changePaperOpen, setChangePaperOpen] = useState(false);
  const [, tick] = useState(0);
  const [highlightMode, setHighlightMode] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string>(HIGHLIGHT_COLORS[0].value);

  const { open: toolsOpen, openTools, closeTools } = useStudyTools();
  const [bookmarks, setBookmarks] = useBookmarks();
  const [recent, setRecent] = useRecent();
  const [practiceSession, setPracticeSession] = usePracticeSession();
  const [practiceReview, setPracticeReview] = usePracticeReview();
  const [practiceRecords, setPracticeRecords] = usePracticeRecords();
  const countOpen = useOpenCounter();
  useActiveTimeTracker("paper");

  const containerRef = useRef<HTMLDivElement>(null);
  const openedKeyRef = useRef<string>("");
  const practiceActive =
    practiceSession !== null && practiceSession.paperId === paper.id && isSessionActive(practiceSession);
  const reviewVisible =
    !reviewDismissed && isReviewFor(practiceReview, paper.id) && !practiceActive;

  /* ---- Sync the mode into the URL so links stay shareable. ---- */
  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("mode", mode);
    next.delete("doc");
    if (next.toString() !== searchParams.toString()) {
      router.replace(`${window.location.pathname}?${next.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  /* ---- Active document per mode (QP for split/notes sides). ---- */
  const activeKind: PaperKind =
    mode === "ms" ? "mark-scheme" : mode === "gt" ? "grade-threshold" : "question-paper";

  const { formProps: changePaperFormProps } = usePaperFilterForm(
    (paperId, type) => {
      setChangePaperOpen(false);
      router.push(`/past-papers/${paperId}?mode=${type === "mark-scheme" ? "ms" : "qp"}`);
    },
    {
      subjectCode: paper.subjectCode,
      year: String(paper.year),
      session: paper.session,
      variant: `${paper.paperNumber}${paper.variant}`,
      type: activeKind === "mark-scheme" ? "mark-scheme" : "question-paper",
    }
  );

  /* ---- Record the open + recent item when the active document changes. ---- */
  useEffect(() => {
    const key = `${paper.id}:${activeKind}`;
    if (openedKeyRef.current === key) return;
    openedKeyRef.current = key;
    countOpen(`paper:${paper.id}:${activeKind}`);
    const file = paper.files.find((f) => f.kind === activeKind);
    if (!file) return;
    const modeParam = activeKind === "question-paper" ? "qp" : activeKind === "mark-scheme" ? "ms" : "gt";
    setRecent((cur) =>
      upsertRecent(cur, {
        key,
        kind: activeKind,
        id: paper.id,
        title: `${paper.subjectName} · ${paper.paperName}`,
        subtitle: `${paper.subjectCode} · ${paper.session} ${paper.year}`,
        subjectCode: paper.subjectCode,
        subjectName: paper.subjectName,
        url: `/past-papers/${paper.id}?mode=${modeParam}`,
        openedAt: new Date().toISOString(),
      })
    );
  }, [paper, activeKind, countOpen, setRecent]);

  /* ---- Practice countdown: re-render every half second while running. ---- */
  const remainingMs = practiceSession ? practiceRemainingMs(practiceSession) : 0;
  useEffect(() => {
    if (!practiceActive) return;
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [practiceActive]);

  /* ---- Auto-finish when time expires. ---- */
  useEffect(() => {
    if (practiceActive && practiceSession !== null && remainingMs <= 0) {
      finishPractice("expired");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceActive, remainingMs]);

  function finishPractice(endedBy: "manual" | "expired") {
    if (practiceSession === null) return;
    const record = finalizeRecord(practiceSession, endedBy);
    setPracticeRecords((cur) => prependPracticeRecord(cur, record));
    setPracticeReview({ paperId: paper.id, recordId: record.id, finishedAt: record.finishedAt });
    setPracticeSession(null);
    setConfirmEnd(false);
    setReviewDismissed(false);
  }

  const isBookmarked = bookmarks.some((b) => b.id === paper.id);

  const toggleBookmark = useCallback(() => {
    if (isBookmarked) {
      setBookmarks((cur) => removeBookmark(cur, paper.id));
    } else {
      setBookmarks((cur) =>
        upsertBookmark(cur, {
          id: paper.id,
          kind: "paper",
          title: `${paper.subjectName} · ${paper.paperName}`,
          subtitle: `${paper.subjectCode} · ${paper.session} ${paper.year}`,
          url: `/past-papers/${paper.id}?mode=qp`,
          addedAt: new Date().toISOString(),
        })
      );
    }
  }, [isBookmarked, paper, setBookmarks]);

  function toggleFocus() {
    if (!document.fullscreenElement) {
      void containerRef.current?.requestFullscreen?.().catch(() => undefined);
    } else {
      void document.exitFullscreen?.().catch(() => undefined);
    }
  }

  useEffect(() => {
    const onChange = () => setFocus(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function setModeSafe(next: ViewerMode) {
    setMode(next);
    setReviewDismissed(true);
  }

  const activeFile = paper.files.find((f) => f.kind === activeKind);
  const fileName = activeFile ? activeFile.url.split("/").pop() || `${paper.id}.pdf` : `${paper.id}.pdf`;

  const docProps = (kind: PaperKind) => ({
    url: paper.files.find((f) => f.kind === kind)?.url ?? "",
    label: KIND_META[kind].label,
    pageNumber: pages[kind] ?? 1,
    numPages: numPages[kind] ?? 0,
    scale: scales[kind] ?? 1,
    onPageChange: (p: number) => setPages((cur) => ({ ...cur, [kind]: p })),
    onNumPagesChange: (n: number) => setNumPages((cur) => ({ ...cur, [kind]: n })),
    onScaleChange: (s: number) => setScales((cur) => ({ ...cur, [kind]: s })),
    docKey: `${paper.id}:${kind}`,
    highlightMode,
    highlightColor,
    onHighlightColorChange: setHighlightColor,
  });

  const qpAvailable = hasKind("question-paper");
  const msAvailable = hasKind("mark-scheme");
  const gtAvailable = hasKind("grade-threshold");

  const singleKind: PaperKind = mode === "ms" ? "mark-scheme" : mode === "gt" ? "grade-threshold" : "question-paper";
  const singleFile = paper.files.find((f) => f.kind === singleKind);

  const modePills: { id: ViewerMode; label: string; icon?: typeof FileText; disabled?: boolean }[] = [
    { id: "qp", label: "QP", icon: FileText, disabled: !qpAvailable },
    { id: "ms", label: "MS", icon: ClipboardCheck, disabled: !msAvailable || practiceActive },
    { id: "split", label: "Split", icon: Columns2, disabled: !(qpAvailable && msAvailable) || practiceActive },
    ...(gtAvailable ? [{ id: "gt" as ViewerMode, label: "GT", icon: BarChart3 }] : []),
    { id: "notes", label: "Notes", icon: NotebookPen, disabled: !qpAvailable },
  ];

  return (
    <div
      ref={containerRef}
      className={cn("flex flex-col bg-surface", focus && "h-screen")}
    >
      {/* Main toolbar */}
      <div className="flex flex-col gap-2 border-b border-border bg-background px-4 py-3 md:px-5">
        <div className="flex items-center gap-3">
          {!focus && (
            <Link
              href="/past-papers"
              aria-label="Back to past papers"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-surface"
            >
              <ArrowLeft size={16} />
            </Link>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-muted">
              {paper.subjectCode} · {paper.subjectName}
            </p>
            <h1 className="truncate font-display text-[15px] font-semibold text-ink">
              {paper.paperName} · {paper.session} {paper.year}
            </h1>
          </div>

          <button
            onClick={() => setChangePaperOpen(true)}
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink sm:inline-flex"
          >
            <SlidersHorizontal size={14} />
            Change paper
          </button>

          <button
            onClick={() => setHighlightMode((v) => !v)}
            aria-pressed={highlightMode}
            className={cn(
              "hidden h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors sm:inline-flex",
              highlightMode
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Highlighter size={14} />
            Highlight
          </button>

          <button
            onClick={() => setPracticeOpen(true)}
            disabled={practiceActive}
            className="hidden h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink sm:inline-flex disabled:opacity-40"
          >
            <Timer size={14} />
            Practice
          </button>

          <button
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this paper"}
            aria-pressed={isBookmarked}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
              isBookmarked
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:bg-surface hover:text-ink"
            )}
          >
            {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>

          <button
            onClick={toolsOpen ? closeTools : openTools}
            aria-label="Study tools"
            aria-pressed={toolsOpen}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
              toolsOpen ? "border-accent/40 bg-accent-soft text-accent" : "border-border text-muted hover:bg-surface hover:text-ink"
            )}
          >
            <PanelRight size={16} />
          </button>

          {activeFile && (
            <a
              href={`/api/pdf-proxy?url=${encodeURIComponent(activeFile.url)}&download=1&filename=${encodeURIComponent(fileName)}`}
              download={fileName}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-ink-solid px-4 text-xs font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          <button
            onClick={toggleFocus}
            aria-label="Enter full screen"
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:bg-surface hover:text-ink md:flex"
          >
            <Maximize2 size={15} />
          </button>
        </div>

        {/* Mode pills */}
        {!focus && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {modePills.map((pill) => {
              const Icon = pill.icon;
              const active = mode === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => !pill.disabled && setModeSafe(pill.id)}
                  disabled={pill.disabled}
                  title={pill.disabled ? (practiceActive ? "Hidden during practice" : "Not available") : undefined}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                    active ? "bg-ink-solid text-on-ink" : "text-muted hover:bg-surface hover:text-ink",
                    pill.disabled && "cursor-not-allowed opacity-40"
                  )}
                >
                  {Icon && <Icon size={13} />}
                  {pill.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Practice banner */}
      {practiceActive && practiceSession && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-signal-amber/30 bg-signal-amber/10 px-4 py-3 md:px-5">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-signal-amber">
            <Timer size={15} />
            Practice Mode
          </span>
          <span className="font-mono text-lg font-medium text-ink">{formatClock(remainingMs)}</span>
          <span className="hidden text-xs text-muted sm:inline">Mark scheme hidden until you finish.</span>
          <div className="ml-auto flex items-center gap-2">
            {!confirmEnd ? (
              <button
                onClick={() => setConfirmEnd(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink-solid px-4 text-xs font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
              >
                <Flag size={13} />
                End Session
              </button>
            ) : (
              <>
                <span className="text-xs font-medium text-ink">Finish now and review?</span>
                <button
                  onClick={() => finishPractice("manual")}
                  className="inline-flex h-9 items-center rounded-full bg-signal-green px-4 text-xs font-medium text-white transition-colors hover:brightness-110"
                >
                  Yes, finish
                </button>
                <button
                  onClick={() => setConfirmEnd(false)}
                  className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-medium text-ink transition-colors hover:bg-surface"
                >
                  Keep going
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review panel after a completed attempt */}
      {reviewVisible && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-signal-green/30 bg-signal-green/10 px-4 py-3 md:px-5">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-green">
            <Sparkles size={15} />
            Practice complete
          </span>
          <span className="text-xs text-muted">
            {practiceReview &&
              formatDuration(practiceRecords.find((r) => r.id === practiceReview.recordId)?.elapsedMs ?? 0)}{" "}
            — time to check your answers against the mark scheme.
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <button
              onClick={() => setModeSafe("split")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink-solid px-4 text-xs font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
            >
              <Columns2 size={13} />
              Split View
            </button>
            <button
              onClick={() => setModeSafe("ms")}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-ink transition-colors hover:bg-surface"
            >
              <ClipboardCheck size={13} />
              Mark Scheme
            </button>
            <button
              onClick={() => setReviewDismissed(true)}
              className="inline-flex h-9 items-center rounded-full px-3 text-xs font-medium text-muted transition-colors hover:text-ink"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main area: single / split / notes */}
      <div
        className={cn(
          "flex flex-1 gap-3 p-3 md:p-4",
          focus ? "min-h-0" : "min-h-[calc(100vh-17rem)]"
        )}
      >
        {mode === "split" && qpAvailable && msAvailable && (
          <SplitViewer
            left={docProps("question-paper")}
            right={docProps("mark-scheme")}
            onScaleChange={(s) => setScales((cur) => ({ ...cur, "question-paper": s, "mark-scheme": s }))}
          />
        )}

        {mode === "notes" && qpAvailable && (
          <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
            <div className="flex min-h-0 flex-1">
              <PdfDocumentViewer {...docProps("question-paper")} />
            </div>
            <aside className="w-full shrink-0 lg:w-[320px]">
              <NotesSidePanel paper={paper} />
            </aside>
          </div>
        )}

        {mode === "qp" && qpAvailable && (
          <div className="flex min-h-0 flex-1">
            <PdfDocumentViewer {...docProps("question-paper")} />
          </div>
        )}

        {!practiceActive && (mode === "ms" || mode === "gt") && singleFile && (
          <div className="flex min-h-0 flex-1">
            <PdfDocumentViewer {...docProps(singleKind)} />
          </div>
        )}

        {mode === "qp" && !qpAvailable && <MissingDoc message="No question paper is available for this paper." />}
        {mode === "ms" && !msAvailable && !practiceActive && (
          <MissingDoc message="No mark scheme is available for this paper." />
        )}
        {mode === "gt" && !gtAvailable && <MissingDoc message="No grade threshold document is available for this session." />}
        {mode === "split" && !(qpAvailable && msAvailable) && (
          <MissingDoc message="Split view needs both a question paper and a mark scheme." />
        )}
        {mode === "notes" && !qpAvailable && <MissingDoc message="No question paper is available for this paper." />}
      </div>

      <PracticeSetupModal open={practiceOpen} onClose={() => setPracticeOpen(false)} initialPaperId={paper.id} />

      {changePaperOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setChangePaperOpen(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-border bg-background p-5 shadow-soft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Change paper</p>
              <button
                onClick={() => setChangePaperOpen(false)}
                aria-label="Close"
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>
            <FilterForm {...changePaperFormProps} hideHeading />
          </div>
        </div>
      )}
    </div>
  );
}

function MissingDoc({ message }: { message: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-background p-10 text-center">
      <FileSearch size={28} className="text-muted" />
      <p className="max-w-xs text-sm text-muted">{message}</p>
      <Link
        href="/past-papers"
        className="mt-1 inline-flex h-9 items-center rounded-full bg-ink-solid px-4 text-xs font-medium text-on-ink hover:bg-ink-solid/90"
      >
        Find another paper
      </Link>
    </div>
  );
}

function NotesSidePanel({ paper }: { paper: PastPaper }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 shadow-soft">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <NotebookPen size={16} className="text-accent" />
        Study Notes
      </p>
      <p className="text-sm leading-relaxed text-muted">
        Syllabus notes for {paper.subjectName} ({paper.subjectCode}) aren&apos;t linked to past papers yet — they&apos;re
        coming soon.
      </p>
      <Link
        href="/notes"
        className="inline-flex h-9 items-center justify-center rounded-full bg-accent-soft px-4 text-xs font-medium text-accent transition-colors hover:bg-accent/15"
      >
        Browse Notes
      </Link>
    </div>
  );
}