const fs = require("fs");
const { spawnSync } = require("child_process");

/**
 * Postinstall hook — menjalankan `prisma generate` HANYA JIKA file
 * `prisma/schema.prisma` ada.
 *
 * Latar belakang:
 * - package.json menjalankan script ini setiap `npm install` / `npm ci`.
 * - Pada Docker multi-stage, stage `base` TIDAK meng-copy seluruh source code
 *   (melainkan hanya package.json + prisma). Kalau suatu saat urutan COPY
 *   berubah dan prisma belum ada, `prisma generate` langsung gagal dan build
 *   berhenti, padahal stage `builder` nanti akan menjalankannya lagi.
 * - Ini juga membantu CI / install lokal di clone bersih tanpa schema.
 */

const SCHEMA = "prisma/schema.prisma";

if (!fs.existsSync(SCHEMA)) {
  console.info(
    `[postinstall] ${SCHEMA} tidak ditemukan — skip \`prisma generate\`.`
  );
  process.exit(0);
}

console.info(`[postinstall] ${SCHEMA} ditemukan — menjalankan prisma generate...`);

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error("[postinstall] Gagal menjalankan prisma generate:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);
