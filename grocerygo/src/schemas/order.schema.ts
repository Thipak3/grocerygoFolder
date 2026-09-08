import { z } from "zod";

export const orderSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  paymentMethod: z.enum(["cod", "online"]),
  totalAmount: z.number().min(0, "Total amount cannot be negative"),
  items: z.array(z.any()).min(1, "At least one item is required"), // Can refine items later if needed
  address: z.object({
    fullName: z.string().optional(),
    mobile: z.string().optional(),
    fullAddress: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pinCode: z.string().optional(),
    pincode: z.string().optional(), // In case casing varies
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).passthrough(),
});
