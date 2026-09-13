import type { Metadata } from "next";
import { Tiers } from "@/proto/sponsor/tiers";

export const metadata: Metadata = {
  title: "Sponsor",
  description:
    "Keep uselayouts free for everyone. Sponsor the library and claim a placement on the sponsor wall.",
};

export default function SponsorPage() {
  return <Tiers />;
}
