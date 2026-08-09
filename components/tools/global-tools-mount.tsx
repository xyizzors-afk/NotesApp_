"use client";

import { usePathname } from "next/navigation";
import { StudyToolsPanel } from "./study-tools-panel";

/**
 * Global tools panel rendered from the layout. Always renders in "overlay"
 * mode (fixed to the right edge, layered on top of the page) — including on
 * the paper viewer, which previously used a separate inline panel that
 * pushed the document's width and collapsed to a bottom sheet on narrow
 * screens. On the viewer page, the paper's ID is pulled from the URL so the
 * scratchpad still saves per-paper instead of falling back to one shared
 * scratchpad.
 */
export function GlobalToolsMount() {
  const pathname = usePathname();
  const viewerMatch = /^\/past-papers\/([^/]+)$/.exec(pathname ?? "");
  const scratchpadKey = viewerMatch ? viewerMatch[1] : null;
  return <StudyToolsPanel mode="overlay" scratchpadKey={scratchpadKey} />;
}