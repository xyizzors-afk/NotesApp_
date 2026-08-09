/**
 * Namespaced localStorage access. All persisted user data flows through this
 * layer so it could later be swapped for a backend without touching components.
 *
 * Values are parsed defensively — corrupted JSON falls back to the supplied
 * default instead of crashing the app.
 */

export const STORAGE_KEYS = {
  profile: "coursify:profile",
  onboarded: "coursify:onboarded",
  theme: "coursify:theme",
  recent: "coursify:recent",
  bookmarks: "coursify:bookmarks",
  activity: "coursify:activity",
  practiceRecords: "coursify:practice-records",
  practiceSession: "coursify:practice-session",
  practiceReview: "coursify:practice-review",
  examTimer: "coursify:exam-timer",
  toolPrefs: "coursify:tool-prefs",
  scratchpad: (key: string) => `coursify:scratchpad:${key}`,
  highlights: (key: string) => `coursify:highlights:${key}`,
} as const;

export function readJSON<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return parsed === undefined || parsed === null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / private mode — ignore; feature degrades to in-memory only.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Wipe every Coursify-namespaced key, leaving unrelated site storage intact. */
export function clearAllLocalData(): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && (key.startsWith("coursify:") || key.startsWith("coursify::scratchpad:"))) {
        keys.push(key);
      }
    }
  } catch {
    // ignore
  }
  keys.forEach((key) => removeKey(key));
  return keys;
}