import Link from "next/link";
import { Sigma, Atom, FlaskConical, Dna, Cpu, ArrowUpRight } from "lucide-react";
import { Subject } from "@/lib/types";

const icons = {
  sigma: Sigma,
  atom: Atom,
  flask: FlaskConical,
  dna: Dna,
  cpu: Cpu,
};

export function SubjectCard({ subject, href }: { subject: Subject; href: string }) {
  const Icon = icons[subject.icon];

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-softLg"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon size={20} strokeWidth={1.8} />
        </span>
        <ArrowUpRight
          size={18}
          className="text-border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
        />
      </div>
      <div className="mt-6">
        <h3 className="font-display text-[17px] font-semibold text-ink">{subject.name}</h3>
        <p className="mt-1 text-xs font-medium text-muted">{subject.code}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{subject.description}</p>
      </div>
    </Link>
  );
}
