"use client";

import { useState } from "react";
import { GraduationCap, X } from "lucide-react";
import { useProfile, useOnboarded } from "@/lib/local-hooks";
import { cn } from "@/lib/utils";

interface NameModalProps {
  open: boolean;
  onClose: () => void;
  /** True on first visit — "Welcome" copy + skip. */
  isOnboarding?: boolean;
}

export function NameModal({ open, onClose, isOnboarding = false }: NameModalProps) {
  const [profile, setProfile] = useProfile();
  const [, setOnboarded] = useOnboarded();
  const [name, setName] = useState("");
  const [error, setError] = useState(false);
  const [touched, setTouched] = useState(false);

  if (!open) return null;

  function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      setTouched(true);
      return;
    }
    setProfile({ name: trimmed.slice(0, 30), createdAt: profile?.createdAt ?? new Date().toISOString() });
    if (isOnboarding) setOnboarded(true);
    onClose();
  }

  // Any way of dismissing the welcome modal — skip, the X button, or the
  // backdrop — counts as "seen it", so it never auto-reopens on a later visit.
  function dismiss() {
    if (isOnboarding) setOnboarded(true);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button aria-label="Close" onClick={dismiss} className="absolute inset-0 h-full w-full bg-black/50 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="name-modal-title"
        className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-7 shadow-softLg"
      >
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <X size={16} />
        </button>

        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink-solid text-on-ink">
          <GraduationCap size={20} strokeWidth={2} />
        </span>

        <h2 id="name-modal-title" className="mt-4 font-display text-xl font-semibold tracking-tight text-ink">
          {isOnboarding ? "Welcome to Coursify" : "What should we call you?"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {isOnboarding
            ? "Coursify keeps your past papers, notes, practice sessions, and study tools in one place. What should we call you?"
            : "Your display name is used for the dashboard greeting."}
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
          maxLength={30}
          aria-label="Your name"
          aria-invalid={error}
          placeholder="Your name"
          className={cn(
            "mt-5 h-12 w-full rounded-xl border bg-background px-4 text-[15px] text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/30",
            error ? "border-red-400" : "border-border"
          )}
        />
        {error && <p className="mt-1.5 text-xs font-medium text-red-500">Please enter a name.</p>}

        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={save}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90"
          >
            {isOnboarding ? "Continue" : "Save name"}
          </button>
        </div>

        {isOnboarding && (
          <button
            onClick={dismiss}
            className="mt-3 w-full text-center text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Skip for now — I&apos;ll set it up later
          </button>
        )}
      </div>
    </div>
  );
}