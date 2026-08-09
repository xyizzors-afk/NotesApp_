"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { ToolId } from "@/lib/local-types";

interface StudyToolsContextValue {
  open: boolean;
  activeTool: ToolId;
  openTools: () => void;
  openTool: (tool: ToolId) => void;
  closeTools: () => void;
  toggleTool: (tool: ToolId) => void;
}

const StudyToolsContext = createContext<StudyToolsContextValue | null>(null);

export function StudyToolsProvider({ children }: { children: React.ReactNode }) {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  const openTools = useCallback(() => setActiveTool((t) => t ?? "calculator"), []);
  const openTool = useCallback((tool: ToolId) => setActiveTool(tool), []);
  const closeTools = useCallback(() => setActiveTool(null), []);
  const toggleTool = useCallback(
    (tool: ToolId) => setActiveTool((t) => (t === tool ? null : tool)),
    []
  );

  return (
    <StudyToolsContext.Provider
      value={{
        open: activeTool !== null,
        activeTool: activeTool ?? "calculator",
        openTools,
        openTool,
        closeTools,
        toggleTool,
      }}
    >
      {children}
    </StudyToolsContext.Provider>
  );
}

export function useStudyTools(): StudyToolsContextValue {
  const ctx = useContext(StudyToolsContext);
  if (!ctx) throw new Error("useStudyTools must be used within StudyToolsProvider");
  return ctx;
}