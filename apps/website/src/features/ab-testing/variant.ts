// apps/website/src/features/ab-testing/variant.ts
import { z } from "zod";

export const VariantSchema = z.enum(["control", "simplified", "expert"]);
export type Variant = z.infer<typeof VariantSchema>;

export function getVariant(userId: string): Variant {
  // Simple deterministic hash for variant assignment
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variants: Variant[] = ["control", "simplified", "expert"];
  return variants[hash % variants.length];
}
