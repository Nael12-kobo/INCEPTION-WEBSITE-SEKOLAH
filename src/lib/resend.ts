import { Resend } from "resend";

/**
 * Client Resend (lazy singleton) — server-only.
 * Tanpa RESEND_API_KEY, kirim email akan gagal dengan pesan jelas
 * (tidak melempar saat import agar build tidak pecah).
 */
let _client: Resend | null = null;

export function getResend(): Resend {
  if (!_client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY belum diisi di .env — email reset tidak dapat dikirim."
      );
    }
    _client = new Resend(apiKey);
  }
  return _client;
}
