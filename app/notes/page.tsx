import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SectionHeading } from "@/components/section-heading";
import { levelLabel } from "@/lib/utils";

const levels = [
  { slug: "o-level", description: "Notes for Cambridge O-levels" },
  //{ slug: "as-level", description: "The first half of the A Level, often taken in Year 12." },
  //{ slug: "a-level", description: "The full Cambridge Advanced qualification, taken in Year 13." },
] as const;

export default function NotesLevelPage() {
  return (
    <div className="container-content py-16">
      <Breadcrumbs items={[{ label: "Notes" }]} />

      <div className="mt-6">
        <SectionHeading
          eyebrow="Notes"
          title="Choose your level"
          description="Notes for AS and A2 will be added soon. Stay tuned!"
        />
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {levels.map((level) => (
          <Link
            key={level.slug}
            href={`/notes/${level.slug}`}
            className="group flex flex-col justify-between rounded-2xl border border-border bg-background p-7 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
          >
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">{levelLabel(level.slug)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{level.description}</p>
            </div>
            <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
              View subjects
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
