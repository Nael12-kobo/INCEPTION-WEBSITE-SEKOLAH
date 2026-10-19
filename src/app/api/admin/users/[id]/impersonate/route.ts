import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canImpersonate } from "@/lib/roles";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import {
  mintSessionToken,
  sessionCookieName,
  sessionCookieOptions,
} from "@/lib/impersonation";

/**
 * POST /api/admin/users/[id]/impersonate — "Masuk sebagai" user target.
 *
 * Hanya untuk akun admin, hanya ke role yang lebih rendah (lihat
 * `canImpersonate`), dan selalu tercatat di audit log. Tidak memerlukan
 * password target: sesi dibuat langsung di server.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const actorId = session?.user?.id;
  if (!actorId) {
    return NextResponse.json({ error: "Belum masuk akun." }, { status: 401 });
  }

  const { id: targetId } = await params;
  if (!targetId || targetId === actorId) {
    return NextResponse.json(
      { error: "Tidak bisa masuk sebagai akun sendiri." },
      { status: 400 }
    );
  }

  const [actor, target] = await Promise.all([
    prisma.user.findUnique({
      where: { id: actorId },
      select: { id: true, name: true, email: true, role: true },
    }),
    prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true },
    }),
  ]);

  if (!actor) {
    return NextResponse.json(
      { error: "Akun admin tidak ditemukan." },
      { status: 401 }
    );
  }
  if (!target) {
    return NextResponse.json(
      { error: "User target tidak ditemukan." },
      { status: 404 }
    );
  }
  if (!canImpersonate(actor.role, target.role)) {
    return NextResponse.json(
      { error: "Hanya boleh masuk sebagai akun dengan role lebih rendah." },
      { status: 403 }
    );
  }

  const token = await mintSessionToken({
    userId: target.id,
    role: target.role,
    impersonatorId: actor.id,
  });

  const res = NextResponse.json({ ok: true, redirectTo: "/dashboard" });
  res.cookies.set(sessionCookieName(), token, sessionCookieOptions());

  await logAudit({
    actorId: actor.id,
    actorEmail: actor.email,
    action: AUDIT_ACTIONS.IMPERSONATION_STARTED,
    targetType: "USER",
    targetId: target.id,
    detail: `Masuk sebagai ${target.email ?? target.id} (role ${target.role})`,
  });

  return res;
}
