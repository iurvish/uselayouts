import type { Metadata } from "next";

import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Browse every useLayouts component in a masonry of preview frames, or switch to the infinite canvas.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
