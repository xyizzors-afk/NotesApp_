"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const STORAGE_KEY = "studyToolsPanelWidth";
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 260;
const MAX_WIDTH = 640;

function clamp(value: number) {
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, value));
}

/**
 * Tracks the study-tools panel width and exposes a pointerdown handler to
 * drag-resize it from an edge handle. The panel is anchored to the right
 * side of the screen, so dragging the left edge leftward should widen it —
 * i.e. width grows as the pointer moves *away* from the panel.
 */
export function useResizablePanelWidth() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number(stored) : NaN;
    if (!Number.isNaN(parsed)) setWidth(clamp(parsed));
  }, []);

  const startDragging = useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault();
      draggingRef.current = true;
      setIsDragging(true);
      const startX = event.clientX;
      const startWidth = width;

      function handleMove(e: PointerEvent) {
        if (!draggingRef.current) return;
        const delta = startX - e.clientX;
        setWidth(clamp(startWidth + delta));
      }

      function handleUp() {
        draggingRef.current = false;
        setIsDragging(false);
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
        setWidth((current) => {
          window.localStorage.setItem(STORAGE_KEY, String(current));
          return current;
        });
      }

      window.addEventListener("pointermove", handleMove);
      window.addEventListener("pointerup", handleUp);
    },
    [width]
  );

  return { width, isDragging, startDragging };
}
