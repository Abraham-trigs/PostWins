import type { NextConfig } from "next";

/**
 * The backend URL where our TS Express server lives.
 * In production, this should be your internal API URL.
 */
const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN || "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // 1. WebSocket Proxy (The "Upgrade" handler)
      // This allows browser ws://localhost:3000/ws to talk to backend :3001/ws
      {
        source: "/ws/:path*",
        destination: `${BACKEND_ORIGIN}/ws/:path*`,
      },
      // 2. HTTP API Proxy (For HttpOnly Cookie / Tenant ID support)
      // This maps browser /api/* calls to backend :3001/api/*
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
