import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import Database from "./config/database";
import { initializeSocket } from "./config/socket";

async function bootstrap(): Promise<void> {
  // Connect to database
  await Database.connect();

  // Create HTTP server and attach Socket.IO
  const httpServer = createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`
  ┌─────────────────────────────────────────┐
  │  Next Order API Server                  │
  │  Environment: ${env.nodeEnv.padEnd(24)}│
  │  Port: ${String(env.port).padEnd(32)}│
  │  Health: http://localhost:${env.port}/health   │
  │  API:    http://localhost:${env.port}/api/v1   │
  └─────────────────────────────────────────┘
    `);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    httpServer.close(() => {
      Database.disconnect().then(() => process.exit(0));
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
