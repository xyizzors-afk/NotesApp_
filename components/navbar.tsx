"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, GraduationCap, Settings, Calculator, FunctionSquare, Timer, ArrowLeftRight, Layers, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfile } from "@/lib/local-hooks";
import { useStudyTools } from "@/components/tools/study-tools-provider";
import { SettingsMenu } from "@/components/settings-menu";
import type { ToolId } from "@/lib/local-types";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/notes", label: "Notes" },
  { href: "/past-papers", label: "Past Papers" },
];

const toolItems: { id: ToolId; label: string; icon: typeof Calculator }[] = [
  { id: "calculator", label: "Scientific Calculator", icon: Calculator },
  { id: "desmos", label: "Desmos Calculator", icon: FunctionSquare },
  { id: "timer", label: "Exam Timer", icon: Timer },
  { id: "converter", label: "Unit Converter", icon: ArrowLeftRight },
  { id: "scratchpad", label: "Scratchpad", icon: Layers },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<"none" | "tools" | "settings">("none");
  const [profile] = useProfile();
  const { openTool } = useStudyTools();

  function closeMenus() {
    setMenu("none");
    setOpen(false);
  }

  // Close the desktop dropdowns when clicking anywhere outside the header.
  useEffect(() => {
    if (menu === "none") return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest("header")) setMenu("none");
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menu]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="container-content flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink-solid text-on-ink">
            <GraduationCap size={17} strokeWidth={2} />
          </span>
          Coursify
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-surface text-ink" : "text-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}

          {/* Tools dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenu((m) => (m === "tools" ? "none" : "tools"))}
              aria-expanded={menu === "tools"}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                menu === "tools" ? "bg-surface text-ink" : "text-muted hover:text-ink"
              )}
            >
              Tools
              <ChevronDown size={14} className={cn("transition-transform", menu === "tools" && "rotate-180")} />
            </button>
            {menu === "tools" && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-background p-2 shadow-softLg">
                {toolItems.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        openTool(tool.id);
                        setMenu("none");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink transition-colors hover:bg-surface"
                    >
                      <Icon size={16} className="text-muted" />
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings / profile */}
          <div className="relative">
            <button
              onClick={() => setMenu((m) => (m === "settings" ? "none" : "settings"))}
              aria-expanded={menu === "settings"}
              aria-label="Settings and profile"
              className="ml-2 flex h-9 items-center gap-2 rounded-full border border-border pl-1.5 pr-3 text-sm font-medium text-ink transition-colors hover:bg-surface"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold uppercase text-accent">
                {(profile?.name ?? "S")[0]}
              </span>
              <Settings size={15} className="text-muted" />
            </button>
            {menu === "settings" && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-border bg-background shadow-softLg">
                <SettingsMenu onNavigate={closeMenus} />
              </div>
            )}
          </div>
        </nav>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-content flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-surface"
              >
                {link.label}
              </Link>
            ))}

            <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Tools</p>
            {toolItems.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    openTool(tool.id);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] font-medium text-ink hover:bg-surface"
                >
                  <Icon size={16} className="text-muted" />
                  {tool.label}
                </button>
              );
            })}

            <p className="mt-3 px-3 text-xs font-semibold uppercase tracking-wide text-muted">Settings</p>
            <div className="rounded-2xl border border-border bg-surface/60">
              <SettingsMenu onNavigate={() => setOpen(false)} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}