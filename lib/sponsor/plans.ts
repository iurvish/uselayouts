export const SPONSOR_TIERS = ["gold", "silver", "bronze"] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];

export const SPONSOR_PLANS: Record<
  SponsorTier,
  { label: string; priceUsd: number; productId: string }
> = {
  gold: {
    label: "Gold",
    priceUsd: 150,
    productId: process.env.DODO_SPONSOR_GOLD_ID ?? "pdt_0Nnjy2g2VgpUxfuYkNeq3",
  },
  silver: {
    label: "Silver",
    priceUsd: 50,
    productId: process.env.DODO_SPONSOR_SILVER_ID ?? "pdt_0Nnjy2exGZEN9NOtv65Xv",
  },
  bronze: {
    label: "Bronze",
    priceUsd: 20,
    productId: process.env.DODO_SPONSOR_BRONZE_ID ?? "pdt_0Nnjy2bdky90lsOzCE9k4",
  },
};

export const SPONSOR_COLLECTION_ID =
  process.env.DODO_SPONSOR_COLLECTION_ID ?? "pdc_0Nnjy2hDmratUjGewmbUg";

export function isSponsorTier(value: string): value is SponsorTier {
  return (SPONSOR_TIERS as readonly string[]).includes(value);
}
