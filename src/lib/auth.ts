import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, logAudit } from "@/lib/audit";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/rate-limit";

/**
 * Konfigurasi Auth.js (NextAuth v5) dengan Prisma + PostgreSQL.
 *
 * - Google & GitHub: OAuth siap pakai (isi .env dengan client ID/secret).
 * - Credentials: lookup user di database + verifikasi bcrypt hash.
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
      },
      async authorize(credentials, request) {
        try {
          const email =
            typeof credentials?.email === "string" ? credentials.email : "";
          const password =
            typeof credentials?.password === "string" ? credentials.password : "";
          if (!email || !password) return null;

          // Guard brute-force: maksimal 5 percobaan per 5 menit untuk
          // kombinasi email+IP. Dihitung SEBELUM bcrypt.compare supaya
          // percobaan berlebih juga tidak membuang CPU.
          const rlKey = `login:${email.trim().toLowerCase()}|${clientIp(request)}`;
          const rl = rateLimit(rlKey, { limit: 5, windowMs: 5 * 60_000 });
          if (!rl.ok) {
            await logAudit({
              actorEmail: email,
              action: AUDIT_ACTIONS.LOGIN_FAILED,
              targetType: "AUTH",
              detail: `Login ditolak: terlalu banyak percobaan untuk ${email}`,
            });
            return null;
          }

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

          // Login berhasil → bersihkan hitungan agar user sah tidak ikut
          // terkunci oleh kegagalannya sendiri sebelumnya.
          resetRateLimit(rlKey);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          };
        } catch (error) {
          console.error("[Auth Authorize] Error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: { strategy: "jwt" },
  events: {
    /**
     * Audit login OAuth (credentials SUDAH dicatat di authorize() — jadi
     * di sini hanya untuk provider OAuth seperti Google & GitHub).
     */
    async signIn({ user, account, isNewUser }) {
      try {
        if (!user?.id || !account) return;
        if (account.type === "credentials") return;

        const provider = account.provider === "google" ? "Google" : account.provider === "github" ? "GitHub" : account.provider;
        const detail = isNewUser
          ? `Daftar & login berhasil via ${provider} (akun baru)`
          : `Login berhasil via ${provider}`;

        await logAudit({
          actorId: user.id,
          actorEmail: user.email ?? undefined,
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          targetType: "AUTH",
          targetId: user.id,
          detail,
          meta: {
            provider: account.provider,
            isNewUser: Boolean(isNewUser),
          },
        });
      } catch (error) {
        console.error("[Auth Event SignIn] Error:", error);
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
        token.roleSyncedAt = 0;
      }

      const ROLE_SYNC_MS = 30_000;
      const lastSync = typeof token.roleSyncedAt === "number" ? token.roleSyncedAt : 0;
      const needsSync = !token.role || Date.now() - lastSync > ROLE_SYNC_MS;

      // Hanya sync role jika ada token.sub dan perlu sync
      if (token.sub && needsSync) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.roleSyncedAt = Date.now();
          } else {
            // User tidak ditemukan di DB, gunakan role dari token atau default
            token.role = token.role || "USER";
            token.roleSyncedAt = Date.now();
          }
        } catch (error) {
          console.error("[Auth JWT] Error syncing role from DB:", error);
          // Jangan gagalkan session kalau DB error, gunakan role yang ada
          token.role = token.role || "USER";
          token.roleSyncedAt = Date.now();
        }
      }

      return token;
    },
    async session({ session, token }) {
      try {
        if (session.user && token.sub) {
          session.user.id = token.sub as string;
          session.user.role = (token.role as string) || "USER";
        }
      } catch (error) {
        console.error("[Auth Session] Error:", error);
      }
      return session;
    },
  },
});