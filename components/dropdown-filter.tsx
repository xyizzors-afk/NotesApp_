"use client";

import { forwardRef, type KeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownFilterProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
  disabled?: boolean;
  required?: boolean;
  /** Show the required/invalid styling (set once the user has attempted to confirm). */
  invalid?: boolean;
  /** Called when Enter is pressed while the field is focused, instead of the browser default. */
  onEnter?: () => void;
}

export const DropdownFilter = forwardRef<HTMLSelectElement, DropdownFilterProps>(
  ({ label, value, onChange, options, className, disabled, required, invalid, onEnter }, ref) => {
    function handleKeyDown(e: KeyboardEvent<HTMLSelectElement>) {
      if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
    }

    return (
      <label className={cn("flex flex-col gap-1.5", className)}>
        <span className="text-xs font-medium text-muted">
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        <div className="relative">
          <select
            ref={ref}
            value={value}
            disabled={disabled}
            aria-invalid={invalid}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              "h-11 w-full appearance-none rounded-xl border bg-background pl-3.5 pr-9 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0",
              disabled
                ? "cursor-not-allowed border-border text-ink/60"
                : invalid
                  ? "border-red-400"
                  : "border-border hover:border-ink/30"
            )}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
        </div>
      </label>
    );
  }
);
DropdownFilter.displayName = "DropdownFilter";
