import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/section-heading";
import { SubjectCard } from "@/components/subject-card";
import { getSubjectsForLevel } from "@/data/subjects";
import { levelLabel } from "@/lib/utils";
import { Level } from "@/lib/types";

const validLevels: Level[] = ["o-level", "as-level", "a-level"];

export function generateStaticParams() {
  return validLevels.map((level) => ({ level }));
}

export default async function LevelSubjectsPage({ params }: { params: Promise<{ level: string }> }) {
  const { level } = await params;
  if (!validLevels.includes(level as Level)) notFound();

  const subjects = getSubjectsForLevel(level);

  return (
    <div className="container-content py-16">
      <Breadcrumbs items={[{ label: "Notes", href: "/notes" }, { label: levelLabel(level) }]} />

      <div className="mt-6">
        <SectionHeading
          eyebrow={levelLabel(level)}
          title="Choose a subject"
          description="Pick a subject to see its topic list, organised in the order the syllabus teaches it."
        />
      </div>

      <div className="mt-9 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard
            key={subject.slug}
            subject={subject}
            href={`/notes/${level}/${subject.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
