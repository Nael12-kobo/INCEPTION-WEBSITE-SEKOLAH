import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/role-utils";
import { prisma } from "@/lib/prisma";
import {
  AdminChatClient,
  type ChatFeedbackRow,
  type ChatMissRow,
  type ChatSummary,
} from "@/components/admin/admin-chat-client";

export const metadata = {
  title: "Evaluasi Chat AI — Admin Panel | SMK Tunas Harapan",
  description:
    "Feedback pengguna dan statistik kualitas jawaban asisten AI sekolah.",
};

export default async function AdminChatPage() {
  const session = await requireAdmin();
  if (!session) {
    redirect("/auth/login?callbackUrl=/admin/chat");
  }

  const [totalUp, totalDown, recent, conversationCount, userCount, missRows] =
    await Promise.all([
      prisma.chatFeedback.count({ where: { rating: "UP" } }),
      prisma.chatFeedback.count({ where: { rating: "DOWN" } }),
      prisma.chatFeedback.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        select: {
          id: true,
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
      // Pertanyaan tanpa kecocokan keyword knowledge — urut frekuensi.
      prisma.chatMissLog.findMany({
        orderBy: { count: "desc" },
        take: 50,
        select: {
          id: true,
          question: true,
          count: true,
          lastAt: true,
        },
      }),
    ]);

  const total = totalUp + totalDown;
  const summary: ChatSummary = {
    totalUp,
    totalDown,
    total,
    helpfulPct: total === 0 ? null : Math.round((totalUp / total) * 100),
    conversationCount,
    userCount,
  };

  const rows: ChatFeedbackRow[] = recent.map((r) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    rating: r.rating,
    comment: r.comment,
    userName: r.user?.name ?? null,
    userEmail: r.user?.email ?? null,
    createdAt: r.createdAt.toISOString(),
  }));

  const miss: ChatMissRow[] = missRows.map((m) => ({
    id: m.id,
    question: m.question,
    count: m.count,
    lastAt: m.lastAt.toISOString(),
  }));

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="font-h1 text-slate-900">Evaluasi Chat AI</h1>
        <p className="font-body text-slate-500">
          Feedback 👍/👎 dari pengguna atas jawaban asisten AI — bahan untuk
          memperbaiki basis pengetahuan chatbot.
        </p>
      </div>

      <AdminChatClient summary={summary} initialRows={rows} missRows={miss} />
    </div>
  );
}
