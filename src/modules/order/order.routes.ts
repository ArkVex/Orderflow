import { Router } from "express";
import { OrderController } from "./order.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createOrderSchema, updateOrderStatusSchema } from "./order.schema";

const router = Router();
const controller = new OrderController();

// Customer
router.post("/", authenticate, authorize("CUSTOMER"), validate(createOrderSchema), controller.create);
router.get("/my-orders", authenticate, authorize("CUSTOMER"), controller.getMyOrders);

// Restaurant owner
router.get("/restaurant", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), controller.getRestaurantOrders);
router.get("/restaurant/stats", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), controller.getStats);

// Shared
router.get("/:id", authenticate, controller.getById);
router.patch("/:id/status", authenticate, validate(updateOrderStatusSchema), controller.updateStatus);

export default router;
