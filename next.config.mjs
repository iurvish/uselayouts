import { createMDX } from "fumadocs-mdx/next";

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/docs/components/discrete-tab",
        destination: "/docs/components/discrete-tabs",
        permanent: true,
      },
      {
        source: "/docs/introduction",
        destination: "/docs/installation",
        permanent: true,
      },
      {
        source: "/docs",
        destination: "/docs/installation",
        permanent: false,
      },
      {
        source: "/gallery",
        destination: "/browse",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },

      {
        protocol: "https",
        hostname: "tapback.co",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      // Cloudflare R2 public CDN (from R2_PUBLIC_URL when set)
      ...(process.env.R2_PUBLIC_URL
        ? (() => {
            try {
              const { hostname, protocol } = new URL(process.env.R2_PUBLIC_URL);
              return [
                {
                  protocol: protocol.replace(":", "") || "https",
                  hostname,
                },
              ];
            } catch {
              return [];
            }
          })()
        : [
            {
              protocol: "https",
              hostname: "*.r2.dev",
            },
          ]),
    ],
  },
};

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

export default withMDX(config);
