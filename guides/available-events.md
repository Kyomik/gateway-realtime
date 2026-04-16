# 📋 Available Events

Dokumen ini berisi daftar event WebSocket yang tersedia untuk tenant. Setiap event memiliki aturan pengirim, penerima, format payload, serta tingkat jaminan pengiriman (QoS).

> **Catatan:** Tidak semua event di bawah ini mungkin tersedia untuk tenant Anda, tergantung pengaturan whitelist/blacklist oleh administrator.

---

## Catatan Umum

- Event yang memanggil API eksternal (misal `rfid-scan`, `cancel-reservasi`) akan mengembalikan respons dengan field `isSuccess` (boolean). Jika `false`, field `message` berisi keterangan error bisnis.  
  Tenant dapat meneruskan error bisnis dengan format `{ isSuccess, error: { error_code, message } }`.

- **Error sistem** (koneksi gagal, timeout) akan langsung dikembalikan ke **pengirim** dengan kode `SYSTEM_ERROR` dan tidak diteruskan ke penerima.

- Untuk memahami QoS dan cara mengirim/menerima event, lihat [Getting Started](./getting-started.md).

---

## Event Berdasarkan Produk

### 1. Produk: `absensi` (Sistem Absensi)

| Event (dikirim client) | Pengirim | Penerima | QoS | Payload Request (contoh) | Payload Response (contoh) | Keterangan |
|------------------------|----------|----------|-----|--------------------------|---------------------------|-------------|
| `rfid-scan` | device | browser | 1 | `{ "uid": "12345", "mode": "login" }`<br>`mode`: `login` / `register` / `update` | `{ "isSuccess": true, "data": { "nama": "Budi", "email": "budi@example.com" } }`<br>atau `{ "isSuccess": false, "message": "UID tidak terdaftar" }` | Melakukan login/register/update berdasarkan scan RFID. Memicu notifikasi email ke tenant. |
| `change-mode` | browser | device | 2 | `{ "mode": "register" }` | Tidak ada response khusus (hanya forward ke device) | Mengubah mode operasi device (`register`/`login`/`update`). |
| `cancel-reservasi` | device | self (pengirim) + broadcast ke semua browser tenant | 2 | `{ "id": "123", "uid": "12345" }` | `{ "isSuccess": true, "data": { ... } }` atau error bisnis | Membatalkan reservasi. Jika sukses, semua browser dalam tenant yang sama akan menerima event `cancel-reservasi` dengan data reservasi. |
| `get-all-reservasi` | device | self (pengirim) | 1 | `{ "uid": "12345" }` | `{ "isSuccess": true, "data": [ ... ] }` | Mendapatkan daftar reservasi untuk UID tertentu. |

> **Catatan:**  
> - Event `rfid-scan` dan `cancel-reservasi` memicu notifikasi email (melalui `NotificationService`).  
> - `cancel-reservasi` memiliki **side effect**: setelah berhasil, event akan dikirim ulang ke semua browser aktif dalam tenant yang sama (tanpa perlu dikirim dari device).

---

### 2. Produk: `bell` (Sistem Bel/Sesi)

| Event | Pengirim | Penerima | QoS | Payload Request | Payload Response | Keterangan |
|-------|----------|----------|-----|-----------------|------------------|-------------|
| `create-sesi` | browser | device | 2 | `{ "time": "07:00", "audio": "bell.mp3", "days": ["senin","rabu"], "ids": [] }` (extends `SesiDto`) | `{ "isSuccess": true, "data": { ... } }` | Membuat sesi bel baru. |
| `destroy-sesi` | browser | device | 2 | `{ "time": "07:00" }` | `{ "isSuccess": true, ... }` | Menghapus sesi bel berdasarkan waktu. |
| `destroy-all-sesi` | browser | device | 2 | `{}` (kosong) | `{ "isSuccess": true, ... }` | Menghapus semua sesi bel. |
| `sync-alarm` | browser | device | 2 | `{ "sesis": [ { "time": "07:00", ... } ] }` | Tidak ada response khusus | Sinkronisasi daftar alarm ke device. |
| `send-metadata-audio` | device | browser | 2 | `{ "audios": [ { "id": "1", "label": "bel pagi" } ] }` | Tidak ada response khusus | Mengirim metadata audio dari device ke browser. |
| `upload-audio-start` | browser | device | 2 | `{ "filename": "bell.mp3", "size": 102400, "type": "mp3", "totalChunks": 5 }` | Tidak ada response khusus | Memulai upload file audio ke device (chunked). |
| `upload-audio-end` | browser | device | 2 | `{}` (kosong) | Tidak ada response khusus | Menandai selesai upload audio. |
| `upload-audio` | browser | device | *null* | **Binary** (buffer audio chunk) | Tidak ada response | Mengirim chunk audio secara binary. |

> **Catatan:**  
> - `upload-audio` adalah **binary event** – payload bukan JSON, melainkan raw buffer. Client harus mengirim data binary sesuai protokol.  
> - Event binary **tidak memiliki QoS** (dianggap 0) dan tidak disimpan di event store.

---

### 3. Produk: `monitoring` (Streaming Gambar)

| Event | Pengirim | Penerima | QoS | Payload Request | Payload Response | Keterangan |
|-------|----------|----------|-----|-----------------|------------------|-------------|
| `stream-image` | device | desktop | *null* | **Binary** (buffer gambar) | **Binary** (buffer dengan header tambahan) | Streaming frame gambar dari device ke desktop. Gateway menambahkan header 5 byte: `[tipe=1][id_device 4 byte][flag=0x01]`. |

> **Catatan:** Binary event tidak disimpan di event store; jika penerima offline, frame akan hilang.

---

### 4. Event Umum (`common`)

| Event | Pengirim | Penerima | QoS | Payload Request | Payload Response | Keterangan |
|-------|----------|----------|-----|-----------------|------------------|-------------|
| `event:ack` | client (browser/device/desktop) | server | 0 | `{ "eventId": "uuid-xxxx", "message": "OK" }` | Tidak ada (server memproses internal) | Wajib dikirim oleh penerima event dengan QoS 2 sebagai konfirmasi. Server akan mengubah status event menjadi `APPLIED`. Jika pengirim asli meminta notifikasi (`notifySender=true`), server akan mengirim `event:delivered` ke pengirim. |
| `event:delivered` | server | pengirim asli | 1 | `{ "originalEventId": "...", "originalEventName": "...", "deliveredTo": "admin", "deliveredAt": 1702656000000, "message": "OK" }` | Tidak ada | Dikirim server ke pengirim asli setelah penerima mengirim `event:ack` (hanya jika `notifySender=true`). |

> **Catatan:** `event:ack` tidak perlu dijawab dengan `event:ack` lagi.

---

## Ringkasan QoS per Event

| QoS | Event | Penjelasan |
|-----|-------|-------------|
| **0** | `stream-image`, `upload-audio`, `event:ack` | Tidak disimpan; jika penerima offline, event hilang. |
| **1** | `rfid-scan`, `get-all-reservasi`, `event:delivered` | Disimpan jika penerima offline; saat online langsung dikirim dan dianggap selesai (tidak perlu ack). |
| **2** | `change-mode`, `cancel-reservasi`, `create-sesi`, `destroy-sesi`, `destroy-all-sesi`, `sync-alarm`, `send-metadata-audio`, `upload-audio-start`, `upload-audio-end` | Disimpan untuk semua penerima (online/offline). Penerima wajib mengirim `event:ack`. Jika ack tidak diterima dalam 30 detik, event akan di‑retry (max 5 kali). |

---

## Catatan Penting untuk Tenant

### Error Bisnis vs Sistem

- **Error bisnis** (misal `"UID tidak terdaftar"`) dikembalikan dalam respons event dengan `isSuccess: false` dan `message`.  
- **Error sistem** (timeout, koneksi gagal, gateway error) akan dikirim langsung ke pengirim dengan event `error` dan kode `SYSTEM_ERROR`. Tidak diteruskan ke penerima.

### Binary Event

- `stream-image` dan `upload-audio` menggunakan raw binary, bukan JSON. Pastikan client mengirim data sebagai `Buffer` (bukan string).  
- Header tambahan ditambahkan oleh gateway, client tidak perlu menambahkan header.

### Acknowledgment (QoS 2)

- Event dengan QoS 2 harus di‑`ack` dengan `event:ack` dalam 30 detik, jika tidak event akan di‑retry.  
- Jika setelah 5 kali retry masih gagal, event akan dihapus dan pengirim akan mendapat notifikasi `event_expired`.

### Side Effect

- Beberapa event (seperti `rfid-scan`, `cancel-reservasi`) memicu notifikasi email atau broadcast ke semua browser dalam tenant.
---

## Referensi

- [Getting Started](./getting-started.md) – Cara koneksi, autentikasi, dan contoh kode.
- [Client Examples](./client-examples.md) – Contoh implementasi untuk browser, device, desktop.
- [Dokumentasi Internal QoS](../docs/reliability.md) – Penjelasan teknis retry dan event store (untuk developer).