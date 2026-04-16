# Multi-Tenant Setup

Panduan ini untuk administrator yang perlu menambah, mengedit, atau menghapus tenant (client) pada gateway.
Saat ini belum tersedia antarmuka web, sehingga semua operasi dilakukan langsung melalui database (MySQL).

> Prasyarat: Akses ke database gateway dan pemahaman dasar SQL.

---

## 1. Menambah Tenant Baru

Untuk menambahkan tenant baru, Anda perlu mengisi beberapa tabel yang saling berelasi.

### 1.1 Tabel `client`

```sql
INSERT INTO client (client_id, status)
VALUES ('nama-tenant-anda', 'active');
```

* `client_id`: nama unik tenant (tanpa spasi, boleh pakai underscore)
* `status`: `active` atau `offline`

Setelah insert, catat `id` yang dihasilkan (misal `123`).

---

### 1.2 Tabel `secret`

```sql
INSERT INTO secret (key_service, key_device, id_client)
VALUES ('rahasia_service_tenant', 'rahasia_device_tenant', <id_client>);
```

* `key_service`: untuk autentikasi browser (JWT)
* `key_device`: untuk autentikasi device (HMAC)

---

### 1.3 Tabel `product`

Gateway memiliki produk bawaan:

* `1`: absensi
* `2`: bell
* `3`: monitoring

Tidak perlu diubah. Relasi diatur melalui tabel lain.

---

### 1.4 Tabel `host_client`

```sql
INSERT INTO host_client (domain, api_secret, id_client, id_product)
VALUES 
  ('https://api.absensi.tenant.com', 'api_secret_absensi', <id_client>, 1),
  ('https://api.bell.tenant.com', 'api_secret_bell', <id_client>, 2);
```

* `domain`: base URL API tenant
* `api_secret`: token untuk komunikasi gateway ke tenant
* `id_product`: produk terkait

---

### 1.5 Tabel `enduser` dan `role_transaksi`

```sql
INSERT INTO enduser (type) VALUES ('browser');
INSERT INTO enduser (type) VALUES ('device');

INSERT INTO role_transaksi (label_role, id_client, id_product, id_enduser)
VALUES ('admin', <id_client>, 1, 101);

INSERT INTO role_transaksi (label_role, id_client, id_product, id_enduser)
VALUES ('default', <id_client>, 2, 102);
```

* `label_role`: nama role
* `id_product`: produk
* `id_enduser`: relasi ke enduser

---

### 1.6 Tabel `device_transaksi`

```sql
INSERT INTO device_transaksi (device_id, status, id_jenis_device, id_client, id_enduser)
VALUES ('DEVICE-001', 'active', <id_jenis_device>, <id_client>, <id_enduser_device>);
```

* `device_id`: ID unik device
* `id_jenis_device`: jenis device
* `id_enduser`: enduser bertipe device

---

## 2. Mengedit Tenant

### 2.1 Ubah Status

```sql
UPDATE client SET status = 'offline' WHERE client_id = 'nama-tenant';
```

### 2.2 Ganti Secret

```sql
UPDATE secret SET key_service = 'baru', key_device = 'baru' WHERE id_client = <id_client>;
```

### 2.3 Ubah Domain atau API Secret

```sql
UPDATE host_client 
SET domain = 'https://new.domain.com', api_secret = 'new_secret'
WHERE id_client = <id_client> AND id_product = <id_product>;
```

---

## 3. Menghapus Tenant

```sql
DELETE FROM client WHERE client_id = 'nama-tenant';
```

Penghapusan akan menghapus semua data terkait (cascade).

Alternatif: ubah status menjadi `offline`.

---

## Referensi

- [Notification Template Setup](./template-notification-setup.md) – Untuk mengatur template notifikasi per tenant.
- [Whitelist & Blacklist Setup](./event-security-setup.md) – Untuk mengatur kontrol event.