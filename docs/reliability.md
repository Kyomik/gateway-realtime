# 🔁 Reliability Module

Dokumen ini menjelaskan implementasi teknis **reliability** di gateway: **Event Store**, **Retry Mechanism** dengan exponential backoff, **QoS 0/1/2** serta **Acknowledgment (ACK)** dan **Timeout Handling**.

> **Catatan:** Penjelasan umum tentang QoS, ACK, dan alur pengiriman event sudah dijelaskan di [Communication Module](./communication.md). Di sini kita fokus pada **implementasi internal**, **konfigurasi**, dan **detail teknis** yang tidak diulang di modul lain.

---

## Arsitektur Umum

Gateway menjamin pengiriman event melalui komponen berikut:

- **Event Store** – menyimpan event untuk penerima yang offline (QoS 1 & 2).
- **Retry Service** – secara periodik mencoba mengirim ulang event yang gagal atau belum di-ACK.
- **QoS Level** – menentukan tingkat jaminan (0, 1, 2).
- **Acknowledgment** – penerima wajib mengirim `event:ack` untuk QoS 2.
- **Timeout & Backoff** – mencegah retry berlebihan.

Client A → Gateway → Event Store (jika offline) → Retry Service → Client B (online)

---

## Event Store (`EventStoreService`)

Bertanggung jawab menyimpan event yang belum berhasil dikirim atau menunggu ACK.

### Struktur Data Internal

- **`events`** – `Map<eventId, EventRecord>` menyimpan semua event.
- **`userEvents`** – `Map<userId, Set<eventId>>` indeks untuk mempercepat pencarian event per user.

### `EventRecord` (per event per user)

Setiap `EventRecord` menyimpan status untuk setiap penerima (`userId`):

| Field | Deskripsi |
|-------|-------------|
| `userStatus` | Status per user: `STORED`, `DELIVERED`, `APPLIED`, `FAILED`. |
| `deliveryAttempts` | Jumlah percobaan pengiriman per user. |
| `lastDeliveryAttempt` | Waktu percobaan terakhir (ms). |
| `deliveryErrors` | Catatan error per user. |

### Metode Penting (API Internal)

| Method | Fungsi |
|--------|--------|
| `create()` | Membuat event baru, menyimpan ke store, menjadwalkan expiry jika TTL ditentukan. |
| `getPending(userId)` | Mengambil semua event yang belum `APPLIED` dan belum expired. |
| `getPendingWithRetry(userId)` | Mengambil event yang perlu di-retry berdasarkan aturan backoff dan batas percobaan. |
| `markDelivered(userId, eventId)` | Ubah status menjadi `DELIVERED` (setelah event dikirim ke client). |
| `markApplied(userId, eventId)` | Ubah status menjadi `APPLIED` (event selesai). Jika semua user `APPLIED`, event dihapus. |
| `markFailed(userId, eventId, error)` | Ubah status menjadi `FAILED` dan catat error. |

### Cleanup & Expiry

| Mekanisme | Penjelasan |
|-----------|-------------|
| **Event expiry** | Jika event memiliki `ttl`, setelah melewati batas akan dihapus. Jika `notifySender=true`, mengirim `event_expired` ke pengirim (jika online). |
| **Stale delivered** | Event status `DELIVERED` melebihi `EVENT_STORE_STALE_TIMEOUT` (default 1 jam) diubah menjadi `FAILED`. |
| **Memory limit** | Jika total event melebihi `EVENT_STORE_MAX_TOTAL`, event dengan prioritas terendah (`APPLIED` < `STORED` < `DELIVERED` < `FAILED`) dihapus paksa. |

### Monitoring (Statistik)

`EventStoreService` menyediakan method `getStats()` dan `getUserStats(userId)` untuk debugging:

- Total event created, delivered, applied, failed, expired.
- Current pending events, max pending per user, memory usage (estimated).
- Per user: jumlah event, status breakdown, expired.

---

## Retry Mechanism (`EventRetryService`)

Berjalan periodik setiap `EVENT_RETRY_INTERVAL` (default 3 detik) dan melakukan:

1. Mengambil semua user yang memiliki event pending.
2. Untuk setiap user, ambil event yang perlu di-retry (`getPendingWithRetry`).
3. Kirim ulang event ke user yang sedang online (session aktif).
4. Perbarui status dan percobaan.

### Aturan Retry (method `shouldRetry`)

| Status | Perilaku |
|--------|----------|
| `APPLIED` | Tidak perlu retry. |
| `STORED` | Belum pernah dikirim → perlu retry (akan dikirim saat koneksi). |
| `DELIVERED` | Retry jika waktu sejak `lastDeliveryAttempt` melebihi `EVENT_STORE_DELIVERED_TIMEOUT` (default 30 detik). |
| `FAILED` | Retry jika percobaan < `EVENT_STORE_MAX_ATTEMPTS` (default 5) dan waktu sejak `lastDeliveryAttempt` > `backoff`. |

**Exponential backoff + jitter:**  
`delay = EVENT_BACKOFF_BASE * 2^attempts * (0.5 + random())`

### Retry & Event Expired Feedback

Jika event expired dan `notifySender=true`, `EventRetryService` (melalui event listener `event.expired`) mengirim pesan `event_expired` ke pengirim asli (jika online). Payload:

```json
{
  "event": "event_expired",
  "eventId": "uuid",
  "eventName": "rfid-scan",
  "reason": "expired"
}
```

## Quality of Service (QoS) – Implementasi di Event Store

> Untuk penjelasan umum QoS, lihat [Communication Module](./communication.md).

| QoS | Implementasi di Event Store |
|-----|-----------------------------|
| **0** | Tidak disimpan. Dikirim sekali, tidak ada retry. |
| **1** | Event disimpan **hanya jika penerima offline**. Saat penerima online, event dikirim dan status langsung `APPLIED`. Tidak perlu ACK. |
| **2** | Event disimpan untuk **semua** penerima (online/offline). Status awal `STORED`. Setelah dikirim ke client (online), status menjadi `DELIVERED`. Client wajib mengirim `event:ack` → status `APPLIED`. Jika ACK tidak datang dalam `EVENT_STORE_DELIVERED_TIMEOUT`, event dianggap gagal dan di-retry. |

### Alur QoS 2 dengan ACK

```text
Sender → Gateway → EventStore.create(status STORED) → kirim ke receiver online → status DELIVERED
Receiver → Gateway (event:ack) → EventStore.markApplied() → hapus jika semua user APPLIED
Jika receiver offline → event tetap STORED → saat connect, dikirim → tunggu ACK
```

## Acknowledgment (ACK/NACK)

Client **wajib** mengirim event `event:ack` setelah menerima event dengan QoS 2. Payload:

```json
{
  "eventId": "uuid",
  "message": "optional"
}
```

Gateway akan:

1. Mencari `EventRecord` berdasarkan `eventId`.
2. Memanggil `markApplied(userId, eventId)`.
3. Jika event asli memiliki `notifySender=true`, gateway mengirim `event:delivered` ke pengirim (online atau disimpan untuk offline).

### Event `event:delivered`

Payload:

```json
{
  "event": "event:delivered",
  "data": {
    "originalEventId": "uuid",
    "originalEventName": "rfid-scan",
    "deliveredTo": "admin_role",
    "deliveredAt": 1702656000000,
    "message": "OK"
  }
}
```

## Timeout Handling

| Timeout | Nilai Default | Dampak |
|---------|---------------|--------|
| **Delivery timeout** | `EVENT_STORE_DELIVERED_TIMEOUT` = 30 detik | Event status `DELIVERED` melebihi batas dianggap gagal, akan di-retry (jika masih dalam batas percobaan). |
| **Stale timeout** | `EVENT_STORE_STALE_TIMEOUT` = 1 jam | Event gagal terus dan melebihi batas akan dihapus (tidak dicoba lagi). |
| **Retry backoff** | `EVENT_BACKOFF_BASE` = 1000 ms | Mencegah retry terlalu cepat. |

## Integrasi dengan Modul Lain

- **Communication Module** – Event handler menentukan QoS dan memanggil `EventStoreService.create()`, `markDelivered()`, `markApplied()`. Lihat [Communication Module](./communication.md).
- **Security Module** – Autentikasi menentukan `userId` (`id_enduser`) yang digunakan sebagai kunci event store.
- **WebSocket Session Manager** – Saat client connect, `BaseLifecycle.deliverPendingEvents()` mengirim semua event pending (QoS 1 & 2) yang tersimpan.

## Cara Kerja Ringkas

1. Event masuk (misal dari device) dengan QoS 2.
2. Handler memanggil `eventStore.create(targetUserIds, eventName, payload, qos, options)`.
3. Event disimpan dengan status `STORED` untuk setiap target user.
4. Jika user online, event langsung dikirim dan status diubah menjadi `DELIVERED`.
5. Client mengirim `event:ack` → status menjadi `APPLIED`.
6. Jika user offline, event tetap tersimpan. Saat user connect, `deliverPendingEvents()` mengirim semua event pending.
7. `EventRetryService` secara periodik mengecek event yang gagal dan mengirim ulang dengan exponential backoff.
8. Event yang sudah `APPLIED` untuk semua user akan dihapus dari store.

## Referensi

- [Communication Module](./communication.md) – Event handler dan pengiriman.
- [Security Module](./security.md) – Autentikasi dan user ID.
- [Environment Variables](./env-detail.md) – Semua konfigurasi reliability.