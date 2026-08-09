"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Delete, Undo2 } from "lucide-react";
import type { AngleMode } from "@/lib/calc";
import { evaluateExpression, formatResult } from "@/lib/calc";
import { cn } from "@/lib/utils";

interface ScientificCalculatorProps {
  className?: string;
}

interface KeyDef {
  label: string;
  action: () => void;
  span?: boolean;
}
export function ScientificCalculator({ className }: ScientificCalculatorProps) {
  const [expr, setExpr] = useState("");
  const [ans, setAns] = useState<number | null>(null);
  const [angle, setAngle] = useState<AngleMode>("deg");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);
  const displayRef = useRef<HTMLInputElement>(null);

  const append = useCallback((text: string) => {
    setExpr((prev) => prev + text);
    setResult("");
    setError(false);
    displayRef.current?.focus();
  }, []);

  const backspace = useCallback(() => {
    setExpr((prev) => prev.slice(0, -1));
    setResult("");
    setError(false);
  }, []);

  const clearAll = useCallback(() => {
    setExpr("");
    setResult("");
    setError(false);
  }, []);

  const compute = useCallback(() => {
    const trimmed = expr.trim();
    if (!trimmed) return;
    try {
      const value = evaluateExpression(trimmed, angle);
      setAns(value);
      setExpr(formatResult(value));
      setResult(formatResult(value));
      setError(false);
    } catch {
      setError(true);
      setResult("Error");
    }
  }, [expr, angle]);

  const useAns = useCallback(() => {
    if (ans === null) return;
    setExpr((prev) => prev + formatResult(ans));
    setError(false);
  }, [ans]);

  const keys: KeyDef[] = [
    {
      label: "sin",
      action: () => {
        append("sin(");
      },
    },
    {
      label: "cos",
      action: () => {
        append("cos(");
      },
    },
    {
      label: "tan",
      action: () => {
        append("tan(");
      },
    },
    { label: "log", action: () => append("log(") },
    { label: "ln", action: () => append("ln(") },
    {
      label: "asin",
      action: () => {
        append("asin(");
      },
    },
    {
      label: "acos",
      action: () => {
        append("acos(");
      },
    },
    {
      label: "atan",
      action: () => {
        append("atan(");
      },
    },
    { label: "x²", action: () => append("^2") },
    { label: "√", action: () => append("sqrt(") },
    { label: "7", action: () => append("7") },
    { label: "8", action: () => append("8") },
    { label: "9", action: () => append("9") },
    { label: "÷", action: () => append("÷") },
    { label: "%", action: () => append("%") },
    { label: "4", action: () => append("4") },
    { label: "5", action: () => append("5") },
    { label: "6", action: () => append("6") },
    { label: "×", action: () => append("×") },
    { label: "^", action: () => append("^") },
    { label: "1", action: () => append("1") },
    { label: "2", action: () => append("2") },
    { label: "3", action: () => append("3") },
    { label: "−", action: () => append("-") },
    { label: "π", action: () => append("π") },
    { label: "0", action: () => append("0") },
    { label: ".", action: () => append(".") },
    { label: "e", action: () => append("e") },
    { label: "+", action: () => append("+") },
    { label: "!", action: () => append("!") },
    { label: "(", action: () => append("(") },
    { label: ")", action: () => append(")") },
    { label: "Ans", action: useAns },
    { label: "⌫", action: backspace },
    { label: "=", action: compute },
  ];

  // Keyboard support
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const { key } = event;
      if (/^[0-9]$/.test(key)) append(key);
      else if (key === ".") append(".");
      else if (key === "+") append("+");
      else if (key === "-") append("-");
      else if (key === "*") append("×");
      else if (key === "/") append("÷");
      else if (key === "^") append("^");
      else if (key === "(") append("(");
      else if (key === ")") append(")");
      else if (key === "%") append("%");
      else if (key === "Enter") {
        // Prevent the browser's default behavior of also click-triggering
        // whichever on-screen key button currently has focus (which would
        // re-append its digit after compute() runs, e.g. 9*6 -> "546").
        event.preventDefault();
        compute();
      } else if (key === "Backspace") backspace();
      else if (key === "Escape") clearAll();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [append, backspace, clearAll, compute]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-full border border-border bg-background p-0.5">
          {(["deg", "rad"] as AngleMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setAngle(m)}
              aria-pressed={angle === m}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium uppercase transition-colors",
                angle === m ? "bg-ink-solid text-on-ink" : "text-muted hover:text-ink"
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Undo2 size={13} />
          Clear
        </button>
      </div>

      {/* Display */}
      <div className="flex flex-col gap-1 rounded-xl border border-border bg-background px-4 py-3 text-right">
        <input
          ref={inputRef}
          aria-label="Calculator expression"
          value={expr}
          onChange={(e) => {
            setExpr(e.target.value);
            setError(false);
            setResult("");
          }}
          className="w-full bg-transparent text-right font-mono text-[15px] text-ink focus:outline-none"
          inputMode="text"
          placeholder="0"
        />
        <p
          className={cn(
            "min-h-[20px] truncate font-mono text-lg transition-colors",
            error ? "text-red-500" : "text-accent"
          )}
        >
          {result || "\u00A0"}
        </p>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {keys.map((key) => (
          <button
            key={key.label}
            onClick={key.action}
            aria-label={key.label}
            className={cn(
              "flex h-10 items-center justify-center rounded-lg border border-border bg-background font-mono text-sm font-medium text-ink transition-colors hover:bg-surfaceHover active:bg-surfaceHover",
              key.span && "col-span-2",
              key.label === "=" && "bg-ink-solid text-on-ink hover:bg-ink-solid/90 active:bg-ink-solid/80",
              /^[0-9]$/.test(key.label) && "text-[15px]"
            )}
          >
            {key.label === "⌫" ? <Delete size={15} /> : key.label}
          </button>
        ))}
      </div>
    </div>
  );
}