import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hasPermission } from "@/lib/roles";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import {
  mintSessionToken,
  readSessionPayload,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/impersonation";

/**
 * POST /api/admin/impersonate/exit — keluar dari mode "masuk sebagai user".
 *
 * Catatan guard: endpoint ini TIDAK memakai requireAdmin() karena sesi yang
 * berjalan sekarang adalah milik target (biasanya role USER). Identitas
 * admin asli dibaca dari klaim `impersonatorId` di token sesi, lalu
 * diverifikasi ulang ke database (masih admin? masih ada?).
 */
export async function POST(request: Request) {
  const payload = await readSessionPayload(request);
  const impersonatorId = payload?.impersonatorId;
  const targetId = payload?.sub;
  if (!payload || !impersonatorId || !targetId) {
    return NextResponse.json(
      { error: "Tidak sedang dalam mode masuk sebagai user." },
      { status: 400 }
    );
  }

  const [actor, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: impersonatorId },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.user.findUnique({
      where: { id: targetId },
      select: { email: true },
    }),
  ]);

  if (!actor || !hasPermission(actor.role, "admin.access")) {
    return NextResponse.json(
      { error: "Akun admin asli tidak valid lagi. Silakan login ulang." },
      { status: 403 }
    );
  }

  const cookieName = sessionCookieName(request);
  const token = await mintSessionToken({
    userId: actor.id,
    role: actor.role,
    name: actor.name,
    email: actor.email,
    cookieName,
  });
  const res = NextResponse.json({ ok: true, redirectTo: "/admin" });
  res.cookies.set(cookieName, token, sessionCookieOptions(request));

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.IMPERSONATION_ENDED,
    targetType: "USER",
    targetId,
    detail: `Kembali ke akun admin${
      target?.email ? ` (sebelumnya masuk sebagai ${target.email})` : ""
    }`,
  });

  return res;
}
