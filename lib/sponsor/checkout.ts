"use client";

import type { SponsorTier } from "./plans";

export async function startSponsorCheckout(tier: SponsorTier) {
  const res = await fetch("/api/sponsor/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tier }),
  });
  const data: { checkoutUrl?: string; error?: string } = await res
    .json()
    .catch(() => ({}));
  if (!res.ok || !data.checkoutUrl) {
    throw new Error(data.error ?? "Could not start checkout");
  }
  window.location.assign(data.checkoutUrl);
}
