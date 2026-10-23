import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canRegisterPpdb } from "@/lib/role-utils";
import {
  WA_ADMIN,
  buildAdminWaMessage,
  buildStudentWaMessage,
  isJurusan,
  registrationNoFromSeq,
  validatePpdbDraft,
} from "@/lib/ppdb";
import { sendWhatsApp } from "@/lib/ppdb-wa";
import { sendPpdbConfirmationEmail } from "@/lib/ppdb-email";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Nomor pendaftaran berikutnya dari urutan TERTINGGI yang masih ada di DB
 * (C1). `count()` dipakai dulu; setelah admin menghapus pendaftaran, count()
 * menunjuk nomor lama sehingga nomor dipakai ulang dan >5 tabrakan menghabiskan
 * retry → 500 padahal form valid. Dengan MAX, nomor yang sudah terpakai selalu
 * terlewati. Fallback bila agregat gagal: +1 dari nomor yang sedang dipegang.
 */
async function nextRegistrationNo(current?: string): Promise<string> {
  const year = new Date().getFullYear();
  const seqFrom = (no: string | null | undefined): number | null => {
    const m = no ? /^PPDB-(\d{4})-(\d+)$/.exec(no) : null;
    if (!m) return null;
    return Number(m[1]) === year ? Number(m[2]) + 1 : null;
  };
  try {
    const agg = await prisma.ppdbRegistration.aggregate({
      _max: { registrationNo: true },
    });
    const seq = seqFrom(agg._max.registrationNo);
    return registrationNoFromSeq(seq ?? 1, year);
  } catch (error) {
    console.warn("[ppdb] Gagal agregasi nomor pendaftaran, pakai fallback:", error);
    const seq = seqFrom(current);
    return registrationNoFromSeq(seq ?? 1, year);
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

  const result = validatePpdbDraft((payload ?? {}) as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ errors: result.errors }, { status: 400 });
  }
  const draft = result.data;

  if (!isJurusan(draft.majorFirst) || !isJurusan(draft.majorSecond)) {
    return NextResponse.json({ message: "Pilihan jurusan tidak valid." }, { status: 400 });
  }

  const existing = await prisma.ppdbRegistration.findUnique({ where: { userId } });
  if (existing) {
    const emailSent = await sendPpdbConfirmationEmail({
      to: existing.email,
      fullName: existing.fullName,
      registrationNo: existing.registrationNo,
      majorFirst: existing.majorFirst,
      majorSecond: existing.majorSecond,
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

  // C1: nomor urut dari agregat MAX (lihat nextRegistrationNo) — pendaftaran
  // terhapus tidak bikin nomor dipakai ulang; kolom @unique + retry tetap
  // jaring pengaman bila ada pendaftar bersamaan.
  let registrationNo = await nextRegistrationNo();

  for (let attempt = 0; attempt < 5; attempt += 1) {
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
        // C2: tabrakan userId = double-submit user yang sama (request kembar
        // lolos cek `existing` di atas karena keduanya membaca sebelum tulis).
        // Samakan responsnya dengan cabang "sudah pernah mendaftar": 200
        // alreadyRegistered — BUKAN retry yang pasti habis lalu 500.
        const target = (error.meta as { target?: unknown } | undefined)?.target;
        const dupOnUserId = Array.isArray(target)
          ? target.includes("userId")
          : target === "userId";
        if (dupOnUserId) {
          const dup = await prisma.ppdbRegistration.findUnique({
            where: { userId },
          });
          if (dup) {
            const emailSent = await sendPpdbConfirmationEmail({
              to: dup.email,
              fullName: dup.fullName,
              registrationNo: dup.registrationNo,
              majorFirst: dup.majorFirst,
              majorSecond: dup.majorSecond,
            });
            return NextResponse.json(
              {
                registrationNo: dup.registrationNo,
                status: dup.status,
                alreadyRegistered: true,
                emailDelivered: emailSent,
              },
              { status: 200 }
            );
          }
        }
      }

      if (!isUniqueViolation || attempt === 4) {
        console.error("Gagal menyimpan pendaftaran PPDB:", error);
        return NextResponse.json(
          { message: "Terjadi kesalahan. Coba lagi beberapa saat." },
          { status: 500 }
        );
      }
      // Tabrakan registrationNo → ambil ulang nomor berikutnya yang masih bebas.
      registrationNo = await nextRegistrationNo(registrationNo);
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
  });
  const adminMessage = buildAdminWaMessage({
    registrationNo,
    fullName: draft.fullName,
    phone: draft.phone,
    majorFirst: draft.majorFirst,
    majorSecond: draft.majorSecond,
    parentName: draft.parentName,
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
