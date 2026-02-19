// apps/website/src/app/request-demo/page.tsx
import type { Metadata } from "next";
import RequestDemoSection from "./_components/RequestDemoSection";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Request Architecture Review | PostWins",
  description:
    "Request a deterministic walkthrough of the PostWins governance engine. Secure, policy-enforced infrastructure for high-stakes institutional systems.",
  keywords: [
    "PostWins demo",
    "governance engine walkthrough",
    "institutional impact software",
    "architecture review",
    "deterministic infrastructure demo",
  ],
  alternates: {
    canonical: "https://postwins.io/request-demo",
  },
  openGraph: {
    title: "Request a PostWins Architecture Review",
    description:
      "See how deterministic infrastructure eliminates operational ambiguity.",
    url: "https://postwins.io/request-demo",
    siteName: "PostWins",
    images: [{ url: "/og-demo.png", width: 1200, height: 630 }],
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * PRODUCTION-GRADE REQUEST DEMO PAGE
 * Injects ContactPoint JSON-LD to qualify for Google "Action" snippets.
 */
export default function RequestDemoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "PostWins Architecture Review Request",
    description:
      "Intake portal for institutional stakeholders requesting system walkthroughs.",
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "governance@postwins.io",
      availableLanguage: ["en"],
    },
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
        <h1>Request a Deterministic Walkthrough of PostWins Infrastructure</h1>
        <p>
          Schedule a deep-dive into our 6-layer governance engine and lifecycle
          enforcement.
        </p>
      </header>

      {/* 3. THE INTAKE COMPONENT */}
      <div className="relative pt-20">
        <RequestDemoSection />
      </div>

      {/* 4. SECURITY REASSURANCE FOOTER */}
      <footer className="pb-20 px-6">
        <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
          <ShieldCheck className="h-3 w-3" />
          Secure_Intake_Protocol_Active
        </div>
      </footer>
    </article>
  );
}
