"use client";

import * as React from "react";

type DialPreviewContextValue = {
  active: boolean;
  setActive: (active: boolean) => void;
};

const DialPreviewContext = React.createContext<DialPreviewContextValue>({
  active: false,
  setActive: () => undefined,
});

export function DialPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [active, setActive] = React.useState(false);
  const value = React.useMemo(() => ({ active, setActive }), [active]);
  return (
    <DialPreviewContext.Provider value={value}>
      {children}
    </DialPreviewContext.Provider>
  );
}

export function useDialPreview() {
  return React.useContext(DialPreviewContext);
}
