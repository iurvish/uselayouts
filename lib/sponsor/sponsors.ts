import type { SponsorLogoId } from "@/components/sponsor/sponsor-logos";
import { withUtm } from "@/lib/utm";
import { SPONSOR_TIERS, type SponsorTier } from "./plans";

/** Tags every outbound sponsor click so the sponsor can attribute the traffic
 *  back to us in their own analytics. */
export function withSponsorUtm(url: string, tier: SponsorTier): string {
  return withUtm(url, { medium: "sponsor", campaign: `${tier}-sponsor` });
}

export type SponsorEntry = {
  name: string;
  /** Fallback mark for sponsors who have not sent artwork yet. */
  abbr: string;
  /** Brand colour: the logo's fill, or the abbr tile's background. */
  color: string;
  href: string;
  since?: string;
  logo?: SponsorLogoId;
};

/** Three slots per tier, in placement order. `null` is an open slot and
 *  renders the checkout CTA. The sponsor wall and the /browse dock both read
 *  this, so a sponsor lands everywhere from one edit. */
export const TIER_SPONSORS: Record<SponsorTier, (SponsorEntry | null)[]> = {
  gold: [
    {
      name: "dotstore",
      abbr: "ds",
      color: "#14141A",
      href: withSponsorUtm("https://www.dotstore.io/", "gold"),
      since: "Oct 2026",
      logo: "dotstore",
    },
    {
      name: "The Internet Designs",
      abbr: "id",
      color: "#1F2123",
      href: withSponsorUtm("https://theinternetdesigns.com/", "gold"),
      since: "Oct 2026",
      logo: "internet-designs",
    },
    null,
  ],
  silver: [null, null, null],
  bronze: [null, null, null],
};

/** Filled slots for a tier, placement order preserved. */
export function sponsorsForTier(tier: SponsorTier): SponsorEntry[] {
  return TIER_SPONSORS[tier].filter((s): s is SponsorEntry => s !== null);
}

export function hasSponsors(tier: SponsorTier): boolean {
  return TIER_SPONSORS[tier].some((s) => s !== null);
}

export const ALL_SPONSORS: readonly {
  tier: SponsorTier;
  sponsor: SponsorEntry;
}[] = SPONSOR_TIERS.flatMap((tier) =>
  sponsorsForTier(tier).map((sponsor) => ({ tier, sponsor })),
);
