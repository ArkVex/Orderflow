import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "./env";
import { AuthPayload } from "../shared/types";

let io: Server;

export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  // Auth middleware for socket connections
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const payload = jwt.verify(token, env.jwtSecret) as AuthPayload;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user as AuthPayload;
    console.log(`Socket connected: ${user.userId} (${user.role})`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${user.userId}`);

    // Drivers join a driver pool room
    if (user.role === "DRIVER") {
      socket.join("drivers");
    }

    // Allow clients to track specific orders
    socket.on("track:order", (orderId: string) => {
      socket.join(`order:${orderId}`);
    });

    // Allow clients to track specific deliveries
    socket.on("track:delivery", (deliveryId: string) => {
      socket.join(`delivery:${deliveryId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${user.userId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

// ─── Event emitters for use in services ─────────────────

export function emitOrderStatusUpdate(orderId: string, data: unknown): void {
  if (!io) return;
  io.to(`order:${orderId}`).emit("order:status-updated", data);
}

export function emitNewOrder(restaurantOwnerId: string, data: unknown): void {
  if (!io) return;
  io.to(`user:${restaurantOwnerId}`).emit("order:new", data);
}

export function emitDeliveryLocationUpdate(deliveryId: string, data: { lat: number; lng: number }): void {
  if (!io) return;
  io.to(`delivery:${deliveryId}`).emit("delivery:location-updated", data);
}

export function emitDeliveryStatusUpdate(deliveryId: string, data: unknown): void {
  if (!io) return;
  io.to(`delivery:${deliveryId}`).emit("delivery:status-updated", data);
}

export function emitNewDeliveryAvailable(data: unknown): void {
  if (!io) return;
  io.to("drivers").emit("delivery:new-available", data);
}
