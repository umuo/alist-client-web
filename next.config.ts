import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // 禁用 ESLint 检查
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
