import { z } from "zod";

export const swapRequestSchema = z.object({
  shiftId: z.string().min(1),
  targetUserId: z.string().optional(),
});
