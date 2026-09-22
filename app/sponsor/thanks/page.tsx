import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your sponsorship is processing.",
};

export default function SponsorThanksPage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-[28px] leading-tight tracking-[-0.04em]">
        Thank you
      </h1>
      <p className="text-[16px] leading-relaxed text-[#071A31]/70">
        Payment is processing. Your sponsorship shows on this page after the
        subscription is confirmed.
      </p>
      <Link
        href="/sponsor"
        className="text-[15px] font-medium underline underline-offset-4"
      >
        Back to sponsors
      </Link>
    </main>
  );
}
