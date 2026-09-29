"use client";

import * as React from "react";
import Link from "next/link";
import { CircleCheck, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthInput } from "@/components/auth/form-controls";
import { useAuthLanguage } from "@/components/auth/language-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Form "Lupa kata sandi": minta email → POST /api/forgot-password.
 * Respons API selalu generik (anti user-enumeration), jadi UI juga
 * selalu menampilkan status "tautan terkirim" bila request sukses.
 */
export function ForgotPasswordForm() {
  const { t } = useAuthLanguage();

  const [email, setEmail] = React.useState("");
  const [fieldError, setFieldError] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFieldError(t("error.required"));
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setFieldError(t("error.email"));
      return;
    }
    setFieldError(null);

    setSubmitting(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setFormError(data?.message ?? t("error.generic"));
        return;
      }
      setSent(true);
    } catch {
      setFormError(t("error.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
          <CircleCheck className="h-8 w-8 text-sky-600" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            {t("reset.sent")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            {t("reset.sentHint")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full"
          onClick={() => setSent(false)}
          disabled={submitting}
        >
          {t("reset.resend")}
        </Button>
        <p className="text-sm text-slate-500">
          <Link
            href="/auth/login"
            className="rounded-sm font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2"
          >
            {t("reset.backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form data-auth-form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] sm:leading-tight">
          {t("reset.heading")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{t("reset.subheading")}</p>
      </div>

      {formError ? (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50/70 px-3.5 py-2.5 text-sm text-rose-700"
        >
          <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
          {formError}
        </div>
      ) : null}

      <AuthInput
        id="forgot-email"
        label={t("field.email")}
        type="email"
        name="email"
        autoComplete="email"
        placeholder={t("field.emailPlaceholder")}
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldError) setFieldError(null);
        }}
        error={fieldError ?? undefined}
        icon={<Mail className="h-4 w-4" aria-hidden />}
        disabled={submitting}
        required
      />

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        aria-busy={submitting}
        className="h-12 w-full text-[0.95rem] active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {t("reset.submitting")}
          </>
        ) : (
          t("reset.submit")
        )}
      </Button>

      <p className="text-center text-sm text-slate-500">
        <Link
          href="/auth/login"
          className="rounded-sm font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2"
        >
          {t("reset.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
