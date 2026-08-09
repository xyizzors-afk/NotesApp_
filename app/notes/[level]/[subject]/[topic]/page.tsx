import { notFound } from "next/navigation";
import Link from "next/link";
import { BookMarked, Calculator, Lightbulb, ListChecks, FileStack } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { NotesTracker } from "@/components/notes-tracker";
import { getSubject } from "@/data/subjects";
import { topicsByLevelSubject, noteContent, fallbackNote } from "@/data/notes";
import { pastPapers } from "@/data/papers";
import { levelLabel } from "@/lib/utils";
import { Level, SubjectSlug } from "@/lib/types";

const validLevels: Level[] = ["o-level", "as-level", "a-level"];

export default async function TopicNotesPage({
  params,
}: {
  params: Promise<{ level: string; subject: string; topic: string }>;
}) {
  const { level, subject: subjectSlug, topic: topicSlug } = await params;
  if (!validLevels.includes(level as Level)) notFound();
  const subject = getSubject(subjectSlug);
  if (!subject) notFound();

  const key = `${level as Level}:${subjectSlug as SubjectSlug}` as `${Level}:${SubjectSlug}`;
  const topics = topicsByLevelSubject[key] ?? [];
  const topic = topics.find((t) => t.slug === topicSlug);
  if (!topic) notFound();

  const noteKey = `${level as Level}:${subjectSlug as SubjectSlug}:${topicSlug}` as const;
  const note = noteContent[noteKey] ?? fallbackNote(topic.name);

  const relatedPapers = pastPapers
    .filter((p) => p.subjectSlug === subject.slug && p.level === level)
    .slice(0, 3);

  return (
    <div className="container-content py-16">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: levelLabel(level), href: `/notes/${level}` },
          { label: subject.name, href: `/notes/${level}/${subjectSlug}` },
          { label: topic.name },
        ]}
      />

      <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              {levelLabel(level)} · {subject.name}
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
              {note.chapter}
            </h1>
            <p className="mt-2 text-sm text-muted">{topic.summary}</p>
          </div>
          <NotesTracker
            level={level}
            subject={subjectSlug}
            topic={topicSlug}
            title={topic.name}
            subjectName={subject.name}
            subjectCode={subject.code}
          />
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-10">
          {/* Study notes */}
          <section>
            <SectionLabel icon={BookMarked} label="Study Notes" />
            <ul className="mt-4 flex flex-col gap-3">
              {note.studyNotes.map((point, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-border bg-background p-4 text-[15px] leading-relaxed text-ink/90">
                  <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {point}
                </li>
              ))}
            </ul>
          </section>

          {/* Definitions */}
          {note.definitions.length > 0 && (
            <section>
              <SectionLabel icon={Lightbulb} label="Important Definitions" />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {note.definitions.map((def) => (
                  <div key={def.term} className="rounded-xl bg-surface p-4">
                    <p className="font-display text-sm font-semibold text-ink">{def.term}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{def.meaning}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Formula box */}
          {note.formulas && note.formulas.length > 0 && (
            <section>
              <SectionLabel icon={Calculator} label="Formula Box" />
              <div className="mt-4 rounded-2xl border border-accent/20 bg-accent-soft p-5">
                <div className="flex flex-col divide-y divide-accent/10">
                  {note.formulas.map((f) => (
                    <div key={f.name} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm font-medium text-ink/80">{f.name}</span>
                      <span className="font-mono text-[15px] font-medium text-accent">{f.expression}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Worked examples */}
          {note.workedExamples.length > 0 && (
            <section>
              <SectionLabel icon={ListChecks} label="Worked Examples" />
              <div className="mt-4 flex flex-col gap-4">
                {note.workedExamples.map((ex, i) => (
                  <div key={i} className="rounded-xl border border-border bg-background p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Problem</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-ink">{ex.problem}</p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Solution</p>
                    <p className="mt-1.5 font-mono text-sm leading-relaxed text-ink/90">{ex.solution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Summary */}
          <section>
            <SectionLabel icon={ListChecks} label="Summary" />
            <ul className="mt-4 flex flex-col gap-2 rounded-xl bg-ink-solid p-5">
              {note.summary.map((s, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-on-ink/85">
                  <span className="mt-0.5 shrink-0 font-mono text-xs text-on-ink/40">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Sidebar: related past papers */}
        <aside className="h-fit rounded-2xl border border-border bg-background p-5 lg:sticky lg:top-24">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <FileStack size={16} className="text-accent" />
            Related Past Papers
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {relatedPapers.length === 0 ? (
              <p className="text-sm text-muted">No related papers linked yet.</p>
            ) : (
              relatedPapers.map((p) => (
                <Link
                  key={p.id}
                  href={`/past-papers/${p.id}`}
                  className="rounded-lg border border-border p-3 text-sm transition-colors hover:bg-surface"
                >
                  <p className="font-medium text-ink">{p.session} {p.year}</p>
                  <p className="mt-0.5 text-xs text-muted">{p.paperName}</p>
                </Link>
              ))
            )}
          </div>
          <Link
            href="/past-papers"
            className="mt-4 inline-flex text-xs font-medium text-accent hover:underline"
          >
            View all past papers →
          </Link>
        </aside>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: typeof BookMarked; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon size={14} />
      </span>
      <h2 className="font-display text-[15px] font-semibold text-ink">{label}</h2>
    </div>
  );
}
