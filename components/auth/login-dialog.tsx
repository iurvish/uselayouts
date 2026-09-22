"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { useAuth } from "@/components/auth/auth-provider";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 5 * 60;

const EMAIL_FIELD_SHADOW =
  "shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.06),0px_0px_0px_1px_rgba(255,255,255,0.06),0px_0px_0px_1px_#27272a,0px_0px_1px_1.5px_rgba(0,0,0,0.24),0px_2px_2px_0px_rgba(0,0,0,0.24)]";
/** Figma 418:9820 — 1px #60a5fa + 4px rgba(51,81,229,0.25) focus ring */
const EMAIL_FIELD_FOCUS =
  "focus-within:bg-[rgba(255,255,255,0.04)] focus-within:shadow-[0px_0px_0px_1px_#60a5fa,0px_0px_0px_4px_rgba(51,81,229,0.25)]";
const EMAIL_FIELD_FOCUS_VISIBLE =
  "focus-visible:bg-[rgba(255,255,255,0.04)] focus-visible:shadow-[0px_0px_0px_1px_#60a5fa,0px_0px_0px_4px_rgba(51,81,229,0.25)]";

/** Anchored email chip — view truncates under a fade; Edit toggles Figma 400:2652 field + Done. */
function EmailAddressChip({
  email,
  onCommit,
  busy,
}: {
  email: string;
  onCommit: (next: string) => void | Promise<void>;
  busy?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(email);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!editing) setDraft(email);
  }, [email, editing]);

  React.useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function finish() {
    const next = draft.trim();
    if (!next || busy) return;
    setEditing(false);
    if (next !== email.trim()) await onCommit(next);
  }

  if (editing) {
    return (
      <div
        className={cn(
          "flex w-full items-center gap-1 overflow-clip rounded-lg bg-[#222223] py-[10px] pr-1.5 pl-2",
          EMAIL_FIELD_SHADOW,
          EMAIL_FIELD_FOCUS,
        )}
      >
        <input
          ref={inputRef}
          type="email"
          autoComplete="email"
          value={draft}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void finish();
            }
            if (e.key === "Escape") {
              setDraft(email);
              setEditing(false);
            }
          }}
          className="min-w-0 flex-1 bg-transparent text-[13px] leading-[1.1] text-white outline-none placeholder:text-[#71717a] disabled:opacity-60"
          placeholder="steve@apple.com"
          aria-label="Email"
        />
        <button
          type="button"
          disabled={busy || !draft.trim()}
          onClick={() => void finish()}
          className="shrink-0 cursor-pointer px-2 text-[12px] font-medium text-[#70a7ff] transition-colors hover:text-[#9bc0ff] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "…" : "Done"}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex w-full items-center overflow-hidden rounded-lg bg-[#1a1a1e]",
        "shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08)]",
      )}
    >
      <span className="min-w-0 flex-1 truncate py-2.5 pr-14 pl-3 text-left text-[13px] font-medium leading-[1.1] text-[#f7f7f7]">
        {email}
      </span>
      {/* Fade under the action so long addresses don’t collide with Edit */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-10 w-12 bg-gradient-to-r from-transparent to-[#1a1a1e]"
      />
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="absolute top-1/2 right-1.5 z-10 -translate-y-1/2 cursor-pointer px-2 py-1.5 text-[12px] font-medium text-[#70a7ff] transition-colors hover:text-[#9bc0ff]"
      >
        Edit
      </button>
    </div>
  );
}

function LoginBubbleBadge() {
  return (
    <div className="relative h-[53.369px] w-[202.757px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/auth/login-bubble.svg"
        alt=""
        width={202.757}
        height={53.369}
        className="pointer-events-none absolute inset-0 max-w-none"
        aria-hidden
      />
      <div className="absolute top-[14.18px] left-[18.38px] flex items-center gap-2">
        <span className="relative flex size-5 shrink-0 items-center justify-center overflow-clip">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth/login-copy-icon.svg"
            alt=""
            width={18.4167}
            height={18.4167}
            className="max-w-none"
            aria-hidden
          />
        </span>
        <span className="font-[family-name:var(--font-geist-sans)] text-[22px] font-medium leading-6 tracking-[-0.33px] text-[#70a7ff] whitespace-nowrap">
          Login to Copy
        </span>
      </div>
    </div>
  );
}

function EmailConfirmationHero() {
  return (
    <div className="relative h-[171.373px] w-[298.52px] shrink-0 overflow-clip">
      <div className="absolute top-[-33px] left-[40.26px] h-[172.369px] w-[257.963px]">
        <div className="absolute inset-[0_0_-5.22%_0]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auth/email-mask.svg"
            alt=""
            width={257.963}
            height={181.366}
            className="max-w-none"
            aria-hidden
          />
        </div>
      </div>
      <div className="absolute top-[calc(50%-17.14px)] left-[calc(50%-11.5px)] flex h-[117.08px] w-[175px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div className="flex-none rotate-[-33.69deg] scale-y-92 skew-x-[22.42deg]">
          <div className="relative h-[100px] w-[110.553px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/auth/email-envelope.svg"
              alt=""
              width={110.553}
              height={100}
              className="max-w-none"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCountdown(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function openMailForEmail(email: string) {
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const urls: Record<string, string> = {
    "gmail.com": "https://mail.google.com",
    "googlemail.com": "https://mail.google.com",
    "outlook.com": "https://outlook.live.com/mail",
    "hotmail.com": "https://outlook.live.com/mail",
    "live.com": "https://outlook.live.com/mail",
    "msn.com": "https://outlook.live.com/mail",
    "yahoo.com": "https://mail.yahoo.com",
    "ymail.com": "https://mail.yahoo.com",
    "icloud.com": "https://www.icloud.com/mail",
    "me.com": "https://www.icloud.com/mail",
    "mac.com": "https://www.icloud.com/mail",
    "proton.me": "https://mail.proton.me",
    "protonmail.com": "https://mail.proton.me",
  };
  window.open(urls[domain] ?? `mailto:${email}`, "_blank", "noopener,noreferrer");
}

function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex w-full cursor-pointer items-center justify-center overflow-clip rounded-[10px] px-2.5 py-2",
        "bg-[hsl(230_77%_55%)]",
        "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.12)]",
        "transition-[transform,background-color] duration-150 active:scale-[0.98]",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
        "disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      <span
        className="relative text-[14px] font-medium leading-5 tracking-[-0.084px] text-white"
        style={{ fontFeatureSettings: '"ss11" 1, "calt" 0, "liga" 0' }}
      >
        {children}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0.2px_rgba(255,255,255,0.16)]"
      />
    </button>
  );
}

/** Pixel-matched open-UI login from Figma 400:320 / confirmation 400:8269. */
export function LoginDialog() {
  const { configured, loginOpen, closeLogin } = useAuth();
  const [email, setEmail] = React.useState("");
  const [mode, setMode] = React.useState<"login" | "signup">("login");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(RESEND_SECONDS);
  const [resending, setResending] = React.useState(false);
  const [chipBusy, setChipBusy] = React.useState(false);
  /** Existing account → magic link; first-time email → verification link. */
  const [isExistingUser, setIsExistingUser] = React.useState(false);

  React.useEffect(() => {
    if (!loginOpen) {
      setStatus("idle");
      setError(null);
      setEmail("");
      setMode("login");
      setResendIn(RESEND_SECONDS);
      setResending(false);
      setChipBusy(false);
      setIsExistingUser(false);
    }
  }, [loginOpen]);

  React.useEffect(() => {
    if (status !== "sent" || resendIn <= 0) return;
    const id = window.setInterval(() => {
      setResendIn((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [status, resendIn]);

  if (!configured) return null;

  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;

  async function resolveEmailExists(trimmed: string) {
    try {
      const res = await fetch("/api/auth/email-exists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as { exists?: boolean };
      return Boolean(json.exists);
    } catch {
      return false;
    }
  }

  function formatAuthError(err: unknown, fallback: string) {
    const message = err instanceof Error ? err.message : fallback;
    if (/rate limit|over_email_send_rate_limit|429/i.test(message)) {
      return "Too many emails sent. Wait a few minutes, or raise the limit in Supabase → Authentication → Rate Limits (needs custom SMTP).";
    }
    return message || fallback;
  }

  async function sendOtp(trimmed: string) {
    const supabase = createClient();
    const { error: signError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectTo() },
    });
    if (signError) throw signError;
  }

  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setStatus("sending");
    setError(null);

    try {
      const exists = await resolveEmailExists(trimmed);
      setIsExistingUser(exists);
      await sendOtp(trimmed);
      setResendIn(RESEND_SECONDS);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(formatAuthError(err, "Could not send login link"));
    }
  }

  async function resendMagicLink() {
    const trimmed = email.trim();
    if (!trimmed || resendIn > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await sendOtp(trimmed);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(formatAuthError(err, "Could not resend login link"));
    } finally {
      setResending(false);
    }
  }

  async function commitChipEmail(next: string) {
    setChipBusy(true);
    setError(null);
    setEmail(next);
    try {
      const exists = await resolveEmailExists(next);
      setIsExistingUser(exists);
      await sendOtp(next);
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(formatAuthError(err, "Could not send login link"));
    } finally {
      setChipBusy(false);
    }
  }

  async function signInWithGoogle() {
    setStatus("sending");
    setError(null);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo() },
      });
      if (signError) throw signError;
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not start Google sign-in");
    }
  }

  const sentEmail = email.trim();
  const isSent = status === "sent";
  const linkLabel = isExistingUser ? "magic link" : "verification link";

  return (
    <Dialog
      open={loginOpen}
      onOpenChange={(open) => {
        if (!open) closeLogin();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="bg-black/10 supports-backdrop-filter:backdrop-blur-[3.35px]" />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-999999 w-[min(calc(100%-2rem),380px)] -translate-x-1/2 -translate-y-1/2 outline-none",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100",
          )}
        >
          <DialogTitle className="sr-only">
            {isSent
              ? "Check your inbox"
              : mode === "signup"
                ? "Sign up to copy"
                : "Login to copy"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isSent
              ? `We sent a ${linkLabel} to ${sentEmail}`
              : "Sign in with Google or email to copy components."}
          </DialogDescription>

          <div className="flex w-full flex-col items-start overflow-clip rounded-[24px] border border-solid border-[#29292b] bg-[#1f1f23] px-1 pt-1">
            <div className="relative flex w-full flex-col items-center overflow-clip rounded-[20px] p-[26px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_1px_3px_0px_rgba(0,0,0,0.4),0px_0px_3px_0px_rgba(0,0,0,0.2)]">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[20px] bg-[#131316]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.01)]" />

              {isSent ? (
                <div className="relative flex w-full flex-col items-center">
                  <EmailConfirmationHero />
                  <div className="flex w-full flex-col gap-5">
                    <div className="flex w-full flex-col items-center gap-3 text-center">
                      <p className="font-[family-name:var(--font-geist-sans)] text-[20px] font-medium tracking-[-0.3px] text-white whitespace-nowrap">
                        Check your inbox
                      </p>
                      <p className="text-[14px] leading-5 text-[#8e8e93]">
                        We sent a {linkLabel} to
                      </p>
                      <EmailAddressChip
                        email={sentEmail}
                        busy={chipBusy}
                        onCommit={commitChipEmail}
                      />
                    </div>
                    <PrimaryButton
                      onClick={() => openMailForEmail(sentEmail)}
                      disabled={chipBusy}
                    >
                      Open Mail
                    </PrimaryButton>
                  </div>
                </div>
              ) : (
                <div className="relative flex w-full flex-col items-center gap-[34px]">
                  <LoginBubbleBadge />

                  <form
                    onSubmit={sendMagicLink}
                    className="flex w-full flex-col gap-5"
                  >
                    <div className="flex w-full flex-col gap-[22px]">
                      <button
                        type="button"
                        onClick={signInWithGoogle}
                        disabled={status === "sending"}
                        className={cn(
                          "relative flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-clip rounded-[10px] p-2",
                          "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.1)]",
                          "transition-transform duration-150 active:scale-[0.98]",
                          "disabled:cursor-not-allowed disabled:opacity-60",
                        )}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-[10px]"
                          style={{
                            backgroundImage:
                              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 100%), linear-gradient(90deg, rgb(53,53,60) 0%, rgb(53,53,60) 100%)",
                          }}
                        />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/auth/google-logo.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="relative max-w-none shrink-0"
                          aria-hidden
                        />
                        <span
                          className="relative text-[14px] font-medium leading-5 tracking-[-0.084px] text-white"
                          style={{
                            fontFeatureSettings: '"ss11" 1, "calt" 0, "liga" 0',
                          }}
                        >
                          Sign in with Google
                        </span>
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.05)]"
                        />
                      </button>

                      <div className="flex w-full items-center justify-center gap-2.5">
                        <div className="h-px min-w-px flex-1 bg-[#2a2a2e]" />
                        <span
                          className="text-[11px] font-medium leading-3 tracking-[0.22px] text-[#acacb4] uppercase whitespace-nowrap"
                          style={{
                            fontFeatureSettings: '"ss11" 1, "calt" 0, "liga" 0',
                          }}
                        >
                          OR
                        </span>
                        <div className="h-px min-w-px flex-1 bg-[#2a2a2e]" />
                      </div>

                      <label className="flex w-full flex-col items-start gap-2">
                        <span className="text-[13px] leading-[1.1] text-white whitespace-nowrap">
                          Email
                        </span>
                        <input
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="steve@apple.com"
                          className={cn(
                            "w-full rounded-lg bg-[#222223] px-2 py-2.5 text-[13px] leading-[1.1] text-white outline-none",
                            "placeholder:text-[#71717a]",
                            EMAIL_FIELD_SHADOW,
                            EMAIL_FIELD_FOCUS_VISIBLE,
                          )}
                        />
                      </label>
                    </div>

                    {error ? (
                      <p className="text-[13px] text-red-400" role="alert">
                        {error}
                      </p>
                    ) : null}

                    <PrimaryButton type="submit" disabled={status === "sending"}>
                      {status === "sending"
                        ? "Sending…"
                        : mode === "signup"
                          ? "Sign up"
                          : "Login"}
                    </PrimaryButton>
                  </form>
                </div>
              )}
            </div>

            <div className="relative flex w-full items-center justify-center py-3">
              {isSent ? (
                <p
                  className="text-[14px] leading-5 tracking-[-0.084px] text-[#acacb4] whitespace-nowrap"
                  style={{
                    fontFeatureSettings: '"ss11" 1, "calt" 0, "liga" 0',
                  }}
                >
                  <span>Didn&apos;t receive it? </span>
                  {resendIn > 0 ? (
                    <span className="text-white">
                      Resend in {formatCountdown(resendIn)}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={resendMagicLink}
                      disabled={resending}
                      className="cursor-pointer text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resending ? "Sending…" : "Resend"}
                    </button>
                  )}
                </p>
              ) : (
                <p
                  className="text-[14px] leading-5 tracking-[-0.084px] whitespace-nowrap"
                  style={{
                    fontFeatureSettings: '"ss11" 1, "calt" 0, "liga" 0',
                  }}
                >
                  <span className="text-[#acacb4]">
                    {mode === "signup"
                      ? "Already have an account? "
                      : "Don't have an account? "}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setMode((m) => (m === "login" ? "signup" : "login"))
                    }
                    className="cursor-pointer font-normal text-white transition-opacity hover:opacity-80"
                  >
                    {mode === "signup" ? "Login" : "Sign up"}
                  </button>
                </p>
              )}
            </div>

            {isSent && error ? (
              <p className="px-4 pb-3 text-center text-[13px] text-red-400" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
