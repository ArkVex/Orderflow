import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";

// Route imports
import authRoutes from "./modules/auth/auth.routes";
import restaurantRoutes from "./modules/restaurant/restaurant.routes";
import menuRoutes from "./modules/menu/menu.routes";
import orderRoutes from "./modules/order/order.routes";
import deliveryRoutes from "./modules/delivery/delivery.routes";

const app = express();

// ─── Global Middleware ────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(apiLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/restaurants", restaurantRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/deliveries", deliveryRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

export default app;
