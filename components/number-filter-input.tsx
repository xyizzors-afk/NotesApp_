"use client";

import { forwardRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

interface NumberFilterInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  /** Called when Enter is pressed while the field is focused. */
  onEnter?: () => void;
  /** Show the required/invalid styling (set once the user has attempted to confirm). */
  invalid?: boolean;
}

export const NumberFilterInput = forwardRef<HTMLInputElement, NumberFilterInputProps>(
  ({ label, value, onChange, placeholder, maxLength, className, onEnter, invalid }, ref) => {
    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
      if (e.key === "Enter" && onEnter) {
        e.preventDefault();
        onEnter();
      }
    }

    return (
      <label className={cn("flex flex-col gap-1.5", className)}>
        <span className="text-xs font-medium text-muted">
          {label} <span className="text-red-500">*</span>
        </span>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          aria-invalid={invalid}
          value={value}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-11 w-full rounded-xl border bg-background px-3.5 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0",
            invalid ? "border-red-400" : "border-border hover:border-ink/30"
          )}
        />
      </label>
    );
  }
);
NumberFilterInput.displayName = "NumberFilterInput";
