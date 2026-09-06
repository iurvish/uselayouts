"use client";

import * as React from "react";

import { useAuth } from "@/components/auth/auth-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

/** Dark open-UI login: magic link email. */
export function LoginDialog() {
  const { configured, loginOpen, closeLogin } = useAuth();
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loginOpen) {
      setStatus("idle");
      setError(null);
      setEmail("");
    }
  }, [loginOpen]);

  if (!configured) return null;

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setError(null);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      const { error: signError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (signError) throw signError;
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not send login link");
    }
  }

  return (
    <Dialog
      open={loginOpen}
      onOpenChange={(open) => {
        if (!open) closeLogin();
      }}
    >
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden rounded-[14px] border border-[hsl(240_4%_29%)] bg-[hsl(240_6%_12%)] p-0 text-white sm:max-w-[360px]",
          "ring-0 shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
        )}
        showCloseButton
      >
        <DialogHeader className="gap-1.5 border-b border-[hsl(240_4%_22%)] px-5 py-4">
          <DialogTitle className="text-base font-medium tracking-[-0.32px] text-white">
            Sign in to copy
          </DialogTitle>
          <DialogDescription className="text-sm leading-5 tracking-[-0.14px] text-[hsl(240_5%_69%)]">
            Enter your email and we&apos;ll send a magic link. After you sign
            in, hit copy again.
          </DialogDescription>
        </DialogHeader>

        {status === "sent" ? (
          <div className="px-5 py-5 text-sm leading-5 text-[hsl(240_5%_69%)]">
            Check <span className="text-white">{email.trim()}</span> for the
            login link.
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3 px-5 py-5">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs tracking-[-0.12px] text-[hsl(240_5%_58%)]">
                Email
              </span>
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-9 border-[hsl(240_4%_29%)] bg-[hsl(240_6%_8%)] text-white placeholder:text-[hsl(240_5%_45%)]"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={status === "sending"}
              className={cn(
                "inline-flex h-9 cursor-pointer items-center justify-center rounded-xl bg-white px-3 text-sm font-medium text-[hsl(240_6%_8%)]",
                "transition-transform duration-150 active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
