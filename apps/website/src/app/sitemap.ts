// apps/website/src/app/sitemap.ts
import { MetadataRoute } from "next";

/**
 * DETERMINISTIC SITEMAP GENERATOR
 * Prioritizes high-governance content for search engine crawlers.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://postwins.io";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1, // Main landing page
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9, // Core manifesto
    },
    {
      url: `${baseUrl}/architecture`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9, // Technical specs
    },
    {
      url: `${baseUrl}/security`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8, // Compliance details
    },
    // Dynamically added stakeholder paths (SEO Landing Pages)
    {
      url: `${baseUrl}/experience/donor`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/experience/regulator`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
