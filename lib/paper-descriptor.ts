import { subjectCodeDirectory, SubjectCodeEntry } from "@/data/subjects";
import { buildCaiefinderUrl } from "@/lib/caiefinder";
import { getPaper, pastPapers } from "@/data/papers";
import type { Level, PastPaper, PaperKind, Session } from "@/lib/types";

/**
 * A paper identified by its CAIE finder parameters (the same ones the
 * past-papers filter collects). Unlike the static `pastPapers` catalogue,
 * these are resolved on demand from the subject-code directory.
 */
export interface PaperDescriptor {
  code: string;
  subject: SubjectCodeEntry;
  year: string;
  session: Session;
  /** Combined paper + variant digits, e.g. "12" for Paper 1, Variant 2. */
  variant: string;
}

export interface PaperSelection extends PaperDescriptor {
  paperNumber: number;
  paperName: string;
}

const SESSION_LETTER: Record<Session, string> = {
  "Feb/March": "m",
  "May/June": "s",
  "Oct/Nov": "w",
};

const LEVEL_MAP: Record<SubjectCodeEntry["level"], Level> = {
  "o-level": "o-level",
  "a-level": "a-level",
  igcse: "igcse",
};

export function buildPaperId(d: PaperDescriptor): string {
  return `${d.code}-${d.year}-${SESSION_LETTER[d.session]}${d.variant}`;
}

export function parsePaperId(id: string): PaperSelection | null {
  // Pattern: {code}-{year}-{sessionLetter}{variant}, e.g. "9709-2024-w-32"
  const match = /^(\d{4})-(\d{4})-([msw])(\d{2})$/.exec(id);
  if (!match) return null;
  const [, code, year, letter, variant] = match;
  const subject = subjectCodeDirectory[code];
  if (!subject) return null;
  const session: Session =
    letter === "m" ? "Feb/March" : letter === "s" ? "May/June" : "Oct/Nov";
  return toSelection({ code, subject, year, session, variant });
}

export function toSelection(d: PaperDescriptor): PaperSelection {
  const paperNumber = d.variant.length === 2 ? Number(d.variant[0]) : Number(d.variant);
  const variantNumber = d.variant.length === 2 ? Number(d.variant[1]) : Number(d.variant);
  return {
    ...d,
    paperNumber,
    paperName: `Paper ${paperNumber} Variant ${variantNumber}`,
  };
}

export function descriptorToPaper(sel: PaperSelection): PastPaper {
  const year = Number(sel.year);
  return {
    id: buildPaperId(sel),
    subjectCode: sel.code,
    subjectSlug: sel.subject.slug,
    subjectName: sel.subject.name,
    level: LEVEL_MAP[sel.subject.level],
    year,
    session: sel.session,
    paperNumber: sel.paperNumber,
    paperName: sel.paperName,
    variant: Number(sel.variant.slice(-1)) || 1,
    files: (["question-paper", "mark-scheme", "grade-threshold"] as PaperKind[]).map((kind) => ({
      kind,
      label: KIND_LABELS[kind],
      url: buildCaiefinderUrl({
        subject: sel.subject,
        code: sel.code,
        year: sel.year,
        session: sel.session,
        variant: sel.variant,
        kind,
      }),
    })),
  };
}

export const KIND_LABELS: Record<PaperKind, string> = {
  "question-paper": "Question Paper",
  "mark-scheme": "Mark Scheme",
  "grade-threshold": "Grade Threshold",
};

/** Static catalogue first, then descriptor-resolved papers. */
export function resolvePaper(id: string): PastPaper | null {
  return getPaper(id) ?? (parsePaperId(id) && descriptorToPaper(parsePaperId(id)!)) ?? null;
}

export function paperExistsInCatalogue(id: string): boolean {
  return pastPapers.some((p) => p.id === id);
}
