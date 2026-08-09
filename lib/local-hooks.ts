"use client";

import { useCallback, useEffect, useRef } from "react";
import type {
  ActiveTimer,
  BookmarkItem,
  Highlight,
  PracticeRecord,
  PracticeReview,
  PracticeSession,
  RecentItem,
  StudyActivity,
  Theme,
  UserProfile,
} from "./local-types";
import { STORAGE_KEYS, readJSON } from "./storage";
import { useLocalState } from "./use-local-state";

/* ------------------------------------------------------------------ */
/* Validation guards                                                   */
/* ------------------------------------------------------------------ */

function isTheme(v: unknown): v is Theme {
  return v === "light" || v === "dark" || v === "amoled";
}

function isProfile(v: unknown): v is UserProfile {
  if (typeof v !== "object" || v === null) return false;
  const p = v as Record<string, unknown>;
  return typeof p.name === "string" && typeof p.createdAt === "string";
}

function isActivity(v: unknown): v is StudyActivity {
  if (typeof v !== "object" || v === null) return false;
  const a = v as Record<string, unknown>;
  const nums = ["papersOpened", "papersPractised", "notesOpened", "papersTotalMs", "notesTotalMs"];
  return nums.every((k) => typeof a[k] === "number" && Number.isFinite(a[k]));
}

function isPracticeRecord(v: unknown): v is PracticeRecord {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" && typeof r.paperId === "string" && typeof r.elapsedMs === "number"
  );
}

function isPracticeSession(v: unknown): v is PracticeSession {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.paperId === "string" &&
    typeof s.startedAt === "number" &&
    typeof s.durationMs === "number" &&
    typeof s.elapsedMs === "number" &&
    typeof s.running === "boolean"
  );
}

function isTimer(v: unknown): v is ActiveTimer {
  if (typeof v !== "object" || v === null) return false;
  const t = v as Record<string, unknown>;
  return typeof t.durationMs === "number" && typeof t.running === "boolean";
}

/* ------------------------------------------------------------------ Hooks */

export function useProfile(): [
  UserProfile | null,
  (next: UserProfile | null | ((current: UserProfile | null) => UserProfile | null)) => void
] {
  return useLocalState<UserProfile | null>(STORAGE_KEYS.profile, null, isProfile);
}

/** Whether the first-visit welcome modal has already been shown and dismissed (saved or skipped). */
export function useOnboarded(): [boolean, (next: boolean | ((current: boolean) => boolean)) => void] {
  return useLocalState<boolean>(STORAGE_KEYS.onboarded, false, (v) => typeof v === "boolean");
}

export function useTheme(): [Theme, (next: Theme | ((current: Theme) => Theme)) => void] {
  return useLocalState<Theme>(STORAGE_KEYS.theme, "light", isTheme);
}

export function useRecent(): [RecentItem[], (next: RecentItem[] | ((current: RecentItem[]) => RecentItem[])) => void] {
  return useLocalState<RecentItem[]>(STORAGE_KEYS.recent, [], (v) =>
    Array.isArray(v) && v.every((x) => x && typeof x === "object" && typeof (x as RecentItem).key === "string")
  );
}

export function useBookmarks(): [BookmarkItem[], (next: BookmarkItem[] | ((current: BookmarkItem[]) => BookmarkItem[])) => void] {
  return useLocalState<BookmarkItem[]>(STORAGE_KEYS.bookmarks, [], (v) =>
    Array.isArray(v) && v.every((x) => x && typeof x === "object" && typeof (x as BookmarkItem).id === "string")
  );
}

export function useActivity(): [StudyActivity, (next: StudyActivity | ((current: StudyActivity) => StudyActivity)) => void] {
  return useLocalState<StudyActivity>(
    STORAGE_KEYS.activity,
    {
      papersOpened: 0,
      papersPractised: 0,
      notesOpened: 0,
      papersTotalMs: 0,
      notesTotalMs: 0,
    },
    isActivity
  );}

export function usePracticeRecords(): [PracticeRecord[], (next: PracticeRecord[] | ((current: PracticeRecord[]) => PracticeRecord[])) => void] {
  return useLocalState<PracticeRecord[]>(STORAGE_KEYS.practiceRecords, [], (v) =>
    Array.isArray(v) && v.every(isPracticeRecord)
  );
}

export function usePracticeSession(): [
  PracticeSession | null,
  (next: PracticeSession | null | ((current: PracticeSession | null) => PracticeSession | null)) => void,
  () => void
] {
  const [session, setSession] = useLocalState<PracticeSession | null>(
    STORAGE_KEYS.practiceSession,
    null,
    (v) => v === null || isPracticeSession(v)
  );
  const clear = useCallback(() => setSession(null), [setSession]);
  return [session, setSession, clear];
}

export function usePracticeReview(): [PracticeReview | null, (next: PracticeReview | null) => void] {
  return useLocalState<PracticeReview | null>(
    STORAGE_KEYS.practiceReview,
    null,
    (v) =>
      v === null ||
      (typeof v === "object" &&
        typeof (v as PracticeReview).paperId === "string" &&
        typeof (v as PracticeReview).recordId === "string")
  );
}

export function useActiveTimer(): [ActiveTimer, (next: ActiveTimer | ((current: ActiveTimer) => ActiveTimer)) => void, () => void] {
  const [timer, setTimer] = useLocalState<ActiveTimer>(
    STORAGE_KEYS.examTimer,
    {
      label: "",
      durationMs: 0,
      endAt: null,
      elapsedMs: 0,
      running: false,
      finishedAt: null,
    },
    isTimer
  );
  const clear = useCallback(() => {
    setTimer({
      label: "",
      durationMs: 0,
      endAt: null,
      elapsedMs: 0,
      running: false,
      finishedAt: null,
    });
  }, [setTimer]);
  return [timer, setTimer, clear];
}

export function useScratchpad(key: string): [string, (next: string | ((current: string) => string)) => void] {
  return useLocalState<string>(STORAGE_KEYS.scratchpad(key), "", (v) => typeof v === "string");
}

/** Highlights for a single document (keyed by paperId + kind, e.g. "9709-...-qp"). */
export function useHighlights(
  key: string
): [Highlight[], (next: Highlight[] | ((current: Highlight[]) => Highlight[])) => void] {
  return useLocalState<Highlight[]>(STORAGE_KEYS.highlights(key), [], (v) => Array.isArray(v));
}

/**
 * Tracks actively-spent time on a study page. Time while the tab is hidden
 * (or the machine is idle for long stretches) is flushed and then skipped —
 * the counter only accrues for visible, in-focus time.
 */
export function useActiveTimeTracker(kind: "paper" | "note") {
  const [activity, setActivity] = useActivity();
  const lastVisibleRef = useRef<number | null>(null);
  const field = kind === "paper" ? "papersTotalMs" : "notesTotalMs";

  const flush = useCallback(() => {
    if (lastVisibleRef.current === null) return;
    const now = Date.now();
    const delta = now - lastVisibleRef.current;
    lastVisibleRef.current = now;
    if (delta < 1000) return; // ignore tiny deltas (re-renders, tab focus switches)
    if (delta > 2 * 60 * 60 * 1000) return; // abandoned tab / overnight sleep
    setActivity((a) => ({ ...a, [field]: a[field] + delta }));
  }, [field, setActivity]);

  useEffect(() => {
    lastVisibleRef.current = Date.now();
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        lastVisibleRef.current = Date.now();
      } else {
        flush();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [flush]);

  // Defensive: even if no visibility/blur events fire, persist progress.
  useEffect(() => {
    const id = window.setInterval(flush, 30_000);
    return () => window.clearInterval(id);
  }, [flush]);

  return activity;
}

/* ------------------------------------------------------------------ */
/* List helpers                                                        */
/* ------------------------------------------------------------------ */

export const MAX_RECENT = 12;

/** Insert (or re-insert) an item at the top, dropping older duplicates. */
export function upsertRecent(current: RecentItem[], item: RecentItem): RecentItem[] {
  const rest = current.filter((r) => r.key !== item.key);
  return [item, ...rest].slice(0, MAX_RECENT);
}

export function removeRecent(current: RecentItem[], key: string): RecentItem[] {
  return current.filter((r) => r.key !== key);
}

export function upsertBookmark(current: BookmarkItem[], item: BookmarkItem): BookmarkItem[] {
  return [item, ...current.filter((b) => b.id !== item.id)];
}

export function removeBookmark(current: BookmarkItem[], id: string): BookmarkItem[] {
  return current.filter((b) => b.id !== id);
}

export function prependPracticeRecord(records: PracticeRecord[], record: PracticeRecord) {
  return [record, ...records].slice(0, 50);
}

/** Increment an open counter once per session visit, not per re-render. */
const sessionCounted = new Set<string>();

export function useOpenCounter(): (key: string) => void {
  const [activity, setActivity] = useActivity();

  return useCallback(
    (key: string) => {
      if (sessionCounted.has(key)) return;
      sessionCounted.add(key);
      setActivity((a) => {
        if (key.startsWith("note:")) return { ...a, notesOpened: a.notesOpened + 1 };
        if (key.startsWith("practice:")) return { ...a, papersPractised: a.papersPractised + 1 };
        return { ...a, papersOpened: a.papersOpened + 1 };
      });
    },
    [setActivity]
  );
}

export { readJSON };