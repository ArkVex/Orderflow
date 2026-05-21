import { PrismaClient } from "../generated/prisma/client";

class Database {
  private static instance: PrismaClient;

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });
    }
    return Database.instance;
  }

  static async connect(): Promise<void> {
    const prisma = Database.getInstance();
    await prisma.$connect();
    console.log("Database connected successfully");
  }

  static async disconnect(): Promise<void> {
    const prisma = Database.getInstance();
    await prisma.$disconnect();
    console.log("Database disconnected");
  }
}

export const prisma = Database.getInstance();
export default Database;
