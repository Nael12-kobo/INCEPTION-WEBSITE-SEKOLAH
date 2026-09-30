import { getResend } from "@/lib/resend";
import { JurusanLabel, type JurusanValue } from "@/lib/ppdb";

const SENDER =
  process.env.RESEND_FROM ??
  "SMK Telekomunikasi Tunas Harapan <noreplay@kitacobalagi.nerucloud.biz.id>";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export async function sendPpdbConfirmationEmail(input: {
  to: string;
  fullName: string;
  registrationNo: string;
  majorFirst: JurusanValue;
  majorSecond: JurusanValue;
}): Promise<boolean> {
  const name = escapeHtml(input.fullName);
  const registrationNo = escapeHtml(input.registrationNo);
  const majorFirst = escapeHtml(JurusanLabel(input.majorFirst));
  const majorSecond = escapeHtml(JurusanLabel(input.majorSecond));

  try {
    const { error } = await getResend().emails.send({
      from: SENDER,
      to: input.to,
      subject: `Konfirmasi pendaftaran ${input.registrationNo} — SMK Telekomunikasi Tunas Harapan`,
      html: `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:32px 16px;background:#f0f9ff;font-family:Arial,sans-serif;color:#0f172a">
    <main style="max-width:520px;margin:0 auto;padding:32px;background:#fff;border-radius:16px">
      <h1 style="font-size:20px;color:#0284c7">Pendaftaran berhasil</h1>
      <p>Halo ${name},</p>
      <p>Terima kasih telah mendaftar di SMK Telekomunikasi Tunas Harapan. Berikut bukti pendaftaran online Anda:</p>
      <p><strong>Nomor pendaftaran:</strong> ${registrationNo}</p>
      <p><strong>Pilihan jurusan 1:</strong> ${majorFirst}</p>
      <p><strong>Pilihan jurusan 2:</strong> ${majorSecond}</p>
      <p>Formulir ini merupakan bukti pendaftaran sementara. Daftar lengkap wajib diisi saat pendaftaran langsung di sekolah.</p>
      <p style="color:#64748b;font-size:13px">Informasi selanjutnya akan disampaikan melalui WhatsApp atau SMS.</p>
    </main>
  </body>
</html>`,
    });

    if (error) {
      console.error("Gagal mengirim email konfirmasi PPDB:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Gagal mengirim email konfirmasi PPDB:", error);
    return false;
  }
}
