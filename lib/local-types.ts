import type { PaperKind } from "./types";

/** Everything below is persisted to localStorage. */
export type Theme = "light" | "dark" | "amoled";

/** A single highlighter mark on a PDF page, saved per document (paper + kind). */
export interface Highlight {
  id: string;
  page: number;
  /** Selected text, kept for reference only (not shown as copyable). */
  text: string;
  color: string;
  /** Bounding boxes as fractions (0–1) of the page's rendered width/height,
   *  so they stay correctly placed across zoom levels and resizes. */
  rects: { x: number; y: number; w: number; h: number }[];
  createdAt: string;
}

export interface UserProfile {
  name: string;
  createdAt: string;
}

export type RecentKind = "question-paper" | "mark-scheme" | "grade-threshold" | "note";

export interface RecentItem {
  /** Stable unique key used for deduplication, e.g. paperId + ":" + kind. */
  key: string;
  kind: RecentKind;
  id: string;
  title: string;
  subtitle: string;
  /** Kind is the document type; kept separate from the paper-level subject. */
  subjectCode: string;
  subjectName: string;
  url: string;
  openedAt: string;
}

export interface BookmarkItem {
  id: string;
  kind: "paper" | "note";
  title: string;
  subtitle: string;
  url: string;
  addedAt: string;
}

export interface StudyActivity {
  papersOpened: number;
  papersPractised: number;
  notesOpened: number;
  /** Time spent *actively* viewing papers (pauses when tab hidden). */
  papersTotalMs: number;
  /** Time spent actively reading notes. */
  notesTotalMs: number;
}

export interface PracticeRecord {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectCode: string;
  subjectName: string;
  session: string;
  year: number;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  elapsedMs: number;
  endedBy: "manual" | "expired";
}

export interface PracticeSession {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectCode: string;
  subjectName: string;
  /** Exam session label, e.g. "May/June". */
  session: string;
  /** Exam year. */
  year: number;
  /** Wall-clock timestamp (ms) the running segment began. */
  startedAt: number;
  /** Total chosen duration in ms. */
  durationMs: number;
  /** Elapsed ms accrued before the current running segment (pause support). */
  elapsedMs: number;
  running: boolean;
}

/** Marks a just-completed practice attempt so the viewer can offer review. */
export interface PracticeReview {
  paperId: string;
  recordId: string;
  finishedAt: string;
}

export interface ActiveTimer {
  label: string;
  durationMs: number;
  /** Absolute end timestamp in ms while running (null when paused/stopped). */
  endAt: number | null;
  /** Elapsed ms accrued before the current running segment. */
  elapsedMs: number;
  running: boolean;
  finishedAt: number | null;
}

export type ToolId = "calculator" | "desmos" | "timer" | "converter" | "scratchpad";

export interface ToolPrefs {
  tool: ToolId;
  scratchpadKey: string | null;
}