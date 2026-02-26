import type { NextConfig } from "next";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:3001";

const nextConfig: NextConfig = {
  // Fixes Turbopack alias resolution in monorepos
  experimental: {
    turbo: {
      resolveAlias: {
        "@/*": ["./src/*"],
      },
    },
  },
  async rewrites() {
    return [
      // WebSocket Proxy (Note: This works locally, but Vercel requires
      // a direct connection to the backend URL for WebSockets in production)
      {
        source: "/ws/:path*",
        destination: `${BACKEND_ORIGIN}/ws/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
