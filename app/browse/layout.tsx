import type { Metadata } from "next";

import { canonical } from "@/lib/seo/site";

import "@/styles/browse.css";

const title = "Browse Animated React Components Live | useLayouts";
const description =
  "Preview every free animated React component in the useLayouts library. Hover a card to see it move, click to copy the code. React, Motion and Tailwind CSS, MIT licensed.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  ...canonical("/browse"),
  openGraph: { title, description, url: "/browse" },
  twitter: { title, description },
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
