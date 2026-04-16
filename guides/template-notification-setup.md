# Notification Template Setup

Panduan ini untuk administrator yang perlu mengatur template notifikasi per tenant (email).
Gateway mendukung template dinamis dengan placeholder `{{...}}`. Saat ini hanya channel MAIL (SMTP) yang aktif.

> Prasyarat: Tenant sudah dibuat (lihat [Multi-Tenant Setup](./tenant-setup.md)).
> Database harus memiliki konfigurasi SMTP per tenant atau menggunakan fallback environment variable.

---

## 1. Struktur Tabel

| Tabel                    | Fungsi          |
| ------------------------ | --------------- |
| `notification_templates` | Induk template  |
| `template_contents`      | Konten template |

Relasi: one-to-many dari `notification_templates` ke `template_contents`.

---

## 2. Menambah Template

### 2.1 Insert Template

```sql
INSERT INTO notification_templates (client_id, event_name)
VALUES ('ilham_Created', 'login-absensi');
```

Catat ID yang dihasilkan.

---

### 2.2 Insert Konten

```sql
INSERT INTO template_contents (template_id, channel, key_name, content_value, sort_order)
VALUES (5, 'mail', 'subject', 'Notifikasi Login: {{nama}}', 1);

INSERT INTO template_contents (template_id, channel, key_name, content_value, sort_order)
VALUES
(5, 'mail', 'body', '<p>Halo {{nama}},</p>', 1),
(5, 'mail', 'body', '<p>Anda telah login pada {{waktu}} dengan UID {{uid}}.</p>', 2),
(5, 'mail', 'body', '<p>Status: {{status}} - {{keterangan}}</p>', 3);
```

Keterangan:

* `channel`: hanya `mail`
* `key_name`: `subject` atau `body`
* `sort_order`: urutan konten

---

### 2.3 Placeholder

| Placeholder                  | Sumber             |
| ---------------------------- | ------------------ |
| `{{nama}}`                   | recipients[].nama  |
| `{{email}}`                  | recipients[].email |
| `{{metadata.*}}`             | metadata           |
| `{{uid}}`, `{{status}}`, dll | context event      |

Placeholder yang tidak dikenali akan dikosongkan.

---

## 3. Mengedit Template

### 3.1 Update Konten

```sql
UPDATE template_contents
SET content_value = '<p>Halo {{nama}}, selamat datang!</p>'
WHERE template_id = 5 AND key_name = 'body' AND sort_order = 1;
```

### 3.2 Tambah Baris

```sql
INSERT INTO template_contents (template_id, channel, key_name, content_value, sort_order)
VALUES (5, 'mail', 'body', '<p>Terima kasih.</p>', 4);
```

### 3.3 Hapus Baris

```sql
DELETE FROM template_contents WHERE id = <id>;
```

---

## 4. Menghapus Template

```sql
DELETE FROM notification_templates WHERE id = <id>;
```

Data terkait akan ikut terhapus (cascade).

---

## 5. Contoh Template

Event: cancel-reservasi

Subject:

```
Pembatalan Reservasi atas nama {{nama}}
```

Body:

```html
<p>Yth. {{nama}},</p>
<p>Reservasi Anda pada <strong>{{waktu_mulai}} s.d. {{waktu_akhir}}</strong> telah dibatalkan.</p>
<p>Keterangan: {{keterangan}}</p>
<p>Terima kasih.</p>
```

---

## 6. Konfigurasi SMTP

```sql
INSERT INTO smtp_config (client_id, smtp_host, smtp_port, smtp_username, smtp_password, encryption, address)
VALUES (<id_client>, 'smtp.gmail.com', 587, 'noreply@tenant.com', 'app_password', 'tls', 'noreply@tenant.com');
```

Keterangan:

* `encryption`: `ssl`, `tls`, atau `none`
* `address`: email pengirim

Jika tidak ada konfigurasi, fallback ke environment variable.

---

## 7. Verifikasi Template

```bash
curl -X POST http://localhost:5498/notifications \
  -H "Authorization: Bearer <access_token_tenant>" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "login-absensi",
    "channels": ["MAIL"],
    "recipients": [
      {
        "nama": "Budi",
        "email": "budi@example.com",
        "metadata": {}
      }
    ],
    "context": {
      "uid": "12345",
      "status": "success",
      "keterangan": "Login berhasil"
    }
  }'
```

---

## Referensi

- [Multi-Tenant Setup](./tenant-setup.md) – Cara menambah tenant.
- [Environment Variables](../.env.example) – Fallback SMTP.
- [Notification Module](../docs/notification.md) – Detail teknis parser dan channel.