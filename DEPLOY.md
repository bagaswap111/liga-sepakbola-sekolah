# Deploy Liga Jateng SMA ke VPS (dengan Caddy yang sudah ada)

## Arsitektur di VPS

```
Internet (80/443)
    │
    ▼
 [Caddy] ── HTTPS otomatis ── liga.domain.com → localhost:3200
    │
    ▼
[liga_frontend] :3200 (nginx internal)
    ├── /           → serve React SPA (static files)
    ├── /api/*      → proxy → liga_backend:5000
    └── /uploads/*  → proxy → liga_backend:5000
         │
         ▼
    [liga_backend] :4200→5000 (Express API)
         │
         ▼
    [liga_db] (PostgreSQL, internal only)
```

## Port yang digunakan

| Container | Port Internal | Port Host (127.0.0.1) |
|-----------|--------------|----------------------|
| liga_frontend | 80 | 3200 |
| liga_backend | 5000 | 4200 |
| liga_db | 5432 | tidak diekspos |

Pastikan port 3200 dan 4200 tidak konflik dengan app lain di VPS.

---

## Langkah Deploy

### 1. Upload/Clone project ke VPS

```bash
# Opsi A: clone dari GitHub
git clone https://github.com/bagaswap111/liga-sepakbola-sekolah.git /opt/liga-sepakbola
cd /opt/liga-sepakbola

# Opsi B: upload zip lalu extract
unzip liga-sepakbola-sekolah.zip -d /opt/
mv /opt/liga-sepakbola /opt/liga-sepakbola
cd /opt/liga-sepakbola
```

### 2. Setup environment

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Isi backend/.env (wajib diubah):
```env
PORT=5000
DB_HOST=liga_db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=GantiPasswordKuat123!
DB_NAME=liga_jateng
JWT_SECRET=RandomStringPanjangSekurangnya32Karakter
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://liga.namadomain.com
ADMIN_EMAIL=admin@ligajateng.com
ADMIN_PASSWORD=AdminPasswordKuat!
```

### 3. Jalankan containers

```bash
docker compose up -d --build
```

Cek semua container running:
```bash
docker compose ps
# Harusnya: liga_db (healthy), liga_backend (running), liga_frontend (running)
```

Cek log kalau ada error:
```bash
docker compose logs -f backend
```

### 4. Tambahkan ke Caddyfile

Cari file Caddyfile yang dipakai oleh container Caddy:
```bash
# Cek volume Caddy
docker inspect caddy | grep -A5 "Mounts"
# Biasanya di /etc/caddy/Caddyfile atau di folder project whistleblower
```

Tambahkan blok ini ke Caddyfile yang ada:
```caddy
liga.namadomain.com {
    reverse_proxy localhost:3200
}
```

Reload Caddy (tanpa restart):
```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

### 5. Test

```bash
# Test backend langsung
curl http://localhost:4200/health
# → {"status":"ok","timestamp":"..."}

# Test via frontend/nginx
curl http://localhost:3200/api/public/news
# → []

# Test domain (setelah Caddy dikonfigurasi)
curl https://liga.namadomain.com/api/public/news
```

---

## Update aplikasi

```bash
cd /opt/liga-sepakbola
git pull  # atau upload zip baru

docker compose up -d --build
# Hanya container yang berubah yang di-rebuild
```

## Backup database

```bash
# Backup
docker exec liga_db pg_dump -U postgres liga_jateng > backup-liga-$(date +%Y%m%d).sql

# Restore
cat backup-liga-20260413.sql | docker exec -i liga_db psql -U postgres liga_jateng
```

## Troubleshooting

```bash
# Container tidak mau start
docker compose logs backend
docker compose logs frontend

# Database connection error
docker compose logs db

# Reset semua (HATI-HATI: hapus data)
docker compose down -v
docker compose up -d --build

# Masuk ke container backend
docker exec -it liga_backend sh
```
