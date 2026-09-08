import { z } from "zod";

export const sendOtpSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
});
