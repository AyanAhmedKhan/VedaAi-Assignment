import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  transpilePackages: ["@react-pdf/renderer"],
};

export default nextConfig;
