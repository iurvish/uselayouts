import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import Link from "next/link";
import { isAdminUser, isDev } from "@/lib/admin/guard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const dev = isDev();
  // The component tools write to the filesystem, so they stay local-only. The
  // feedback inbox is the one thing worth reaching in production.
  if (!dev && !(await isAdminUser())) notFound();

  return (
    /* Opaque light shell: .light resets tokens; avoid /opacity so dark body can't bleed through. */
    <div className="light min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link
            href="/admin"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            uselayouts
            <span className="ml-1.5 font-normal text-muted-foreground">
              admin
            </span>
          </Link>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {dev ? "local · development" : "production"}
          </Badge>
          <div className="flex-1" />
          <nav className="flex items-center gap-1">
            {dev ? (
              <Link
                href="/admin/copies"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Copies
              </Link>
            ) : null}
            {dev ? (
              <Link
                href="/admin/landing"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Landing
              </Link>
            ) : null}
            <Link
              href="/admin/feedback"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Feedback
            </Link>
            {dev ? (
              <Link
                href="/admin/new"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                New
              </Link>
            ) : null}
            <Link
              href="/browse"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Browse
            </Link>
            <Link
              href="/docs"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Docs
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
