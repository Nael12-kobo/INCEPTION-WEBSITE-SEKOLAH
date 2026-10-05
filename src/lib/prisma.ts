import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Singleton PrismaClient untuk Next.js.
 * Disimpan di globalThis saat development agar hot-reload tidak
 * membuat banyak connection pool ke database.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // Jangan throw saat build (next build mengimpor route handlers tanpa env).
    // Kembalikan proxy yang baru error saat query benar-benar dijalankan.
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return new Proxy({} as PrismaClient, {
        get() {
          throw new Error(
            "DATABASE_URL belum diisi. Salin .env.example ke .env lalu isi DATABASE_URL."
          );
        },
      });
    }
    throw new Error(
      "DATABASE_URL belum diisi. Salin .env.example ke .env lalu isi DATABASE_URL."
    );
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
