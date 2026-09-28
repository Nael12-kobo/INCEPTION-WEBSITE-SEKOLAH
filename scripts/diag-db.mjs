// Sementara: parsing .env seperti aplikasi, tes koneksi, tanpa menampilkan password.
import fs from "node:fs";
import pg from "pg";

// parser dotenv sederhana
const env = {};
for (const line of fs.readFileSync(".env", "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (!m) continue;
  let v = m[2];
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  env[m[1]] = v;
}

const DIRECT_URL = env.DIRECT_URL ?? "";
console.log("DIRECT_URL ada:", Boolean(DIRECT_URL), "| panjang:", DIRECT_URL.length);

let u;
try {
  u = new URL(DIRECT_URL);
} catch (e) {
  console.log("DIRECT_URL GAGAL DI-PARSE sebagai URL:", String(e).slice(0, 120));
  process.exit(0);
}

console.log("protocol:", u.protocol);
console.log("username:", decodeURIComponent(u.username));
console.log("password diisi:", u.password.length > 0, "| panjang:", decodeURIComponent(u.password).length);
console.log("host:", u.hostname, "| port:", u.port);
console.log("database:", u.pathname);

// tes koneksi
const c = new pg.Client({
  connectionString: DIRECT_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});
try {
  await c.connect();
  const r = await c.query("select current_user, current_database(), version() like '%Supabase%' as is_supabase");
  console.log("KONEKSI OK:", JSON.stringify(r.rows[0]));
  const t = await c.query(
    "select table_name from information_schema.tables where table_schema='public' order by table_name"
  );
  console.log("tabel public:", t.rows.map((x) => x.table_name).join(", ") || "(kosong)");
  await c.end();
} catch (e) {
  console.log("KONEKSI GAGAL:", String(e && e.message ? e.message : e).slice(0, 200));
}
