import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { authLimiter } from "../../middleware/rateLimiter";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();
const controller = new AuthController();

router.post("/register", authLimiter, validate(registerSchema), controller.register);
router.post("/login", authLimiter, validate(loginSchema), controller.login);
router.get("/profile", authenticate, controller.getProfile);

export default router;
