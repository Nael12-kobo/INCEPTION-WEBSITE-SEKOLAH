/**
 * Tokenizer markdown RINGKAN untuk balasan asisten chat — murni string,
 * tanpa React/JSX supaya bisa diuji unit terpisah (lihat MarkdownLite.tsx
 * untuk bagian render-nya).
 *
 * Kenapa manual: bubble chat cuma butuh subset kecil dari output Gemini
 * (**tebal**, `kode`, path/URL). react-markdown menambah bundle besar
 * hanya untuk kasus ini (proyek ini konsisten menjaga bundle tetap ramping).
 *
 * Yang didukung:
 * - **teks**      → token bold
 * - `kode`        → token code; bila isinya path internal → href ikut diisi
 * - [teks](url)   → token link (internal = next/link, eksternal = tab baru)
 * - https://...   → token link (tanda baca di akhir dilepas dari href)
 * - /ppdb dst.    → token link (hanya route internal yang dikenal — cegah
 *                   false-positive kayak "5/10" atau "1 juta /bulan")
 */

/** Route internal yang aman di-linkify otomatis (sesuai daftar page.tsx di src/app). */
export const INTERNAL_ROUTES = [
  "academic",
  "admin",
  "auth",
  "chat",
  "dashboard",
  "guru-karyawan",
  "jurusan",
  "ppdb",
  "privacy-policy",
  "profile",
  "sejarah",
  "settings",
  "student",
  "terms-of-service",
];

/** Satu pass regex: urutan alternasi = urutan prioritas. */
const TOKEN_RE = new RegExp(
  [
    "\\[([^\\]]+)\\]\\(([^)\\s]+)\\)", // [teks](url)
    "`([^`]+)`", // `kode`
    "\\*\\*([^*]+)\\*\\*", // **tebal**
    "https?:\\/\\/\\S+", // URL lengkap
    "\\/(?:" +
      INTERNAL_ROUTES.join("|") +
      ")(?:\\/[\\w\\-.?=&%]*)*", // path internal
  ].join("|"),
  "g"
);

export type MarkdownToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  /** href terisi bila kode berisi path internal → dirender jadi link bergaya kode. */
  | { type: "code"; value: string; href?: string }
  | { type: "link"; label: string; href: string };

/** path internal = diawali "/" + salah satu route yang dikenal. */
export function isInternalPath(value: string): boolean {
  return new RegExp(`^\\/(?:${INTERNAL_ROUTES.join("|")})(\\/|[?]|$)`).test(value);
}

export function tokenizeMarkdown(text: string): MarkdownToken[] {
  const tokens: MarkdownToken[] = [];
  let last = 0;
  let match: RegExpExecArray | null;

  const pushText = (value: string) => {
    if (!value) return;
    const prev = tokens[tokens.length - 1];
    if (prev?.type === "text") prev.value += value;
    else tokens.push({ type: "text", value });
  };

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    pushText(text.slice(last, match.index));
    const raw = match[0];

    if (match[1] !== undefined && match[2] !== undefined) {
      // [teks](url)
      const href = match[2].replace(/[.,;:!]+$/, "");
      tokens.push({ type: "link", label: match[1], href });
    } else if (match[3] !== undefined) {
      // `kode` — path internal tetap diklik agar pengguna bisa ke halamannya
      const code = match[3];
      tokens.push(
        isInternalPath(code)
          ? { type: "code", value: code, href: code }
          : { type: "code", value: code }
      );
    } else if (match[4] !== undefined) {
      // **tebal**
      tokens.push({ type: "bold", value: match[4] });
    } else if (raw.startsWith("http")) {
      // URL polos — buang tanda baca yang nempel di akhir kalimat
      const href = raw.replace(/[.,;:!]+$/, "");
      tokens.push({ type: "link", label: href, href });
    } else {
      // path internal polos (mis. "...ada di /ppdb.")
      tokens.push({ type: "link", label: raw, href: raw });
    }

    last = match.index + raw.length;
  }
  pushText(text.slice(last));
  return tokens;
}
