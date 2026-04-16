# Database Schema 

![Diagram Arsitektur](./images/database-schema.png)

## 📌 Keterangan Relasi

- **client (1) → (N) secret** : satu client punya banyak secret (`key_service`, `key_device`)
- **client (1) → (N) host_client** : satu client punya banyak domain/API untuk produk berbeda
- **client (1) → (N) role_transaksi** : satu client punya banyak role
- **client (1) → (N) device_transaksi** : satu client punya banyak device
- **client (1) → (N) refresh_tokens** : satu client punya banyak refresh token
- **product (1) → (N) host_client** : satu product bisa dipakai banyak client
- **product (1) → (N) jenis_device** : satu product punya banyak jenis device
- **product (1) → (N) role_transaksi** : satu product bisa diakses banyak role
- **jenis_device (1) → (N) device_transaksi** : satu jenis device bisa dipakai banyak device
- **jenis_device (1) → (N) event_transaksi** : satu jenis device punya banyak event yang diizinkan
- **enduser (1) → (N) role_transaksi** : satu enduser bisa punya banyak role
- **enduser (1) → (N) device_transaksi** : satu enduser bisa punya banyak device
- **role_transaksi (1) → (N) whitelist_role_send_event** : satu role punya banyak whitelist send
- **role_transaksi (1) → (N) whitelist_role_get_event** : satu role punya banyak whitelist get
- **device_transaksi (1) → (N) blacklist_device_send_event** : satu device punya banyak blacklist send
- **device_transaksi (1) → (N) blacklist_device_get_event** : satu device punya banyak blacklist get
- **event_transaksi (1) → (N) whitelist/blacklist** : satu event bisa muncul di banyak aturan akses
- **notification_templates (1) → (N) template_contents** : satu template punya banyak konten (subject/body per channel)

## 🧩 Catatan Penting

- **Whitelist** berlaku untuk browser (role), **blacklist** untuk device.
- **enduser** menyimpan tipe pengguna (`browser`, `device`, `desktop`) dan dihubungkan ke `role_transaksi` atau `device_transaksi`.
- **refresh_tokens** menyimpan token refresh untuk JWT browser.
- **firebase_config** dan **smtp_config** adalah konfigurasi per tenant untuk autentikasi Firebase dan email.
- **`notification_templates.client_id`** adalah string yang mengacu ke `client.client_id` (bukan foreign key numerik ke `client.id`). Ini disengaja untuk kemudahan administrasi.
