# Whitelist & Blacklist Setup

Panduan ini untuk administrator yang perlu mengatur kontrol event (whitelist/blacklist) per tenant, product, dan user type.
Gateway menggunakan whitelist untuk browser dan blacklist untuk device.

> Prasyarat: Tenant, role, device, dan event sudah terdaftar di database.

---

## 1. Konsep Dasar

| Tipe Client | Mekanisme                        | Tabel                                                   |
| ----------- | -------------------------------- | ------------------------------------------------------- |
| Browser     | Whitelist (hanya yang diizinkan) | whitelist_role_send_event, whitelist_role_get_event     |
| Device      | Blacklist (yang dilarang)        | blacklist_device_send_event, blacklist_device_get_event |

Data ini diambil saat autentikasi dan disimpan dalam session.

---

## 2. Melihat Daftar Event

```sql
SELECT id, event, id_jenis_device FROM event_transaksi;
```

Contoh:

* 1 = register
* 2 = login
* 3 = update
* 10 = create-sesi

---

## 3. Whitelist Browser

### 3.1 Whitelist Send

```sql
INSERT INTO whitelist_role_send_event (id_role, id_event)
VALUES (1, 10);
```

Hapus:

```sql
DELETE FROM whitelist_role_send_event WHERE id_role = 1 AND id_event = 10;
```

---

### 3.2 Whitelist Get

```sql
INSERT INTO whitelist_role_get_event (id_role, id_event)
VALUES (1, 2);
```

Catatan:
Whitelist get menggunakan event asli dari device (misalnya `rfid-scan`), bukan label hasil seperti `result-scan`.

---

## 4. Blacklist Device

### 4.1 Blacklist Send

```sql
INSERT INTO blacklist_device_send_event (id_device_transaksi, id_event)
VALUES (1, 1);
```

Hapus:

```sql
DELETE FROM blacklist_device_send_event WHERE id_device_transaksi = 1 AND id_event = 1;
```

---

### 4.2 Blacklist Get

```sql
INSERT INTO blacklist_device_get_event (id_device_transaksi, id_event)
VALUES (2, <id_event>);
```

---

## 5. Mendapatkan ID Role dan Device

### ID Role

```sql
SELECT r.id
FROM role_transaksi r
JOIN client c ON c.id = r.id_client
WHERE c.client_id = 'nama-tenant' AND r.label_role = 'admin';
```

### ID Device

```sql
SELECT d.id
FROM device_transaksi d
JOIN client c ON c.id = d.id_client
WHERE c.client_id = 'nama-tenant' AND d.device_id = 'DEVICE-001';
```

---

## 6. Contoh Skenario

### Browser hanya boleh kirim dan terima event tertentu

```sql
INSERT INTO whitelist_role_send_event (id_role, id_event) VALUES (1, 2);
INSERT INTO whitelist_role_get_event (id_role, id_event) VALUES (1, 2);
```

### Device dilarang mengirim event tertentu

```sql
INSERT INTO blacklist_device_send_event (id_device_transaksi, id_event)
VALUES (3, 15);
```

---

## 7. Dampak Perubahan

Perubahan tidak langsung berlaku.
Client harus reconnect agar data terbaru digunakan.

---

## 8. Verifikasi

* Periksa log gateway
* Cari error seperti FORBIDDEN_EVENT

---

## Referensi
- [Available Events](./available-events.md) – Daftar event dan kegunaannya.
- [Multi-Tenant Setup](./tenant-setup.md) – Cara menambah role dan device.
- [Communication Module](../docs/communication.md) – Detail filter whitelist/blacklist di helper.
