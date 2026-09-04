import type { Metadata } from "next";

import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Explore every useLayouts component in a live masonry of motion previews, or switch to the infinite canvas.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
