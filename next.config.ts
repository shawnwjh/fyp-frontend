import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Don’t fail the build on ESLint errors (still runs locally/CI if you call `next lint`)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
