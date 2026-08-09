"use client";

import { useEffect, useRef } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useActiveTimeTracker, useBookmarks, useOpenCounter, useRecent, removeBookmark, upsertBookmark, upsertRecent } from "@/lib/local-hooks";
import { cn } from "@/lib/utils";

interface NotesTrackerProps {
  level: string;
  subject: string;
  topic: string;
  title: string;
  subjectName: string;
  subjectCode: string;
}

/**
 * Mounted on the notes topic page: records the note as read (once per visit),
 * tracks active reading time, adds it to "recently viewed", and provides the
 * bookmark control. Does nothing if note content is still a placeholder.
 */
export function NotesTracker({ level, subject, topic, title, subjectName, subjectCode }: NotesTrackerProps) {
  const countOpen = useOpenCounter();
  const [recent, setRecent] = useRecent();
  const [bookmarks, setBookmarks] = useBookmarks();
  useActiveTimeTracker("note");
  const countedRef = useRef(false);

  const noteKey = `${level}:${subject}:${topic}`;
  const noteUrl = `/notes/${level}/${subject}/${topic}`;
  const isBookmarked = bookmarks.some((b) => b.id === noteKey);

  useEffect(() => {
    if (countedRef.current) return;
    countedRef.current = true;
    countOpen(`note:${noteKey}`);
    setRecent((cur) =>
      upsertRecent(cur, {
        key: `note:${noteKey}`,
        kind: "note",
        id: noteKey,
        title,
        subtitle: `${subjectName} · ${subjectCode}`,
        subjectCode,
        subjectName,
        url: noteUrl,
        openedAt: new Date().toISOString(),
      })
    );
  }, [noteKey, title, subjectName, subjectCode, noteUrl, countOpen, setRecent]);

  function toggleBookmark() {
    if (isBookmarked) {
      setBookmarks((cur) => removeBookmark(cur, noteKey));
    } else {
      setBookmarks((cur) =>
        upsertBookmark(cur, {
          id: noteKey,
          kind: "note",
          title,
          subtitle: `${subjectName} · ${subjectCode}`,
          url: noteUrl,
          addedAt: new Date().toISOString(),
        })
      );
    }
  }

  return (
    <button
      onClick={toggleBookmark}
      aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this note"}
      aria-pressed={isBookmarked}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors",
        isBookmarked ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-background text-muted hover:bg-surface hover:text-ink"
      )}
    >
      {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
      {isBookmarked ? "Saved" : "Bookmark"}
    </button>
  );
}