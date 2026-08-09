"use client";

import { useState, type ComponentType } from "react";
import { Monitor, Moon, Sun, Trash2, UserPen, ShieldCheck, MonitorSmartphone } from "lucide-react";
import type { Theme } from "@/lib/local-types";
import { useTheme } from "@/lib/local-hooks";
import { clearAllLocalData } from "@/lib/storage";
import { useNameModal } from "./name-modal-provider";
import { cn } from "@/lib/utils";

const THEME_OPTIONS: { id: Theme; label: string; icon: ComponentType<{ size?: number | string }> }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: MonitorSmartphone },
  { id: "amoled", label: "AMOLED", icon: Monitor },
];

export function SettingsMenu({ onNavigate }: { onNavigate?: () => void }) {
  const [theme, setTheme] = useTheme();
  const { openNameModal } = useNameModal();
  const [confirmingClear, setConfirmingClear] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Appearance</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => {
                  setTheme(option.id);
                  onNavigate?.();
                }}
                aria-pressed={theme === option.id}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors",
                  theme === option.id
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border bg-background text-muted hover:text-ink"
                )}
              >
                <Icon size={15} />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Profile</p>
        <button
          onClick={() => {
            openNameModal();
            onNavigate?.();
          }}
          className="mt-2 inline-flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          <UserPen size={16} className="text-muted" />
          Change display name
        </button>
      </div>

      <div className="h-px bg-border" />

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Local study data</p>
        <button
          onClick={() => setConfirmingClear((v) => !v)}
          className="mt-2 inline-flex w-full items-center gap-2.5 rounded-xl px-2 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface"
        >
          <Trash2 size={16} className="text-muted" />
          Clear local study data
        </button>
        {confirmingClear && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-red-300/60 bg-red-500/10 p-3 text-xs text-ink">
            <span>
              This removes bookmarks, history, stats, practice sessions, timers and scratchpads from this
              browser.
            </span>
            <span className="flex shrink-0 gap-2">
              <button
                onClick={() => {
                  clearAllLocalData();
                  window.location.reload();
                }}
                className="rounded-full bg-red-500 px-3 py-1.5 font-medium text-white hover:bg-red-600"
              >
                Clear
              </button>
              <button
                onClick={() => setConfirmingClear(false)}
                className="rounded-full bg-surface px-3 py-1.5 font-medium text-ink"
              >
                Keep
              </button>
            </span>
          </div>
        )}
        <p className="mt-2 flex items-start gap-1.5 px-2 text-[11px] leading-relaxed text-muted">
          <ShieldCheck size={13} className="mt-0.5 shrink-0" />
          Everything is stored in this browser only. No account or server is involved.
        </p>
      </div>
    </div>
  );
}