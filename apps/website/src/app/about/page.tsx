// apps/website/src/app/about/page.tsx
import type { Metadata } from "next";
import AboutSection from "./_components/AboutSection";

export const metadata: Metadata = {
  title: "About PostWins | Deterministic Governance Infrastructure",
  description:
    "PostWins is a deterministic execution platform designed for high-governance environments. We engineer correctness, auditability, and structured lifecycle modeling at scale.",
  keywords: [
    "governance platform",
    "deterministic systems",
    "auditability",
    "state machine architecture",
    "institutional infrastructure",
    "execution lifecycle modeling",
    "PostWins",
  ],
  alternates: {
    canonical: "https://postwins.io/about",
  },
  openGraph: {
    title: "About PostWins: Engineering Trust",
    description:
      "Deterministic execution infrastructure for institutions that cannot afford ambiguity. Governance engineered, not assumed.",
    url: "https://postwins.io/about",
    siteName: "PostWins",
    images: [{ url: "/og-about.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The PostWins Manifesto",
    description:
      "Building deterministic infrastructure for high-stakes environments.",
  },
  robots: {
    index: true,
    follow: true,
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
  },
};

/**
 * PRODUCTION-GRADE ABOUT PAGE
 * Optimized for SEO, Semantic Clarity, and Structural Trust
 */
export default function AboutPage() {
  // 1. ORGANIZATION SCHEMA (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "PostWins",
    url: "https://postwins.io",
    logo: "https://postwins.io",
    description:
      "Deterministic governance infrastructure for high-stakes institutional systems.",
    knowsAbout: [
      "Deterministic State Modeling",
      "Multi-tenant Isolation",
      "Immutable Audit Ledgers",
      "Lifecycle Reconciliation",
    ],
    slogan: "Trust is Architectural.",
  };

  return (
    <article className="bg-slate-950 min-h-screen">
      {/* 2. INJECT STRUCTURED DATA */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 3. SEMANTIC HEADER FOR SEARCH CRAWLERS */}
      <header className="sr-only">
        <h1>About PostWins Governance Engine</h1>
        <p>
          A manifesto on deterministic execution, systemic correctness, and
          architectural trust.
        </p>
      </header>

      {/* 4. DYNAMIC MANIFESTO CONTENT */}
      <AboutSection />

      {/* 5. SEO FOOTER CONTEXT */}
      <footer className="sr-only">
        <p>
          PostWins reduces systemic risk in humanitarian and grant systems
          through architectural enforcement.
        </p>
      </footer>
    </article>
  );
}
