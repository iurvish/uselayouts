import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";
import "@/styles/dialkit.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LoginDialog } from "@/components/auth/login-dialog";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "useLayouts | Free animated React components",
    template: "%s - useLayouts",
  },
  description:
    "Free React components with animation, built with Framer Motion and Tailwind CSS. Preview them, copy the code, and add them to your site.",
  authors: [{ name: "Urvish Mali" }],
  creator: "useLayouts",
  metadataBase: new URL("https://uselayouts.com"),
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
    url: "https://uselayouts.com",
    title: "useLayouts | Free animated React components",
    description:
      "Free React components with animation, built with Framer Motion and Tailwind CSS. Preview them, copy the code, and add them to your site.",
    siteName: "useLayouts",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "useLayouts free animated React components",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "useLayouts | Free animated React components",
    description:
      "Free React components with animation, built with Framer Motion and Tailwind CSS. Preview them, copy the code, and add them to your site.",
    images: ["/og.jpg"],
    creator: "@0xUrvish",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} `} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex flex-col min-h-screen antialiased`}
        suppressHydrationWarning
      >
        <RootProvider search={{ enabled: false }}>
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
