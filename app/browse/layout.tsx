import type { Metadata } from "next";

import "@/styles/browse.css";

const title = "Browse animated React components - useLayouts";
const description =
  "Look through free animated React components. Hover a card to see it move, then click to copy the code.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
