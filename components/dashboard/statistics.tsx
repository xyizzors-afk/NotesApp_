"use client";

import { FileText, ClipboardCheck, BookOpen, Clock, Flag } from "lucide-react";
import { useActivity, usePracticeRecords } from "@/lib/local-hooks";
import { formatDuration, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Statistics() {
  const [activity] = useActivity();
  const [records] = usePracticeRecords();

  const totalStudyMs =
    activity.papersTotalMs + activity.notesTotalMs + (records.length ? records.reduce((sum, r) => sum + r.elapsedMs, 0) : 0);
  const avgCompletionMs = records.length
    ? records.reduce((sum, r) => sum + r.elapsedMs, 0) / records.length
    : null;

  const stats = [
    { label: "Papers Opened", value: String(activity.papersOpened), icon: FileText },
    { label: "Papers Practised", value: String(records.length), icon: ClipboardCheck },
    { label: "Notes Read", value: String(activity.notesOpened), icon: BookOpen },
    { label: "Total Study Time", value: formatDuration(totalStudyMs), icon: Clock },
  ];

  return (
    <section aria-labelledby="stats-heading">
      <div className="mb-3">
        <h2 id="stats-heading" className="font-display text-lg font-semibold tracking-tight text-ink">
          Study statistics
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon size={17} strokeWidth={1.8} />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold text-ink">{stat.value}</span>
                <span className="block truncate text-xs text-muted">{stat.label}</span>
              </span>
            </div>
          );
        })}
      </div>

      {avgCompletionMs !== null && (
        <p className="mt-3 text-xs text-muted">
          Average completion time across {records.length} practice {records.length === 1 ? "session" : "sessions"}:{" "}
          <span className="font-medium text-ink">{formatDuration(avgCompletionMs)}</span>
        </p>
      )}

      {records.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {records.slice(0, 5).map((record) => (
            <li key={record.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-background px-4 py-3 text-sm">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">
                  {record.subjectName} · {record.paperTitle}
                </span>
                <span className="block text-xs text-muted">
                  {record.subjectCode} · {record.session} {record.year} · {formatDateTime(record.startedAt)}
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  record.endedBy === "expired" ? "bg-signal-amber/10 text-signal-amber" : "bg-accent-soft text-accent"
                )}
              >
                <Flag size={11} />
                {record.endedBy === "expired" ? "Time up" : "Finished early"}
              </span>
              <span className="text-xs text-muted">{formatDuration(record.elapsedMs)}</span>
            </li>
          ))}
        </ul>
      )}

      {records.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface/40 p-6 text-center">
          <p className="text-sm text-muted">
            No practice sessions yet. Start one and your completed attempts will show up here.
          </p>
        </div>
      )}
    </section>
  );
}