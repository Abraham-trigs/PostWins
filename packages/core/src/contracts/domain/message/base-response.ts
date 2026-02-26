// src/common/base-response.ts

import { z } from "zod";

export const SuccessResponse = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    ok: z.literal(true),
    data: schema,
  });

export const ErrorResponse = z.object({
  ok: z.literal(false),
  error: z.string(),
});
