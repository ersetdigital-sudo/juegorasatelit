import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    cpus: 1,
    workerThreads: true,
  },
  // Type checking is run separately with `npx tsc --noEmit` in this workspace.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
