"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import type { OpenPanel } from "@/components/open/open-actions";

type OpenPanelContextValue = {
  panel: OpenPanel;
  setPanel: (panel: OpenPanel) => void;
  /** Localhost-only stage: hide open chrome for recording. */
  stage: boolean;
  setStage: (stage: boolean) => void;
};

const OpenPanelContext = React.createContext<OpenPanelContextValue | null>(null);

export function OpenPanelProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [panel, setPanelState] = React.useState<OpenPanel>(null);
  const [stage, setStageState] = React.useState(false);
  const [pathForPanel, setPathForPanel] = React.useState(pathname);

  // Close drawers when the route changes (no scroll side effects).
  if (pathname !== pathForPanel) {
    setPathForPanel(pathname);
    if (panel !== null) setPanelState(null);
    if (stage) setStageState(false);
  }

  const setPanel = React.useCallback((next: OpenPanel) => {
    setPanelState(next);
  }, []);

  const setStage = React.useCallback((next: boolean) => {
    setStageState(next);
    if (next) setPanelState(null);
  }, []);

  const value = React.useMemo(
    () => ({ panel, setPanel, stage, setStage }),
    [panel, setPanel, stage, setStage],
  );

  return <OpenPanelContext.Provider value={value}>{children}</OpenPanelContext.Provider>;
}

export function useOpenPanel() {
  const value = React.useContext(OpenPanelContext);
  if (!value) {
    throw new Error("useOpenPanel must be used within OpenPanelProvider");
  }
  return value;
}
