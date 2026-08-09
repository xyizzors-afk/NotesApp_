"use client";

import { useEffect, useState, type ComponentType } from "react";
import { CloudSun, Moon, Sun } from "lucide-react";
import { useProfile } from "@/lib/local-hooks";
import { QuickActions } from "./quick-actions";
import { RecentItems } from "./recent-items";
import { BookmarksList } from "./bookmarks-list";
import { Statistics } from "./statistics";
import { PracticeSetupModal } from "@/components/practice/practice-setup-modal";

type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

function greetingFor(hour: number): { text: string; icon: IconComponent } {
  if (hour >= 5 && hour < 12) return { text: "Good morning", icon: Sun };
  if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: CloudSun };
  if (hour >= 17 && hour < 21) return { text: "Good evening", icon: Moon };
  return { text: "Good night", icon: Moon };
}

export function Dashboard() {
  const [profile] = useProfile();
  const [now, setNow] = useState<Date | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const greeting = now ? greetingFor(now.getHours()) : null;
  const name = profile?.name?.trim();

  return (
    <div className="container-content py-8 md:py-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          {greeting ? (
            <>
              {greeting.text}
              {name && <span className="text-accent">, {name}</span>}
            </>
          ) : (
            <span className="inline-block h-9 w-56 animate-pulse rounded-lg bg-surfaceHover align-middle md:h-10" aria-hidden="true" />
          )}
        </h1>
        <p className="mt-2 text-[15px] text-muted">Continue where you left off or start a new study session.</p>
      </header>

      {/* Quick Actions */}
      <section className="mt-8" aria-labelledby="quick-actions-heading">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent">
            {greeting ? <greeting.icon size={14} /> : <Sun size={14} />}
          </span>
          <h2 id="quick-actions-heading" className="text-xs font-semibold uppercase tracking-wider text-muted">
            Quick Actions
          </h2>
        </div>
        <QuickActions onPractice={() => setPracticeOpen(true)} />
      </section>

      <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <RecentItems />
        <BookmarksList />
      </div>

      <div className="mt-8">
        <Statistics />
      </div>

      <PracticeSetupModal open={practiceOpen} onClose={() => setPracticeOpen(false)} />
    </div>
  );
}