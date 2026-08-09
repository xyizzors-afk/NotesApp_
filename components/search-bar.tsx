"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { cn } from "@/lib/utils";

export function SearchBar({
  className,
  size = "lg",
  placeholder = "Search notes or past papers...",
}: {
  className?: string;
  size?: "lg" | "md";
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/past-papers?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={cn(
        "flex w-full items-center gap-3 rounded-full border border-border bg-background shadow-soft transition-shadow focus-within:shadow-softLg",
        size === "lg" ? "h-14 px-5" : "h-11 px-4",
        className
      )}
    >
      <Search size={size === "lg" ? 20 : 17} className="shrink-0 text-muted" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder={placeholder}
        aria-label="Search notes or past papers"
        className={cn(
          "w-full bg-transparent text-ink placeholder:text-muted focus:outline-none",
          size === "lg" ? "text-[15px]" : "text-sm"
        )}
      />
      <button
        type="submit"
        className={cn(
          "shrink-0 rounded-full bg-ink-solid font-medium text-on-ink transition-colors hover:bg-ink-solid/90",
          size === "lg" ? "h-10 px-5 text-sm" : "h-8 px-4 text-xs"
        )}
      >
        Search
      </button>
    </form>
  );
}
