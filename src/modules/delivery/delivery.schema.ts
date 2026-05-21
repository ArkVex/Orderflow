import { z } from "zod";

export const assignDriverSchema = z.object({
  driverId: z.string().uuid("Invalid driver ID"),
});

export const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(["PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED"]),
});

export const registerDriverSchema = z.object({
  vehicleType: z.string().optional(),
  licensePlate: z.string().optional(),
});

export type AssignDriverInput = z.infer<typeof assignDriverSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationSchema>;
export type UpdateDeliveryStatusInput = z.infer<typeof updateDeliveryStatusSchema>;
export type RegisterDriverInput = z.infer<typeof registerDriverSchema>;
