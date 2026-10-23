/**
 * Util kecil untuk membaca body respons API dengan aman.
 * `res.json()` mentah melempar "Unexpected end of JSON input" bila body
 * kosong / bukan JSON (mis. error 502 HTML dari proxy) — parse di sini
 * selalu kembali `null` dalam kasus itu.
 */
export async function parseJsonSafe<T = Record<string, unknown>>(
  res: Response
): Promise<T | null> {
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
