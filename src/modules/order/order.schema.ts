import { z } from "zod";

export const createOrderSchema = z.object({
  restaurantId: z.string().uuid("Invalid restaurant ID"),
  deliveryAddressId: z.string().uuid().optional(),
  notes: z.string().optional(),
  paymentMethod: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid("Invalid menu item ID"),
    quantity: z.number().int().positive("Quantity must be at least 1"),
    notes: z.string().optional(),
  })).min(1, "Order must have at least one item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PREPARING", "READY", "PICKED_UP", "DELIVERED", "CANCELLED"]),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
