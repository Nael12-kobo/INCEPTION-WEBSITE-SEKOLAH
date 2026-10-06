/**
 * Pengambil berita dari situs resmi sekolah (WordPress).
 *
 * Sumber : https://www.tunasharapan.info/official/blog/
 * API    : https://www.tunasharapan.info/official/wp-json/wp/v2/posts
 *
 * Dipanggil dari server component (bukan browser) supaya bebas CORS dan
 * hasilnya bisa di-cache Next (`revalidate: 3600` = per jam).
 *
 * Catatan soal GAMBAR: post di situs itu TIDAK memakai featured image —
 * fotonya menempel di dalam konten. Jadi kita ambil `<img>` pertama dari
 * `content.rendered`, lalu di-upgrade ke ukuran penuh dengan menghapus
 * sufiks ukuran WordPress (`-300x187` → original). Kalau tidak ada gambar
 * (atau formatnya .heic yang tidak bisa ditampilkan browser), nilainya
 * `null` dan kartu berita memakai placeholder.
 */

export type Berita = {
  id: number;
  judul: string;
  ringkasan: string;
  url: string;
  /** Sudah diformat "17 Sep 2026" saat fetch, biar tidak beda hasil
      formatting antara Node (SSR) dan browser (hydration). */
  tanggal: string;
  kategori: string;
  gambar: string | null;
};

export const BLOG_URL = "https://www.tunasharapan.info/official/blog/";

const API = "https://www.tunasharapan.info/official/wp-json/wp/v2/posts";

/** Ekstensi gambar yang benar-benar bisa dirender browser. */
const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

type WpPost = {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  categories?: number[];
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url?: string }>;
    "wp:term"?: Array<Array<{ name: string }>>;
  };
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
};

/** HTML → teks biasa: buang tag, decode entity, rapikan spasi. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(
      /&([a-z]+);/gi,
      (whole, name) => NAMED_ENTITIES[name.toLowerCase()] ?? whole,
    )
    .replace(/\s+/g, " ")
    .trim();
}

/** Potong di batas kata, tanpa memotong di tengah huruf. */
function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6))}…`;
}

/** `-300x187.jpg` → `.jpg` (dapat foto resolusi penuh dari WP). */
function toFullSize(url: string): string {
  return url.replace(/-\d+x\d+(\.\w+)(\?.*)?$/i, "$1$2");
}

/** Gambar pertama yang valid di dalam konten post. */
function firstContentImage(content: string): string | null {
  const matches = content.match(/<img[^>]+src=["']([^"']+)["']/gi) ?? [];
  for (const tag of matches) {
    const src = tag.match(/src=["']([^"']+)["']/i)?.[1];
    if (!src) continue;
    // .heic tidak bisa dirender Chrome/Safari web — lewati.
    if (!IMAGE_EXT.test(src.split("?")[0])) continue;
    return toFullSize(src);
  }
  return null;
}

function pickImage(post: WpPost): string | null {
  const featured =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  if (featured && IMAGE_EXT.test(featured.split("?")[0])) {
    return toFullSize(featured);
  }
  return firstContentImage(post.content?.rendered ?? "");
}

function pickCategory(post: WpPost): string {
  const terms = post._embedded?.["wp:term"];
  const first = terms?.find((group) => group.length > 0)?.[0];
  return first?.name ?? "Berita";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Ambil N berita terbaru. Gagal fetch TIDAK melempar error — mengembalikan
 * `[]` supaya homepage tetap tampil (kartu berita fallback dipakai).
 */
export async function ambilBerita(limit = 9): Promise<Berita[]> {
  try {
    const res = await fetch(`${API}?per_page=${limit}&_embed`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(15_000),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const posts = (await res.json()) as WpPost[];
    if (!Array.isArray(posts)) return [];

    return posts.map((post) => ({
      id: post.id,
      judul: stripHtml(post.title?.rendered ?? "").slice(0, 160),
      ringkasan: truncate(stripHtml(post.excerpt?.rendered ?? ""), 180),
      url: post.link,
      tanggal: formatDate(post.date),
      kategori: pickCategory(post),
      gambar: pickImage(post),
    }));
  } catch (err) {
    // Jangan bikin homepage error gara-gara situs sekolah lagi down.
    console.warn("[berita] gagal ambil dari tunasharapan.info:", err);
    return [];
  }
}
