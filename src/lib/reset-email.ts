import { getResend } from "@/lib/resend";

/**
 * Email reset password — HTML inline (tanpa dependency template tambahan).
 * Return true bila berhasil dikirim, false bila gagal (API error / env kosong).
 */
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<boolean> {
  const sender =
    process.env.RESEND_FROM ??
    "SMK Telekomunikasi Tunas Harapan <onboarding@resend.dev>";

  const html = `<!doctype html>
<html lang="id">
  <body style="margin:0;padding:0;background-color:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;box-shadow:0 1px 3px rgba(2,132,199,0.08);overflow:hidden;">
            <tr>
              <td style="background-color:#0284c7;padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:0.02em;">SMK Telekomunikasi Tunas Harapan</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 8px;color:#0f172a;font-size:20px;font-weight:700;">Reset kata sandi</h2>
                <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                  Kami menerima permintaan reset kata sandi untuk akun Anda.
                  Klik tombol di bawah untuk membuat kata sandi baru.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <a href="${resetUrl}"
                         style="display:inline-block;background-color:#0284c7;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
                        Buat kata sandi baru
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;color:#64748b;font-size:13px;line-height:1.6;">
                  Atau salin tautan berikut ke peramban Anda:
                </p>
                <p style="margin:0 0 24px;word-break:break-all;">
                  <a href="${resetUrl}" style="color:#0284c7;font-size:13px;">${resetUrl}</a>
                </p>
                <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                  Tautan berlaku 1 jam dan hanya dapat dipakai sekali.
                  Abaikan email ini bila Anda tidak merasa meminta reset kata sandi.
                </p>
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #e0f2fe;padding:16px 32px;text-align:center;">
                <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; ${new Date().getFullYear()} SMK Telekomunikasi Tunas Harapan</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  try {
    const { error } = await getResend().emails.send({
      from: sender,
      to,
      subject: "Reset kata sandi — SMK Telekomunikasi Tunas Harapan",
      html,
    });
    if (error) {
      console.error("Gagal mengirim email reset:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Gagal mengirim email reset:", err);
    return false;
  }
}
