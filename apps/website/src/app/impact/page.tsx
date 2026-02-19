// apps/website/src/app/impact/page.tsx
import type { Metadata } from "next";
import ImpactSection from "@/_components/ImpactSection"; // Matches our final naming convention

export const metadata: Metadata = {
  title: "Impact | Provable Outcomes & Speed | PostWins",
  description:
    "PostWins enables organizations to reduce operational ambiguity, accelerate case routing, and provide defensible, audit-backed reporting to donors and regulators.",
  keywords: [
    "provable impact",
    "lifecycle reconstruction",
    "institutional reporting",
    "governance metrics",
    "operational velocity",
    "defensible outcomes",
  ],
  alternates: {
    canonical: "https://postwins.io/impact",
  },
  openGraph: {
    title: "PostWins Impact: Speed & Provable Outcomes",
    description:
      "Impact becomes measurable. Governance becomes structural. Trust becomes architectural.",
    url: "https://postwins.io/impact",
    siteName: "PostWins",
    images: [{ url: "/og-impact.png", width: 1200, height: 630 }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * PRODUCTION-GRADE IMPACT PAGE
 * Injects Dataset and Organization JSON-LD to rank for "Impact Metrics" queries.
 */
export default function ImpactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "PostWins Impact Framework",
    description:
      "Deterministic metrics for operational velocity and governance compliance.",
    creator: {
      "@type": "Organization",
      name: "PostWins",
    },
    variableMeasured: [
      "Operational Ambiguity Reduction",
      "Case Routing Velocity",
      "Policy Compliance Consistency",
      "Lifecycle State Reconstruction Precision",
    ],
  };

  return (
    <article className="bg-slate-950 min-h-screen">
      {/* 1. INJECT STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 2. SEMANTIC SEO HOOK */}
      <header className="sr-only">
        <h1>Provable Impact and Governance Metrics for High-Stakes Systems</h1>
        <p>
          Reconstruct lifecycle states with precision and eliminate undocumented
          decisions.
        </p>
      </header>

      {/* 3. DYNAMIC IMPACT CONTENT (Context-Aware) */}
      <ImpactSection />

      {/* 4. FINAL MANIFESTO ANCHOR */}
      <footer className="pb-24 px-6 text-center">
        <div className="max-w-2xl mx-auto py-12 border-t border-slate-900">
          <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">
            Governance becomes structural. Trust becomes architectural.
          </p>
        </div>
      </footer>
    </article>
  );
}
