// apps/website/src/_lib/stakeholder-content.ts
import { PrimaryRole } from "./experience.types";

export interface StakeholderCopy {
  hero: {
    headline: string;
    subheadline: string;
    supporting: string;
  };
  problem: {
    title: string;
    body: string;
    risks: string[];
  };
  solution: {
    title: string;
    summary: string;
    transitions: string[];
  };
  architectureFocus: {
    layer: string;
    whyItMatters: string;
    enforcement: string;
  };
}

export const STAKEHOLDER_COPY: Record<
  Exclude<PrimaryRole, null>,
  StakeholderCopy
> = {
  donor: {
    hero: {
      headline: "Deterministic Infrastructure for Provable Impact",
      subheadline:
        "Deliver speed and provable outcomes through policy-enforced workflows.",
      supporting:
        "PostWins transforms grant management into a governed execution system where every outcome is defensible.",
    },
    problem: {
      title: "Ambiguity is the Hidden Cost of Impact",
      body: "Manual overrides and unverified disbursement histories create operational risk and funding disputes.",
      risks: [
        "Invisible approval chains",
        "Unverifiable disbursement histories",
        "Funding disputes",
      ],
    },
    solution: {
      title: "Governed Execution, Not Just Case Tracking",
      summary:
        "Impact is not assumed; it is system-enforced via audit-backed execution.",
      transitions: ["Policy-validated", "Ledger-recorded", "Explainable"],
    },
    architectureFocus: {
      layer: "Immutable Audit Ledger",
      whyItMatters:
        "The ledger provides forensic-level operational tracing for regulatory audit readiness.",
      enforcement:
        "Every critical lifecycle event is hashed and recorded immutably.",
    },
  },
  regulator: {
    hero: {
      headline: "Policy-Enforced Governance for High-Compliance",
      subheadline:
        "Multi-tenant isolation and audit-backed execution for regulatory peace of mind.",
      supporting:
        "Every decision is traceable, every transition is validated, and every outcome is defensible.",
    },
    problem: {
      title: "Regulatory Exposure in Opaque Systems",
      body: "Unstructured routing and undocumented overrides create systemic regulatory risk.",
      risks: [
        "Regulatory exposure",
        "Unauthorized transitions",
        "Data leakage",
      ],
    },
    solution: {
      title: "System-Enforced Compliance",
      summary:
        "Finite state machine modeling rejects invalid transitions at the protocol level.",
      transitions: ["Role-scoped", "Tenant-isolated", "Audit-backed"],
    },
    architectureFocus: {
      layer: "Explainable Decision Modeling",
      whyItMatters:
        "No black-box outcomes. Every state can be reconstructed with routing rationale.",
      enforcement:
        "Redaction policies ensure role-scoped visibility while maintaining integrity.",
    },
  },
  operator: {
    hero: {
      headline: "Structured Lifecycle Progression for Operational Velocity",
      subheadline:
        "Accelerate case routing and eliminate undocumented decisions.",
      supporting:
        "Built for organizations that cannot afford operational ambiguity in high-stakes environments.",
    },
    problem: {
      title: "Complexity is the Enemy of Velocity",
      body: "Most systems optimize for reporting; PostWins optimizes for correctness and speed.",
      risks: [
        "Manual routing lag",
        "Unstructured approval chains",
        "Operational risk",
      ],
    },
    solution: {
      title: "Deterministic Workflow Engine",
      summary:
        "Replace manual routing with structured, policy-validated lifecycle transitions.",
      transitions: [
        "Intake",
        "Classification",
        "Routing",
        "Verification",
        "Approval",
      ],
    },
    architectureFocus: {
      layer: "Reconciliation & Integrity Jobs",
      whyItMatters:
        "Integrity enforcement is continuous and proactive, not reactive.",
      enforcement:
        "Background jobs detect unauthorized transitions and restore system integrity.",
    },
  },
  technical: {
    hero: {
      headline: "Modular Governance Engine Infrastructure",
      subheadline:
        "Prisma + PostgreSQL relational constraints with deterministic service-layer orchestration.",
      supporting:
        "Security is enforced at the policy and transition level—not only at the endpoint.",
    },
    problem: {
      title: "Architectural Failure in Legacy Systems",
      body: "Data separation must be architectural, not conventional. Legacy systems lack strict isolation.",
      risks: [
        "Cross-tenant mutation",
        "Direct DB bypass",
        "Non-deterministic state",
      ],
    },
    solution: {
      title: "Hardened Relational Integrity Layer",
      summary:
        "Deterministic infrastructure with multi-role operational institutional support.",
      transitions: [
        "Schema-level fk-constraints",
        "Transaction boundaries",
        "Tenant partitioning",
      ],
    },
    architectureFocus: {
      layer: "Service Layer Orchestration",
      whyItMatters:
        "All state mutations pass through deterministic validation pipelines.",
      enforcement:
        "Service-layer policy enforcement prevents direct database mutation bypass.",
    },
  },
  observer: {
    hero: {
      headline: "Deterministic Infrastructure for Humanitarian Impact",
      subheadline:
        "Transforming case management into a governed execution system.",
      supporting:
        "Built for organizations operating in high-governance environments where trust is architectural.",
    },
    problem: {
      title: "Ambiguity Erodes Trust",
      body: "When humanitarian aid is involved, every outcome must be defensible and traceable.",
      risks: [
        "Lack of traceability",
        "Operational ambiguity",
        "Audit failures",
      ],
    },
    solution: {
      title: "System-Enforced Impact",
      summary:
        "Each state transition is policy-validated, role-scoped, and ledger-recorded.",
      transitions: ["Traceable", "Validated", "Defensible"],
    },
    architectureFocus: {
      layer: "Deterministic Execution",
      whyItMatters:
        "Governance is engineered, not assumed. PostWins reduces systemic risk.",
      enforcement: "Impact is measurable because it is structural.",
    },
  },
};
