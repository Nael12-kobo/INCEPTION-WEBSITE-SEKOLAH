"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthInput,
  PasswordInput,
  AuthCheckbox,
  AuthDivider,
} from "@/components/auth/form-controls";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { useAuthLanguage } from "@/components/auth/language-provider";
import type { AuthMessageKey } from "@/lib/auth-dictionary";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REMEMBER_KEY = "auth-remember-email";

type FieldErrors = Partial<Record<"email" | "password", string>>;

/** localStorage sebagai external store (pola yang direkomendasikan React). */
function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getRememberedEmail(): string {
  return window.localStorage.getItem(REMEMBER_KEY) ?? "";
}

function getEmptyString(): string {
  return "";
}

export function LoginForm() {
  const { t } = useAuthLanguage();
  const router = useRouter();

  // Email tersimpan "Ingat saya": null/on server, nilai tersimpan di client.
  // Setelah pengguna mulai mengetik, input pengguna yang dipakai (bukan fallback).
  const rememberedEmail = React.useSyncExternalStore(
    subscribeStorage,
    getRememberedEmail,
    getEmptyString
  );
  const [typedEmail, setTypedEmail] = React.useState<string | null>(null);
  const email = typedEmail ?? rememberedEmail;

  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [succeeded, setSucceeded] = React.useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!email.trim()) errors.email = t("error.required");
    else if (!EMAIL_RE.test(email.trim())) errors.email = t("error.email");
    if (!password) errors.password = t("error.required");
    else if (password.length < 8) errors.password = t("error.passwordLength");
    return errors;
  };

  const handleBlur = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => {
      const value = field === "email" ? email : password;
      if (!value) return prev;
      const next = validate();
      return { ...prev, [field]: next[field] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      if (remember) window.localStorage.setItem(REMEMBER_KEY, email.trim());
      else window.localStorage.removeItem(REMEMBER_KEY);

      /**
       * Titik integrasi credentials: authorize() di src/lib/auth.ts
       * mengecek bcrypt + rate limit brute-force.
       */
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setFormError(t("error.credentials"));
        return;
      }

      setSucceeded(true);
      /**
       * Hormati callbackUrl (20+ tempat meng-redirect ke
       * `/auth/login?callbackUrl=...`, mis. /admin, /ppdb, /dashboard).
       * Dulu selalu dilempar ke /dashboard sehingga user yang mencoba
       * buka /admin berakhir di dashboard.
       *
       * Hanya path relatif yang diterima supaya tidak jadi open redirect:
       * tolak `//domain` dan `/\domain` (browser memperlakukan `\` = `/`).
       */
      const cb = new URLSearchParams(window.location.search).get("callbackUrl");
      const safeCallback =
        cb && cb.startsWith("/") && !cb.startsWith("//") && !cb.includes("\\")
          ? cb
          : null;
      router.push(safeCallback ?? "/dashboard");
      router.refresh();
    } catch {
      setFormError(t("error.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (key: keyof FieldErrors, messageKey: AuthMessageKey) =>
    fieldErrors[key] ? t(messageKey) : undefined;

  return (
    <form data-auth-form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] sm:leading-tight">
          {t("login.heading")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{t("login.subheading")}</p>
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

      <div className="space-y-4">
        <AuthInput
          id="login-email"
          label={t("field.email")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t("field.emailPlaceholder")}
          value={email}
          onChange={(e) => setTypedEmail(e.target.value)}
          onBlur={() => handleBlur("email")}
          error={fieldError("email", "error.email")}
          icon={<Mail className="h-4 w-4" aria-hidden />}
          disabled={submitting}
          required
        />

        <PasswordInput
          id="login-password"
          label={t("field.password")}
          name="password"
          autoComplete="current-password"
          placeholder={t("field.passwordPlaceholder")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          onBlur={() => handleBlur("password")}
          error={fieldError("password", "error.passwordLength")}
          disabled={submitting}
          required
        />
      </div>

      {/* Remember + forgot */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <AuthCheckbox
          id="login-remember"
          label={t("login.remember")}
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />

        <Link
          href="/auth/forgot-password"
          className="rounded-sm text-sm font-medium text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2"
        >
          {t("login.forgot")}
        </Link>
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={submitting || succeeded}
        aria-busy={submitting}
        className="h-12 w-full text-[0.95rem] active:scale-[0.99]"
      >
        {submitting ? (
          <>
            <Loader2 className="animate-spin" aria-hidden />
            {t("login.submitting")}
          </>
        ) : (
          t("login.submit")
        )}
      </Button>

      <AuthDivider label={t("divider")} />

      <SocialAuthButtons />

      <p className="text-center text-sm text-slate-500">
        {t("login.noAccount")}{" "}
        <Link
          href="/auth/register"
          className="rounded-sm font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2"
        >
          {t("login.createAccount")}
        </Link>
      </p>
    </form>
  );
}
