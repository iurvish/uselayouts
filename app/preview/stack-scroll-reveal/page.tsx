import type { Metadata } from "next";

import StackScrollReveal from "@/registry/default/example/stack-scroll-reveal";

export const metadata: Metadata = {
  title: "Stack Scroll Reveal",
  robots: { index: false, follow: false },
};

export default function StackScrollRevealPreviewPage() {
  return <StackScrollReveal />;
}
