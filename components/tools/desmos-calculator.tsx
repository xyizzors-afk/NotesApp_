"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, FunctionSquare } from "lucide-react";

/**
 * Desmos graphing calculator via the official public API
 * (script: https://www.desmos.com/api). Loaded lazily; if the script can't
 * load (offline / blocked), a fallback link is shown.
 */

// Public demo API key published in Desmos's own API examples.
const DESMOS_API_URL =
  "https://www.desmos.com/api/v1.8/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

interface DesmosCalculator {
  destroy: () => void;
  setExpression: (expr: unknown) => void;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: new (el: HTMLElement, options?: Record<string, unknown>) => DesmosCalculator;
    };
  }
}

let scriptPromise: Promise<boolean> | null = null;

function loadDesmos(): Promise<boolean> {
  if (typeof window !== "undefined" && window.Desmos) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = DESMOS_API_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Desmos));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function DesmosCalculator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<DesmosCalculator | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    loadDesmos().then((ok) => {
      if (cancelled) return;
      if (!ok || !window.Desmos || !containerRef.current) {
        setStatus("error");
        return;
      }
      calcRef.current = new window.Desmos.GraphingCalculator(containerRef.current, {
        border: false,
        expressions: true,
        keypad: true,
      });
      setStatus("ready");
    });
    return () => {
      cancelled = true;
      calcRef.current?.destroy();
      calcRef.current = null;
    };
  }, []);

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border p-8 text-center">
        <FunctionSquare size={26} className="text-muted" />
        <p className="text-sm text-muted">
          Desmos couldn&apos;t load here (it may be blocked or you&apos;re offline).
        </p>
        <a
          href="https://www.desmos.com/calculator"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
        >
          Open Desmos in a new tab
          <ExternalLink size={13} />
        </a>
      </div>
    );
  }

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-background">
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted">Loading Desmos…</p>
        </div>
      )}
      <div ref={containerRef} className={status === "ready" ? "h-full w-full" : "hidden"} />
    </div>
  );
}