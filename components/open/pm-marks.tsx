/* eslint-disable @next/next/no-img-element -- brand marks are static SVGs. */

import type { PackageManager } from "@/lib/open/package-manager";

export function NpmMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#CB3837" />
      <path d="M5 6.5h14v11H12.1v-8.3H9.3v8.3H5V6.5Z" fill="#fff" />
    </svg>
  );
}

export function BunMark({ className }: { className?: string }) {
  return (
    <img src="/open/bun.svg" alt="" width={20} height={20} className={className} draggable={false} />
  );
}

export function YarnMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#2C8EBB" />
      <path
        d="M12.4 5.2c.7 1.2.4 2.2-.2 3.1.8.2 1.4.8 1.6 1.6.7-.2 1.3.1 1.8.7.6.7.5 1.6.1 2.2.6.7.7 1.7.2 2.5-.5.8-1.4 1.1-2.2 1l-.3 1.3c1.3.2 2.2 1.1 2.2 2.3H8.4c0-1.3 1-2.2 2.3-2.3l.2-1.1c-.5-.2-.9-.6-1.1-1.1-.7.1-1.4-.2-1.8-.8-.4-.6-.3-1.4.1-1.9-.5-.8-.4-1.8.2-2.5.5-.5 1.2-.7 1.8-.5.3-.8.9-1.4 1.7-1.6-.4-1 .2-2.3.8-2.9Z"
        fill="#fff"
      />
    </svg>
  );
}

export function PnpmMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <rect width="24" height="24" rx="4" fill="#242424" />
      <path d="M5 5h5v5H5V5Zm7 0h5v5h-5V5Zm7 0v5h-5V5h5ZM5 12h5v5H5v-5Zm7 0h5v5h-5v-5Z" fill="#F9AD00" />
      <path d="M19 12h-5v5h5v-5Z" fill="#F9AD00" opacity="0.45" />
    </svg>
  );
}

export function PackageManagerMark({
  manager,
  className,
}: {
  manager: PackageManager;
  className?: string;
}) {
  const marks = {
    npm: NpmMark,
    bun: BunMark,
    yarn: YarnMark,
    pnpm: PnpmMark,
  };
  const Icon = marks[manager];
  return <Icon className={className} />;
}
