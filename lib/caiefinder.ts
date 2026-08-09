import { PaperKind, Session } from "@/lib/types";
import { SubjectCodeEntry } from "@/data/subjects";

const SESSION_LETTER: Record<Session, string> = {
  "Feb/March": "m",
  "May/June": "s",
  "Oct/Nov": "w",
};

const KIND_ABBREVIATION: Record<PaperKind, string> = {
  "question-paper": "qp",
  "mark-scheme": "ms",
  "grade-threshold": "gt",
};

const LEVEL_SEGMENT: Record<SubjectCodeEntry["level"], string> = {
  "o-level": "O Levels",
  "a-level": "A Levels",
  igcse: "IGCSE",
};

// caiefinder.com only encodes spaces in its path segments — everything else
// (parentheses, the literal "/") stays as-is, so we replicate that instead of
// running the whole thing through encodeURIComponent.
function segment(value: string): string {
  return value.trim().replace(/\s+/g, "%20");
}

export interface CaiefinderQuery {
  subject: SubjectCodeEntry;
  code: string;
  year: string;
  session: Session;
  /** Combined paper + variant digits as CAIE prints them, e.g. "12" or "21". */
  variant: string;
  kind: PaperKind;
}

/**
 * Builds a direct PDF URL against caiefinder.com's static file layout:
 *   /pastpapers/pdf/{A/O Levels/IGCSE}/{Subject Folder} ({Code})/{Year}/{code}_{session}{yy}_{kind}_{variant}.pdf
 *
 * Most subjects are filed under a single plain name, e.g. "Biology (9700)".
 * A handful use a "Name1 - Name2" folder instead (confirmed: Additional
 * Mathematics is "Mathematics - Additional (0606)"), which is why
 * SubjectCodeEntry carries an optional `folderName` override — set it only
 * for subjects confirmed to need it; everything else falls back to `name`.
 */
export function buildCaiefinderUrl({ subject, code, year, session, variant, kind }: CaiefinderQuery): string {
  const levelPath = LEVEL_SEGMENT[subject.level];
  const subjectPath = `${subject.folderName ?? subject.name} (${code})`;
  const yy = year.slice(-2);
  // Grade thresholds are published once per subject per session (not per
  // paper/variant), so the CAIE file naming convention drops the variant
  // suffix for this kind: "{code}_{sessionLetter}{yy}_gt.pdf" rather than
  // "..._gt_{variant}.pdf".
  const fullCode =
    kind === "grade-threshold"
      ? `${code}_${SESSION_LETTER[session]}${yy}_${KIND_ABBREVIATION[kind]}`
      : `${code}_${SESSION_LETTER[session]}${yy}_${KIND_ABBREVIATION[kind]}_${variant}`;

  return [
    "https://caiefinder.com/pastpapers/pdf",
    segment(levelPath),
    segment(subjectPath),
    segment(year),
    `${fullCode}.pdf`,
  ].join("/");
}
