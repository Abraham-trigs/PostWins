// packages/analytics/src/index.ts
import { z } from "zod";

export const GovernanceEventSchema = z.object({
  id: z.string().uuid(),
  actor: z.enum(["donor", "regulator", "operator", "technical", "observer"]),
  action: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});

export type GovernanceEvent = z.infer<typeof GovernanceEventSchema>;
