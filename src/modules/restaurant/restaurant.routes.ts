import { Router } from "express";
import { RestaurantController } from "./restaurant.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createRestaurantSchema, updateRestaurantSchema } from "./restaurant.schema";

const router = Router();
const controller = new RestaurantController();

router.get("/", controller.list);
router.get("/:id", controller.getById);
router.post("/", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), validate(createRestaurantSchema), controller.create);
router.patch("/:id", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), validate(updateRestaurantSchema), controller.update);
router.delete("/:id", authenticate, authorize("RESTAURANT_OWNER", "ADMIN"), controller.delete);

export default router;
