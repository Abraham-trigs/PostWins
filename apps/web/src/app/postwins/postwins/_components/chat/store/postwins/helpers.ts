// src/app/xotic/postwins/_components/chat/store/postwins/helpers.ts
// Purpose: Pure utility helpers for PostWin UI store. No state, no side effects beyond deterministic ID generation.

import type { DeliveryItem, EvidenceFile, EvidenceKind } from "../types";

/* =========================================================
   Design reasoning
   ---------------------------------------------------------
   This file isolates all pure helpers used across slices.
   Keeping these functions separate prevents duplication,
   improves testability, and ensures slices remain focused
   purely on state transitions.
   These utilities are deterministic and contain no store
   logic, ensuring no circular slice coupling.
========================================================= */

/* =========================================================
   Structure
   ---------------------------------------------------------
   - nowIso(): timestamp helper
   - uid(): lightweight deterministic ID
   - evidenceId(): dedupe key builder
   - makeTxId(): transaction ID generator
   - makeInitialDeliveryDraft(): builder
   - normalizeDeliveryItems(): safe normalization
========================================================= */

/* =========================================================
   Implementation
========================================================= */

/**
 * Returns ISO timestamp.
 * Centralized for consistent formatting.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Lightweight client-safe ID generator.
 * Used for message IDs.
 */
export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Deterministic evidence dedupe key.
 * Prevents duplicate file attachments.
 */
export function evidenceId(kind: EvidenceKind, file: File): string {
  return `${kind}:${file.name}:${file.size}:${file.lastModified}`;
}

/**
 * Transaction ID generator.
 * Uses crypto when available.
 */
export function makeTxId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Initial delivery draft builder.
 * Isolated to avoid duplication in reset logic.
 */
export function makeInitialDeliveryDraft() {
  return {
    location: "",
    items: [{ name: "", qty: 1 }],
    notes: "",
  };
}

/**
 * Normalizes delivery items:
 * - Trims name
 * - Coerces qty to number
 * - Filters invalid entries
 */
export function normalizeDeliveryItems(
  items: DeliveryItem[],
): Array<{ name: string; qty: number }> {
  return items
    .map((i) => ({
      name: i.name.trim(),
      qty: Number(i.qty),
    }))
    .filter((i) => i.name.length > 0 && Number.isFinite(i.qty) && i.qty > 0);
}

/* =========================================================
   Example usage (test-safe)
========================================================= */

// const items = normalizeDeliveryItems([{ name: " Cement ", qty: "2" as any }]);
// console.log(items); // [{ name: "Cement", qty: 2 }]

/* =========================================================
   Implementation guidance
   ---------------------------------------------------------
   - Import from this file inside slices.
   - Do NOT mutate inputs inside helpers.
   - Keep helpers stateless to avoid test complexity.
========================================================= */

/* =========================================================
   Scalability insight
   ---------------------------------------------------------
   If offline queueing or idempotency grows, transaction
   helpers can evolve here without touching slice logic.
   This preserves store stability while expanding capability.
========================================================= */
