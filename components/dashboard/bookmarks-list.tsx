"use client";

import Link from "next/link";
import { FileText, BookOpen, X } from "lucide-react";
import { useBookmarks } from "@/lib/local-hooks";
import { removeBookmark } from "@/lib/local-hooks";
import type { BookmarkItem } from "@/lib/local-types";

export function BookmarksList() {
  const [bookmarks, setBookmarks] = useBookmarks();

  return (
    <section aria-labelledby="bookmarks-heading">
      <div className="mb-3">
        <h2 id="bookmarks-heading" className="font-display text-lg font-semibold tracking-tight text-ink">
          Bookmarks
        </h2>
      </div>

      {bookmarks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/40 p-7 text-center">
          <p className="text-sm text-muted">
            Papers and notes you save will appear here — use the bookmark button on any paper or note.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((item) => (
            <BookmarkRow key={item.id} item={item} onRemove={(id) => setBookmarks((cur) => removeBookmark(cur, id))} />
          ))}
        </ul>
      )}
    </section>
  );
}

function BookmarkRow({ item, onRemove }: { item: BookmarkItem; onRemove: (id: string) => void }) {
  const Icon = item.kind === "note" ? BookOpen : FileText;
  return (
    <li className="group relative flex items-center gap-3 rounded-2xl border border-border bg-background p-3.5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg">
      <Link href={item.url} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Icon size={16} strokeWidth={1.8} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
          <span className="mt-0.5 block truncate text-xs text-muted">{item.subtitle}</span>
        </span>
      </Link>
      <button
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.title} from bookmarks`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted opacity-70 transition-opacity hover:bg-surface hover:text-ink group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </li>
  );
}