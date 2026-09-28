import "dotenv/config";
import { defineConfig } from "prisma/config";

// Catatan: dipakai oleh Prisma CLI (migrate/db push). Untuk Supabase,
// pakai DIRECT_URL (port 5432) — bukan yang pooled (port 6543).
// Kosong sampai env diisi — `prisma generate` tetap bisa jalan.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
