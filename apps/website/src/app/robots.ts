// apps/website/src/app/robots.ts
import { MetadataRoute } from "next";

/**
 * DETERMINISTIC CRAWL BUDGET MANAGEMENT
 * Protects governance-sensitive routes and optimizes SEO indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://postwins.io";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/architecture",
          "/security",
          "/impact",
          "/experience/donor",
          "/experience/regulator",
        ],
        disallow: [
          "/api/", // Internal Telemetry/Governance Endpoints
          "/_next/", // Next.js System Files
          "/admin/", // Future Admin Dashboards
          "/auth/", // Authentication Flows
          "/experience/technical", // Scoped technical docs
          "/*?*", // Prevent crawling URL parameters (AB test noise)
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
