// packages/core/src/index.ts
// Purpose: Public contract surface for frontend/backend boundary

/**
 * Design reasoning
 * ------------------------------------------------------------
 * Core is the canonical HTTP + shared contract boundary.
 * It must NEVER manually redefine Prisma enums.
 * All enums are generated from schema.prisma.
 * Frontend depends only on this package.
 */

/* ============================================================
   Generated Prisma Enums (Single Source of Truth)
   ============================================================ */

export * from "./generated/enums";

/* ============================================================
   Shared Primitive Types
   ============================================================ */

export type UUID = string;
export * from "./contracts/cases/case-list";

/* ============================================================
   Re-export Contracts (Add as They Are Created)
   ============================================================ */

// export * from "./contracts/cases/case-list";
// export * from "./contracts/...";

/* ============================================================
   Structure
   ------------------------------------------------------------
   - Generated enums
   - Primitives
   - HTTP contracts
   ============================================================ */

/* ============================================================
   Implementation guidance
   ------------------------------------------------------------
   - Never define enums manually here.
   - Always regenerate after Prisma enum changes.
   - All HTTP contracts must live in /contracts.
   ============================================================ */

/* ============================================================
   Scalability insight
   ------------------------------------------------------------
   Core should remain persistence-agnostic.
   It mirrors schema, but never imports Prisma directly.
   ============================================================ */
