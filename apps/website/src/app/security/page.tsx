// apps/website/src/app/security/page.tsx
import type { Metadata } from "next";
import SecuritySection from "./_components/SecuritySection";
import { Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Model | Deterministic Governance | PostWins",
  description:
    "PostWins enforces security at the architectural level: Tenant isolation, role-based capability derivation, and idempotent mutation protection.",
  keywords: [
    "deterministic security",
    "governance engine",
    "tenant isolation",
    "RBAC",
    "audit ledger",
  ],
  alternates: { canonical: "https://postwins.io" },
};

export default function SecurityPage() {
  // 1. DATA SCHEMA FOR SEARCH ENGINES
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PostWins Governance Engine",
    operatingSystem: "Web/Cloud",
    applicationCategory: "BusinessApplication",
    featureList: [
      "Deterministic RBAC",
      "Multi-tenant Isolation",
      "Idempotent Mutation Protection",
      "Immutable Audit Ledger",
    ],
    offers: {
      "@type": "Offer",
      availability: "https://schema.org",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "PostWins",
    },
  };

  return (
    <article className="bg-slate-950 min-h-screen">
      {/* 2. INJECT JSON-LD (HIDDEN) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sr-only">
        <h1>PostWins Security Infrastructure</h1>
        <p>Comprehensive overview of our deterministic security model.</p>
      </header>

      <SecuritySection />

      <section className="pb-32 px-6">
        <div className="max-w-4xl mx-auto p-12 rounded-[3rem] border border-slate-900 bg-black/40 text-center space-y-6">
          <div className="flex justify-center text-blue-500 mb-4">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Security as an{" "}
            <span className="text-blue-600">Architectural Constant.</span>
          </h2>
          <p className="text-slate-500 leading-relaxed max-w-2xl mx-auto">
            We do not rely on convention. Data separation is enforced at the
            schema, middleware, and lifecycle reconciliation levels to eliminate
            systemic risk.
          </p>
          <div className="pt-8 flex flex-wrap justify-center gap-4 text-[10px] font-mono text-slate-700 uppercase tracking-widest">
            <span>ISO_READY</span>
            <span className="text-blue-900">•</span>
            <span>GDPR_COMPLIANT</span>
            <span className="text-blue-900">•</span>
            <span>DETERMINISTIC_ENFORCEMENT</span>
          </div>
        </div>
      </section>
    </article>
  );
}
