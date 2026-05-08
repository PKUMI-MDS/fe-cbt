# Deploy FE CBT ke VPS

Panduan ini untuk deploy `fe-cbt` Next.js app ke VPS dengan:

- Nginx sebagai reverse proxy
- PM2 sebagai process manager
- npm sebagai package manager
- Port aplikasi: `3009`
- Domain: `cat.miftadigital.cloud`

## 1. Prasyarat

Pastikan VPS sudah punya:

```bash
node -v
npm -v
pm2 -v
nginx -v
```

`fe-cbt` memakai Next.js 14. Disarankan pakai Node.js 20 LTS atau 22 LTS.

## 2. DNS Domain

Di DNS provider, arahkan domain ke IP VPS:

```text
Type: A
Name: cat
Value: IP_VPS_KAMU
TTL: Auto
```

Hasil akhirnya:

```text
cat.miftadigital.cloud
```

## 3. Clone atau Pull Project

Contoh jika repo langsung berisi app `fe-cbt`:

```bash
cd /var/www
git clone <REPO_URL> fe-cbt
cd /var/www/fe-cbt
```

Kalau project sudah ada:

```bash
cd /var/www/fe-cbt
git pull
```

Jika repo utama berisi folder `fe-cbt`, pakai path seperti ini:

```bash
cd /var/www/CBT-TOAFL/fe-cbt
git pull
```

Sesuaikan path dengan struktur VPS lu.

## 4. Buat Environment File

Buat `.env.local`:

```bash
nano .env.local
```

Isi:

```env
NEXT_PUBLIC_API_BASE_URL=https://be-cbt.miftadigital.cloud/api
```

Catatan:

- `NEXT_PUBLIC_API_BASE_URL` akan dibaca frontend untuk request ke backend API.
- Karena prefix `NEXT_PUBLIC_`, value ini memang masuk ke bundle browser. Jangan isi secret di env ini.

## 5. Install Dependency

Karena `fe-cbt` memakai `package-lock.json`, gunakan npm:

```bash
npm ci
```

Kalau sedang development dan lockfile belum sinkron:

```bash
npm install
```

Untuk production, rekomendasi tetap:

```bash
npm ci
```

## 6. Build Project

```bash
npm run build
```

Jika build gagal karena Node version, cek:

```bash
node -v
```

Gunakan Node.js 20 LTS atau 22 LTS.

## 7. Jalankan dengan PM2 Ecosystem di Port 3009

Project ini menyediakan `ecosystem.config.js` untuk PM2. Isi utamanya menjalankan Next.js production server:

```js
module.exports = {
  apps: [
    {
      name: "fe-cbt",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3009",
      cwd: __dirname,
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: "3009",
      },
    },
  ],
};
```

Jalankan app:

```bash
pm2 start ecosystem.config.js
```

Cek status:

```bash
pm2 status
pm2 logs fe-cbt
```

Simpan process PM2 agar auto start setelah reboot:

```bash
pm2 save
pm2 startup
```

Ikuti command lanjutan yang ditampilkan oleh `pm2 startup`.

## 8. Konfigurasi Nginx

Buat server block:

```bash
sudo nano /etc/nginx/sites-available/cat.miftadigital.cloud
```

Isi:

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name cat.miftadigital.cloud;

    client_max_body_size 20M;

    location / {
        proxy_pass http://127.0.0.1:3009;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan config:

```bash
sudo ln -s /etc/nginx/sites-available/cat.miftadigital.cloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Kalau symlink sudah ada, cek:

```bash
ls -la /etc/nginx/sites-enabled/
```

## 9. Pasang SSL HTTPS

Kalau Certbot belum ada:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

Generate SSL:

```bash
sudo certbot --nginx -d cat.miftadigital.cloud
```

Cek auto-renew:

```bash
sudo certbot renew --dry-run
```

Setelah SSL aktif, akses:

```text
https://cat.miftadigital.cloud
```

## 10. Update Deploy Setelah Pull

Setiap ada update code:

```bash
cd /var/www/fe-cbt
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js --only fe-cbt
```

Kalau path repo berbeda:

```bash
cd /var/www/CBT-TOAFL/fe-cbt
git pull
npm ci
npm run build
pm2 reload ecosystem.config.js --only fe-cbt
```

## 11. Troubleshooting

### App tidak bisa diakses

Cek PM2:

```bash
pm2 status
pm2 logs fe-cbt
```

Cek apakah port `3009` listen:

```bash
ss -tulpn | grep 3009
```

Cek Nginx:

```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### API tidak connect

Cek `.env.local`:

```bash
cat .env.local
```

Pastikan:

```env
NEXT_PUBLIC_API_BASE_URL=https://be-cbt.miftadigital.cloud/api
```

Lalu rebuild dan reload:

```bash
npm run build
pm2 reload ecosystem.config.js --only fe-cbt
```

### Build gagal

Cek Node dan dependency:

```bash
node -v
npm -v
npm ci
npm run build
```

Jika `npm ci` gagal karena lockfile tidak sinkron, jalankan di local:

```bash
npm install
```

Lalu commit perubahan `package-lock.json`.

## 12. Quick Command Summary

```bash
cd /var/www/fe-cbt
git pull
npm ci
npm run build
pm2 start ecosystem.config.js
pm2 save
sudo nginx -t
sudo systemctl reload nginx
```

Production URL:

```text
https://cat.miftadigital.cloud
```
