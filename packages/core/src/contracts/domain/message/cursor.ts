// src/pagination/cursor.ts

import { z } from "zod";

export const CursorSchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().uuid(),
});

export type Cursor = z.infer<typeof CursorSchema>;
