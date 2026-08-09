"use client";

import { useEffect, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Calculator, FunctionSquare, Timer, ArrowLeftRight, Layers, X, PanelRightClose } from "lucide-react";
import type { ToolId } from "@/lib/local-types";
import { useStudyTools } from "./study-tools-provider";
import { ScientificCalculator } from "./scientific-calculator";
import { DesmosCalculator } from "./desmos-calculator";
import { ExamTimer } from "./exam-timer";
import { UnitConverter } from "./unit-converter";
import { Scratchpad } from "./scratchpad";
import { cn } from "@/lib/utils";
import { useResizablePanelWidth } from "./use-resizable-panel-width";

const TOOLS: { id: ToolId; label: string; icon: typeof Calculator }[] = [
  { id: "calculator", label: "Calculator", icon: Calculator },
  { id: "desmos", label: "Desmos", icon: FunctionSquare },
  { id: "timer", label: "Exam Timer", icon: Timer },
  { id: "converter", label: "Converter", icon: ArrowLeftRight },
  { id: "scratchpad", label: "Scratchpad", icon: Layers },
];

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

function ResizeHandle({ onPointerDown, className }: { onPointerDown: (e: ReactPointerEvent) => void; className?: string }) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize study tools panel"
      onPointerDown={onPointerDown}
      className={cn(
        "group absolute inset-y-0 left-0 z-10 w-2 -translate-x-1/2 cursor-col-resize touch-none",
        className
      )}
    >
      <div className="mx-auto h-full w-px bg-border transition-colors group-hover:bg-accent group-active:bg-accent" />
    </div>
  );
}

interface StudyToolsPanelProps {
  /** inline = sits beside the paper viewer; overlay = global side panel/sheet. */
  mode?: "overlay" | "inline";
  /** Scratchpad storage key when opened from a specific paper. */
  scratchpadKey?: string | null;
}

export function StudyToolsPanel({ mode = "overlay", scratchpadKey = null }: StudyToolsPanelProps) {
  const { open, activeTool, openTool, closeTools } = useStudyTools();
  const isDesktop = useIsDesktop();

  const { width, isDragging, startDragging } = useResizablePanelWidth();

  if (mode === "inline" && isDesktop) {
    return (
      <aside
        aria-label="Study tools"
        style={{ width: open ? width : 0 }}
        className={cn(
          "relative shrink-0 overflow-hidden border-border bg-background",
          !isDragging && "transition-[width,opacity] duration-300",
          open ? "border-l opacity-100" : "border-l-0 opacity-0"
        )}
      >
        {open ? (
          <div className="relative flex h-full flex-col" style={{ width }}>
            <ResizeHandle onPointerDown={startDragging} />
            <PanelBody scratchpadKey={scratchpadKey} mode="inline" />
          </div>
        ) : null}
      </aside>
    );
  }

  if (isDesktop) {
    return (
      <aside
        aria-label="Study tools"
        aria-hidden={!open}
        style={{ width }}
        className={cn(
          "fixed inset-y-0 right-0 z-40 mt-16 flex flex-col border-l border-border bg-background shadow-softLg",
          !isDragging && "transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "translate-x-full pointer-events-none"
        )}
      >
        <ResizeHandle onPointerDown={startDragging} />
        <PanelBody scratchpadKey={scratchpadKey} mode="overlay" />
      </aside>
    );
  }

  // Mobile: bottom sheet — unmount fully when closed, no slide transform needed here.
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end">
      <button
        aria-label="Close study tools"
        onClick={closeTools}
        className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Study tools"
        className="relative flex max-h-[80vh] w-full flex-col rounded-t-2xl border-t border-border bg-surface shadow-softLg"
      >
        <PanelBody scratchpadKey={scratchpadKey} mode="overlay" />
      </div>
    </div>
  );
}

function PanelBody({ scratchpadKey, mode }: { scratchpadKey: string | null; mode: "inline" | "overlay" }) {
  const { activeTool, openTool, closeTools } = useStudyTools();
  const isInline = mode === "inline";

  return (
    <>
      <div className="flex items-center justify-between border-b border-border px-2 py-2">
        <div className="flex items-center gap-0.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const active = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                onClick={() => openTool(tool.id)}
                aria-label={tool.label}
                title={tool.label}
                aria-pressed={active}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-ink-solid text-on-ink" : "text-muted hover:bg-surfaceHover hover:text-ink"
                )}
              >
                <Icon size={17} />
              </button>
            );
          })}
        </div>
        {isInline && (
          <button
            onClick={closeTools}
            aria-label="Collapse tools"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surfaceHover hover:text-ink"
          >
            <PanelRightClose size={17} />
          </button>
        )}
        {!isInline && (
          <button
            onClick={closeTools}
            aria-label="Close study tools"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surfaceHover hover:text-ink"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {activeTool === "calculator" && <ScientificCalculator />}
        {activeTool === "desmos" && <DesmosCalculator />}
        {activeTool === "timer" && <ExamTimer />}
        {activeTool === "converter" && <UnitConverter />}
        {activeTool === "scratchpad" && (
          <Scratchpad storageKey={scratchpadKey ?? "default"} />
        )}
      </div>
    </>
  );
}