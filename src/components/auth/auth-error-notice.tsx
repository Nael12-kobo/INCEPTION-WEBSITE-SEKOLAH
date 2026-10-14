"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CircleAlert, House, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthLanguage } from "@/components/auth/language-provider";

/**
 * Pesan untuk kode error Auth.js (https://errors.authjs.dev).
 * Kode yang tidak dikenal memakai `errorPage.generic`.
 */
const ERROR_KEYS = {
  Configuration: "errorPage.configuration",
  AccessDenied: "errorPage.accessDenied",
  Verification: "errorPage.verification",
  OAuthAccountNotLinked: "errorPage.notLinked",
  OAuthSignin: "errorPage.oauth",
  OAuthCreateAccount: "errorPage.oauth",
  Callback: "errorPage.oauth",
  EmailSignin: "errorPage.oauth",
  CredentialsSignin: "errorPage.credentials",
  SessionRequired: "errorPage.sessionRequired",
  Default: "errorPage.generic",
} as const;

type ErrorKey = (typeof ERROR_KEYS)[keyof typeof ERROR_KEYS];

/**
 * Isi halaman /auth/error.
 * Membaca `?error=<kode>` dari Auth.js dan menampilkan penjelasan ramah
 * (bukan 404) untuk semua kode error login yang mungkin.
 */
export function AuthErrorNotice() {
  const searchParams = useSearchParams();
  const { t } = useAuthLanguage();

  const code = searchParams.get("error");
  const key: ErrorKey = code && code in ERROR_KEYS
    ? ERROR_KEYS[code as keyof typeof ERROR_KEYS]
    : "errorPage.generic";

  return (
    <div>
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
        <CircleAlert className="h-6 w-6" aria-hidden />
      </span>

      <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
        {t("errorPage.heading")}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {t(key)}
      </p>

      {code ? (
        <p className="mt-3 font-caption text-xs text-slate-400">
          Kode: <span className="font-mono">{code}</span>
        </p>
      ) : null}

      <div className="mt-7 space-y-3">
        <Button asChild size="lg" className="h-12 w-full text-[0.95rem]">
          <Link href="/auth/login">
            <LogIn aria-hidden />
            {t("errorPage.backToLogin")}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 w-full text-[0.95rem]">
          <Link href="/">
            <House aria-hidden />
            {t("errorPage.home")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
