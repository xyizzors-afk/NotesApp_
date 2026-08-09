export type Level = "o-level" | "as-level" | "a-level" | "igcse";

export type SubjectSlug =
  | "mathematics"
  | "additional-mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "computer-science"
  | "art"
  | "arabic"
  | "bangladesh-studies"
  | "bengali"
  | "business-studies"
  | "combined-science"
  | "commerce"
  | "commercial-studies"
  | "computer-studies"
  | "economics"
  | "english-language"
  | "environmental-management"
  | "first-language-urdu"
  | "french"
  | "german"
  | "geography"
  | "hinduism"
  | "history"
  | "human-and-social-biology"
  | "islamic-religion-and-culture"
  | "islamiyat"
  | "literature-in-english"
  | "nepali"
  | "pakistan-studies"
  | "principles-of-accounts"
  | "religious-studies"
  | "second-language-urdu"
  | "setswana"
  | "sinhala"
  | "sociology"
  | "spanish"
  | "statistics"
  | "swahili"
  | "tamil"
  | "travel-and-tourism"
  | "accounting"
  | "afrikaans"
  | "agriculture"
  | "art-design"
  | "bahasa-indonesia"
  | "business"
  | "chinese-first-language"
  | "chinese-second-language"
  | "chinese-foreign-language"
  | "design-technology"
  | "drama"
  | "arabic-first-language"
  | "arabic-foreign-language"
  | "information-technology"
  | "marine-science"
  | "further-mathematics"
  | "law"
  | "thinking-skills"
  | "global-perspectives-and-research"
  | "psychology"
  | "digital-media-and-design"
  | "ict"
  | "english-first-language"
  | "english-second-language";

export interface Subject {
  slug: SubjectSlug;
  name: string;
  code: string;
  description: string;
  levels: Level[];
  icon: "sigma" | "atom" | "flask" | "dna" | "cpu";
}

export interface Topic {
  slug: string;
  name: string;
  summary: string;
  noteCount: number;
}

export interface Note {
  chapter: string;
  definitions: { term: string; meaning: string }[];
  formulas?: { name: string; expression: string }[];
  studyNotes: string[];
  workedExamples: { problem: string; solution: string }[];
  summary: string[];
}

export type Session = "Feb/March" | "May/June" | "Oct/Nov";
export type PaperKind = "question-paper" | "mark-scheme" | "grade-threshold";

export interface PastPaper {
  id: string;
  subjectCode: string;
  subjectSlug: SubjectSlug;
  subjectName: string;
  level: Level;
  year: number;
  session: Session;
  paperNumber: number;
  paperName: string;
  variant: number;
  files: {
    kind: PaperKind;
    label: string;
    url: string;
  }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "class-test" | "mock-exam" | "caie-exam" | "deadline";
  subjectSlug?: SubjectSlug;
  date: string; // ISO date
  notes?: string;
}
