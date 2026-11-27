"use client";

/* eslint-disable @next/next/no-img-element -- provider avatars, remote and tiny. */

import * as React from "react";
import type { User } from "@supabase/supabase-js";

import { cn } from "@/lib/utils";

function userAvatarUrl(user: User) {
  const meta = user.user_metadata ?? {};
  if (typeof meta.avatar_url === "string" && meta.avatar_url)
    return meta.avatar_url;
  if (typeof meta.picture === "string" && meta.picture) return meta.picture;
  return null;
}

export function userDisplayName(user: User) {
  const meta = user.user_metadata ?? {};
  return (
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null
  );
}

function userInitials(user: User) {
  const name = userDisplayName(user) || user.email || "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserAvatar({
  user,
  size = 36,
  className,
}: {
  user: User;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = React.useState(false);
  const src = userAvatarUrl(user);

  React.useEffect(() => {
    setFailed(false);
  }, [user.id, src]);

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2e] text-[11px] font-medium text-white shadow-[0px_0px_0px_1px_rgba(255,255,255,0.08)]",
        className,
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden>{userInitials(user)}</span>
      )}
    </span>
  );
}
