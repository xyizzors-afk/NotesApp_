import type { PracticeRecord, PracticeReview, PracticeSession } from "./local-types";

/** Real elapsed time for a session, from wall-clock timestamps. */
export function practiceElapsedMs(session: PracticeSession): number {
  return session.elapsedMs + (session.running ? Date.now() - session.startedAt : 0);
}

export function practiceRemainingMs(session: PracticeSession): number {
  return Math.max(0, session.durationMs - practiceElapsedMs(session));
}

export function newSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Build a completed attempt record. Elapsed is captured at finish time. */
export function finalizeRecord(session: PracticeSession, endedBy: "manual" | "expired"): PracticeRecord {
  const finishedAt = new Date().toISOString();
  return {
    id: newSessionId(),
    paperId: session.paperId,
    paperTitle: session.paperTitle,
    subjectCode: session.subjectCode,
    subjectName: session.subjectName,
    session: session.session,
    year: session.year,
    startedAt: new Date(session.startedAt).toISOString(),
    finishedAt,
    durationMs: session.durationMs,
    elapsedMs: practiceElapsedMs(session),
    endedBy,
  };
}

export function isSessionActive(session: PracticeSession | null): boolean {
  if (!session) return false;
  return practiceRemainingMs(session) > 0 || session.running;
}

export function isReviewFor(review: PracticeReview | null, paperId: string): boolean {
  return review !== null && review.paperId === paperId;
}
