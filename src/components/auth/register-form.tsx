"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthInput,
  PasswordInput,
  AuthCheckbox,
  AuthDivider,
} from "@/components/auth/form-controls";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { useAuthLanguage } from "@/components/auth/language-provider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type FieldKey = "name" | "email" | "password" | "confirm" | "terms";
type FieldErrors = Partial<Record<FieldKey, string>>;

export function RegisterForm() {
  const { t } = useAuthLanguage();
  const router = useRouter();

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [succeeded, setSucceeded] = React.useState(false);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = t("error.required");
    if (!email.trim()) errors.email = t("error.required");
    else if (!EMAIL_RE.test(email.trim())) errors.email = t("error.email");
    if (!password) errors.password = t("error.required");
    else if (password.length < 8) errors.password = t("error.passwordLength");
    if (!confirm) errors.confirm = t("error.required");
    else if (confirm !== password) errors.confirm = t("error.confirmPassword");
    if (!agree) errors.terms = t("error.terms");
    return errors;
  };

  const clearError = (key: FieldKey) =>
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      /**
       * Titik integrasi pendaftaran: endpoint stub di src/app/api/register.
       * Hubungkan dengan backend/user store yang sebenarnya di sana —
       * kontrak: 201 → sukses, 4xx/5xx → tampilkan `message`.
       */
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setFormError(data?.message ?? t("error.generic"));
        return;
      }

      // Akun dibuat → langsung masuk dan arahkan ke beranda.
      await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });
      setSucceeded(true);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setFormError(t("error.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form data-auth-form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] sm:leading-tight">
          {t("register.heading")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{t("register.subheading")}</p>
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
          id="register-name"
          label={t("field.fullName")}
          type="text"
          name="name"
          autoComplete="name"
          placeholder={t("field.fullNamePlaceholder")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) clearError("name");
          }}
          error={fieldErrors.name ? t("error.required") : undefined}
          icon={<User className="h-4 w-4" aria-hidden />}
          disabled={submitting}
          required
        />

        <AuthInput
          id="register-email"
          label={t("field.email")}
          type="email"
          name="email"
          autoComplete="email"
          placeholder={t("field.emailPlaceholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) clearError("email");
          }}
          error={fieldErrors.email ? t("error.email") : undefined}
          icon={<Mail className="h-4 w-4" aria-hidden />}
          disabled={submitting}
          required
        />

        <PasswordInput
          id="register-password"
          label={t("field.password")}
          name="password"
          autoComplete="new-password"
          placeholder={t("field.passwordPlaceholder")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) clearError("password");
          }}
          error={fieldErrors.password ? t("error.passwordLength") : undefined}
          disabled={submitting}
          required
        />

        <PasswordInput
          id="register-confirm"
          label={t("field.confirmPassword")}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t("field.confirmPasswordPlaceholder")}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (fieldErrors.confirm) clearError("confirm");
          }}
          error={fieldErrors.confirm ? t("error.confirmPassword") : undefined}
          disabled={submitting}
          required
        />
      </div>

      <AuthCheckbox
        id="register-terms"
        name="terms"
        checked={agree}
        onChange={(e) => {
          setAgree(e.target.checked);
          if (fieldErrors.terms) clearError("terms");
        }}
        error={fieldErrors.terms ? t("error.terms") : undefined}
        disabled={submitting}
        label={
          <>
            {t("register.terms")}{" "}
            <Link
              href="/"
              className="font-medium text-sky-600 underline-offset-4 hover:text-sky-700 hover:underline"
            >
              {t("register.termsLink")}
            </Link>{" "}
            {t("register.termsAnd")}{" "}
            <Link
              href="/"
              className="font-medium text-sky-600 underline-offset-4 hover:text-sky-700 hover:underline"
            >
              {t("register.privacyLink")}
            </Link>
          </>
        }
      />

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
            {t("register.submitting")}
          </>
        ) : (
          t("register.submit")
        )}
      </Button>

      <AuthDivider label={t("divider")} />

      <SocialAuthButtons />

      <p className="text-center text-sm text-slate-500">
        {t("register.haveAccount")}{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 focus-visible:ring-offset-2 rounded-sm"
        >
          {t("register.signIn")}
        </Link>
      </p>
    </form>
  );
}
