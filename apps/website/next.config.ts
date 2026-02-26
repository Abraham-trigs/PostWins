import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // This is the standard way to handle workspace packages in Next.js
  transpilePackages: ["@posta/ui"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
