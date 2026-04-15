# 🔐 Security

Dokumentasi ini mencakup mekanisme keamanan yang diterapkan: **autentikasi multi-metode** dan **rate limiting** untuk API serta WebSocket.

> Semua variabel environment yang terkait (seperti `JWT_SECRET`, `REFRESH_TOKEN_EXPIRY_DAYS`, `RATE_LIMIT_*`, dll.) dijelaskan di [Environment Variables](./env-detail.md).

---

## 🚦 Rate Limiter

Rate limiter pada proyek ini sudah diterapkan pada endpoint API dan komunikasi WebSocket.
Pattern yang digunakan adalah **Factory** dan **Strategy**, sehingga fleksibel untuk mengganti storage atau menambah aturan tanpa mengubah kode inti.

**Storage saat ini:** `in-memory` (Redis sudah tersedia tetapi belum diaktifkan).

---

### ⚙️ Alur Teknis

1. Request masuk (HTTP/WebSocket).
2. Guard atau handler memicu pengecekan rate limit (`preConnect` / `postConnect`).
3. `KeyExtractorFactory` menghasilkan key unik.
4. `RateLimitService` mencatat request ke storage.
5. Jika limit terlampaui:

   * REST → `429 Too Many Requests`
   * WS → koneksi ditolak / error dikirim

---

### 🏭 Factory

| Factory                   | Fungsi                         |
| ------------------------- | ------------------------------ |
| `RatelimitStorageFactory` | Menyediakan storage rate limit |
| `KeyExtractorFactory`     | Menentukan key unik request    |

---

### 🔄 Phase Rate Limiting

| Phase        | Keterangan          |
| ------------ | ------------------- |
| Pre-Connect  | Sebelum autentikasi |
| Post-Connect | Setelah autentikasi |

> ⚠️ WebSocket hanya menggunakan **Pre-Connect** saat ini.

---

### 📌 Implementasi

#### REST API

```ts
@UseGuards(RestRateLimitGuard)
@Post('login')
@RateLimit('preConnect')
async login() {}
```

#### WebSocket

```ts
await this.wsRateLimitGuard.validate(request, 'preConnect');
```

---

### 🔧 Ekstensibilitas

#### Ganti Storage

1. Implement `IStorageRateLimit`
2. Daftarkan ke factory
3. Set `RATE_LIMIT_STORAGE=redis`

#### Tambah Key Extractor

1. Implement `KeyExtractor`
2. Daftarkan ke factory

---

## 🔐 Autentikasi

Menggunakan pattern **Strategy** untuk mendukung berbagai metode.

### Metode yang Didukung

| Metode   | Target  | Cara Kerja                     |
| -------- | ------- | ------------------------------ |
| JWT      | Browser | Token via header Authorization |
| HMAC     | IoT     | Signature SHA256 + timestamp   |
| Firebase | Desktop | Verifikasi via Firebase Admin  |

---

### 🔑 Format HMAC

```json
{
  "clientId": "acme-iot",
  "deviceId": "sensor-001",
  "timestamp": "1702656000000",
  "signature": "abcdef..."
}
```

Signature:

```
HMAC-SHA256(key_device, deviceId + timestamp + clientId)
```

---

### 🔄 Alur Autentikasi WebSocket

1. Client connect dengan query:

   * `type`
   * `token`
2. Gateway memanggil `AuthService`
3. Strategy dipilih:

   * browser → JWT
   * device → HMAC
   * desktop → Firebase
4. Token diverifikasi
5. Jika sukses → auth disimpan di socket
6. Jika gagal → koneksi ditolak

---

### ❌ Error Code

| Kode                  | Deskripsi           |
| --------------------- | ------------------- |
| TOKEN_EXPIRED         | Token kadaluarsa    |
| INVALID_TOKEN         | Token tidak valid   |
| INVALID_SIGNATURE     | Signature salah     |
| UNAUTHENTICATED       | Gagal autentikasi   |
| INVALID_TOKEN_FORMAT  | Format salah        |
| UNSUPPORTED_AUTH_TYPE | Tipe tidak didukung |

---

### 🧠 Strategy

| Strategy             | Untuk   |
| -------------------- | ------- |
| JwtAuthStrategy      | Browser |
| HmacAuthStrategy     | Device  |
| FireBaseAuthStrategy | Desktop |

---

### 📦 Metadata Setelah Login

#### Browser

* whitelist send/get
* products

#### Device

* blacklist send/get
* products

Digunakan untuk kontrol routing event.

---

## 🔄 Refresh Token

* Endpoint: `/auth/refresh`
* One-time use
* Disimpan di DB
* Default: 7 hari

---

## 🌐 Endpoint Auth

| Endpoint      | Method | Rate Limit  |
| ------------- | ------ | ----------- |
| /auth/token   | POST   | preConnect  |
| /auth/refresh | POST   | postConnect |
| /auth/logout  | POST   | postConnect |

---

### 📥 Contoh Request

```http
POST /auth/token
Content-Type: application/json

{
  "client_id": "acme-web",
  "secret_key": "secret",
  "role": "admin"
}
```

### 📤 Response

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900
}
```

---

## ➕ Menambah Strategy Baru

```ts
export interface IAuthStrategy {
  validate(token: string, clientId?: string): Promise<AuthResult>;
}
```

Langkah:

1. Buat strategy
2. Implement validate
3. Register ke `strategyMap`
4. Gunakan `type` baru di client

---

## 📚 Referensi

* Environment Variables
* Communication Module
* Reliability Module
