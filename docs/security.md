# 🔐 Security

Dokumentasi ini mencakup mekanisme keamanan yang diterapkan: **autentikasi multi-metode** dan **rate limiting** untuk API serta WebSocket.

> Semua variabel environment yang terkait (seperti `JWT_SECRET`, `REFRESH_TOKEN_EXPIRY_DAYS`, `RATE_LIMIT_*`, dll.) dijelaskan di [Environment Variables](./env-detail.md).

---

## Rate Limiter

Rate limiter pada proyek ini sudah diterapkan pada endpoint API dan komunikasi WebSocket.  
Pattern yang digunakan adalah **Factory** dan **Strategy**, sehingga Anda dapat mengganti storage (misal dari memory ke Redis) atau menambah aturan key extractor tanpa mengubah kode inti.

**Saat ini storage yang digunakan:** `in-memory` (Redis sudah siap secara kode namun dinonaktifkan).

### Alur Teknis (Cara Kerja)

1. Request masuk (HTTP atau WebSocket).
2. Guard (atau panggilan manual) memicu pengecekan rate limit dengan rule tertentu (`preConnect` / `postConnect`).
3. `KeyExtractorFactory` menghasilkan key unik (misal `ip:token` untuk WS pre‑connect, atau header `Authorization` untuk REST post‑connect).
4. `RateLimitService` yang dipanggil dari guard memanggil storage (in‑memory) untuk menambah hitungan key tersebut dalam jendela waktu yang ditentukan.
5. Jika melebihi batas, request diblokir dan mengembalikan response `429 Too Many Requests`.  
   Untuk WebSocket, koneksi ditolak atau dikirim pesan error rate‑limit.

### Factory yang Tersedia

| Factory | Fungsi |
|---------|--------|
| `RatelimitStorageFactory` | Menyediakan storage untuk menyimpan data rate limit (counter, waktu blokir). |
| `KeyExtractorFactory` | Menyediakan strategy untuk mengekstrak key unik dari request (berdasarkan IP, token, dll). |

> **Catatan Storage:** Storage yang digunakan (`memory` atau `redis`) ditentukan melalui environment variable `RATE_LIMIT_STORAGE`.

> **Catatan Key Extractor:** Untuk REST API, key extractor yang dipilih ditentukan oleh **decorator** `@RateLimit()`. Untuk WebSocket, key extractor ditentukan melalui **parameter kedua** pada fungsi `validate()`.

### Dua Phase Rate Limiting

| Phase | Keterangan |
|-------|-------------|
| **Pre‑Connect** | Sebelum autentikasi. Membatasi percobaan login, handshake WebSocket, dll. |
| **Post‑Connect** | Setelah autentikasi. Membatasi request berdasarkan identitas user yang sudah login. |

> **Catatan WebSocket:** Rate limiter untuk WebSocket **hanya diterapkan pada fase pre‑connect**. Post‑connect untuk WebSocket belum tersedia.

### Penerapan

#### REST API

- Menggunakan **decorator** `@RateLimit('preConnect')` atau `@RateLimit('postConnect')` dan **Guard** (fitur NestJS).
- Contoh pada `auth.controller` (pre‑connect) dan `notification.controller` (post‑connect).

```typescript
@UseGuards(RestRateLimitGuard)
@Post('login')
@RateLimit('preConnect')
async login() { ... }

#### WebSocket

- WebSocket murni (`@WebSocketGateway`) tidak mendukung Guard maupun decorator NestJS, sehingga pemakaiannya dengan pendekatan DI (layaknya service biasa).
- Rate limiter dipanggil secara manual di dalam service websocket-gateway menggunakan `WebsocketRateLimitGuard`.

```typescript
await this.wsRateLimitGuard.validate(request, 'preConnect');
```

## Ekstensibilitas

### Mengganti Storage

Anda bisa mengganti storage dari memory ke Redis (atau lainnya) dengan cara:

1. Membuat class yang mengimplementasikan interface `IStorageRateLimit`.
2. Menambahkan provider tersebut ke `RatelimitStorageFactory`.
3. Mengatur environment variable `RATE_LIMIT_STORAGE=redis`.

### Menambah Aturan Key Extractor untuk WebSocket

Anda bisa membuat class pada provider bagian WS dengan cara:

1. Membuat class yang mengimplementasikan interface `KeyExtractor`.
2. Menambahkan extractor tersebut ke `KeyExtractorFactory`.

---

## Autentikasi

Pattern yang digunakan adalah **Strategy**, sehingga Anda dapat menambahkan metode autentikasi baru tanpa mengubah kode inti.

Gateway mendukung tiga metode autentikasi, masing-masing ditujukan untuk tipe klien yang berbeda:

| Metode | Target Pengguna | Cara Kerja |
|--------|----------------|-------------|
| **JWT** (JSON Web Token) | Browser / Web App | Gateway bertindak sebagai **centralized authentication server** untuk tipe browser. Token dikirim melalui header `Authorization: Bearer <token>`. |
| **HMAC** (Hash-based Message Authentication Code) | IoT / Device | Device memiliki `key_device` (secret). Setiap request ditandatangani dengan HMAC-SHA256. Gateway memverifikasi hash dan timestamp (max 5 menit). |
| **Firebase Token** | Desktop App (Electron, dll) | Token dari Firebase Authentication diverifikasi menggunakan Firebase Admin SDK melalui `ProviderFactory` per tenant. |

> **Catatan Centralized Authentication:** Untuk tipe **browser**, gateway bertindak sebagai **token issuer** sekaligus verifier (JWT). Untuk tipe device dan desktop, gateway hanya **memverifikasi** token yang diterbitkan oleh sistem lain (HMAC signature atau Firebase). Tidak ada mekanisme shared JWT secret antar layanan.

### ProviderFactory untuk Firebase

Gateway menggunakan `ProviderFactory` untuk mengelola koneksi Firebase per tenant. Setiap tenant dapat memiliki konfigurasi Firebase sendiri yang disimpan di tabel `firebase_config`:

| Kolom | Deskripsi |
|-------|-------------|
| `clientId` | ID tenant (relasi ke `client`). |
| `projectId` | Firebase project ID. |
| `clientEmail` | Email service account Firebase. |
| `privateKey` | Private key service account (dalam format string dengan `\n`). |

`AuthProviderFactory` akan membaca konfigurasi tersebut dan membuat instance `FirebaseProvider` yang di‑cache selama 1 jam untuk efisiensi. Jika tidak ditemukan konfigurasi untuk tenant, autentikasi Firebase akan gagal.


### Contoh Format Token HMAC

Device harus mengirim payload JSON (misal sebagai query parameter `?token=...`) dengan struktur:

```json
{
  "clientId": "acme-iot",
  "deviceId": "sensor-001",
  "timestamp": "1702656000000",
  "signature": "a1b2c3d4e5f67890..."
}
```
Signature dihitung dengan:  
`HMAC-SHA256(key_device, deviceId + timestamp + clientId)`

> Timestamp dalam milidetik. Gateway menolak jika selisih waktu > 5 menit.

### Alur Teknis Autentikasi WebSocket

1. Client mengirim koneksi WebSocket dengan query parameter:
   - `type=browser` atau `type=device` atau `type=desktop`
   - `token=<jwt_or_hmac_or_firebase>`
   - (khusus desktop juga `clientId=xxx`)

2. Gateway memanggil `AuthService.validateToken(token, type, clientId?)`.

3. `AuthService` memilih strategy berdasarkan `type` dari `strategyMap`:
   - `browser` → `JwtAuthStrategy`
   - `device` → `HmacAuthStrategy`
   - `desktop` → `FireBaseAuthStrategy`

4. Strategy yang dipilih melakukan verifikasi:
   - **JwtAuthStrategy**: verifikasi JWT dengan `JwtService` (secret dari `.env`), lalu panggil `BrowserService.getAuth(client_id, role)` → ambil data dari database (whitelist, produk, dll).
   - **HmacAuthStrategy**: parse JSON, cek timestamp (max 5 menit), cari device di database via `DeviceService.getAuth()`, hitung ulang HMAC, bandingkan signature dengan `crypto.timingSafeEqual`.
   - **FireBaseAuthStrategy**: panggil `ProviderFactory.getProvider('auth', clientId)` untuk mendapatkan adapter Firebase tenant, verifikasi token, lalu panggil `BrowserService.getAuth()` dengan role (default `"default"` jika tidak ada).

5. Jika sukses, strategy mengembalikan `AuthResult` berisi:
   - `auth` (objek `BrowserUser` atau `DeviceUser`) yang menyimpan metadata (`id_enduser`, whitelist/blacklist, products, dll)
   - `id_enduser`

6. Gateway menyimpan `auth` ke dalam socket (misal `socket.data.auth`) untuk digunakan saat **routing event** dan **kontrol akses**.

7. Jika gagal, strategy melempar `AppWsException` dengan kode (lihat tabel di bawah). Gateway menutup koneksi atau mengirim pesan error.

> **Catatan Desktop:** Meskipun targetnya desktop, implementasi autentikasi menggunakan `BrowserService` karena pola data (whitelist, produk, role) sama dengan browser. Hanya metode verifikasi token yang berbeda (Firebase vs JWT).

### Daftar Kode Error Autentikasi

| Kode | Deskripsi | Penyebab |
|------|-----------|-----------|
| `TOKEN_EXPIRED` | Token kadaluwarsa | JWT expired, HMAC timestamp > 5 menit, atau Firebase token expired |
| `INVALID_TOKEN` | Token tidak valid | JWT signature salah, format Firebase token salah |
| `INVALID_SIGNATURE` | HMAC signature tidak cocok | `key_device` tidak sesuai atau pesan diubah |
| `UNAUTHENTICATED` | Autentikasi gagal | Client ID tidak ditemukan, device tidak dikenal, role tidak valid |
| `INVALID_TOKEN_FORMAT` | Format token salah | HMAC payload bukan JSON valid, atau field wajib hilang |
| `UNSUPPORTED_AUTH_TYPE` | Tipe autentikasi tidak didukung | `type` bukan `browser`, `device`, atau `desktop` |

### Strategy yang Tersedia

| Strategy | Lokasi | Digunakan untuk | Validasi |
|----------|--------|----------------|----------|
| `JwtAuthStrategy` | `strategies/jwt-auth.strategy.ts` | Browser | JWT signature & expiry |
| `HmacAuthStrategy` | `strategies/hmac-auth.strategy.ts` | Device | HMAC-SHA256 + timestamp |
| `FireBaseAuthStrategy` | `strategies/firebase-auth.strategy.ts` | Desktop | Firebase ID token via tenant provider |

### Metadata yang Disimpan Setelah Autentikasi

Setelah berhasil, gateway menyimpan objek `auth` dengan properti:

**Untuk Browser (`BrowserUser`):**
- `id_enduser`, `clientId`, `product`, `products` (domain & secret per produk)
- `whiteListSend` (daftar event ID yang boleh dikirim)
- `whiteListGet` (daftar event ID yang boleh diterima)

**Untuk Device (`DeviceUser`):**
- `id_enduser`, `clientId`, `product`, `products`
- `blackListSend` (event ID yang dilarang dikirim)
- `blackListGet` (event ID yang dilarang diterima)

Metadata ini digunakan oleh **Routing Engine** untuk menentukan apakah suatu event diizinkan. Detail lebih lanjut tentang whitelist/blacklist dan routing dapat dilihat di [Communication Module](./communication.md).

### Refresh Token (khusus JWT)

Gateway menyediakan endpoint `POST /auth/refresh` untuk memperpanjang `access_token` menggunakan `refresh_token`.

- **Storage:** Database (tabel `refresh_tokens`)
- **Masa berlaku:** Default 7 hari (dapat diatur via `REFRESH_TOKEN_EXPIRY_DAYS`)
- **Keamanan:** Setiap kali digunakan, token lama langsung di-**revoke** dan diganti dengan yang baru (one-time use). Revoke all untuk satu `client_id` juga tersedia.

### Endpoint Autentikasi (REST API)

Semua endpoint dilindungi oleh `RestRateLimitGuard` dan rate limit sesuai phase:

| Endpoint | Method | Rate Limit | Keterangan |
|----------|--------|------------|-------------|
| `/auth/token` | POST | `preConnect` | Login, dapatkan access & refresh token |
| `/auth/refresh` | POST | `postConnect` | Perpanjang access token (butuh refresh token) |
| `/auth/logout` | POST | `postConnect` | Revoke refresh token |

**Contoh request login:**

```http
POST /auth/token
Content-Type: application/json

{
  "client_id": "acme-web",
  "secret_key": "supersecret",
  "role": "admin"
}
```
**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "550e8400-e29b-41d4-a716-446655440000",
  "expires_in": 900
}
```
> `expires_in` dalam detik (15 menit = 900 detik). Dapat diatur per request melalui field opsional `access_token_expired` dengan format seperti `"15m"`, `"1h"`, `"30s"`.

### Ekstensibilitas: Menambah Strategy Autentikasi Baru

Untuk menambahkan metode autentikasi baru (misal: OAuth2, LDAP):

1. Buat class yang mengimplementasikan **interface `IAuthStrategy`**.

   ```typescript
   export interface IAuthStrategy {
     validate(token: string, clientId?: string): Promise<AuthResult>;
   }

2. Implementasikan method `validate()`: verifikasi token, lalu panggil service yang sesuai (`BrowserService` atau `DeviceService`) untuk mendapatkan metadata.

3. Daftarkan strategy ke `AuthService.strategyMap` dengan key baru (misal `oauth2`).

4. Client mengirim `type=oauth2` saat koneksi WebSocket.

## Referensi

- [Environment Variables](./env-detail.md) – Daftar lengkap variabel environment.
- [Communication Module](./communication.md) – Detail whitelist/blacklist dan routing.
- [Reliability Module](./reliability.md) – Mekanisme retry dan QoS.