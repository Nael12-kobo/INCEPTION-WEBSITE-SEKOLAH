import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/role-utils";
import {
  WA_ADMIN,
  buildAdminWaMessage,
  buildStudentWaMessage,
  isJurusan,
  registrationNoFromCount,
  validatePpdbDraft,
} from "@/lib/ppdb";
import { sendWhatsApp } from "@/lib/ppdb-wa";

/**
 * Endpoint pendaftaran PPDB.
 *
 * Wajib login (calon siswa membuat akun dulu) dan satu akun hanya boleh
 * mendaftar sekali. Nomor pendaftaran dibuat server sebagai rujukan resmi.
 *
 * Kontrak dengan PpdbForm:
 * - 201 → { registrationNo, waUrl } pendaftar baru
 * - 200 → registrationNo yang sama, bila user sudah pernah mendaftar
 * - 400 → { errors } per-field, dari validatePpdbDraft yang sama
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
  
  // Only USER role can register for PPDB
  if (session.user.role !== UserRole.USER) {
    return NextResponse.json(
      { message: "Hanya peran USER yang dapat mendaftar PPDB." },
      { status: 403 }
    );
  }
  
  const userId = session.user.id;

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
    return NextResponse.json(
      {
        registrationNo: existing.registrationNo,
        status: existing.status,
        alreadyRegistered: true,
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

  // Nomor urut dari jumlah pendaftar; kolom @unique menangkap tabrakan
  // akibat dua request bersamaan, lalu diulang dengan offset.
  const count = await prisma.ppdbRegistration.count();
  let registrationNo = registrationNoFromCount(count);

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
      break;
    } catch (error) {
      const isUniqueViolation =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isUniqueViolation || attempt === 4) {
        console.error("Gagal menyimpan pendaftaran PPDB:", error);
        return NextResponse.json(
          { message: "Terjadi kesalahan. Coba lagi beberapa saat." },
          { status: 500 }
        );
      }
      registrationNo = registrationNoFromCount(count + attempt + 1);
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

  const [toStudent, toAdmin] = await Promise.all([
    sendWhatsApp(draft.phone, studentMessage),
    sendWhatsApp(WA_ADMIN, adminMessage),
  ]);

  if (toStudent.sent) {
    await prisma.ppdbRegistration.update({
      where: { registrationNo },
      data: { waSentAt: new Date() },
    });
  }

  if (!toStudent.sent || !toAdmin.sent) {
    console.warn(
      `[ppdb] ${registrationNo} tersimpan, WhatsApp belum terkirim ` +
        `(${toStudent.reason ?? toAdmin.reason}). Ringkasan:\n${adminMessage}`
    );
  }

  // Fallback tanpa API: pengguna bisa mengirim pesan ke sekretariat sendiri
  // dengan satu klik, memakai pesan yang sudah terisi.
  const waUrl = `https://wa.me/?text=${encodeURIComponent(studentMessage)}`;

  return NextResponse.json(
    { registrationNo, waUrl, whatsappDelivered: toStudent.sent },
    { status: 201 }
  );
}
