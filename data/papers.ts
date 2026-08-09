import { PastPaper } from "@/lib/types";

// Placeholder data. In production, `files[].url` will point to an approved
// external PDF provider. The frontend does not need to change when that
// integration is added — only these URLs.
export const pastPapers: PastPaper[] = [];

export function getPaper(id: string) {
  return pastPapers.find((p) => p.id === id);
}

export const filterOptions = {
  levels: ["o-level", "as-level", "a-level"] as const,
  years: Array.from(new Set(pastPapers.map((p) => p.year))).sort((a, b) => b - a),
  sessions: ["Feb/March", "May/June", "Oct/Nov"] as const,
};
