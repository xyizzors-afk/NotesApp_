import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/section-heading";
import { getSubject } from "@/data/subjects";
import { topicsByLevelSubject } from "@/data/notes";
import { levelLabel } from "@/lib/utils";
import { Level, SubjectSlug } from "@/lib/types";

const validLevels: Level[] = ["o-level", "as-level", "a-level"];

export default async function SubjectTopicsPage({
  params,
}: {
  params: Promise<{ level: string; subject: string }>;
}) {
  const { level, subject: subjectSlug } = await params;
  if (!validLevels.includes(level as Level)) notFound();
  const subject = getSubject(subjectSlug);
  if (!subject || !subject.levels.includes(level as Level)) notFound();

  const topics = topicsByLevelSubject[`${level as Level}:${subjectSlug as SubjectSlug}`] ?? [];

  return (
    <div className="container-content py-16">
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: levelLabel(level), href: `/notes/${level}` },
          { label: subject.name },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow={`${levelLabel(level)} · ${subject.code}`}
          title={subject.name}
          description={subject.description}
        />
      </div>

      <div className="mt-9">
        {topics.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
            <p className="text-sm text-muted">
              Topics for {subject.name} at {levelLabel(level)} are coming soon.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {topics.map((topic, i) => (
              <Link
                key={topic.slug}
                href={`/notes/${level}/${subjectSlug}/${topic.slug}`}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft font-mono text-xs font-medium text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-[15px] font-semibold text-ink">{topic.name}</h3>
                    <p className="mt-0.5 text-sm text-muted">{topic.summary}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-muted sm:flex">
                    <BookOpen size={13} />
                    {topic.noteCount} notes
                  </span>
                  <ArrowRight size={17} className="text-border transition-transform group-hover:translate-x-1 group-hover:text-ink" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
