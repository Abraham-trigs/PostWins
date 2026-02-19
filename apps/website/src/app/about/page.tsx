import type { Metadata } from "next";
import AboutSection from "@/_components/AboutSection";

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
  ],
  alternates: {
    canonical: "https://postwins.io/about",
  },
  openGraph: {
    title: "About PostWins",
    description:
      "Engineering deterministic execution infrastructure for institutions that cannot afford ambiguity.",
    url: "https://postwins.io/about",
    siteName: "PostWins",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About PostWins",
    description:
      "We build deterministic governance infrastructure for high-stakes environments.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return <AboutSection />;
}
