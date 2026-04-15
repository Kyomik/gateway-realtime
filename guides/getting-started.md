# Getting Started – Panduan Pengguna Gateway

Dokumen ini menjelaskan cara **terhubung dan menggunakan** WebSocket gateway sebagai tenant (pengguna gateway). Anda akan belajar:

- Mendapatkan token autentikasi sesuai tipe client (browser, device, desktop)
- Membuka koneksi WebSocket
- Mengirim dan menerima event
- Menangani error umum

---

## 1. Tipe Client dan Metode Autentikasi

Gateway mendukung tiga tipe client, masing-masing dengan metode autentikasi berbeda:

| Tipe Client | Metode Auth | Token Didapatkan Dari |
|-------------|-------------|------------------------|
| **browser** (Web App) | JWT (Bearer token) | Endpoint `POST /auth/token` dengan `client_id`, `secret_key`, `role` |
| **device** (IoT) | HMAC signature | Dihitung sendiri menggunakan `key_device` (tidak ada endpoint login) |
| **desktop** (Electron, dll) | Firebase ID token | Login ke Firebase, dapatkan token ID |

> Anda harus sudah memiliki `client_id`, `secret_key` (browser) atau `key_device` (device) atau konfigurasi Firebase project (desktop) dari administrator gateway.

---

## 2. Mendapatkan Token

### 2.1 Untuk Browser (JWT)

**Request ke endpoint gateway:**

```http
POST /auth/token
Content-Type: application/json

{
  "client_id": "nama-tenant-anda",
  "secret_key": "kunci-rahasia-anda",
  "role": "admin"
}
```

**Response sukses:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "expires_in": 900
}
```

`access_token` digunakan untuk koneksi WebSocket (valid 15 menit).
`refresh_token` digunakan untuk mendapatkan token baru (endpoint `/auth/refresh`).

### 2.2 Untuk Device (HMAC)

Device tidak perlu login. Anda harus memiliki `key_device` yang sudah didaftarkan oleh administrator. Setiap koneksi WebSocket menyertakan payload JSON yang ditandatangani dengan HMAC-SHA256.

**Format payload (wajib):**

```json
{
  "clientId": "nama-tenant-anda",
  "deviceId": "sensor-001",
  "timestamp": 1702656000000,
  "signature": "a1b2c3d4e5f67890..."
}
```

**Cara menghitung signature:**

```text
message = deviceId + timestamp + clientId
signature = HMAC-SHA256(key_device, message)
```

> Timestamp dalam milidetik. Gateway hanya menerima selisih waktu ≤ 5 menit.

### 2.3 Untuk Desktop (Firebase)

Login ke Firebase menggunakan SDK Firebase di aplikasi desktop Anda, dapatkan **ID token**.  
Token ini akan dikirim bersama parameter `clientId` saat koneksi WebSocket.

> Pastikan tenant sudah memiliki konfigurasi Firebase project di gateway (dikelola administrator).

---

## 3. Membuka Koneksi WebSocket

Gunakan library WebSocket standar (browser: `WebSocket`, Node.js: `ws`, dll).  
URL gateway: `ws://gateway-anda:5498` (sesuaikan host dan port).

### 3.1 Browser (JWT)

Sertakan token sebagai query parameter:

```text
ws://localhost:5498?type=browser&token=eyJhbGciOiJIUzI1NiIs...
```

### 3.2 Device (HMAC)

Sertakan payload HMAC yang sudah di‑stringify sebagai query parameter `token`:

```text
ws://localhost:5498?type=device&token={"clientId":"tenant-anda","deviceId":"sensor-001","timestamp":1702656000000,"signature":"..."}
```

> **URL-encode** payload JSON terlebih dahulu.

### 3.3 Desktop (Firebase)

Sertakan token dan `clientId`:

```text
ws://localhost:5498?type=desktop&token=firebase-id-token&clientId=tenant-anda
```

## 4. Mengirim Event

**Format Payload JSON**

```json
{
  "event": "nama_event",
  "data": { ... }
}
```

**Contoh mengirim event rfid-scan dari device:**

```json
{
  "event": "rfid-scan",
  "data": {
    "uid": "12345",
    "mode": "login"
  }
}
```

### 4.1 Event dengan QoS 2 (memerlukan ack)

Jika event membutuhkan jaminan pengiriman (QoS 2), Anda akan menerima event dengan field meta:

```json
{
  "event": "result-scan",
  "data": { ... },
  "meta": { "eventId": "uuid-xxxx" }
}
```

Anda wajib mengirim balasan event:ack dalam waktu yang ditentukan:

```json
{
  "event": "event:ack",
  "data": {
    "eventId": "uuid-xxxx",
    "message": "OK"
  }
}
```

> Jika tidak mengirim ack, gateway akan mengirim ulang event.

### 5. Menerima Event

Gateway akan mengirim event ke client yang berhak menerima. Format pesan:

```json
{
  "event": "nama_event_untuk_penerima",
  "data": { ... }
}
```

Contoh browser menerima event result-scan dari device:

```json
{
  "event": "result-scan",
  "data": {
    "uid": "12345",
    "status": "success",
    "nama": "Budi"
  }
}
```

### 6 Menangani Error

Jika terjadi error (misal event tidak diizinkan, token expired), gateway akan mengirim:

```json
{
  "event": "error",
  "code": "FORBIDDEN_EVENT",
  "message": "Akses event ditolak"
}
```

**Daftar kode error umum:**

| Code | Arti |
|------|------|
| `TOKEN_EXPIRED` | Token kadaluwarsa, harus login ulang |
| `INVALID_TOKEN` | Token tidak valid |
| `UNAUTHENTICATED` | Autentikasi gagal (client tidak dikenali) |
| `FORBIDDEN_EVENT` | Event tidak diizinkan untuk role/device ini |
| `INVALID_JSON` | Payload bukan JSON valid |
| `SYSTEM_ERROR` | Gangguan internal gateway atau backend |

---

## 7. Refresh Token (khusus browser)

Sebelum `access_token` kadaluwarsa (15 menit), lakukan refresh dengan mengirim `POST /auth/refresh`:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "550e8400-e29b-41d4-a716-446655440000"
}
```

Response memberikan `access_token` baru. Kemudian buka koneksi WebSocket baru dengan token tersebut.

---

## 8. Troubleshooting

| Masalah | Kemungkinan Penyebab |
|---------|----------------------|
| Koneksi ditutup langsung (1008) | Token tidak valid, kadaluwarsa, atau `type` salah |
| Event tidak sampai ke penerima | Whitelist/blacklist tidak mengizinkan event untuk role/device tersebut |
| Error `FORBIDDEN_EVENT` | Event tidak termasuk dalam daftar yang diizinkan untuk pengirim |
| Event tidak terkirim padahal sudah sukses | Periksa apakah receiver sedang offline (QoS 0 tidak disimpan) |

Untuk informasi lebih lanjut tentang event yang tersedia (daftar event, format payload, penerima yang diizinkan), lihat [Available Events](./available-events.md).

---

## Referensi

- [Available Events](./available-events.md) – Daftar event dan formatnya.
- [Client Examples](./client-examples.md) – Contoh kode lebih lengkap untuk berbagai platform.
- [Security Module (dokumentasi internal)](../docs/security.md) – Penjelasan teknis autentikasi (untuk developer).