// apps/website/src/app/architecture/page.tsx
import type { Metadata } from "next";
import ArchitectureClient from "./_components/ArchitectureClient";

export const metadata: Metadata = {
  title: "Architecture | Deterministic Execution Stack | PostWins",
  description:
    "Explore the PostWins execution stack: Deterministic state transitions, immutable ledger architecture, and policy-enforced governance for high-stakes institutional systems.",
  keywords: [
    "deterministic architecture",
    "governance engine",
    "state machine modeling",
    "immutable ledger system",
    "multi-tenant SaaS isolation",
    "policy enforcement architecture",
    "PostWins stack",
  ],
  alternates: {
    canonical: "https://postwins.io/architecture",
  },
  openGraph: {
    title: "PostWins Architecture: The Deterministic Stack",
    description:
      "Modular governance engine enforcing provable lifecycle progression through architectural constraints.",
    url: "https://postwins.io/architecture",
    siteName: "PostWins",
    images: [{ url: "/og-architecture.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostWins Technical Architecture",
    description:
      "Deterministic modeling. Immutable ledger. Enforced governance.",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
};

/**
 * PRODUCTION-GRADE ARCHITECTURE PAGE
 * Injects Technical-Specific JSON-LD for Search Engine Optimization
 */
export default function ArchitecturePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "PostWins Deterministic Execution Architecture",
    description:
      "A deep-dive into the 6-layer governance engine and state-machine modeling of PostWins.",
    author: {
      "@type": "Organization",
      name: "PostWins Engineering",
    },
    keywords: "Deterministic State, Immutable Ledger, Multi-tenant Isolation",
    articleSection: "System Architecture",
    about: {
      "@type": "SoftwareSourceCode",
      programmingLanguage: "TypeScript",
      runtimePlatform: "Node.js",
    },
  };

  return (
    <article className="bg-slate-950 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Semantic SEO Hook */}
      <header className="sr-only">
        <h1>PostWins Technical Stack and Governance Infrastructure</h1>
      </header>

      <ArchitectureClient />
    </article>
  );
}
