import { Subject, SubjectSlug } from "@/lib/types";

export const subjects: Subject[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    code: "9709 / 4024",
    description: "Pure Math, Mechanics, Statistics and core Additional Maths.",
    levels: ["o-level", "as-level", "a-level"],
    icon: "sigma",
  },
  {
    slug: "physics",
    name: "Physics",
    code: "9702 / 5054",
    description: "Mechanics, waves, electricity, and modern physics.",
    levels: ["o-level", "as-level", "a-level"],
    icon: "atom",
  },
  {
    slug: "chemistry",
    name: "Chemistry",
    code: "9701 / 5070",
    description: "Physical, organic, and inorganic chemistry fundamentals.",
    levels: ["o-level", "as-level", "a-level"],
    icon: "flask",
  },
  {
    slug: "biology",
    name: "Biology",
    code: "9700 / 5090",
    description: "Cell biology, genetics, physiology, and ecology.",
    levels: ["o-level", "as-level", "a-level"],
    icon: "dna",
  },
  {
    slug: "computer-science",
    name: "Computer Science",
    code: "9618 / 2210",
    description: "Algorithms, data structures, networks, and programming.",
    levels: ["o-level", "as-level", "a-level"],
    icon: "cpu",
  },
];

// Maps every known 4-digit Cambridge syllabus code to the subject + level it
// belongs to. The code alone (no level picker) is now the only subject input
// on the past-papers filter, and this directory is what resolves it — both
// for validating the code and for building the caiefinder.com PDF URL
// (level segment + subject name + code all come from here).
//
// Note the name is the exact syllabus name for THAT code, not the generic
// subject name — e.g. 4024 is "Mathematics D" (O Level, Syllabus D), while
// 9709 is plain "Mathematics" (A Level). Using the generic name for both
// would build a wrong caiefinder.com URL for one of them.
export interface SubjectCodeEntry {
  slug: SubjectSlug;
  name: string;
  level: "o-level" | "a-level" | "igcse";
  /**
   * Overrides `name` for the caiefinder.com folder path only, for the few
   * subjects filed under a "Name1 - Name2" folder instead of a plain name.
   * Confirmed against caiefinder.com: Additional Mathematics. Leave unset
   * for everything else — the plain name is correct for the vast majority
   * of subjects (e.g. "Biology (9700)").
   */
  folderName?: string;
}

const baseSubjectCodes: Record<string, SubjectCodeEntry> = {
  "9709": { slug: "mathematics", name: "Mathematics", level: "a-level" },
  "4024": { slug: "mathematics", name: "Mathematics Syllabus D", level: "o-level", folderName: "Mathematics - D" },
  "4037": {
    slug: "additional-mathematics",
    name: "Additional Mathematics",
    level: "o-level",
    folderName: "Mathematics - Additional",
  },
  "9702": { slug: "physics", name: "Physics", level: "a-level" },
  "5054": { slug: "physics", name: "Physics", level: "o-level" },
  "9701": { slug: "chemistry", name: "Chemistry", level: "a-level" },
  "5070": { slug: "chemistry", name: "Chemistry", level: "o-level" },
  "9700": { slug: "biology", name: "Biology", level: "a-level" },
  "5090": { slug: "biology", name: "Biology", level: "o-level" },
  "9608": { slug: "computer-science", name: "Computer Science", level: "a-level" },
  "9618": { slug: "computer-science", name: "Computer Science", level: "a-level" },
  "2210": { slug: "computer-science", name: "Computer Science", level: "o-level" },

  // Cambridge O Level — https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-upper-secondary/cambridge-o-level/subjects/
  "6010": { slug: "art", name: "Art", level: "o-level" },
  "3180": { slug: "arabic", name: "Arabic", level: "o-level" },
  "7094": { slug: "bangladesh-studies", name: "Bangladesh Studies", level: "o-level" },
  "3204": { slug: "bengali", name: "Bengali", level: "o-level" },
  "7115": { slug: "business-studies", name: "Business Studies", level: "o-level" },
  "5129": { slug: "combined-science", name: "Combined Science", level: "o-level" },
  "7100": { slug: "commerce", name: "Commerce", level: "o-level" },
  "7101": { slug: "commercial-studies", name: "Commercial Studies", level: "o-level" },
  "7010": { slug: "computer-studies", name: "Computer Studies", level: "o-level" },
  "2281": { slug: "economics", name: "Economics", level: "o-level" },
  "1123": { slug: "english-language", name: "English Language", level: "o-level" },
  "5014": { slug: "environmental-management", name: "Environmental Management", level: "o-level" },
  "3247": { slug: "first-language-urdu", name: "First Language Urdu", level: "o-level" },
  "3015": { slug: "french", name: "French", level: "o-level" },
  "3025": { slug: "german", name: "German (Syllabus B)", level: "o-level" },
  "2217": { slug: "geography", name: "Geography", level: "o-level" },
  "2055": { slug: "hinduism", name: "Hinduism", level: "o-level" },
  "2158": { slug: "history", name: "History (World Affairs 1917-1991)", level: "o-level" },
  "5096": { slug: "human-and-social-biology", name: "Human and Social Biology", level: "o-level" },
  "2056": { slug: "islamic-religion-and-culture", name: "Islamic Religion and Culture", level: "o-level" },
  "2058": { slug: "islamiyat", name: "Islamiyat", level: "o-level" },
  "2010": { slug: "literature-in-english", name: "Literature in English", level: "o-level" },
  "3202": { slug: "nepali", name: "Nepali", level: "o-level" },
  "2059": { slug: "pakistan-studies", name: "Pakistan Studies", level: "o-level" },
  "7110": { slug: "principles-of-accounts", name: "Principles of Accounts", level: "o-level" },
  "2048": { slug: "religious-studies", name: "Religious Studies (Bible Knowledge)", level: "o-level" },
  "3248": { slug: "second-language-urdu", name: "Second Language Urdu", level: "o-level" },
  "3158": { slug: "setswana", name: "Setswana", level: "o-level" },
  "3205": { slug: "sinhala", name: "Sinhala", level: "o-level" },
  "2251": { slug: "sociology", name: "Sociology", level: "o-level" },
  "3035": { slug: "spanish", name: "Spanish (Syllabus B)", level: "o-level" },
  "4040": { slug: "statistics", name: "Statistics", level: "o-level" },
  "3162": { slug: "swahili", name: "Swahili", level: "o-level" },
  "3206": { slug: "tamil", name: "Tamil", level: "o-level" },
  "7096": { slug: "travel-and-tourism", name: "Travel and Tourism", level: "o-level" },

  // Cambridge IGCSE — https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-upper-secondary/cambridge-igcse/subjects/
  // (A–E only so far; add the rest here as they're confirmed against the site.)
  "0452": { slug: "accounting", name: "Accounting", level: "igcse" },
  "0985": { slug: "accounting", name: "Accounting (9-1)", level: "igcse" },
  "0606": {
    slug: "additional-mathematics",
    name: "Additional Mathematics",
    level: "igcse",
    folderName: "Mathematics - Additional",
  },
  "0548": { slug: "afrikaans", name: "Afrikaans - Second Language", level: "igcse" },
  "0600": { slug: "agriculture", name: "Agriculture", level: "igcse" },
  "0508": { slug: "arabic-first-language", name: "Arabic - First Language", level: "igcse" },
  "7184": { slug: "arabic-first-language", name: "Arabic - First Language (9-1)", level: "igcse" },
  "0544": { slug: "arabic-foreign-language", name: "Arabic - Foreign Language", level: "igcse" },
  "7180": { slug: "arabic-foreign-language", name: "Arabic (9-1)", level: "igcse" },
  "0400": { slug: "art-design", name: "Art & Design", level: "igcse" },
  "0989": { slug: "art-design", name: "Art & Design (9-1)", level: "igcse" },
  "0538": { slug: "bahasa-indonesia", name: "Bahasa Indonesia", level: "igcse" },
  "0610": { slug: "biology", name: "Biology", level: "igcse" },
  "0970": { slug: "biology", name: "Biology (9-1)", level: "igcse" },
  "0264": { slug: "business", name: "Business", level: "igcse" },
  "0774": { slug: "business", name: "Business (9-1)", level: "igcse" },
  "0450": { slug: "business-studies", name: "Business Studies", level: "igcse" },
  "0986": { slug: "business-studies", name: "Business Studies (9-1)", level: "igcse" },
  "0620": { slug: "chemistry", name: "Chemistry", level: "igcse" },
  "0971": { slug: "chemistry", name: "Chemistry (9-1)", level: "igcse" },
  "0509": { slug: "chinese-first-language", name: "Chinese - First Language", level: "igcse" },
  "0523": { slug: "chinese-second-language", name: "Chinese - Second Language", level: "igcse" },
  "0547": { slug: "chinese-foreign-language", name: "Chinese (Mandarin) - Foreign Language", level: "igcse" },
  "0715": { slug: "commerce", name: "Commerce", level: "igcse" },
  "0478": { slug: "computer-science", name: "Computer Science", level: "igcse" },
  "0984": { slug: "computer-science", name: "Computer Science (9-1)", level: "igcse" },
  "0445": { slug: "design-technology", name: "Design & Technology", level: "igcse" },
  "0979": { slug: "design-technology", name: "Design & Technology (9-1)", level: "igcse" },
  "0411": { slug: "drama", name: "Drama", level: "igcse" },
  "0994": { slug: "drama", name: "Drama (9-1)", level: "igcse" },
  "0455": { slug: "economics", name: "Economics", level: "igcse" },
  "0987": { slug: "economics", name: "Economics (9-1)", level: "igcse" },
};

// Add any extra codes here — this is code-only, nothing here is ever shown
// in the UI, it just extends what the past-papers "Subject Code" field will
// accept. `slug` must be one of the SubjectSlug values in lib/types.ts (add
// a new one there first if the subject doesn't exist yet); `name` should be
// the exact syllabus name CAIE/caiefinder.com uses for that specific code.
//
// Example:
// "9231": { slug: "further-mathematics", name: "Further Mathematics", level: "a-level" },
const additionalSubjectCodes: Record<string, SubjectCodeEntry> = {
  // Cambridge AS & A Level
  "9626": { slug: "information-technology", name: "Information Technology", level: "a-level" },
  "9693": { slug: "marine-science", name: "Marine Science", level: "a-level" },
  "9231": { slug: "further-mathematics", name: "Further Mathematics", level: "a-level" },
  "9084": { slug: "law", name: "Law", level: "a-level" },
  "9694": { slug: "thinking-skills", name: "Thinking Skills", level: "a-level" },
  "9239": { slug: "global-perspectives-and-research", name: "Global Perspectives & Research", level: "a-level" },
  "9708": { slug: "economics", name: "Economics", level: "a-level" },
  "9609": { slug: "business", name: "Business", level: "a-level" },
  "9706": { slug: "accounting", name: "Accounting", level: "a-level" },
  "9696": { slug: "geography", name: "Geography", level: "a-level" },
  "9699": { slug: "sociology", name: "Sociology", level: "a-level" },
  "9990": { slug: "psychology", name: "Psychology", level: "a-level" },
  "9489": { slug: "history", name: "History", level: "a-level" },
  "9395": { slug: "travel-and-tourism", name: "Travel and Tourism", level: "a-level" },
  "9093": { slug: "english-language", name: "English Language", level: "a-level" },
  "9695": { slug: "literature-in-english", name: "Literature in English", level: "a-level" },
  "9479": { slug: "art-design", name: "Art & Design", level: "a-level" },
  "9482": { slug: "drama", name: "Drama", level: "a-level" },
  "9481": { slug: "digital-media-and-design", name: "Digital Media & Design", level: "a-level" },
  "9716": { slug: "french", name: "French", level: "a-level" },
  "9719": { slug: "spanish", name: "Spanish", level: "a-level" },

  // Cambridge O Level
  "7707": { slug: "accounting", name: "Accounting", level: "o-level" },

  // Cambridge IGCSE (Standard A*-G Scale)
  "0625": { slug: "physics", name: "Physics", level: "igcse" },
  "0417": { slug: "ict", name: "Information & Communication Technology", level: "igcse" },
  "0580": { slug: "mathematics", name: "Mathematics", level: "igcse" },
  "0460": { slug: "geography", name: "Geography", level: "igcse" },
  "0470": { slug: "history", name: "History", level: "igcse" },
  "0493": { slug: "islamiyat", name: "Islamiyat", level: "igcse" },
  "0448": { slug: "pakistan-studies", name: "Pakistan Studies", level: "igcse" },
  "0500": { slug: "english-first-language", name: "English - First Language", level: "igcse" },
  "0510": { slug: "english-second-language", name: "English - Second Language", level: "igcse" },

  // Cambridge IGCSE (9-1 Numerical Variant Scale)
  "0972": { slug: "physics", name: "Physics (9-1)", level: "igcse" },
  "0983": { slug: "ict", name: "Information & Communication Technology (9-1)", level: "igcse" },
  "0980": { slug: "mathematics", name: "Mathematics (9-1)", level: "igcse" },
  "0976": { slug: "geography", name: "Geography (9-1)", level: "igcse" },
  "0977": { slug: "history", name: "History (9-1)", level: "igcse" },
  "0990": { slug: "english-first-language", name: "English - First Language (9-1)", level: "igcse" },
  "0991": { slug: "english-second-language", name: "English - Second Language (9-1)", level: "igcse" },

  // IGCSE Psychology
  "0266": { slug: "psychology", name: "Psychology", level: "igcse" },
};

export const subjectCodeDirectory: Record<string, SubjectCodeEntry> = {
  ...baseSubjectCodes,
  ...additionalSubjectCodes,
};

export function getSubject(slug: string) {
  return subjects.find((s) => s.slug === slug);
}

export function getSubjectsForLevel(level: string) {
  return subjects.filter((s) => s.levels.includes(level as Subject["levels"][number]));
}
