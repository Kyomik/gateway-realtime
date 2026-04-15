# 📢 Notification Module

Dokumen ini menjelaskan mekanisme **notifikasi multi‑channel** di gateway: **template per tenant**, **parser konten dinamis**, **channel SMTP** (WhatsApp sebagai placeholder), serta integrasi dengan **ProviderFactory** untuk konfigurasi per tenant.

> **Catatan:** Saat ini hanya channel **SMTP (email)** yang diimplementasikan sepenuhnya. Channel WhatsApp masih dalam tahap kerangka dan belum aktif.

---

## Arsitektur Umum

Gateway menyediakan fitur notifikasi asinkron yang dipicu oleh **event internal** (misal `absensi.scan.login`) atau melalui **REST API** `POST /notifications`. Alur utama:

1. **Trigger** – event atau API request masuk.
2. **NotificationService** – membaca template dari database berdasarkan `clientId` dan `event_name`.
3. **Template Parser** – mengganti placeholder `{{...}}` dengan data konteks dan metadata penerima.
4. **Channel** – mengirim pesan melalui provider yang sesuai (SMTP, dll).
5. **ProviderFactory** – menyediakan koneksi SMTP yang sudah dikonfigurasi per tenant (atau fallback ke env default).

Trigger (Event/API) → NotificationService → Template + Parser → Channel (MailChannel) → SMTP Provider → Email


---

## Template Notifikasi per Tenant

### Struktur Database

- **`notification_templates`** – menyimpan template per tenant (`client_id`) dan `event_name`.
- **`template_contents`** – menyimpan konten per template, dengan atribut:
  - `channel` (`MAIL`, `WHATSAPP`, dll)
  - `key_name` (`subject`, `body`, dll)
  - `content_value` (teks template dengan placeholder `{{...}}`)
  - `sort_order` (urutan penggabungan konten)

### Contoh Template

Untuk event `LOGIN_ABSENSI`, template bisa berisi:

| key_name | content_value |
|----------|----------------|
| subject  | `Notifikasi Login: {{nama}}` |
| body     | `<p>Halo {{nama}}, Anda telah login pada {{waktu}}.</p><p>UID: {{uid}}</p>` |

> **Fallback:** Jika template tidak ditemukan, notifikasi akan diabaikan (hanya log warning).

---

## Notification Parser (`NotificationParser`)

Parser bertugas mengganti placeholder `{{...}}` dengan nilai dari:

- **Konteks** – data dari event (misal `uid`, `status`, `waktu_mulai`).
- **Metadata penerima** – field tambahan dari objek `StudentDto.metadata`.
- **Nama penerima** – placeholder `{{nama}}` akan diganti dengan `StudentDto.nama`.

Contoh penggunaan:

```typescript
const parsedBody = NotificationParser.parse(contents, context, studentName, metadata);
```

> **Parser** juga merapikan HTML ke teks plain (untuk email text version) dengan menghapus tag HTML dan menormalisasi baris baru.

### Channel (IChannel)

Interface `IChannel` mendefinisikan method `send()` untuk mengirim notifikasi ke saluran tertentu.


#### MailChannel (SMTP)

- Menggunakan `ProviderFactory` untuk mendapatkan provider email (`IEmailProvider`) sesuai `clientId`.
- Provider yang tersedia saat ini: **SMTP** (via `nodemailer`). SendGrid masih sebagai placeholder.
- Mengirim email secara paralel ke semua penerima (`Promise.all`), error tidak memblokir pengiriman lainnya.
- Konversi HTML ke plain text dilakukan otomatis untuk fallback email client yang tidak mendukung HTML.

#### WhatsappChannel

- **Belum diimplementasikan** (method `send()` kosong).
- Disediakan sebagai kerangka untuk pengembangan channel WhatsApp di masa depan.

### Notification Service (`NotificationService`)

#### Metode `send(dto, clientId)`

1. Mencari template dari database berdasarkan `clientId` dan `dto.event`.
2. Jika tidak ditemukan, log warning dan return.
3. Untuk setiap channel dalam `dto.channels`:
   - Ambil konten template yang sesuai dengan channel tersebut.
   - Panggil `channel.send()` dengan konteks, recipients, dan konten.
   - Tidak menunggu hasil (fire‑and‑forget); error ditangkap dan dicatat di console.

#### Channel Map

```typescript
private readonly channelMap: Record<NotificationChannel, IChannel> = {
  [NotificationChannel.MAIL]: this.mailChannel,
  [NotificationChannel.WHATSAPP]: this.whatsappChannel,
};
```

### Notification Listener (`NotificationListener`)

Listener bereaksi terhadap event internal yang di‑emit dari modul lain (misal `RFIDScanEvent` di Communication Module).

| Event | Trigger | Data |
|-------|---------|------|
| `absensi.scan.login` | Setelah login berhasil | `clientId`, `ScanDto` (nama, email, uid, status, metadata) |
| `absensi.reservasi.cancel` | Setelah reservasi dibatalkan | `clientId`, `ReservasiDto` (nama, email, waktu mulai/akhir, metadata) |
| `notification.requested` | Dari REST API | `clientId`, `BaseNotificationDto` |

Setiap listener memanggil `NotificationService.send()` dengan event yang sesuai dan data yang sudah dipetakan.

### REST API Endpoint

#### `POST /notifications`

Memungkinkan tenant (client) mengirim notifikasi secara langsung melalui API.

- **Auth:** Menggunakan `ApiAuthGuard` (JWT token dari header `Authorization`).
- **Rate Limit:** `postConnect` (tergantung konfigurasi rate limit).
- **Payload:** `BaseNotificationDto`:

```json
{
  "event": "LOGIN_ABSENSI",
  "channels": ["MAIL"],
  "recipients": [
    {
      "nama": "Budi",
      "email": "budi@example.com",
      "metadata": { "kelas": "12A" }
    }
  ],
  "context": {
    "uid": "12345",
    "status": "success"
  }
} 
```

- **Response:** Langsung mengembalikan 
```json
{
  "isSuccess": true,
  "message": "Notification request accepted and is being processed"
}
```
– proses notifikasi berjalan asinkron di latar belakang.

> **Belum diimpelmentasikan** webhook ke service lain saat proses sudah selesai.

## ProviderFactory untuk Email

Gateway menggunakan `ProviderFactory` untuk menyediakan koneksi email (SMTP) per tenant. Konfigurasi SMTP tenant disimpan di tabel `smtp_config`:

| Kolom | Deskripsi |
|-------|-------------|
| `clientId` | ID tenant (relasi ke `client`). |
| `smtpHost` | Server SMTP (misal `smtp.gmail.com`). |
| `smtpPort` | Port SMTP (`465` untuk SSL, `587` untuk TLS). |
| `smtpUsername` | Username SMTP. |
| `smtpPassword` | Password SMTP. |
| `encryption` | `ssl` atau `tls` (opsional). |
| `address` | Email pengirim (from). |

Jika konfigurasi tenant tidak ditemukan, gateway akan menggunakan **fallback ke environment variable** [Environment Variables](./env-detail.md). `EmailProviderFactory` membuat instance `SmtpEmailProvider` yang di‑cache selama 1 jam.

## Integrasi dengan Modul Lain

- **Security Module** – `ApiAuthGuard` melindungi endpoint notifikasi. `ProviderFactory` juga digunakan untuk autentikasi Firebase. Lihat [Security Module](./security.md).
- **Communication Module** – Event `absensi.scan.login` dan `absensi.reservasi.cancel` di‑emit dari event handler (misal `RFIDScanEvent`, `CancelReservasiEvent`). Lihat [Communication Module](./communication.md).
- **Reliability Module** – Tidak langsung terkait, namun notifikasi bersifat **fire‑and‑forget** (tidak di‑retry jika gagal). Jika diperlukan reliability, bisa ditambahkan antrian (Bull) di masa depan.

## Cara Menambah Channel Baru (Developer)

1. Implementasikan interface `IChannel` pada class baru (misal `TelegramChannel`).
2. Tambahkan enum baru di `NotificationChannel`.
3. Daftarkan channel di `NotificationService.channelMap`.
4. (Opsional) Buat provider factory jika channel membutuhkan konfigurasi per tenant.

Contoh kerangka:

```typescript
@Injectable()
export class TelegramChannel implements IChannel {
  async send(context, recipients, clientId, contents): Promise<void> {
    // Implementasi kirim pesan via Telegram API
  }
}
```

## Referensi

- [Security Module](./security.md) – Autentikasi API dan ProviderFactory.
- [Communication Module](./communication.md) – Event yang memicu notifikasi.
- [Environment Variables](./env-detail.md) – Semua konfigurasi, termasuk email.