// apps/website/src/_lib/analytics.server.ts
"use server";
import { z } from "zod";

const EventSchema = z.object({
  event: z.string(),
  role: z.string().optional(),
  timestamp: z.number(),
});

export async function trackServerEvent(data: unknown) {
  const parsed = EventSchema.safeParse(data);
  if (parsed.success) {
    // In production, fetch to backend governance engine
    console.log("[TELEMETRY]", parsed.data);
  }
}
