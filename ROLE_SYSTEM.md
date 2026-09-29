# Role-Based Access Control (RBAC)

Sumber kebenaran di kode: `src/lib/roles.ts`  
(`ROLE_PERMISSIONS`, `ROLE_ACCESS_MATRIX`, helper `hasPermission` / `can*`).

## Hierarki
`SUPER_ADMIN` > `ADMIN` > `USER`

| | USER | ADMIN | SUPER_ADMIN |
|---|:---:|:---:|:---:|
| Dashboard personal | ✓ | ✓ | ✓ |
| Daftar PPDB | ✓ | ✗ | ✗ |
| Panel admin | ✗ | ✓ | ✓ |
| Lihat semua user | ✗ | ✓ | ✓ |
| Edit nama/email user | ✗ | USER saja | ADMIN + USER |
| Ubah role | ✗ | ✗ | ✓* |
| Hapus user | ✗ | ✗ | ✓* |
| Kelola PPDB (status/hapus) | ✗ | ✓ | ✓ |
| Role & Izin | ✗ | ✓ | ✓ |
| Audit Log | ✗ | ✗ | ✓ |

\* Tidak boleh menyentuh akun sendiri atau SUPER_ADMIN lain.

## Ringkasan peran

### USER
- Login, dashboard, profil sendiri
- Mendaftar PPDB (1x) + lihat status sendiri
- Tidak masuk `/admin`

### ADMIN
- Semua akses portal kecuali daftar PPDB
- Overview admin, lihat user, edit data **USER** saja
- Kelola semua pendaftaran PPDB (status + hapus)
- Lihat matrix Role & Izin + pengaturan
- **Tidak** ubah role, hapus user, atau buka Audit Log

### SUPER_ADMIN
- Semua yang ADMIN bisa
- Edit ADMIN & USER; ubah role; hapus ADMIN & USER
- Audit Log
- Tidak edit/hapus/ubah role SUPER_ADMIN lain atau diri sendiri

## Setup akun awal
| Email | Password | Role |
|---|---|---|
| `superadmin@example.com` | `superadmin123` | SUPER_ADMIN |
| `admin@example.com` | `admin123` | ADMIN |

Ganti password setelah login pertama.

## API
- `GET/PUT /api/admin/users` — list (admin+); ubah role (super only)
- `PATCH/DELETE /api/admin/users/[id]` — edit/hapus sesuai permission
- `GET /api/admin/ppdb` — list (admin+)
- `PATCH/DELETE /api/admin/ppdb/[id]` — status/hapus (admin+)
- `POST /api/ppdb` — daftar (USER only via `canRegisterPpdb`)

## UI
Matrix lengkap: `/admin/roles` (ADMIN & SUPER_ADMIN).
