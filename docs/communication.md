# 🌐 Communication Module

Dokumen ini menjelaskan arsitektur komunikasi realtime gateway: **WebSocket connection management**, **event routing**, **whitelist/blacklist control**, serta **synchronous API calls** ke layanan eksternal.

---

## Arsitektur Umum

Gateway menyediakan dua jalur komunikasi:

1. **WebSocket** (realtime) – untuk client (browser, device, desktop). Semua pesan masuk (JSON atau binary) diproses oleh event handler.
2. **REST API** (synchronous) – untuk panggilan antar layanan (service-to-service). Misalnya, saat event membutuhkan data dari sistem eksternal, gateway memanggil API melalui `ExternalApiService`.

Client WebSocket → Gateway → Routing Engine → Event Handler → (Opsional) External API → Response ke Client


---

## WebSocket Session Management

### Session Registry (`WebSocketSessionRegistry`)

- Menyimpan semua session aktif (`WsSession`) berdasarkan `sessionId` (biasanya `id_enduser`).
- Secondary index: berdasarkan `tenantId` dan tipe (`browser` / `device` / `desktop`) untuk mempercepat pencarian client dalam satu tenant.
- Digunakan untuk mengirim event ke semua browser/device dalam tenant tertentu.

### Session Manager (`WebSocketSessionManager`)

- Membuat, mengganti (replace), atau melanjutkan (resume) session saat client (re)connect.
- Menentukan apakah session baru atau melanjutkan session yang sedang `SUSPEND`.
- Menyediakan method: `establishSession()`, `getActiveSockets()`, `getActiveSocketsByType()`, `getIdEnduserByType()`.

### Lifecycle Management (`LifecycleFactory` + `BaseLifecycle`)

Setiap session memiliki **lifecycle** yang berbeda tergantung tipe client:

| Tipe | Lifecycle Class | Perilaku |
|------|----------------|----------|
| `browser` / `desktop` | `BrowserLifecycle` | Setelah koneksi, mengirim snapshot daftar device (dengan status ONLINE/OFFLINE). |
| `device` | `DeviceLifecycle` | Memberi tahu semua browser terkait saat device connect, disconnect, suspend, atau resume. |
| lainnya | `DefaultLifecycle` | Tidak melakukan aksi tambahan. |

**State session**: `CONNECTING` → `ONLINE` → `SUSPEND` → `OFFLINE`.  
Setelah disconnect, session masuk ke `SUSPEND` selama `WS_SESSION_SUSPEND_TIMEOUT` (ms). Jika tidak ada reconnect, session dihapus.

---

## Event Handling

### Struktur Event

Semua event (JSON) harus meng-extend `BaseWsEventJSON<TDto, TResult>` atau `BaseWsEventBinner` untuk binary.

Setiap event memiliki properti wajib:

| Properti | Deskripsi |
|----------|-------------|
| `labelEvent` | Nama event yang didengar oleh gateway (dari client). |
| `labelEventToReceiver` | Nama event yang dikirim ke penerima (bisa berbeda). |
| `productName` | Produk terkait event (misal `absensi`, `monitoring`). |
| `type` | Tipe pengirim yang diizinkan (`browser`, `device`, `desktop`). |
| `receiverType` | Tipe penerima (`browser`, `device`, `self`, `server`). |
| `dto` | Class DTO untuk validasi payload (class-transformer). |
| `qos` | Quality of Service (0, 1, 2). |
| `ttl` | Time-to-live (ms) untuk event offline (QoS 1/2). |

### Alur Eksekusi Event

1. Client mengirim `{ event: "rfid-scan", data: {...} }` melalui WebSocket.
2. `WebSocketMessageService.onMessage()` menerima pesan, parse JSON, cari handler berdasarkan `event`.
3. Handler melakukan:
   - Validasi payload dengan DTO.
   - `validatePayload()` untuk aturan bisnis tambahan.
   - `getReceivers()` → menentukan siapa penerima berdasarkan whitelist/blacklist dan tipe.
   - `modifiedPayload()` (opsional) → ubah payload sebelum dikirim.
   - `dispatch()` → kirim ke penerima sesuai QoS.
4. Jika event membutuhkan panggilan API eksternal (misal ke sistem absensi), dilakukan di `modifiedPayload()` atau `executeBase()`.

### Registrasi Event Handler

Semua event handler didaftarkan melalui dependency injection dengan token `'WS_EVENTS_JSON'` dan `'WS_EVENTS_BINNER'`.  
`WebSocketMessageService` akan memuat semua handler tersebut saat inisialisasi dan menyimpannya dalam `Map` berdasarkan `labelEvent` (untuk JSON) atau `productName` (untuk binary).

Event handler untuk produk tertentu (misal `absensi`) dikelompokkan dalam file `index.ts` masing-masing, lalu diekspor ke `WS_EVENT_JSON_CLASSES`.

### Whitelist & Blacklist Control

Filter event dilakukan oleh **helper** (`BrowserHelper`, `DeviceHelper`), tergantung tipe **pengirim** dan **penerima**.

| Helper | Aturan untuk Pengirim | Aturan untuk Penerima |
|--------|----------------------|----------------------|
| `BrowserHelper` | `whiteListSend` (event ID yang boleh dikirim) | `whiteListGet` (event ID yang boleh diterima) |
| `DeviceHelper` | `blackListSend` (event ID yang dilarang dikirim) | `blackListGet` (event ID yang dilarang diterima) |

Daftar event ID yang tersedia untuk suatu produk diambil dari database melalui `EventService.getByProduct(productName)`.  
Event ID ini kemudian dicocokkan dengan `whiteListSend`/`whiteListGet` (browser) atau `blackListSend`/`blackListGet` (device).

> **Catatan:** Whitelist/blacklist diambil dari database saat autentikasi dan disimpan di objek `BrowserUser` / `DeviceUser`.

### Quality of Service (QoS)

| QoS | Perilaku |
|-----|----------|
| 0 | Kirim sekali, tidak ada jaminan sampai. Tidak disimpan di `EventStore`. |
| 1 | Kirim, jika penerima offline, simpan event. Setelah terkirim, langsung tandai `APPLIED`. |
| 2 | Kirim, simpan untuk semua penerima (online/offline). Butuh **acknowledgment** dari penerima (`event:ack`). Setelah ack, status menjadi `APPLIED`. |

Detail implementasi retry dan event store ada di [Reliability Module](./reliability.md).

---

## Routing Multi‑Tenant

Gateway menentukan rute berdasarkan metadata yang tersimpan di `principal` (hasil autentikasi):

- `clientId` → tenant ID.
- `product` → produk utama (misal `absensi`).
- `type` → tipe end-user (`browser`, `device`, `desktop`).

Saat event akan dikirim ke penerima, `WebSocketSessionManager.getActiveSocketsByType()` mengambil semua session aktif dalam tenant yang sama, lalu difilter dengan `BrowserHelper` / `DeviceHelper` berdasarkan whitelist/blacklist event.

Contoh: Event `rfid-scan` dari device dikirim ke semua browser dalam tenant yang sama yang memiliki `whiteListGet` mencakup event ID terkait.

---

## Synchronous API Calls (Service-to-Service)

Gateway dapat memanggil REST API eksternal secara sinkron melalui `ExternalApiService`.

### ExternalApiService

- Menggunakan `HttpService` dari NestJS (axios).
- Mendukung timeout (5 detik).
- Menambahkan header `Authorization: Bearer <secret>` jika `secret` disediakan.
- Melempar `WebhookError` jika terjadi error (timeout, non-2xx, dll).

### Contoh Penggunaan di Event

```typescript
// Di dalam RFIDScanEvent.modifiedPayload()
const product = user.getProduct(this.productName);
const result = await this.absensiApiService.login(
  product.domain,
  payload.uid,
  product.secret
);
```

Setiap produk (misal `absensi`) memiliki **domain** dan **api secret** yang disimpan di database. Gateway mengambilnya saat autentikasi dan menyimpannya di `principal.products`.

### WHResPipe (Webhook Response Pipe)

Digunakan untuk memvalidasi respons dari API eksternal terhadap DTO success dan error. Jika respons tidak sesuai format, akan melempar `AppWsException`.

```typescript
await WHResPipe(raw, SuccessLoginResponseDto, ErrorBusinesDto);
```

### Binary Event

Untuk efisiensi bandwidth, gateway mendukung binary event (misal streaming gambar). Handler binary harus meng-extend `BaseWsEventBinner`.

- Payload diterima sebagai `Buffer`.
- Bisa ditambahkan header khusus (contoh: `StreamImageEvent` menambahkan header 5 byte: tipe, ID device, flag).
- Dispatch langsung mengirim buffer ke semua penerima tanpa modifikasi (kecuali header).
- Binary event **tidak menggunakan QoS**, tidak disimpan di event store.

### Event Acknowledgment (QoS 2)

Client harus mengirim event `event:ack` setelah menerima event dengan QoS 2.

**Payload:**

```json
{
  "eventId": "uuid",
  "message": "optional"
}
```

Gateway akan:

1. Menandai event sebagai `APPLIED` untuk user tersebut.
2. Jika pengirim asli (`senderId`) meminta notifikasi (`notifySender=true`), gateway mengirim `event:delivered` ke pengirim (online atau disimpan untuk offline).

### WebSocket Heartbeat

`WebSocketHeartbeatService` secara periodik mengirim ping ke semua client aktif. Jika client tidak merespon pong dalam `WS_HEARTBEAT_INTERVAL` (default 30 detik) dan melebihi `WS_MAX_MISSED_PONGS` (default 2), koneksi ditutup.

Properti `socket.isAlive` dan `socket.missedPongs` digunakan untuk melacak kesehatan koneksi.

### Koneksi Awal (Query Pipe & Auth Guard)

#### WsQueryPipe

Memparsing query parameter dari URL koneksi WebSocket:

- `token` – token autentikasi (JWT / HMAC / Firebase).
- `type` – tipe client (`browser`, `device`, `desktop`).
- `product` (opsional) – produk yang diminta.
- `clientId` (opsional, wajib untuk desktop) – ID tenant.

Jika parameter wajib tidak ada, melempar `AppWsException('INVALID_QUERY')`.

#### WebSocketAuthGuard

- Menerima `IncomingMessage` (request HTTP upgrade).
- Memanggil `WsQueryPipe` untuk mengekstrak parameter.
- Memanggil `AuthService.validateToken()` untuk memverifikasi token sesuai `type`.
- Mengembalikan `{ id_enduser, auth, product, type }` yang akan digunakan untuk membuat session.

Guard ini dipanggil di `WebsocketGateway.handleConnection()` sebelum session dibuat.

---

### Error Handling

Gateway membedakan dua kategori error:

| Kategori | Contoh | Penanganan |
|----------|--------|-------------|
| **Sistem Error** | HTTP 4xx/5xx, timeout, koneksi gagal, `WebhookError` | Error langsung dikembalikan ke **pengirim** (client yang memicu event). Pengirim menerima `AppWsException` dengan kode `SYSTEM_ERROR`. Tidak diteruskan ke penerima. |
| **Bisnis Error** | Respons API eksternal dengan `isSuccess: false` (misal `ErrorBusinesDto`) | Error dapat **diteruskan ke penerima** sebagai event biasa. Contoh: device mengirim scan, API balik `{ isSuccess: false, message: "UID tidak terdaftar" }`, gateway tetap mengirim event `result-scan` ke browser dengan payload error. |

**Alur praktis di dalam event handler:**

```typescript
const raw = await this.apiService.call(...);
const result = await WHResPipe(raw, SuccessDto, ErrorDto);

if (!result.isSuccess) {
  // Error bisnis – bisa diteruskan ke penerima
  await this.dispatch(receivers, { error: result.message }, session);
  return;
}
// Sukses – lanjutkan
```

## Integrasi dengan Modul Lain

- **Security** – Autentikasi menentukan `principal` dan metadata (whitelist/blacklist). Lihat [Security Module](./security.md).
- **Reliability** – Event store dan retry untuk QoS 1/2. Lihat [Reliability Module](./reliability.md).
- **Notification** – Tidak langsung terkait, namun bisa dipicu dari event (misal kirim notifikasi via email setelah event sukses).

---

## Cara Menambah Event Baru (Developer)

1. Buat DTO untuk payload (input) dan response (output).
2. Buat class yang meng-extend `BaseWsEventJSON` (atau `BaseWsEventBinner` untuk binary).
3. Implementasikan properti abstrak (`labelEvent`, `productName`, `type`, `receiverType`, `dto`, `qos`).
4. Implementasikan method `validatePayload()` (bisa return `true` jika tidak ada validasi tambahan).
5. Implementasikan `modifiedPayload()` jika perlu mengubah payload sebelum dikirim ke penerima.
6. Jika perlu memanggil API eksternal, inject service yang menggunakan `ExternalApiService`.
7. Daftarkan class event di `WS_EVENT_JSON_CLASSES` (sesuai produk) agar di-load oleh module.

Contoh: lihat `RFIDScanEvent` dan `CancelReservasiEvent`.

---

## Referensi

- [Security Module](./security.md) – Autentikasi dan rate limiting.
- [Reliability Module](./reliability.md) – Event store, retry, QoS.
- [User Guide – Getting Started](./getting-started.md) – Cara koneksi dan kirim event dari client.