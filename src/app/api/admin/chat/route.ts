import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/chat
 * Ringkasan evaluasi chatbot untuk /admin/chat:
 * - agregat feedback 👍/👎 (total + persentase)
 * - daftar feedback terbaru (dengan pertanyaan & jawaban snapshot)
 * - ringkasan percakapan tersimpan (user login)
 */
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalUp, totalDown, recent, conversationCount, userCount] =
      await Promise.all([
        prisma.chatFeedback.count({ where: { rating: "UP" } }),
        prisma.chatFeedback.count({ where: { rating: "DOWN" } }),
        prisma.chatFeedback.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
          select: {
            id: true,
            messageId: true,
            question: true,
            answer: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        }),
        prisma.chatConversation.count(),
        prisma.user.count({ where: { chatConversations: { some: {} } } }),
      ]);

    const total = totalUp + totalDown;
    const helpfulPct = total === 0 ? null : Math.round((totalUp / total) * 100);

    return NextResponse.json({
      summary: {
        totalUp,
        totalDown,
        total,
        helpfulPct,
        conversationCount,
        userCount,
      },
      recent,
    });
  } catch (error) {
    console.error("Error fetching chat evaluation:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat evaluation" },
      { status: 500 }
    );
  }
}
