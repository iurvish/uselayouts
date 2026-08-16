import type { Metadata } from "next";

import "@/styles/browse.css";

export const metadata: Metadata = {
  title: "Browse",
  description:
    "Explore every useLayouts component on an infinite canvas of live motion previews, or switch to a grid.",
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
