"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  configured: boolean;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  /**
   * If signed in (or Supabase unset in local/dev), runs `action`.
   * Otherwise opens the login dialog and returns false.
   */
  requireAuth: (action?: () => void | Promise<void>) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(configured);
  const [loginOpen, setLoginOpen] = React.useState(false);

  React.useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) {
        setUser(data.user ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) setLoginOpen(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [configured]);

  const openLogin = React.useCallback(() => setLoginOpen(true), []);
  const closeLogin = React.useCallback(() => setLoginOpen(false), []);

  const requireAuth = React.useCallback(
    async (action?: () => void | Promise<void>) => {
      if (!configured) {
        await action?.();
        return true;
      }
      if (user) {
        await action?.();
        return true;
      }
      setLoginOpen(true);
      return false;
    },
    [configured, user],
  );

  const signOut = React.useCallback(async () => {
    if (!configured) return;
    await createClient().auth.signOut();
    setUser(null);
  }, [configured]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      configured,
      loginOpen,
      openLogin,
      closeLogin,
      requireAuth,
      signOut,
    }),
    [
      user,
      loading,
      configured,
      loginOpen,
      openLogin,
      closeLogin,
      requireAuth,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
