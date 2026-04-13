# ⚽ Liga Sepakbola SMA Jawa Tengah

Portal resmi kompetisi sepakbola antar SMA se-Jawa Tengah. Platform full-stack siap deploy dengan fitur lengkap.

## 🚀 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Backend | Node.js · Express · TypeScript · TypeORM |
| Frontend | React 18 · Vite · Tailwind CSS · React Query |
| Database | PostgreSQL 16 |
| Auth | JWT (Role: admin / team) |
| Upload | Multer (file lokal, max 5MB) |
| Deploy | Docker Compose |

---

## ✨ Fitur

### Publik
- 🏠 Homepage: berita terbaru, jadwal mendatang, hasil pertandingan
- 📅 Jadwal & Hasil (filter status)
- 🏆 Klasemen otomatis (hitung W/D/L/GD/PTS)
- 👥 Profil tim & lineup pemain per posisi
- 📰 Berita & informasi liga

### Dashboard Tim
- 📝 Pendaftaran mandiri (buat akun + data tim)
- 👤 Edit profil tim (pelatih, manajer, alamat)
- ⚽ Tambah/hapus pemain + upload dokumen (kartu pelajar, surat izin ortu, surat sehat, foto)
- 💳 Upload bukti transfer pendaftaran & asuransi
- 📆 Lihat jadwal & hasil pertandingan tim sendiri

### Dashboard Admin
- 📊 Statistik ringkas (total tim, pemain, pertandingan, berita)
- ✅ Verifikasi / tolak pendaftaran tim (beserta alasan penolakan)
- 💰 Konfirmasi pembayaran pendaftaran & asuransi per tim
- ⚽ CRUD pertandingan (jadwal, skor, venue, grup, status)
- 📰 CRUD berita (dengan upload gambar)
- 👤 Hapus pemain dari sistem

---

## 🛠️ Menjalankan Lokal

### Prasyarat
- Docker Desktop terinstall
- Git

### Langkah

```bash
# 1. Clone repo
git clone https://github.com/bagaswap111/liga-sepakbola-sekolah.git
cd liga-sepakbola-sekolah

# 2. Buat file .env backend
cp backend/.env.example backend/.env
# Edit backend/.env sesuai kebutuhan (atau biarkan default)

# 3. Jalankan semua service
docker compose up --build

# Akses:
# Frontend  → http://localhost
# Backend   → http://localhost:5000
# API Docs  → http://localhost:5000/health
```

### Login Default Admin
```
Email    : admin@ligajateng.com
Password : Admin1234!
```

---

## 🌐 Deploy ke VPS

### Prasyarat VPS
- Ubuntu 22.04 / Debian 11
- Docker & Docker Compose v2
- Domain (opsional, untuk HTTPS)

### Langkah Deploy

```bash
# 1. SSH ke VPS
ssh root@YOUR_VPS_IP

# 2. Install Docker
curl -fsSL https://get.docker.com | sh

# 3. Clone repo
git clone https://github.com/bagaswap111/liga-sepakbola-sekolah.git
cd liga-sepakbola-sekolah

# 4. Setup .env backend PRODUCTION
cp backend/.env.example backend/.env
nano backend/.env
# Ganti:
#   DB_PASSWORD=passwordkuat123
#   JWT_SECRET=randomstringpanjangsekali
#   ADMIN_PASSWORD=PasswordAdminKuat!
#   FRONTEND_URL=https://yourdomain.com

# 5. Build & jalankan
docker compose up -d --build

# 6. Cek status
docker compose ps
docker compose logs -f backend
```

### Update Aplikasi

```bash
git pull
docker compose up -d --build
```

---

## 📁 Struktur Proyek

```
liga-sepakbola-sekolah/
├── backend/
│   ├── src/
│   │   ├── config/        # DataSource (TypeORM)
│   │   ├── controllers/   # auth, team, admin, public
│   │   ├── entities/      # Team, Player, Match, News, User
│   │   ├── middleware/     # JWT auth
│   │   ├── routes/        # authRoutes, teamRoutes, adminRoutes, publicRoutes
│   │   └── utils/         # multer upload config
│   ├── uploads/           # File upload (di-mount volume Docker)
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── contexts/      # AuthContext
│   │   ├── layouts/       # PublicLayout, AdminLayout, TeamLayout
│   │   ├── pages/
│   │   │   ├── AdminDashboard/   # Dashboard, Teams, Matches, News, Players
│   │   │   └── TeamDashboard/    # Dashboard, Profile, Players, Payment, Schedule
│   │   └── services/      # axios instance
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

### Public (tanpa auth)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/public/teams | Daftar tim terverifikasi |
| GET | /api/public/teams/:id | Detail tim |
| GET | /api/public/matches | Semua pertandingan |
| GET | /api/public/news | Berita published |
| GET | /api/public/standings | Klasemen |

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Daftar tim baru |
| GET | /api/auth/me | Info user login |

### Team (JWT required, role: team)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/team/my-team | Data tim sendiri |
| PUT | /api/team/my-team | Update profil tim |
| POST | /api/team/players | Tambah pemain |
| DELETE | /api/team/players/:id | Hapus pemain |
| POST | /api/team/payment-proof | Upload bukti bayar |
| POST | /api/team/insurance-proof | Upload bukti asuransi |
| GET | /api/team/my-matches | Jadwal tim sendiri |

### Admin (JWT required, role: admin)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | /api/admin/stats | Statistik dashboard |
| GET | /api/admin/teams | Semua tim |
| PUT | /api/admin/teams/verify | Verifikasi tim |
| PUT | /api/admin/teams/confirm-payment | Konfirmasi bayar |
| DELETE | /api/admin/teams/:id | Hapus tim |
| GET/POST | /api/admin/matches | CRUD pertandingan |
| PUT/DELETE | /api/admin/matches/:id | Update/hapus |
| GET/POST | /api/admin/news | CRUD berita |
| PUT/DELETE | /api/admin/news/:id | Update/hapus |
| GET/DELETE | /api/admin/players | Kelola pemain |

---

## 📝 Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan liga sekolah.
