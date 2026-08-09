"use client";

import Link from "next/link";
import {
  BookOpen,
  FileStack,
  Timer,
  Calculator,
  FunctionSquare,
  ArrowLeftRight,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useStudyTools } from "@/components/tools/study-tools-provider";
import type { ToolId } from "@/lib/local-types";

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  tool?: ToolId;
}

const ACTIONS: QuickAction[] = [
  { id: "notes", label: "Browse Notes", description: "Study notes by level & subject", icon: BookOpen, href: "/notes" },
  { id: "papers", label: "Find Past Papers", description: "Search by code, year & variant", icon: FileStack, href: "/past-papers" },
  { id: "practice", label: "Practice Mode", description: "Timed attempt, then review", icon: Timer },
  { id: "calculator", label: "Scientific Calculator", description: "Full function calculator", icon: Calculator, tool: "calculator" },
  { id: "desmos", label: "Desmos Calculator", description: "Graphing calculator", icon: FunctionSquare, tool: "desmos" },
  { id: "exam-timer", label: "Exam Timer", description: "Custom countdown timer", icon: Timer, tool: "timer" },
  { id: "converter", label: "Unit Converter", description: "Length, mass, energy & more", icon: ArrowLeftRight, tool: "converter" },
  { id: "scratchpad", label: "Scratchpad", description: "Quick working notes", icon: Layers, tool: "scratchpad" },
];

export function QuickActions({ onPractice }: { onPractice: () => void }) {
  const { openTool } = useStudyTools();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {ACTIONS.map((action) => {
        const Icon = action.icon;
        if (action.id === "practice") {
          return (
            <button
              key={action.id}
              onClick={onPractice}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block font-display text-[15px] font-semibold text-ink">{action.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{action.description}</span>
              </span>
            </button>
          );
        }
        if (action.href) {
          return (
            <Link
              key={action.id}
              href={action.href}
              className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block font-display text-[15px] font-semibold text-ink">{action.label}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted">{action.description}</span>
              </span>
            </Link>
          );
        }
        return (
          <button
            key={action.id}
            onClick={() => openTool(action.tool!)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-background p-4 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-softLg"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
              <Icon size={18} strokeWidth={1.8} />
            </span>
            <span>
              <span className="block font-display text-[15px] font-semibold text-ink">{action.label}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{action.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}