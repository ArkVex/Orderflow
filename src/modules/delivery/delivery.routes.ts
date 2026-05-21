import { Router } from "express";
import { DeliveryController } from "./delivery.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { assignDriverSchema, updateLocationSchema, updateDeliveryStatusSchema, registerDriverSchema } from "./delivery.schema";

const router = Router();
const controller = new DeliveryController();

// Driver registration
router.post("/drivers/register", authenticate, authorize("DRIVER"), validate(registerDriverSchema), controller.registerDriver);

// Driver's active deliveries
router.get("/drivers/my-deliveries", authenticate, authorize("DRIVER"), controller.getMyDeliveries);

// Available drivers (for restaurant/admin)
router.get("/drivers/available", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), controller.getAvailableDrivers);

// Create delivery for an order
router.post("/order/:orderId", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), controller.createForOrder);

// Get delivery by order
router.get("/order/:orderId", authenticate, controller.getByOrder);

// Get delivery details
router.get("/:id", authenticate, controller.getById);

// Assign driver
router.patch("/:id/assign", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), validate(assignDriverSchema), controller.assignDriver);

// Update delivery status (driver only)
router.patch("/:id/status", authenticate, authorize("DRIVER"), validate(updateDeliveryStatusSchema), controller.updateStatus);

// Update driver location (driver only)
router.patch("/:id/location", authenticate, authorize("DRIVER"), validate(updateLocationSchema), controller.updateLocation);

export default router;
