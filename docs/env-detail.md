# 📋 Environment Variables Documentation

Dokumentasi ini menjelaskan semua environment variables yang digunakan dalam aplikasi gateway.

---

## 🌐 Server & Umum

| Variable  | Contoh      | Keterangan                                                       |
| --------- | ----------- | ---------------------------------------------------------------- |
| `PORT`    | `5498`      | Port tempat gateway berjalan.                                    |
| `APP_URL` | `localhost` | URL publik aplikasi (digunakan untuk generate link, email, dll). |

---

## 🔐 JWT Authentication

| Variable                    | Contoh           | Keterangan                                         |
| --------------------------- | ---------------- | -------------------------------------------------- |
| `JWT_SECRET`                | `jwt_secret_key` | **Rahasia!** Kunci untuk menandatangani token JWT. |
| `REFRESH_TOKEN_EXPIRY_DAYS` | `7`              | Masa berlaku refresh token (dalam hari).           |
| `ACCESS_TOKEN_EXPIRY`       | `15m`            | Masa berlaku access token (`15m`, `1h`, `2d`).     |

---

## 🗄️ Database (DB)

| Variable        | Contoh          | Keterangan                                           |
| --------------- | --------------- | ---------------------------------------------------- |
| `DB_CONNECTION` | `mysql`         | Jenis database (`mysql`, `postgres`, `sqlite`, dll). |
| `DB_HOST`       | `localhost`     | Alamat server database.                              |
| `DB_PORT`       | `3306`          | Port database (default MySQL).                       |
| `DB_USER`       | `(isi sendiri)` | Username database.                                   |
| `DB_PASS`       | `(isi sendiri)` | Password database.                                   |
| `DB_NAME`       | `(isi sendiri)` | Nama database yang digunakan.                        |

---

## 🔌 WebSocket Connection Management

| Variable                     | Contoh  | Keterangan                                     |
| ---------------------------- | ------- | ---------------------------------------------- |
| `WS_HEARTBEAT_INTERVAL`      | `30000` | Interval (ms) server mengirim ping ke client.  |
| `WS_MAX_MISSED_PONGS`        | `2`     | Maksimal missed pong sebelum koneksi diputus.  |
| `WS_SESSION_SUSPEND_TIMEOUT` | `6000`  | Timeout (ms) sebelum session dihapus permanen. |

---

## 🚦 Rate Limiter

### WebSocket Pre-Auth (sebelum login)

| Variable                         | Contoh  | Keterangan                          |
| -------------------------------- | ------- | ----------------------------------- |
| `RATE_LIMIT_WS_PRE_WINDOW_MS`    | `60000` | Jendela waktu (ms).                 |
| `RATE_LIMIT_WS_PRE_MAX_ATTEMPTS` | `20`    | Maks request dalam window tersebut. |

### WebSocket Post-Auth (sesudah login)

| Variable                          | Contoh  | Keterangan                          |
| --------------------------------- | ------- | ----------------------------------- |
| `RATE_LIMIT_WS_POST_WINDOW_MS`    | `60000` | Jendela waktu (ms).                 |
| `RATE_LIMIT_WS_POST_MAX_ATTEMPTS` | `20`    | Maks request dalam window tersebut. |

### REST Pre-Auth (endpoint publik)

| Variable                    | Contoh | Keterangan                       |
| --------------------------- | ------ | -------------------------------- |
| `RATE_LIMIT_REST_PRE_TTL`   | `60`   | TTL dalam detik.                 |
| `RATE_LIMIT_REST_PRE_LIMIT` | `5`    | Maks request dalam TTL tersebut. |

### REST Post-Auth (endpoint terproteksi)

| Variable                     | Contoh | Keterangan                       |
| ---------------------------- | ------ | -------------------------------- |
| `RATE_LIMIT_REST_POST_TTL`   | `60`   | TTL dalam detik.                 |
| `RATE_LIMIT_REST_POST_LIMIT` | `3`    | Maks request dalam TTL tersebut. |

---

## 🔁 Event Store & Retry Mechanism (Reliability)

| Variable                        | Contoh    | Keterangan                                   |
| ------------------------------- | --------- | -------------------------------------------- |
| `EVENT_STORE_MAX_PER_USER`      | `1000`    | Maks event per user.                         |
| `EVENT_STORE_MAX_TOTAL`         | `100000`  | Maks total event global.                     |
| `EVENT_STORE_CLEANUP_INTERVAL`  | `300000`  | Interval pembersihan event (ms).             |
| `EVENT_STORE_DELIVERED_TIMEOUT` | `30000`   | Timeout event delivered dianggap hang.       |
| `EVENT_STORE_STALE_TIMEOUT`     | `3600000` | Timeout event pending dianggap basi (1 jam). |
| `EVENT_STORE_MAX_ATTEMPTS`      | `5`       | Maks retry pengiriman event.                 |
| `EVENT_BACKOFF_BASE`            | `1000`    | Delay awal exponential backoff (ms).         |
| `EVENT_CACHE_TTL`               | `60000`   | TTL cache event (ms).                        |
| `EVENT_RETRY_INTERVAL`          | `3000`    | Interval retry tanpa backoff (ms).           |

---

## 📧 Notifikasi Email (SMTP)

> ⚠️ **Catatan:** Hindari duplikasi `DEFAULT_MAIL_ADDRESS`.

| Variable                 | Contoh              | Keterangan                             |
| ------------------------ | ------------------- | -------------------------------------- |
| `DEFAULT_MAIL_ADDRESS`   | `admin@example.com` | Email pengirim default.                |
| `DEFAULT_EMAIL_PROVIDER` | `smtp`              | Provider email (sementara hanya SMTP). |
| `DEFAULT_MAIL_HOST`      | `smtp.gmail.com`    | Server SMTP.                           |
| `DEFAULT_PORT_MAIL`      | `465`               | Port SMTP (`465` SSL, `587` TLS).      |
| `DEFAULT_MAIL_USERNAME`  | `user@gmail.com`    | Username SMTP.                         |
| `DEFAULT_MAIL_PASSWORD`  | `app-password`      | Password SMTP (gunakan app password).  |
| `DEFAULT_MAIL_SECURE`    | `true`              | `true` untuk SSL/TLS.                  |

---

## ✅ Tips Keamanan

* Jangan pernah commit file `.env` ke repository.
* Gunakan `.env.example` untuk template.
* Simpan secret seperti `JWT_SECRET` di tempat yang aman.
* Gunakan environment berbeda untuk development & production.

---

## 📌 Contoh `.env`

```env
PORT=5498
APP_URL=http://localhost

JWT_SECRET=your_secret
REFRESH_TOKEN_EXPIRY_DAYS=7
ACCESS_TOKEN_EXPIRY=15m

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=secret
DB_NAME=app_db
```
