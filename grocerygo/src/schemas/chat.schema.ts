import { z } from "zod";

export const aiSuggestionSchema = z.object({
  role: z.enum(["user", "delivery-boy", "admin"]).optional().default("user"),
  message: z.string().optional().default(""),
});
