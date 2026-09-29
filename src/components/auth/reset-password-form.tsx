"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { CircleCheck, Loader2, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/form-controls";
import { useAuthLanguage } from "@/components/auth/language-provider";

/**
 * Form "Buat kata sandi baru" (dari tautan email reset).
 * Token diambil dari query param `?token=...`.
 *
 * Suspense: useSearchParams membutuhkan boundary Suspense saat
 * prerender statis — dibungkus di halaman (reset-password/page.tsx).
 */
export function ResetPasswordForm() {
  const { t } = useAuthLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [fieldErrors, setFieldErrors] = React.useState<
    Partial<Record<"password" | "confirm", string>>
  >({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [succeeded, setSucceeded] = React.useState(false);

  const invalidLink = !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors: typeof fieldErrors = {};
    if (!password) errors.password = t("error.required");
    else if (password.length < 8) errors.password = t("error.passwordLength");
    if (!confirm) errors.confirm = t("error.required");
    else if (confirm !== password) errors.confirm = t("error.confirmPassword");
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSucceeded(true);
        return;
      }

      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (res.status === 422) {
        setFormError(t("error.resetLink"));
      } else {
        setFormError(data?.message ?? t("error.generic"));
      }
    } catch {
      setFormError(t("error.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  if (succeeded) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100">
          <CircleCheck className="h-8 w-8 text-sky-600" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            {t("newpass.success")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            {t("newpass.successHint")}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          className="h-12 w-full text-[0.95rem]"
          onClick={() => {
            router.push("/auth/login");
            router.refresh();
          }}
        >
          {t("newpass.goToLogin")}
        </Button>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100">
          <ShieldX className="h-8 w-8 text-rose-600" aria-hidden />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">
            {t("reset.heading")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">
            {t("error.resetLink")}
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="h-12 w-full"
          onClick={() => router.push("/auth/forgot-password")}
        >
          {t("reset.resend")}
        </Button>
      </div>
    );
  }

  return (
    <form data-auth-form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Heading */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] sm:leading-tight">
          {t("newpass.heading")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">
          {t("newpass.subheading")}
        </p>
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
        <PasswordInput
          id="reset-password"
          label={t("field.newPassword")}
          name="password"
          autoComplete="new-password"
          placeholder={t("field.newPasswordPlaceholder")}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password ? t("error.passwordLength") : undefined}
          disabled={submitting}
          required
        />

        <PasswordInput
          id="reset-confirm"
          label={t("field.confirmNewPassword")}
          name="confirmPassword"
          autoComplete="new-password"
          placeholder={t("field.confirmPasswordPlaceholder")}
          value={confirm}
          onChange={(e) => {
            setConfirm(e.target.value);
            if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }));
          }}
          error={fieldErrors.confirm ? t("error.confirmPassword") : undefined}
          disabled={submitting}
          required
        />
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
            {t("newpass.submitting")}
          </>
        ) : (
          t("newpass.submit")
        )}
      </Button>
    </form>
  );
}
