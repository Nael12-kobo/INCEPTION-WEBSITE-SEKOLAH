/**
 * Kamus teks untuk halaman autentikasi.
 * Bahasa dipilih via AuthLanguageProvider (toggle di halaman) dan
 * tersimpan di localStorage. Aman dipakai di server component juga.
 */

export type Locale = "id" | "en";

export const LOCALES: Locale[] = ["id", "en"];

const id = {
  "reset.heading": "Lupa kata sandi?",
  "reset.subheading": "Masukkan email Anda dan kami kirim tautan untuk membuat kata sandi baru.",
  "reset.submit": "Kirim tautan reset",
  "reset.submitting": "Mengirim…",
  "reset.sent": "Tautan reset telah dikirim.",
  "reset.sentHint": "Periksa kotak masuk (dan folder spam) Anda. Tautan berlaku 1 jam.",
  "reset.resend": "Kirim ulang tautan",
  "reset.backToLogin": "Kembali ke halaman masuk",

  "newpass.heading": "Buat kata sandi baru",
  "newpass.subheading": "Kata sandi baru minimal 8 karakter.",
  "newpass.submit": "Simpan kata sandi baru",
  "newpass.submitting": "Menyimpan…",
  "newpass.success": "Kata sandi berhasil diubah!",
  "newpass.successHint": "Silakan masuk dengan kata sandi baru Anda.",
  "newpass.goToLogin": "Masuk sekarang",

  "field.newPassword": "Kata sandi baru",
  "field.newPasswordPlaceholder": "Minimal 8 karakter",
  "field.confirmNewPassword": "Konfirmasi kata sandi baru",

  "error.resetLink": "Tautan reset tidak valid atau sudah digunakan.",
  "error.resetExpired": "Tautan reset kedaluwarsa. Minta tautan baru.",

  "login.heading": "Selamat datang kembali",
  "login.subheading": "Masuk untuk melanjutkan ke akun Anda.",
  "login.submit": "Masuk",
  "login.submitting": "Memproses…",
  "login.noAccount": "Belum punya akun?",
  "login.createAccount": "Daftar sekarang",

  "register.heading": "Buat akun baru",
  "register.subheading": "Mulai perjalanan Anda bersama kami.",
  "register.submit": "Buat Akun",
  "register.submitting": "Membuat akun…",
  "register.haveAccount": "Sudah punya akun?",
  "register.signIn": "Masuk",

  "field.fullName": "Nama lengkap",
  "field.fullNamePlaceholder": "Budi Santoso",
  "field.email": "Email",
  "field.emailPlaceholder": "nama@sekolah.sch.id",
  "field.password": "Kata sandi",
  "field.passwordPlaceholder": "Minimal 8 karakter",
  "field.confirmPassword": "Konfirmasi kata sandi",
  "field.confirmPasswordPlaceholder": "Ulangi kata sandi",

  "login.remember": "Ingat saya",
  "login.forgot": "Lupa kata sandi?",
  "register.terms": "Saya setuju dengan",
  "register.termsLink": "Syarat & Ketentuan",
  "register.termsAnd": "serta",
  "register.privacyLink": "Kebijakan Privasi",

  "divider": "atau lanjutkan dengan",
  "google": "Google",
  "github": "GitHub",
  "googleLoading": "Menghubungkan…",
  "githubLoading": "Menghubungkan…",

  "error.required": "Wajib diisi.",
  "error.email": "Format email tidak valid.",
  "error.passwordLength": "Kata sandi minimal 8 karakter.",
  "error.confirmPassword": "Konfirmasi kata sandi tidak cocok.",
  "error.terms": "Anda harus menyetujui syarat & ketentuan.",
  "error.credentials": "Email atau kata sandi salah.",
  "error.generic": "Terjadi kesalahan. Coba lagi.",

  "panel.quote":
    "“Sekolah vokasi modern — mencetak lulusan siap kerja, siap kuliah, dan siap berwirausaha.”",
  "panel.caption": "SMK Telekomunikasi Tunas Harapan",
  "langToggle": "Bahasa",
} as const;

const en: Record<keyof typeof id, string> = {
  "reset.heading": "Forgot your password?",
  "reset.subheading": "Enter your email and we'll send a link to create a new password.",
  "reset.submit": "Send reset link",
  "reset.submitting": "Sending…",
  "reset.sent": "Reset link sent.",
  "reset.sentHint": "Check your inbox (and spam folder). The link is valid for 1 hour.",
  "reset.resend": "Resend link",
  "reset.backToLogin": "Back to sign in",

  "newpass.heading": "Create a new password",
  "newpass.subheading": "Your new password must be at least 8 characters.",
  "newpass.submit": "Save new password",
  "newpass.submitting": "Saving…",
  "newpass.success": "Password updated!",
  "newpass.successHint": "Please sign in with your new password.",
  "newpass.goToLogin": "Sign in now",

  "field.newPassword": "New password",
  "field.newPasswordPlaceholder": "At least 8 characters",
  "field.confirmNewPassword": "Confirm new password",

  "error.resetLink": "This reset link is invalid or has already been used.",
  "error.resetExpired": "This reset link has expired. Request a new one.",

  "login.heading": "Welcome back",
  "login.subheading": "Sign in to continue to your account.",
  "login.submit": "Sign in",
  "login.submitting": "Signing in…",
  "login.noAccount": "Don't have an account?",
  "login.createAccount": "Create account",

  "register.heading": "Create your account",
  "register.subheading": "Start your journey with us.",
  "register.submit": "Create account",
  "register.submitting": "Creating account…",
  "register.haveAccount": "Already have an account?",
  "register.signIn": "Sign in",

  "field.fullName": "Full name",
  "field.fullNamePlaceholder": "John Carter",
  "field.email": "Email",
  "field.emailPlaceholder": "name@school.edu",
  "field.password": "Password",
  "field.passwordPlaceholder": "At least 8 characters",
  "field.confirmPassword": "Confirm password",
  "field.confirmPasswordPlaceholder": "Repeat your password",

  "login.remember": "Remember me",
  "login.forgot": "Forgot password?",
  "register.terms": "I agree to the",
  "register.termsLink": "Terms & Conditions",
  "register.termsAnd": "and",
  "register.privacyLink": "Privacy Policy",

  "divider": "or continue with",
  "google": "Google",
  "github": "GitHub",
  "googleLoading": "Connecting…",
  "githubLoading": "Connecting…",

  "error.required": "This field is required.",
  "error.email": "Enter a valid email address.",
  "error.passwordLength": "Password must be at least 8 characters.",
  "error.confirmPassword": "Passwords do not match.",
  "error.terms": "You must agree to the terms & conditions.",
  "error.credentials": "Incorrect email or password.",
  "error.generic": "Something went wrong. Please try again.",

  "panel.quote":
    "“A modern vocational school — graduating students ready to work, study, and build their own business.”",
  "panel.caption": "SMK Telekomunikasi Tunas Harapan",
  "langToggle": "Language",
};

export const dictionaries: Record<Locale, Record<keyof typeof id, string>> = {
  id,
  en,
};

export type AuthMessageKey = keyof typeof id;
