"use client";

import * as React from "react";
import Link from "next/link";

import {
  AUTH_EMAIL_KINDS,
  buildAuthEmailHtml,
  type AuthEmailKind,
} from "@/lib/emails/auth-templates";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminEmailsPage() {
  const [kind, setKind] = React.useState<AuthEmailKind>("magic-link");
  const [origin, setOrigin] = React.useState("https://uselayouts.com");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { subject, html } = React.useMemo(
    () =>
      buildAuthEmailHtml(kind, {
        ctaUrl: `${origin}/auth/callback`,
        logoUrl: `${origin}/brand/logomark-email.png`,
      }),
    [kind, origin],
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link href="/admin" className="underline-offset-2 hover:underline">
              Admin
            </Link>
            {" / "}
            Emails
          </p>
          <h1 className="text-2xl font-medium tracking-tight">Auth emails</h1>
          <p className="text-muted-foreground mt-1 max-w-xl text-sm">
            Figma 400:9195 layout. Paste HTML from{" "}
            <code className="text-foreground">emails/auth/*.html</code> into
            Supabase → Authentication → Email Templates. Subject:{" "}
            <span className="text-foreground">{subject}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {AUTH_EMAIL_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              buttonVariants({
                variant: kind === k ? "default" : "outline",
                size: "sm",
              }),
            )}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#29292b] bg-[#1b1c1f]">
        <iframe
          title={`${kind} email preview`}
          srcDoc={html}
          className="h-[820px] w-full bg-[#1b1c1f]"
        />
      </div>
    </div>
  );
}
