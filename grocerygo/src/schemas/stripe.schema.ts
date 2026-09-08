import { z } from "zod";

export const stripeEventSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.object({
      metadata: z.object({
        orderId: z.string().optional(),
      }).passthrough().optional(),
    }).passthrough(),
  }).passthrough(),
});
