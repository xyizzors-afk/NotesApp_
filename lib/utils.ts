import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function levelLabel(level: string) {
  switch (level) {
    case "o-level":
      return "O Level";
    case "as-level":
      return "AS Level";
    case "a-level":
      return "A Level";
    case "igcse":
      return "IGCSE";
    default:
      return level;
  }
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
