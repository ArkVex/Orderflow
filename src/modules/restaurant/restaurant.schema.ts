import { z } from "zod";

export const createRestaurantSchema = z.object({
  name: z.string().min(2, "Restaurant name must be at least 2 characters"),
  description: z.string().optional(),
  phone: z.string().min(8, "Invalid phone number"),
  email: z.string().email("Invalid email"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(4, "Zip code is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  operatingHours: z.record(z.string(), z.object({
    open: z.string(),
    close: z.string(),
  })).optional(),
  avgPrepTime: z.number().int().min(5).max(120).optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export type CreateRestaurantInput = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurantInput = z.infer<typeof updateRestaurantSchema>;
