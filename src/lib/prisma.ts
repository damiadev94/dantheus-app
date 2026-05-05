// ─── Imports ──────────────────────────────────────────────────────────────────
import { PrismaClient } from "@prisma/client";

// ─── Client singleton ─────────────────────────────────────────────────────────
// ? En dev, Next.js recarga módulos en cada hot-reload creando múltiples instancias.
// Guardarlo en globalThis evita agotar el pool de conexiones de Neon.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
