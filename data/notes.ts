import { Level, Note, SubjectSlug, Topic } from "@/lib/types";

type Key = `${Level}:${SubjectSlug}`;

export const topicsByLevelSubject: Partial<Record<Key, Topic[]>> = {};

type NoteKey = `${Level}:${SubjectSlug}:${string}`;

export const noteContent: Partial<Record<NoteKey, Note>> = {};

export const fallbackNote = (chapter: string): Note => ({
  chapter,
  definitions: [],
  studyNotes: [
    "Full notes for this chapter are being written by our subject specialists and will appear here soon.",
  ],
  workedExamples: [],
  summary: ["Check back shortly — this chapter is in progress."],
});
