"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ExternalLink, FileWarning, Loader2, Eraser } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHighlights } from "@/lib/local-hooks";
import type { Highlight } from "@/lib/local-types";
import { HIGHLIGHT_COLORS } from "@/lib/highlight-colors";

// Load the worker from a CDN pinned to whatever pdfjs-dist version react-pdf
// itself resolved at install time (pdfjs.version). react-pdf bundles its own
// internal pdfjs-dist dependency, which is often a *different* version than
// any top-level pdfjs-dist in package.json — copying a locally-installed
// worker file reliably drifts out of sync with it and throws
// "API version X does not match Worker version Y". Deriving the URL from
// pdfjs.version at runtime is always correct, whatever version react-pdf
// happens to depend on.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/** Maps an external PDF URL to the same-origin proxy route. */
export function proxiedPdfUrl(url: string): string {
  if (url.startsWith("/") || url.startsWith(location.origin)) return url;
  return `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
}

export function isPdfUrlLocal(url: string): boolean {
  return url.startsWith("/") || url.startsWith(location.origin);
}

export interface PdfDocumentViewerProps {
  url: string;
  label: string;
  pageNumber: number;
  numPages: number;
  scale: number;
  onPageChange: (page: number) => void;
  onNumPagesChange: (numPages: number) => void;
  onScaleChange: (scale: number) => void;
  /** Show the compact per-document control bar (page nav). */
  showControls?: boolean;
  className?: string;
  onOpen?: () => void;
  /** Unique per-document key (e.g. paperId + kind) — highlights are saved under this. */
  docKey?: string;
  /** When true, selecting text creates a highlight instead of just selecting. */
  highlightMode?: boolean;
  highlightColor?: string;
  onHighlightColorChange?: (color: string) => void;
}

export function PdfDocumentViewer({
  url,
  label,
  pageNumber,
  numPages,
  scale,
  onPageChange,
  onNumPagesChange,
  onScaleChange,
  showControls = true,
  className,
  onOpen,
  docKey,
  highlightMode = false,
  highlightColor = HIGHLIGHT_COLORS[0].value,
  onHighlightColorChange,
}: PdfDocumentViewerProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const fileUrl = useMemo(() => proxiedPdfUrl(url), [url]);
  const [highlights, setHighlights] = useHighlights(docKey || url);

  // Reset state when the document URL changes (QP ↔ MS ↔ ER).
  useEffect(() => {
    setStatus("loading");
  }, [fileUrl]);

  // Responsive page width, capped so huge pages aren't rendered at extreme sizes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerWidth(el.clientWidth - 32);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const hasScrolledToInitialRef = useRef(false);

  const scrollToPage = useCallback((n: number, behavior: ScrollBehavior = "smooth") => {
    pageRefs.current.get(n)?.scrollIntoView({ behavior, block: "start" });
  }, []);

  const goPrev = useCallback(() => {
    if (pageNumber > 1) scrollToPage(pageNumber - 1);
  }, [pageNumber, scrollToPage]);

  const goNext = useCallback(() => {
    if (pageNumber < numPages) scrollToPage(pageNumber + 1);
  }, [pageNumber, numPages, scrollToPage]);

  // Resume at whatever page was last active for this document (e.g. switching
  // back to QP after viewing MS), but only once per mount — after that, the
  // scroll position itself is the source of truth.
  useEffect(() => {
    if (status !== "ready" || numPages === 0 || hasScrolledToInitialRef.current) return;
    hasScrolledToInitialRef.current = true;
    if (pageNumber > 1) scrollToPage(pageNumber, "auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, numPages]);

  // Track which page is currently in view while scrolling, so the page
  // indicator and jump-to-page controls stay in sync with actual scroll
  // position instead of a single mounted page.
  useEffect(() => {
    if (status !== "ready" || numPages === 0) return;
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: { page: number; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const page = Number((entry.target as HTMLElement).dataset.page);
          if (!best || entry.intersectionRatio > best.ratio) best = { page, ratio: entry.intersectionRatio };
        }
        if (best) onPageChange(best.page);
      },
      { root, threshold: [0.25, 0.5, 0.75] }
    );

    pageRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [status, numPages, onPageChange]);

  // Keyboard page navigation.
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext]);

  // Block copying the underlying text — selection itself stays enabled
  // (required for highlighting), only the clipboard write is stopped.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const blockCopy = (event: ClipboardEvent) => event.preventDefault();
    const blockContextMenu = (event: MouseEvent) => event.preventDefault();
    el.addEventListener("copy", blockCopy);
    el.addEventListener("contextmenu", blockContextMenu);
    return () => {
      el.removeEventListener("copy", blockCopy);
      el.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);

  // Turn a text selection into a saved highlight while highlight mode is on.
  useEffect(() => {
    if (!highlightMode) return;
    const el = containerRef.current;
    if (!el) return;

    function handleMouseUp() {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      if (!el!.contains(range.commonAncestorContainer)) return;
      const text = selection.toString().trim();
      if (!text) return;

      const rectsByPage = new Map<number, DOMRect[]>();
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width === 0 || rect.height === 0) continue;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const pageEl = document.elementFromPoint(cx, cy)?.closest<HTMLElement>("[data-page]");
        if (!pageEl) continue;
        const page = Number(pageEl.dataset.page);
        if (!rectsByPage.has(page)) rectsByPage.set(page, []);
        rectsByPage.get(page)!.push(rect);
      }

      const created: Highlight[] = [];
      rectsByPage.forEach((rects, page) => {
        const pageEl = pageRefs.current.get(page);
        if (!pageEl) return;
        const box = pageEl.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return;
        created.push({
          id: crypto.randomUUID(),
          page,
          text,
          color: highlightColor,
          rects: rects.map((r) => ({
            x: (r.left - box.left) / box.width,
            y: (r.top - box.top) / box.height,
            w: r.width / box.width,
            h: r.height / box.height,
          })),
          createdAt: new Date().toISOString(),
        });
      });

      if (created.length > 0) setHighlights((cur) => [...cur, ...created]);
      selection.removeAllRanges();
    }

    el.addEventListener("mouseup", handleMouseUp);
    return () => el.removeEventListener("mouseup", handleMouseUp);
  }, [highlightMode, highlightColor, setHighlights]);

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-soft", className)}>
      {showControls && (
        <div className="flex shrink-0 items-center gap-1 border-b border-border bg-background px-3 py-2">
          <p className="min-w-0 flex-1 truncate text-xs font-semibold uppercase tracking-wide text-muted">
            {label}
          </p>

          {highlightMode && (
            <div className="mr-1 flex items-center gap-1">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => onHighlightColorChange?.(c.value)}
                  aria-label={`Highlight color ${c.name}`}
                  aria-pressed={highlightColor === c.value}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 transition-transform",
                    highlightColor === c.value ? "scale-110 border-ink" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value.replace(/[\d.]+\)$/, "1)") }}
                />
              ))}
              {highlights.length > 0 && (
                <button
                  onClick={() => setHighlights([])}
                  aria-label="Clear highlights"
                  className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-surfaceHover hover:text-ink"
                >
                  <Eraser size={13} />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-background p-0.5">
            <button
              onClick={() => onScaleChange(Math.max(0.5, Math.round((scale - 0.25) * 100) / 100))}
              disabled={scale <= 0.5}
              aria-label="Zoom out"
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-surfaceHover hover:text-ink disabled:opacity-40"
            >
              <span className="text-sm font-bold leading-none">−</span>
            </button>
            <span className="min-w-[34px] text-center font-mono text-[11px] text-muted">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => onScaleChange(Math.min(2, Math.round((scale + 0.25) * 100) / 100))}
              disabled={scale >= 2}
              aria-label="Zoom in"
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted hover:bg-surfaceHover hover:text-ink disabled:opacity-40"
            >
              <span className="text-sm font-bold leading-none">+</span>
            </button>
            {scale !== 1 && (
              <button
                onClick={() => onScaleChange(1)}
                aria-label="Reset zoom"
                className="flex h-6 items-center justify-center rounded-md px-1.5 text-[10px] font-medium text-muted hover:bg-surfaceHover hover:text-ink"
              >
                1×
              </button>
            )}
          </div>
        </div>
      )}

      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto bg-surface">
        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading {label.toLowerCase()}…
          </div>
        )}
        {status === "error" && (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <FileWarning size={26} className="text-muted" />
            <p className="max-w-xs text-sm text-muted">
              This document couldn&apos;t be loaded — it may not exist for this paper, or the PDF provider may
              be blocking it.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
            >
              Try opening it directly
              <ExternalLink size={13} />
            </a>
          </div>
        )}
        {status !== "error" && containerWidth > 0 && (
          <div className="flex w-full flex-col items-center gap-4 p-4">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages: n }) => {
                onNumPagesChange(n);
                onOpen?.();
                setStatus("ready");
              }}
              onLoadError={() => setStatus("error")}
              loading={null}
              error={null}
            >
              {Array.from({ length: numPages }, (_, i) => i + 1).map((n) => (
                <div
                  key={n}
                  data-page={n}
                  className={cn("relative", highlightMode && "cursor-text")}
                  ref={(el) => {
                    if (el) pageRefs.current.set(n, el);
                    else pageRefs.current.delete(n);
                  }}
                >
                  <Page
                    pageNumber={n}
                    width={containerWidth}
                    scale={scale}
                    renderTextLayer
                    renderAnnotationLayer
                    loading={
                      <div className="flex h-64 w-full items-center justify-center text-sm text-muted">
                        Rendering page…
                      </div>
                    }
                  />
                  {highlights
                    .filter((h) => h.page === n)
                    .flatMap((h) =>
                      h.rects.map((r, i) => (
                        <div
                          key={`${h.id}-${i}`}
                          className="pointer-events-none absolute rounded-[2px]"
                          style={{
                            left: `${r.x * 100}%`,
                            top: `${r.y * 100}%`,
                            width: `${r.w * 100}%`,
                            height: `${r.h * 100}%`,
                            backgroundColor: h.color,
                          }}
                        />
                      ))
                    )}
                </div>
              ))}
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}