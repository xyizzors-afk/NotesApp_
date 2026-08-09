"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Subject } from "@/lib/types";

interface SubjectComboboxProps {
  label: string;
  subjects: Subject[];
  value: string;
  onChange: (slug: string) => void;
  className?: string;
  /** Called when Enter is pressed while the field is focused. */
  onEnter?: () => void;
  /** Show the required/invalid styling (set once the user has attempted to confirm). */
  invalid?: boolean;
}

export const SubjectCombobox = forwardRef<HTMLInputElement, SubjectComboboxProps>(
  ({ label, subjects, value, onChange, className, onEnter, invalid }, ref) => {
    const selected = subjects.find((s) => s.slug === value) ?? null;
    const [query, setQuery] = useState(selected?.name ?? "");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Keep the displayed text in sync if the selection is cleared/changed externally.
    useEffect(() => {
      setQuery(selected?.name ?? "");
    }, [selected?.name]);

    const matches = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return subjects;
      return subjects.filter(
        (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
      );
    }, [subjects, query]);

    function selectSubject(subject: Subject | null) {
      onChange(subject?.slug ?? "");
      setQuery(subject?.name ?? "");
      setOpen(false);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) setOpen(true);
        setHighlighted((i) => Math.min(i + 1, matches.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (open && matches[highlighted]) {
          selectSubject(matches[highlighted]);
        }
        onEnter?.();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }

    return (
      <div className={cn("relative flex flex-col gap-1.5", className)}>
        <span className="text-xs font-medium text-muted">
          {label} <span className="text-red-500">*</span>
        </span>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls="subject-combobox-listbox"
            aria-autocomplete="list"
            aria-invalid={invalid}
            autoComplete="off"
            placeholder="Type a subject..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlighted(0);
              setOpen(true);
              if (selected) onChange("");
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-11 w-full rounded-xl border bg-background pl-3.5 pr-9 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0",
              invalid ? "border-red-400" : "border-border hover:border-ink/30"
            )}
          />
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>

        {open && matches.length > 0 && (
          <ul
            id="subject-combobox-listbox"
            role="listbox"
            className="absolute top-full z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-border bg-background py-1 shadow-softLg"
          >
            {matches.map((subject, i) => (
              <li key={subject.slug}>
                <button
                  type="button"
                  // onMouseDown fires before the input's onBlur, so the click registers.
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSubject(subject);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between px-3.5 py-2 text-left text-sm text-ink",
                    i === highlighted ? "bg-surface" : "hover:bg-surface"
                  )}
                >
                  <span>{subject.name}</span>
                  <span className="text-xs text-muted">{subject.code}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
SubjectCombobox.displayName = "SubjectCombobox";
