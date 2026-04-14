<!-- # 🔐 Security

Dokumentasi ini mencakup mekanisme keamanan yang diterapkan di gateway: **autentikasi multi-metode** dan **rate limiting** untuk API serta WebSocket.

---

## Autentikasi

Gateway mendukung tiga metode autentikasi, masing-masing ditujukan untuk tipe klien yang berbeda:

| Metode | Target Pengguna | Cara Kerja |
|--------|----------------|-------------|
| **JWT** (JSON Web Token) | Browser / Web App | Token dikirim melalui header `Authorization: Bearer <token>`. Gateway memverifikasi signature dan expiry. |
| **HMAC** (Hash-based Message Authentication Code) | IoT / Device | Device memiliki secret key. Setiap request ditandatangani dengan HMAC. Gateway memverifikasi hash. |
| **Firebase Token** | Desktop App (Electron, dll) | Token dari Firebase Authentication diverifikasi menggunakan Firebase Admin SDK. |

### Alur Autentikasi Umum

1. Client mengirim kredensial ke **API Backend** (terpisah dari gateway) untuk mendapatkan token sesuai tipe.
2. Client terhubung ke WebSocket gateway dengan menyertakan token (query param `?token=` atau header).
3. Gateway mengekstrak dan memverifikasi token.
4. Setelah sukses, gateway mendapatkan metadata seperti `tenantId`, `product`, `userType` dari token.
5. Metadata digunakan untuk routing dan kontrol akses.

> Untuk detail teknis implementasi, lihat modul `auth` di source code.

--- -->

## Rate Limiter

Rate limiter pada proyek ini sudah diterapkan pada endpoint API dan komunikasi WebSocket.
Pattern yang digunakan adalah **Factory** dan **Strategy**, sehingga pengguna bisa mengembangkannya dengan teknologi yang lebih baik (misalnya mengganti storage dari memory ke Redis). 

**Saat ini storage yang digunakan:** `in-memory` (belum menggunakan Redis).

### Alur Teknis (Cara Kerja)
1. Request masuk (HTTP atau WebSocket).

2. Guard (atau panggilan manual) memicu pengecekan rate limit dengan rule tertentu (preConnect / postConnect).

3. KeyExtractorFactory menghasilkan key unik (misal ip:token untuk WS pre-connect, atau header Authorization untuk REST post-connect).

4. RateLimitService yang dipanggil dari guard memanggil storage (in-memory) untuk menambah hitungan key tersebut dalam jendela waktu yang ditentukan.

5. Jika melebihi batas, request diblokir dan mengembalikan response 429 Too Many Requests.
Untuk WebSocket, koneksi ditolak atau dikirim pesan error rate-limit.

## Factory yang Tersedia

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
```

#### WebSocket

- WebSocket murni (@WebSocketGateway) tidak mendukung Guard maupun decorator NestJS. sehingga pemakaiannya dengan pendekatan DI (layaknya service biasa).
- Rate limiter dipanggil secara manual di dalam service websocket-gateway menggunakan WebsocketRateLimitGuard.

```typescript
await this.wsRateLimitGuard.validate(request, 'preConnect');
```

### Ekstensibilitas 

#### Mengganti Storage
Anda bisa mengganti storage dari memory ke Redis (atau lainnya) dengan cara:

1. Membuat class yang mengimplementasikan interface IStorageRateLimit.

2. Menambahkan provider tersebut ke RatelimitStorageFactory.

#### Menambah Aturan Key Extractor untuk Websocket
Anda bisa meembuat class pada provider bagian ws dengan cara :

1. Membuat class yang mengimplementasikan interface KeyExtractor.

2. Menambah extractor tersebut ke KeyExtractorFactory.