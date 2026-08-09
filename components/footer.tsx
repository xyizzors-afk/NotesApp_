import Link from "next/link";
import { GraduationCap } from "lucide-react";

const columns = [
  {
    title: "Study",
    links: [
      { href: "/notes", label: "Notes" },
      { href: "/past-papers", label: "Past Papers" },
      { href: "/calendar", label: "Exam Calendar" },
    ],
  },
  {
    title: "Levels",
    links: [
      { href: "/notes/o-level", label: "O Level" },
      { href: "/notes/as-level", label: "AS Level" },
      { href: "/notes/a-level", label: "A Level" },
    ],
  },
  {
    title: "Subjects",
    links: [
      { href: "/notes/a-level/mathematics", label: "Mathematics" },
      { href: "/notes/a-level/physics", label: "Physics" },
      { href: "/notes/a-level/chemistry", label: "Chemistry" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-content grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-solid text-on-ink">
              <GraduationCap size={17} strokeWidth={2} />
            </span>
            Coursify
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            One place for Cambridge O Level, AS Level, and A Level students to find notes,
            past papers, mark schemes, practice mode, and study tools.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4 className="font-display text-[13px] font-semibold uppercase tracking-wide text-muted">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink/80 transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border">
        <div className="container-content flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted md:flex-row">
          <p>© {new Date().getFullYear()} Coursify. Not affiliated with Cambridge Assessment International Education.</p>
          <p>Built for O Level, AS Level & A Level students.</p>
        </div>
      </div>
    </footer>
  );
}