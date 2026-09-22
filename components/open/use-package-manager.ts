"use client";

import * as React from "react";

import {
  PACKAGE_MANAGER_STORAGE_KEY,
  isPackageManager,
  type PackageManager,
} from "@/lib/open/package-manager";

export function usePackageManager() {
  const [manager, setManagerState] = React.useState<PackageManager>("bun");

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(PACKAGE_MANAGER_STORAGE_KEY);
      if (stored && isPackageManager(stored)) setManagerState(stored);
    } catch {
      // ignore
    }
  }, []);

  const setManager = React.useCallback((next: PackageManager) => {
    setManagerState(next);
    try {
      window.localStorage.setItem(PACKAGE_MANAGER_STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  return [manager, setManager] as const;
}
