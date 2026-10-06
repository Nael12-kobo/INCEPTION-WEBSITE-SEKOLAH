import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Retrieval keyword sederhana untuk dataset `knowledge/*.md`.
 * Dipakai server-side (route /api/chat) agar jawaban Gemini
 * berdasar fakta situs, bukan karangan.
 */

interface KnowledgeEntry {
  file: string;
  topic: string;
  keywords: string[];
  content: string;
  mtimeMs: number;
}

const KNOWLEDGE_DIR = join(process.cwd(), "knowledge");

/** Urutan menentukan prioritas bila skor seri. */
const TOPIC_KEYWORDS: { file: string; topic: string; keywords: string[] }[] = [
  {
    file: "06-ppdb.md",
    topic: "ppdb",
    keywords: [
      "ppdb", "spmb", "pendaftaran", "daftar", "gelombang", "syarat",
      "berkas", "rapor", "formulir", "nomor pendaftaran", "daftar ulang",
      "tes", "wawancara", "biaya", "beasiswa", "kuota", "login",
    ],
  },
  {
    file: "07-kontak.md",
    topic: "kontak",
    keywords: [
      "kontak", "alamat", "telepon", "telp", "whatsapp", "wa", "email",
      "lokasi", "maps", "sekretariat", "panitia", "hubungi", "nomor wa",
      "umbul", "tengaran", "semarang",
    ],
  },
  {
    file: "02-jurusan.md",
    topic: "jurusan",
    keywords: [
      "jurusan", "program keahlian", "kompetensi", "dkv", "pplg", "tjkt",
      "tkr", "tkro", "otomotif", "desain", "jaringan", "software",
      "gim", "game", "rpl", "tkj", "multimedia",
    ],
  },
  {
    file: "03-fasilitas.md",
    topic: "fasilitas",
    keywords: [
      "fasilitas", "lab", "laboratorium", "wifi", "internet", "e-learning",
      "perpustakaan", "ekskul", "ekstrakurikuler", "asrama", "kantin",
      "musholla", "aula", "bkk", "uks", "bk", "cisco", "fiber",
    ],
  },
  {
    file: "01-profil-sekolah.md",
    topic: "profil-sekolah",
    keywords: [
      "profil", "sekolah", "visi", "misi", "sejarah", "akreditasi",
      "npsn", "siswa", "guru", "alumni", "mitra", "smk", "tunas harapan",
    ],
  },
  {
    file: "08-berita.md",
    topic: "berita",
    keywords: [
      "berita", "kabar", "pengumuman", "artikel", "mou", "magang",
      "juara", "lomba", "beasiswa", "prestasi", "kegiatan",
    ],
  },
  {
    file: "04-prestasi.md",
    topic: "prestasi",
    keywords: ["prestasi", "juara", "penghargaan", "piala", "medali", "olimpiade", "kompetisi", "beasiswa"],
  },
  {
    file: "05-kegiatan.md",
    topic: "kegiatan",
    keywords: ["kegiatan", "acara", "event", "agenda", "osis", "pramuka", "ekskul", "ekstrakurikuler", "magang", "mou", "robotik", "futsal"],
  },
];

const cache = new Map<string, KnowledgeEntry>();

function loadEntry(def: (typeof TOPIC_KEYWORDS)[number]): KnowledgeEntry | null {
  try {
    const full = join(KNOWLEDGE_DIR, def.file);
    const st = statSync(full);
    const hit = cache.get(def.file);
    if (hit && hit.mtimeMs === st.mtimeMs) return hit;
    const content = readFileSync(full, "utf8");
    const entry: KnowledgeEntry = {
      ...def,
      content,
      mtimeMs: st.mtimeMs,
    };
    cache.set(def.file, entry);
    return entry;
  } catch {
    return null;
  }
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Cocokkan keyword terhadap teks user.
 * Keyword pendek (≤3 huruf, mis. "wa", "bk", "lab", "smk") wajib cocok
 * sebagai kata utuh — tanpa ini "wa" ikut cocok di "beasiswa" dan
 * "bk" ikut cocok di "obat" dsb.
 */
function matchesKeyword(lower: string, kw: string): boolean {
  if (!kw) return false;
  if (kw.includes(" ")) return lower.includes(kw);
  if (kw.length <= 3) {
    return new RegExp(`\\b${escapeRegExp(kw)}\\b`).test(lower);
  }
  return lower.includes(kw);
}

/** Daftar topik yang relevan, diurutkan dari yang paling cocok. */
export function pickRelevantTopics(text: string, maxFiles = 3): string[] {
  const lower = text.toLowerCase();
  const scored = TOPIC_KEYWORDS.map((def) => {
    let score = 0;
    for (const kw of def.keywords) {
      if (matchesKeyword(lower, kw)) score += kw.length > 4 ? 2 : 1;
    }
    return { file: def.file, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxFiles)
    .map((s) => s.file);

  // Tanpa kecocokan keyword (mis. "halo", "pagi") → beri konteks umum
  // agar AI tetap memperkenalkan diri dengan fakta benar.
  if (scored.length === 0) return ["01-profil-sekolah.md", "07-kontak.md"];
  return scored;
}

/**
 * Konteks siap tempel ke systemInstruction.
 * Tiap file dipotong agar hemat token; total dibatasi maxTotalChars.
 */
export function getKnowledgeContext(
  text: string,
  opts: { maxFiles?: number; maxCharsPerFile?: number; maxTotalChars?: number } = {}
): { files: string[]; context: string } {
  const { maxFiles = 3, maxCharsPerFile = 2500, maxTotalChars = 7500 } = opts;
  const files = pickRelevantTopics(text, maxFiles);
  const parts: string[] = [];
  let total = 0;

  for (const file of files) {
    const def = TOPIC_KEYWORDS.find((d) => d.file === file);
    if (!def) continue;
    const entry = loadEntry(def);
    if (!entry) continue;
    const body = entry.content.slice(0, maxCharsPerFile);
    const chunk = `--- Sumber: knowledge/${entry.file} ---\n${body}`;
    if (total + chunk.length > maxTotalChars) break;
    parts.push(chunk);
    total += chunk.length;
  }

  // Fallback: direktori knowledge hilang → kembalikan string kosong,
  // pemanggil tetap lanjut dengan SYSTEM_PROMPT lama.
  return { files, context: parts.join("\n\n") };
}
