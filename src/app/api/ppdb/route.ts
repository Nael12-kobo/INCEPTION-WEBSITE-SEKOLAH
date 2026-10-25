import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRegisterPpdb } from "@/lib/role-utils";
import {
  WA_ADMIN,
  buildAdminWaMessage,
  buildStudentWaMessage,
  JurusanLabel,
  registrationNoFromSeq,
  validatePpdbDraft,
} from "@/lib/ppdb";
import { sendWhatsApp } from "@/lib/ppdb-wa";
import { sendPpdbConfirmationEmail } from "@/lib/ppdb-email";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getPpdbJurusanOptions } from "@/lib/ppdb-jurusan-server";

/**
 * Ambil nomor berikutnya dari urutan numerik tertinggi di DB. Kolom nomor
 * bertipe teks, sehingga MAX teks akan menganggap "9999" lebih besar dari
 * "10000" dan bisa membuat nomor yang sama dicoba berulang kali.
 */
async function nextRegistrationNo(
  current?: string,
  year = new Date().getFullYear(),
): Promise<string> {
  const seqFrom = (no: string | null | undefined): number | null => {
    const m = no ? /^PPDB-(\d{4})-(\d+)$/.exec(no) : null;
    if (!m) return null;
    return Number(m[1]) === year ? Number(m[2]) : null;
  };
  try {
    const pattern = `^PPDB-${year}-([0-9]+)$`;
    const rows = await prisma.$queryRaw<Array<{ maxSeq: bigint | null }>>`
      SELECT MAX((substring("registrationNo" from ${pattern}))::bigint) AS "maxSeq"
      FROM "ppdb_registrations"
    `;
    const dbMax = rows[0]?.maxSeq;
    const dbSeq = dbMax == null ? 0 : Number(dbMax);
    if (!Number.isSafeInteger(dbSeq) || dbSeq < 0) {
      throw new Error("Urutan nomor pendaftaran di luar rentang aman.");
    }
    const currentSeq = seqFrom(current) ?? 0;
    return registrationNoFromSeq(Math.max(dbSeq, currentSeq) + 1, year);
  } catch (error) {
    console.warn("[ppdb] Gagal membaca urutan nomor pendaftaran, pakai fallback:", error);
    const seq = seqFrom(current);
    return registrationNoFromSeq((seq ?? 0) + 1, year);
  }
}

/**
 * Endpoint pendaftaran PPDB.
 *
 * Wajib login (calon siswa membuat akun dulu) dan satu akun hanya boleh
 * mendaftar sekali. Nomor pendaftaran dibuat server sebagai rujukan resmi.
 *
 * Kontrak dengan PpdbForm:
 * - 201 → { registrationNo, waUrl } pendaftar baru
 * - 200 → registrationNo yang sama, bila user sudah pernah mendaftar
 * - 400 → { errors } per-field, dari validatePpdbDraft yang sama; key "photo"
 *         dipakai bila foto siswa (syarat pendaftaran) belum diunggah
 * - 401 → belum login
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Silakan masuk sebelum mendaftar." },
      { status: 401 }
    );
  }
  
  // Hanya role dengan permission ppdb.register (USER)
  if (!canRegisterPpdb(session.user.role)) {
    return NextResponse.json(
      { message: "Hanya peran USER yang dapat mendaftar PPDB." },
      { status: 403 }
    );
  }
  
  const userId = session.user.id;

  // S4: endpoint ini memicu email & WhatsApp keluar (termasuk pada cabang
  // re-submit) → batasi per IP supaya tidak dipakai mem-bombing penerima.
  const rl = rateLimit(`ppdb:${clientIp(request)}`, {
    limit: 15,
    windowMs: 600_000,
  });
  if (!rl.ok) {
    const message =
      "Terlalu banyak permintaan pendaftaran. Tunggu beberapa menit lalu coba lagi.";
    return NextResponse.json(
      { message, error: message, retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const jurusanOptions = await getPpdbJurusanOptions();
  const labelJurusan = (value: string) => {
    const option = jurusanOptions.find((item) => item.value === value);
    return option ? option.nama + " (" + option.kode + ")" : JurusanLabel(value);
  };
  const result = validatePpdbDraft(
    (payload ?? {}) as Record<string, unknown>,
    jurusanOptions,
  );
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  const draft = result.data;

  const existing = await prisma.ppdbRegistration.findUnique({ where: { userId } });
  if (existing) {
    const emailSent = await sendPpdbConfirmationEmail({
      to: existing.email,
      fullName: existing.fullName,
      registrationNo: existing.registrationNo,
      majorFirst: existing.majorFirst,
      majorSecond: existing.majorSecond,
      majorFirstLabel: labelJurusan(existing.majorFirst),
      majorSecondLabel: labelJurusan(existing.majorSecond),
    });
    if (!emailSent) {
      console.warn(
        `[ppdb] ${existing.registrationNo} sudah terdaftar, email konfirmasi ulang belum terkirim.`
      );
    }
    return NextResponse.json(
      {
        registrationNo: existing.registrationNo,
        status: existing.status,
        alreadyRegistered: true,
        emailDelivered: emailSent,
      },
      { status: 200 }
    );
  }

  const birthDate = new Date(draft.birthDate);
  if (Number.isNaN(birthDate.getTime())) {
    return NextResponse.json(
      { errors: { birthDate: "Tanggal lahir tidak valid." } },
      { status: 400 }
    );
  }

  // Syarat pendaftaran: foto siswa wajib sudah diunggah lewat /api/account/photo.
  // Pendaftar lama (grandfathered) tidak terkena syarat ini karena sudah
  // ditangani cabang `existing` di atas.
  const registrant = await prisma.user.findUnique({
    where: { id: userId },
    select: { photoUpdatedAt: true },
  });
  if (!registrant?.photoUpdatedAt) {
    return NextResponse.json(
      {
        errors: {
          photo:
            "Unggah foto siswa terlebih dahulu — foto merupakan syarat pendaftaran.",
        },
      },
      { status: 400 }
    );
  }

  // C1: nomor urut dari MAX numerik (lihat nextRegistrationNo) — pendaftaran
  // terhapus tidak bikin nomor dipakai ulang; kolom @unique + retry tetap
  // jaring pengaman bila ada pendaftar bersamaan.
  const registrationYear = new Date().getFullYear();
  let registrationNo = await nextRegistrationNo(undefined, registrationYear);

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      const created = await prisma.ppdbRegistration.create({
        data: {
          registrationNo,
          userId,
          fullName: draft.fullName,
          email: draft.email,
          gender: draft.gender,
          birthPlace: draft.birthPlace,
          birthDate,
          previousSchool: draft.previousSchool,
          address: draft.address,
          phone: draft.phone,
          majorFirst: draft.majorFirst,
          majorSecond: draft.majorSecond,
          parentName: draft.parentName,
          parentPhone: draft.parentPhone,
        },
      });
      registrationNo = created.registrationNo;
      await logAudit({
        actorId: userId,
        actorEmail: draft.email,
        action: AUDIT_ACTIONS.PPDB_REGISTERED,
        targetType: "PPDB",
        targetId: created.id,
        detail: `Pendaftaran baru ${created.registrationNo} (${draft.fullName}) — jurusan ${draft.majorFirst}/${draft.majorSecond}`,
      });
      break;
    } catch (error) {
      const isUniqueViolation =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (isUniqueViolation) {
        // Dua request dari akun yang sama bisa lolos pemeriksaan awal secara
        // bersamaan. Pada P2002, cek userId tanpa bergantung pada format meta
        // target Prisma/driver; bila sudah tersimpan, kembalikan nomor lama.
        try {
          const duplicate = await prisma.ppdbRegistration.findUnique({
            where: { userId },
          });
          if (duplicate) {
            const emailSent = await sendPpdbConfirmationEmail({
              to: duplicate.email,
              fullName: duplicate.fullName,
              registrationNo: duplicate.registrationNo,
              majorFirst: duplicate.majorFirst,
              majorSecond: duplicate.majorSecond,
              majorFirstLabel: labelJurusan(duplicate.majorFirst),
              majorSecondLabel: labelJurusan(duplicate.majorSecond),
            });
            return NextResponse.json(
              {
                registrationNo: duplicate.registrationNo,
                status: duplicate.status,
                alreadyRegistered: true,
                emailDelivered: emailSent,
              },
              { status: 200 },
            );
          }
        } catch (lookupError) {
          console.error("[ppdb] Gagal mengecek pendaftaran ganda:", lookupError);
        }
      }

      if (!isUniqueViolation || attempt === 9) {
        console.error("Gagal menyimpan pendaftaran PPDB:", error);
        return NextResponse.json(
          { message: "Terjadi kesalahan. Coba lagi beberapa saat." },
          { status: 500 }
        );
      }
      // Tabrakan registrationNo → ambil ulang nomor berikutnya yang masih bebas.
      registrationNo = await nextRegistrationNo(registrationNo, registrationYear);
    }
  }

  // Notifikasi WhatsApp ke nomor pendaftar dan ke sekretariat.
  // Kegagalan kirim tidak membatalkan pendaftaran: nomor tetap berlaku dan
  // bisa dikirim ulang manual, jadi tetap dicatat di server.
  const studentMessage = buildStudentWaMessage({
    registrationNo,
    fullName: draft.fullName,
    majorFirst: draft.majorFirst,
    majorSecond: draft.majorSecond,
    majorFirstLabel: labelJurusan(draft.majorFirst),
    majorSecondLabel: labelJurusan(draft.majorSecond),
  });
  const adminMessage = buildAdminWaMessage({
    registrationNo,
    fullName: draft.fullName,
    phone: draft.phone,
    majorFirst: draft.majorFirst,
    majorSecond: draft.majorSecond,
    parentName: draft.parentName,
    majorFirstLabel: labelJurusan(draft.majorFirst),
    majorSecondLabel: labelJurusan(draft.majorSecond),
  });

  const [toStudent, toAdmin, emailSent] = await Promise.all([
    sendWhatsApp(draft.phone, studentMessage),
    sendWhatsApp(WA_ADMIN, adminMessage),
    sendPpdbConfirmationEmail({
      to: draft.email,
      fullName: draft.fullName,
      registrationNo,
      majorFirst: draft.majorFirst,
      majorSecond: draft.majorSecond,
      majorFirstLabel: labelJurusan(draft.majorFirst),
      majorSecondLabel: labelJurusan(draft.majorSecond),
    }),
  ]);

  if (toStudent.sent) {
    // C3: update penanda WA hanyalah metadata — DB hiccup sesaat tidak boleh
    // membuat client menerima 500 padahal pendaftaran sudah tersimpan.
    try {
      await prisma.ppdbRegistration.update({
        where: { registrationNo },
        data: { waSentAt: new Date() },
      });
    } catch (error) {
      console.warn(`[ppdb] Gagal menandai waSentAt ${registrationNo}:`, error);
    }
  }

  if (!toStudent.sent || !toAdmin.sent) {
    console.warn(
      `[ppdb] ${registrationNo} tersimpan, WhatsApp belum terkirim ` +
        `(${toStudent.reason ?? toAdmin.reason}). Ringkasan:\n${adminMessage}`
    );
  }
  if (!emailSent) {
    console.warn(
      `[ppdb] ${registrationNo} tersimpan, email konfirmasi ke ${draft.email} belum terkirim.`
    );
  }

  // Fallback tanpa API: pengguna bisa mengirim pesan ke sekretariat sendiri
  // dengan satu klik, memakai pesan yang sudah terisi.
  const waUrl = `https://wa.me/?text=${encodeURIComponent(studentMessage)}`;

  return NextResponse.json(
    {
      registrationNo,
      waUrl,
      whatsappDelivered: toStudent.sent,
      emailDelivered: emailSent,
    },
    { status: 201 }
  );
}
