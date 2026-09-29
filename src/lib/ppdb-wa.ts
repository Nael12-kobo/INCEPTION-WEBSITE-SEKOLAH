/**
 * Pengiriman WhatsApp untuk notifikasi PPDB.
 *
 * Pakai WhatsApp Cloud API (Meta) bila kredensial terisi, sehingga benar-benar
 * terkirim ke nomor pendaftar. Tanpa kredensial, fungsi tetap mengembalikan
 * true=false agar pemanggil bisa mencatatnya — pendaftaran tidak boleh gagal
 * hanya karena WhatsApp tidak terkonfigurasi.
 *
 * Env yang dipakai (lihat .env.example):
 *   WHATSAPP_TOKEN   — token akses permanen dari Meta Business
 *   WHATSAPP_PHONE_ID — ID nomor telepon pengirim (format 628...)
 */

type SendResult = { sent: boolean; reason?: string };

const CLOUD_API = "https://graph.facebook.com/v21.0";

function stripInternational(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return `62${digits}`;
}

export async function sendWhatsApp(
  to: string,
  message: string
): Promise<SendResult> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    return {
      sent: false,
      reason: "WHATSAPP_TOKEN / WHATSAPP_PHONE_ID belum diisi.",
    };
  }

  try {
    const res = await fetch(`${CLOUD_API}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: stripInternational(to),
        type: "text",
        text: { body: message, preview_url: true },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return { sent: false, reason: `WhatsApp API ${res.status}: ${detail}` };
    }
    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      reason: error instanceof Error ? error.message : "Kesalahan jaringan.",
    };
  }
}
