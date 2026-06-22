import type { NextConfig } from "next";

import path from "path";

// @ts-ignore
const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd(), '..'),
  // @ts-ignore
  turbopack: {
    root: path.resolve(process.cwd(), '..'),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
  },
};

export default nextConfig;
