import "dotenv/config";

import type { PrismaClient as PrismaClientType } from "@/generated/prisma/client";

import { env } from "@/config";
import { PrismaClient } from "@/generated/prisma/client";
import { logger } from "@/lib/logging";

// Singleton pattern with globalThis for hot reload support
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

/**
 * Build log configuration based on environment settings
 */
function buildLogConfig() {
  const log: ("query" | "info" | "warn" | "error")[] = [];

  // Always log errors
  log.push("error");

  if (env.NODE_ENV === "development") {
    log.push("warn");
    if (env.PRISMA_QUERY_LOG) {
      log.push("query");
    }
    if (env.PRISMA_LOG_LEVEL === "info") {
      log.push("info");
    }
  }
  else {
    // Production: configurable logging
    if (env.PRISMA_LOG_LEVEL === "warn") {
      log.push("warn");
    }
    if (env.PRISMA_LOG_LEVEL === "info") {
      log.push("warn", "info");
    }
  }

  return Array.from(new Set(log));
};

/**
 * Prisma Service - Singleton pattern for optimal connection management
 * Uses PrismaClient with DATABASE_URL from environment.
 */
class PrismaService {
  private static instance: PrismaClientType;

  /**
   * Get singleton PrismaClient instance
   */
  public static getInstance(): PrismaClientType {
    if (!PrismaService.instance) {
      PrismaService.instance
        = globalForPrisma.prisma
          ?? new PrismaClient({
            log: buildLogConfig(),
          });

      // Cache instance in development for hot reload
      if (env.NODE_ENV !== "production") {
        globalForPrisma.prisma = PrismaService.instance;
      }

      // Setup graceful shutdown handlers
      const cleanup = async () => {
        try {
          logger.info("Disconnecting Prisma client...");
          await PrismaService.instance.$disconnect();
          logger.info("Prisma client disconnected successfully");
        }
        catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          logger.error(`Error disconnecting Prisma client: ${errorMessage}`, {
            error: { message: errorMessage },
          });
        }
      };

      process.on("beforeExit", cleanup);
      process.on("SIGINT", async () => {
        await cleanup();
        process.exit(0);
      });
      process.on("SIGTERM", async () => {
        await cleanup();
        process.exit(0);
      });
    }

    return PrismaService.instance;
  }

  /**
   * Health check - verify database connectivity
   */
  public static async healthCheck(): Promise<boolean> {
    try {
      await PrismaService.getInstance().$queryRaw`SELECT 1 as health`;
      return true;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Database health check failed: ${errorMessage}`, {
        error: { message: errorMessage },
      });
      return false;
    }
  }

  /**
   * Get database connection information (for detailed health checks)
   */
  public static async getConnectionInfo() {
    const prisma = PrismaService.getInstance();
    try {
      const result = await prisma.$queryRaw`
        SELECT
          current_database() as database_name,
          current_user as current_user,
          version() as version
      `;
      return result;
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to get connection info: ${errorMessage}`, {
        error: { message: errorMessage },
      });
      throw error;
    }
  }
}

// Export singleton instance
export const prisma = PrismaService.getInstance();
export { PrismaService };
