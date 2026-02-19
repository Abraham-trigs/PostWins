import type { Metadata } from "next";
import ArchitectureClient from "./_components/ArchitectureClient";

export const metadata: Metadata = {
  title: "Architecture | Deterministic Execution Stack | PostWins",
  description:
    "Explore the PostWins execution stack. Deterministic state transitions, immutable ledger architecture, multi-tenant isolation, and policy-enforced governance at scale.",
  keywords: [
    "deterministic architecture",
    "governance engine",
    "state machine modeling",
    "immutable ledger system",
    "multi-tenant SaaS isolation",
    "policy enforcement architecture",
    "institutional infrastructure",
  ],
  alternates: {
    canonical: "https://postwins.io/architecture",
  },
  openGraph: {
    title: "PostWins Architecture",
    description:
      "A modular governance engine enforcing provable lifecycle progression in high-stakes systems.",
    url: "https://postwins.io/architecture",
    siteName: "PostWins",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostWins Architecture",
    description:
      "Deterministic modeling. Immutable ledger. Enforced governance.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ArchitecturePage() {
  return <ArchitectureClient />;
}
