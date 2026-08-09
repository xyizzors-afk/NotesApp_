"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ClipboardCheck, BarChart3, Bookmark, BookmarkCheck, Timer } from "lucide-react";
import { PastPaper, PaperKind } from "@/lib/types";
import { cn, levelLabel } from "@/lib/utils";
import { useBookmarks, removeBookmark, upsertBookmark } from "@/lib/local-hooks";
import { PracticeSetupModal } from "@/components/practice/practice-setup-modal";

const kindIcon: Record<PaperKind, typeof FileText> = {
  "question-paper": FileText,
  "mark-scheme": ClipboardCheck,
  "grade-threshold": BarChart3,
};

const modeParam: Record<PaperKind, string> = {
  "question-paper": "qp",
  "mark-scheme": "ms",
  "grade-threshold": "gt",
};

export function PaperCard({ paper }: { paper: PastPaper }) {
  const [bookmarks, setBookmarks] = useBookmarks();
  const [practiceOpen, setPracticeOpen] = useState(false);
  const isBookmarked = bookmarks.some((b) => b.id === paper.id);

  function toggleBookmark() {
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
  }

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-background p-5 shadow-soft transition-shadow hover:shadow-softLg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {paper.subjectCode} {paper.subjectName}
          </p>
          <h3 className="mt-1.5 font-display text-[16px] font-semibold text-ink">
            {paper.session} {paper.year}
          </h3>
          <p className="mt-0.5 text-sm text-muted">
            {paper.paperName} · Variant {paper.variant}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink/70">
            {levelLabel(paper.level)}
          </span>
          <button
            onClick={toggleBookmark}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this paper"}
            aria-pressed={isBookmarked}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
              isBookmarked
                ? "border-accent/40 bg-accent-soft text-accent"
                : "border-border text-muted hover:bg-surface hover:text-ink"
            )}
          >
            {isBookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {paper.files.map((file) => {
          const Icon = kindIcon[file.kind];
          return (
            <Link
              key={file.kind}
              href={`/past-papers/${paper.id}?mode=${modeParam[file.kind]}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-ink/80 transition-colors hover:border-ink/30 hover:bg-surface"
            >
              <Icon size={14} />
              {file.label}
            </Link>
          );
        })}
        <button
          onClick={() => setPracticeOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-xs font-medium text-ink/80 transition-colors hover:border-ink/30 hover:bg-surface"
        >
          <Timer size={14} />
          Practice
        </button>
      </div>

      <PracticeSetupModal open={practiceOpen} onClose={() => setPracticeOpen(false)} initialPaperId={paper.id} />
    </div>
  );
}