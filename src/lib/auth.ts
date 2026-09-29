import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { Provider } from "next-auth/providers";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";

/**
 * Konfigurasi Auth.js (NextAuth v5) dengan Prisma + PostgreSQL.
 *
 * - Google & GitHub: OAuth siap pakai (isi .env dengan client ID/secret).
 * - Credentials: lookup user di database + verifikasi bcrypt hash.
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google,
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
      },
      async authorize(credentials) {
        const email =
          typeof credentials?.email === "string" ? credentials.email : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          await logAudit({
            actorEmail: email,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            targetType: "AUTH",
            detail: `Percobaan login gagal untuk ${email} (akun tidak ditemukan / tanpa password)`,
          });
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          await logAudit({
            actorId: user.id,
            actorEmail: user.email,
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            targetType: "AUTH",
            detail: `Percobaan login gagal untuk ${email} (password salah)`,
          });
          return null;
        }

        await logAudit({
          actorId: user.id,
          actorEmail: user.email,
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          targetType: "AUTH",
          targetId: user.id,
          detail: `Login berhasil via email & kata sandi`,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ] as Provider[],
  pages: {
    signIn: "/auth/login",
  },
  session: { strategy: "jwt" },
  events: {
    /** Audit login OAuth (credentials sudah dicatat di authorize). */
    async signIn({ user }) {
      if (user?.id && typeof (user as { role?: unknown }).role === "undefined") {
        await logAudit({
          actorId: user.id,
          actorEmail: user.email,
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          targetType: "AUTH",
          targetId: user.id,
          detail: "Login berhasil via OAuth",
        });
      }
    },
  },
  callbacks: {
    /**
     * Strategy "jwt" hanya menyimpan user id pada token.sub — default session
     * callback Auth.js tidak menyalinnya ke session.user.id. Tanpa ini
     * session.user.id selalu undefined, sehingga guard /dashboard memantulkan
     * user balik ke halaman login (loop).
     *
     * Role selalu di-sync dari DB agar perubahan role (admin panel) langsung
     * berlaku tanpa menunggu login ulang, dan OAuth ikut mendapat role default.
     */
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        if (typeof user.role === "string") {
          token.role = user.role;
        }
        // Paksa refresh role segera setelah login.
        token.roleSyncedAt = 0;
      }

      const ROLE_SYNC_MS = 30_000;
      const lastSync = typeof token.roleSyncedAt === "number" ? token.roleSyncedAt : 0;
      const needsSync = !token.role || Date.now() - lastSync > ROLE_SYNC_MS;

      if (token.sub && needsSync) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true },
          });
          token.role = dbUser?.role ?? token.role ?? "USER";
          token.roleSyncedAt = Date.now();
        } catch {
          token.role = token.role ?? "USER";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as string) || "USER";
      }
      return session;
    },
  },
});
