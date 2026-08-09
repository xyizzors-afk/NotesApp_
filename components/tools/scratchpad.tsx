"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pencil, Trash2 } from "lucide-react";
import { useScratchpad } from "@/lib/local-hooks";

/**
 * Personal scratchpad — temporary working notes for a study session.
 * Distinct from the site's academic Notes section. Autosaves to localStorage
 * keyed by `storageKey` (per paper when opened from a paper viewer).
 */
export function Scratchpad({
  storageKey,
  placeholder,
}: {
  storageKey: string;
  placeholder?: string;
}) {
  const [text, setText] = useScratchpad(storageKey);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [confirming, setConfirming] = useState(false);
  const savedAtRef = useRef<Date | null>(null);
  const timerRef = useRef<number | null>(null);

  // Debounced autosave.
  useEffect(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      savedAtRef.current = new Date();
      setSavedAt(savedAtRef.current);
    }, 600);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [text]);

  function clear() {
    setText("");
    setConfirming(false);
    setSavedAt(null);
    savedAtRef.current = null;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Pencil size={13} />
          Scratchpad
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-signal-green">
              <Check size={12} />
              Saved
            </span>
          )}
        </p>
        <button
          onClick={() => (text.trim() ? setConfirming((v) => !v) : undefined)}
          disabled={!text.trim()}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-red-500 disabled:opacity-40"
        >
          <Trash2 size={13} />
          Clear
        </button>
      </div>

      {confirming && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-ink">
          <span>Delete all scratchpad text?</span>
          <span className="flex shrink-0 gap-2">
            <button
              onClick={clear}
              className="rounded-full bg-red-500/10 px-3 py-1 font-medium text-red-500 hover:bg-red-500/20"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-full bg-surface px-3 py-1 font-medium"
            >
              Keep
            </button>
          </span>
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder ?? "Jot down workings, formulas, or reminders here…"}
        aria-label="Scratchpad"
        className="mt-3 min-h-[220px] w-full flex-1 resize-none rounded-xl border border-border bg-background p-3.5 text-sm leading-relaxed text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <p className="mt-2 text-right text-[11px] text-muted">
        {savedAt ? `Saved ${savedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}` : "Autosaves as you type"}
      </p>
    </div>
  );
}