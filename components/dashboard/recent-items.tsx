"use client";

import Link from "next/link";
import { FileText, ClipboardCheck, BarChart3, BookOpen, ChevronRight, ArrowRight } from "lucide-react";
import { useRecent } from "@/lib/local-hooks";
import { timeAgo } from "@/lib/format";
import type { RecentItem, RecentKind } from "@/lib/local-types";

const KIND_META: Record<RecentKind, { label: string; icon: typeof FileText }> = {
  "question-paper": { label: "Question Paper", icon: FileText },
  "mark-scheme": { label: "Mark Scheme", icon: ClipboardCheck },
  "grade-threshold": { label: "Grade Threshold", icon: BarChart3 },
  note: { label: "Note", icon: BookOpen },
};

// Fallback for recent items saved under a kind that no longer exists (e.g.
// "examiner-report" before it was renamed to "grade-threshold") — keeps
// stale localStorage data from crashing the page instead of requiring a
// migration or a manual clear.
const FALLBACK_META = { label: "Document", icon: FileText };

export function RecentItems() {
  const [recent] = useRecent();

  return (
    <section aria-labelledby="recent-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="recent-heading" className="font-display text-lg font-semibold tracking-tight text-ink">
          Continue studying
        </h2>
        {recent.length > 0 && (
          <Link href="/past-papers" className="text-xs font-medium text-accent hover:underline">
            View all
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <EmptyRecent />
      ) : (
        <ul className="flex flex-col gap-2">
          {recent.slice(0, 6).map((item) => {
            const meta = KIND_META[item.kind] ?? FALLBACK_META;
            return <RecentRow key={item.key} item={item} meta={meta} />;
          })}
        </ul>
      )}
    </section>
  );
}

function RecentRow({ item, meta }: { item: RecentItem; meta: { label: string; icon: typeof FileText } }) {
  const Icon = meta.icon;
  return (
    <li>
      <Link
        href={item.url}
        className="group flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon size={17} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">{item.title}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">
            {item.subtitle} · {meta.label}
          </span>
        </span>
        <span className="hidden shrink-0 text-xs text-muted sm:block">{timeAgo(item.openedAt)}</span>
        <ChevronRight size={15} className="shrink-0 text-border transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </Link>
    </li>
  );
}

function EmptyRecent() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 p-8 text-center">
      <p className="text-sm text-muted">Nothing opened yet. Your recent past papers and notes will show here.</p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
        <Link href="/notes" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink-solid px-4 text-xs font-medium text-on-ink hover:bg-ink-solid/90">
          <BookOpen size={13} />
          Browse Notes
        </Link>
        <Link href="/past-papers" className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-ink hover:bg-surface">
          <ArrowRight size={13} />
          Find Past Papers
        </Link>
      </div>
    </div>
  );
}