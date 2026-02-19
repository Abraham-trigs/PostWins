// apps/website/src/app/request-demo/requestDemoNarrate.ts
// Purpose: Defines role-based narrative framing for the Request Demo page.

import type { PrimaryRole } from "@/_lib/experience.types";

/* =========================================================
   Design reasoning
   =========================================================
   This file isolates Request Demo messaging from global copy.
   It keeps conversion framing contextual per stakeholder role
   while maintaining a simple mailto CTA.

   No business logic lives here — only narrative data.
*/

/* =========================================================
   Types
   ========================================================= */

export type RequestDemoRole = Exclude<PrimaryRole, null>;

export interface RequestDemoNarrative {
  hero: {
    title: string;
    subtitle: string;
  };
  cta: {
    headline: string;
    body: string;
    email: string;
  };
}

/* =========================================================
   Narrative Map
   ========================================================= */

const REQUEST_DEMO_NARRATIVE: Record<RequestDemoRole, RequestDemoNarrative> = {
  donor: {
    hero: {
      title: "See Funding Accountability in Action.",
      subtitle:
        "Experience how deterministic governance transforms financial allocation into defensible outcomes.",
    },
    cta: {
      headline: "Schedule a Funding Governance Walkthrough.",
      body: "Review how ledger-backed execution ensures transparency across funding flows.",
      email: "demo@postwins.io",
    },
  },

  regulator: {
    hero: {
      title: "Audit-Ready Governance Demonstration.",
      subtitle:
        "Observe how structured lifecycle enforcement reduces regulatory exposure.",
    },
    cta: {
      headline: "Request a Compliance Demonstration.",
      body: "Explore how architectural enforcement prevents unauthorized transitions.",
      email: "demo@postwins.io",
    },
  },

  operator: {
    hero: {
      title: "Operational Clarity at System Level.",
      subtitle:
        "See how deterministic routing improves speed without compromising integrity.",
    },
    cta: {
      headline: "Book an Execution Workflow Demo.",
      body: "Understand how structured transitions eliminate routing ambiguity.",
      email: "demo@postwins.io",
    },
  },

  technical: {
    hero: {
      title: "Inspect the Deterministic Stack.",
      subtitle:
        "Walk through service-layer enforcement and relational integrity boundaries.",
    },
    cta: {
      headline: "Review the Technical Architecture.",
      body: "Dive into transaction safety, ledger commits, and enforcement orchestration.",
      email: "demo@postwins.io",
    },
  },

  observer: {
    hero: {
      title: "Explore Institutional Governance Infrastructure.",
      subtitle:
        "See how architectural enforcement transforms trust into measurable outcomes.",
    },
    cta: {
      headline: "Schedule an Institutional Overview.",
      body: "Understand how structured systems reduce ambiguity across high-stakes environments.",
      email: "demo@postwins.io",
    },
  },
};

/* =========================================================
   Resolver
   ========================================================= */

export function getRequestDemoNarrative(
  role: PrimaryRole | null | undefined,
): RequestDemoNarrative {
  if (!role || !(role in REQUEST_DEMO_NARRATIVE)) {
    return REQUEST_DEMO_NARRATIVE.observer;
  }

  return REQUEST_DEMO_NARRATIVE[role as RequestDemoRole];
}

/* =========================================================
   Structure
   =========================================================
   - RequestDemoRole
   - RequestDemoNarrative
   - REQUEST_DEMO_NARRATIVE map
   - getRequestDemoNarrative resolver
*/

/* =========================================================
   Implementation guidance
   =========================================================
   In RequestDemoClient.tsx:

   import { getRequestDemoNarrative } from "../requestDemoNarrate";
   const narrative = getRequestDemoNarrative(role);
*/

/* =========================================================
   Scalability insight
   =========================================================
   This structure allows future migration to a validated form
   without changing narrative architecture.
*/
