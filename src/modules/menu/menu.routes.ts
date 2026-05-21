import { Router } from "express";
import { MenuController } from "./menu.controller";
import { validate } from "../../middleware/validate";
import { authenticate, authorize } from "../../middleware/auth";
import { createCategorySchema, updateCategorySchema, createMenuItemSchema, updateMenuItemSchema } from "./menu.schema";

const router = Router();
const controller = new MenuController();

// Public - view menu
router.get("/restaurant/:restaurantId/categories", controller.getCategories);

// Protected - manage categories
router.post(
  "/restaurant/:restaurantId/categories",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  validate(createCategorySchema),
  controller.createCategory,
);
router.patch(
  "/categories/:categoryId",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  validate(updateCategorySchema),
  controller.updateCategory,
);
router.delete(
  "/categories/:categoryId",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  controller.deleteCategory,
);

// Protected - manage items
router.post(
  "/categories/:categoryId/items",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  validate(createMenuItemSchema),
  controller.createItem,
);
router.patch(
  "/items/:itemId",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  validate(updateMenuItemSchema),
  controller.updateItem,
);
router.delete(
  "/items/:itemId",
  authenticate, authorize("RESTAURANT_OWNER", "ADMIN"),
  controller.deleteItem,
);

export default router;
