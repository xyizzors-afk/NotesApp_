"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ClipboardCheck } from "lucide-react";
import { PdfDocumentViewer, type PdfDocumentViewerProps } from "./pdf-document";
import { cn } from "@/lib/utils";

interface SplitViewerProps {
  left: Omit<PdfDocumentViewerProps, "onScaleChange">;
  right: Omit<PdfDocumentViewerProps, "onScaleChange">;
  onScaleChange: (scale: number) => void;
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

export function SplitViewer({ left, right, onScaleChange }: SplitViewerProps) {
  const isDesktop = useIsDesktop();
  const [leftPct, setLeftPct] = useState(50);
  const [mobileTab, setMobileTab] = useState<"left" | "right">("left");
  const dividerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  // Draggable divider on desktop.
  useEffect(() => {
    if (!isDesktop || !dividerRef.current) return;
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const container = dividerRef.current?.parentElement;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDesktop]);

  if (!isDesktop) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="flex shrink-0 gap-1">
          <TabButton active={mobileTab === "left"} onClick={() => setMobileTab("left")} icon={FileText} label={left.label} />
          <TabButton active={mobileTab === "right"} onClick={() => setMobileTab("right")} icon={ClipboardCheck} label={right.label} />
        </div>
        <div className="flex min-h-0 flex-1">
          {mobileTab === "left" ? (
            <PdfDocumentViewer {...left} onScaleChange={onScaleChange} />
          ) : (
            <PdfDocumentViewer {...right} onScaleChange={onScaleChange} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1">
      <div style={{ width: `${leftPct}%` }} className="flex min-w-0">
        <PdfDocumentViewer {...left} onScaleChange={onScaleChange} />
      </div>
      <div
        ref={dividerRef}
        role="separator"
        aria-orientation="vertical"
        aria-label="Adjust split"
        onPointerDown={() => {
          draggingRef.current = true;
          document.body.style.cursor = "col-resize";
          document.body.style.userSelect = "none";
        }}
        className="w-1.5 shrink-0 cursor-col-resize touch-none border-x border-border bg-surface"
      />
      <div style={{ width: `${100 - leftPct}%` }} className="flex min-w-0">
        <PdfDocumentViewer {...right} onScaleChange={onScaleChange} />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FileText;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors",
        active ? "bg-ink-solid text-on-ink" : "bg-background text-muted hover:text-ink"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}