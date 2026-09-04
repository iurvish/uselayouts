import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { isDev } from "@/lib/admin/guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!isDev()) notFound();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4">
          <Link href="/admin" className="font-semibold tracking-tight">
            uselayouts admin
          </Link>
          <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
            development only
          </span>
          <div className="flex-1" />
          <Link
            href="/admin/new"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            New component
          </Link>
          <Link
            href="/docs"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Docs
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-4 py-8">{children}</main>
    </div>
  );
}
