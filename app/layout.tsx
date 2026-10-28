import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";
import "@/styles/dialkit.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginDialog } from "@/components/auth/login-dialog";
import { SiteJsonLd } from "@/components/seo/json-ld";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/seo/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * The brand name is unknown, so leading the title with it spent the highest
 * weighted position in the tag on a word nobody searches. The query modifiers
 * ("free", "animated", "react components", "ui library") lead instead.
 */
const DEFAULT_TITLE = "Free Animated React Components & UI Library";

export const metadata: Metadata = {
  title: {
    default: `${DEFAULT_TITLE} | useLayouts`,
    template: "%s | useLayouts",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "animated react components",
    "free react components",
    "react ui library",
    "animated ui library",
    "react component library",
    "framer motion components",
    "motion react components",
    "tailwind css components",
    "shadcn components",
    "copy paste react components",
  ],
  applicationName: "useLayouts",
  category: "technology",
  authors: [{ name: "Urvish Mali", url: "https://urvish.in" }],
  creator: "Urvish Mali",
  publisher: "useLayouts",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    title: `${DEFAULT_TITLE} | useLayouts`,
    description: SITE_DESCRIPTION,
    siteName: "useLayouts",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "useLayouts — free animated React components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DEFAULT_TITLE} | useLayouts`,
    description: SITE_DESCRIPTION,
    images: ["/og.jpg"],
    creator: "@0xUrvish",
    site: "@0xUrvish",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // useLayouts ships one theme. `dark` is rendered by the server so the
    // first paint is already correct — no inline script, no hydration flash,
    // and no OS `prefers-color-scheme` path that could resolve to light.
    <html lang="en" className={`dark ${inter.variable}`}>
      <head>
        <SiteJsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen antialiased`}
      >
        {/* theme.enabled: false drops next-themes entirely — it is what wrote
            `html.light` from localStorage/system, and it also registered a
            bare `d` keydown listener on window that toggled the theme. */}
        <RootProvider search={{ enabled: false }} theme={{ enabled: false }}>
          <AuthProvider>
            {children}
            <LoginDialog />
          </AuthProvider>
        </RootProvider>
        <Analytics />
        <GoogleAnalytics gaId="G-EBGR3GK00N" />
      </body>
    </html>
  );
}
