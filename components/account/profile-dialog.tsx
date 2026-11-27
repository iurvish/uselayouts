"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, Copy, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { DocsSteps } from "@/components/open/docs-steps";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type KeyMeta = { prefix: string; createdAt: string; lastUsedAt: string | null };

type Client = "claude" | "cursor" | "vscode";

const CLIENTS: { id: Client; label: string }[] = [
  { id: "claude", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "vscode", label: "VS Code" },
];

/** Stands in for the secret once it has been shown, so the snippet keeps its shape. */
const KEY_PLACEHOLDER = "YOUR_KEY";

/** The feedback and login dialogs' field shadow stack, so wells read the same. */
const FIELD_SHADOW =
  "shadow-[0px_-1px_0px_0px_rgba(255,255,255,0.06),0px_0px_0px_1px_rgba(255,255,255,0.06),0px_0px_0px_1px_#27272a,0px_0px_1px_1.5px_rgba(0,0,0,0.24),0px_2px_2px_0px_rgba(0,0,0,0.24)]";

const WELL = cn("rounded-xl bg-[hsl(240_2%_7%)]", FIELD_SHADOW);

const STEP_TITLE = "text-[14px] leading-6 font-medium tracking-[-0.15px] text-white";

function snippet(client: Client, url: string, key: string) {
  const auth = `Bearer ${key}`;
  if (client === "claude") {
    return `claude mcp add --transport http \\\n  uselayouts ${url} \\\n  --header "Authorization: ${auth}"`;
  }
  const server = { url, headers: { Authorization: auth } };
  return client === "cursor"
    ? JSON.stringify({ mcpServers: { uselayouts: server } }, null, 2)
    : JSON.stringify({ servers: { uselayouts: { type: "http", ...server } } }, null, 2);
}

/**
 * The full key in the snippet pushes every line past the card, and it already
 * sits in the field above. Show its head; the copy button still copies it whole.
 */
function maskKey(key: string) {
  return key === KEY_PLACEHOLDER ? key : `${key.slice(0, 8)}…`;
}

/** Swaps to a tick for a beat after copying, then settles back. */
function CopyButton({
  value,
  label,
  disabled,
}: {
  value: string;
  label: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1400);
  }

  const icon =
    "absolute inset-0 m-auto size-3.5 transition-[opacity,scale,filter] duration-200 ease-out motion-reduce:transition-none";

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      aria-label={copied ? "Copied" : label}
      className={cn(
        "relative flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[#8e8e93] transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96]",
        // 28px box, 40px target.
        "before:absolute before:-inset-1.5",
        "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/6 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
        "disabled:pointer-events-none disabled:opacity-40",
      )}
    >
      <Copy
        aria-hidden
        className={cn(icon, copied ? "scale-50 opacity-0 blur-[2px]" : "scale-100 opacity-100")}
        strokeWidth={1.6}
      />
      <Check
        aria-hidden
        className={cn(
          icon,
          "text-[hsl(152_55%_62%)]",
          copied ? "scale-100 opacity-100" : "scale-50 opacity-0 blur-[2px]",
        )}
        strokeWidth={2}
      />
    </button>
  );
}

function useApiKey(open: boolean) {
  const [key, setKey] = React.useState<KeyMeta | null>(null);
  const [secret, setSecret] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"loading" | "idle" | "working">("loading");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      // The plaintext lives only as long as the dialog that revealed it.
      setSecret(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setStatus("loading");
    fetch("/api/keys")
      .then((res) => res.json())
      .then((json: { key?: KeyMeta | null }) => !cancelled && setKey(json.key ?? null))
      // A failed read looks like "no key yet"; generating surfaces the real error.
      .catch(() => {})
      .finally(() => !cancelled && setStatus("idle"));
    return () => {
      cancelled = true;
    };
  }, [open]);

  async function generate() {
    setStatus("working");
    setError(null);
    try {
      const res = await fetch("/api/keys", { method: "POST" });
      const json = (await res.json()) as { key?: KeyMeta; secret?: string; error?: string };
      if (!res.ok) throw new Error(json.error);
      setKey(json.key ?? null);
      setSecret(json.secret ?? null);
    } catch (err) {
      setError(
        process.env.NODE_ENV === "development" && err instanceof Error && err.message
          ? err.message
          : "Could not create a key. Try again.",
      );
    } finally {
      setStatus("idle");
    }
  }

  return { key, secret, status, error, generate };
}

/** Step 1: the one thing on this dialog that has state. */
function KeyStep({
  apiKey,
  secret,
  status,
  error,
  onGenerate,
}: {
  apiKey: KeyMeta | null;
  secret: string | null;
  status: "loading" | "idle" | "working";
  error: string | null;
  onGenerate: () => void;
}) {
  const working = status === "working";

  let body: React.ReactNode;
  if (status === "loading") {
    body = <div className="h-11 animate-pulse rounded-xl bg-white/4" />;
  } else if (!apiKey) {
    body = (
      <button
        type="button"
        disabled={working}
        onClick={onGenerate}
        className={cn(
          "relative flex h-9 w-fit cursor-pointer items-center justify-center overflow-clip rounded-[10px] px-3.5",
          "bg-[hsl(230_77%_55%)] text-[14px] font-medium tracking-[-0.084px] text-white",
          "shadow-[0px_2px_2px_-1px_rgba(0,0,0,0.16),0px_4px_4px_-2px_rgba(0,0,0,0.24),0px_0px_0px_1px_rgba(0,0,0,0.12)]",
          "transition-[scale,background-color,opacity] duration-150 ease-out active:scale-[0.96]",
          "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-[hsl(230_77%_58%)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
        )}
      >
        Generate key
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_0px_0.2px_rgba(255,255,255,0.16)]"
        />
      </button>
    );
  } else {
    body = (
      <div className={cn("flex h-11 items-center gap-2 pr-1.5 pl-3.5", WELL)}>
        <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white">
          {secret ?? (
            <>
              {apiKey.prefix}
              <span className="text-[#52525b]">••••••••</span>
            </>
          )}
        </code>
        {secret ? (
          <CopyButton value={secret} label="Copy API key" />
        ) : (
          <button
            type="button"
            disabled={working}
            aria-busy={working}
            onClick={onGenerate}
            className={cn(
              "relative shrink-0 cursor-pointer rounded-[8px] px-2.5 py-1.5 text-[13px] text-[#8e8e93] transition-[background-color,color,scale,opacity] duration-150 ease-out active:scale-[0.96]",
              "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/6 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            Regenerate
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className={STEP_TITLE}>Create an API key</p>
      {body}
      {error ? (
        <p role="alert" className="text-[12px] leading-4 text-red-400">
          {error}
        </p>
      ) : secret ? (
        <p className="text-[12px] leading-4 text-[hsl(38_80%_66%)]">
          Copy it now. You won&rsquo;t see it again.
        </p>
      ) : null}
    </div>
  );
}

export function ProfileDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuth();
  const { key, secret, status, error, generate } = useApiKey(open);
  const [client, setClient] = React.useState<Client>("claude");
  const [origin, setOrigin] = React.useState("https://uselayouts.com");

  React.useEffect(() => {
    // Preview deploys and localhost point their snippet at themselves.
    setOrigin(window.location.origin);
  }, []);

  if (!user) return null;

  const url = `${origin}/api/mcp`;
  const setup = snippet(client, url, secret ?? KEY_PLACEHOLDER);
  const setupShown = snippet(client, url, maskKey(secret ?? KEY_PLACEHOLDER));
  // Until a key exists the snippet is a preview of what is coming, not something to copy.
  const setupReady = Boolean(key);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/10 supports-backdrop-filter:backdrop-blur-[3.35px]" />
        <DialogPrimitive.Popup
          data-slot="dialog-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-999999 w-[min(calc(100%-2rem),440px)] -translate-x-1/2 -translate-y-1/2 outline-none",
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 duration-100",
          )}
        >
          <div className="relative flex w-full flex-col gap-6 overflow-clip rounded-[20px] border border-[#29292b] bg-[#131316] p-6 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_1px_3px_0px_rgba(0,0,0,0.4)]">
            <div className="flex items-start gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <DialogTitle className="text-[18px] leading-6 font-medium tracking-[-0.3px] text-white">
                  Connect your editor
                </DialogTitle>
                <DialogDescription className="text-[14px] leading-5 text-[#8e8e93]">
                  Ask Claude Code, Cursor, or VS Code for a component and it installs it for you.
                </DialogDescription>
              </div>
              <DialogPrimitive.Close
                aria-label="Close"
                className={cn(
                  "relative -mt-1 -mr-2 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[8px] text-[#71717a] transition-[background-color,color,scale] duration-150 ease-out active:scale-[0.96]",
                  "before:absolute before:-inset-1",
                  "[@media(hover:hover)_and_(pointer:fine)]:hover:bg-white/6 [@media(hover:hover)_and_(pointer:fine)]:hover:text-white",
                )}
              >
                <X aria-hidden className="size-4" strokeWidth={1.6} />
              </DialogPrimitive.Close>
            </div>

            <DocsSteps>
              <KeyStep
                apiKey={key}
                secret={secret}
                status={status}
                error={error}
                onGenerate={() => void generate()}
              />

              <div className="flex flex-col gap-2">
                <p className={STEP_TITLE}>Add it to your editor</p>
                <div
                  className={cn(
                    "overflow-hidden transition-opacity duration-200 ease-out",
                    WELL,
                    !setupReady && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between border-b border-white/6 py-1 pr-1.5 pl-1.5">
                    <div role="tablist" aria-label="Editor" className="flex">
                      {CLIENTS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          role="tab"
                          aria-selected={client === option.id}
                          onClick={() => setClient(option.id)}
                          className={cn(
                            "relative cursor-pointer rounded-[7px] px-2 py-1 text-[12px] transition-colors duration-150 ease-out",
                            "before:absolute before:inset-x-0 before:-inset-y-2",
                            client === option.id
                              ? "text-white"
                              : "text-[#71717a] [@media(hover:hover)_and_(pointer:fine)]:hover:text-[#a1a1aa]",
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <CopyButton value={setup} label="Copy setup" disabled={!setupReady} />
                  </div>
                  <pre
                    className={cn(
                      "overflow-x-auto px-3.5 py-3 font-mono text-[12px] leading-[18px] whitespace-pre text-[#a1a1aa]",
                      // A long localhost or preview URL can still overflow; keep its scroller quiet.
                      "[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10",
                    )}
                  >
                    {setupShown}
                  </pre>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <p className={STEP_TITLE}>Ask for a component</p>
                <p className="text-[14px] leading-5 text-[#8e8e93]">
                  &ldquo;Add the discrete-tabs component from useLayouts.&rdquo;
                </p>
              </div>
            </DocsSteps>
          </div>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
