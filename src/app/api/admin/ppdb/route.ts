import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";

// GET - List all PPDB registrations (Admin and Super Admin only)
export async function GET() {
  const session = await requireAdmin();
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await prisma.ppdbRegistration.findMany({
      select: {
        id: true,
        registrationNo: true,
        fullName: true,
        email: true,
        status: true,
        majorFirst: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error("Error fetching PPDB registrations:", error);
    return NextResponse.json({ error: "Failed to fetch PPDB registrations" }, { status: 500 });
  }
}