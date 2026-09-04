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
    ],
  },
};

const withMDX = createMDX({
  // customise the config file path
  // configPath: "source.config.ts"
});

export default withMDX(config);
