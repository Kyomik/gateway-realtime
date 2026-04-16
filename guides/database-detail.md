┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     DATABASE: auth_service                                  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────┐       ┌─────────────────┐       ┌───────────────┐       ┌─────────────────┐
│    client     │       │     secret      │       │    product    │       │   host_client   │
├───────────────┤       ├─────────────────┤       ├───────────────┤       ├─────────────────┤
│ id (PK)       │◄──┐   │ id (PK)         │       │ id (PK)       │       │ id (PK)         │
│ client_id (UK)│   │   │ key_service     │       │ nama_product  │       │ domain          │
│ status        │   │   │ key_device      │       └───────────────┘       │ api_secret      │
│ created_at    │   │   │ id_client (FK)  │────┐                          │ id_client (FK)  │──┐
│ updated_at    │   │   │ created_at      │    │                          │ id_product (FK) │──┼─┐
└───────────────┘   │   └─────────────────┘    │                          └─────────────────┘  │ │
                    │                          │                                             │ │
                    │   ┌─────────────────┐    │   ┌─────────────────┐                      │ │
                    │   │   enduser       │    │   │  jenis_device   │                      │ │
                    │   ├─────────────────┤    │   ├─────────────────┤                      │ │
                    │   │ id (PK)         │    │   │ id (PK)         │                      │ │
                    │   │ type            │    │   │ type            │                      │ │
                    │   └─────────────────┘    │   │ id_product (FK) │──────────────────────┘ │
                    │                          │   └─────────────────┘                        │
                    │   ┌─────────────────┐    │                                             │
                    │   │  role_transaksi │    │   ┌─────────────────┐                        │
                    │   ├─────────────────┤    │   │ device_transaksi│                        │
                    │   │ id (PK)         │    │   ├─────────────────┤                        │
                    │   │ label_role      │    │   │ id (PK)         │                        │
                    │   │ id_client (FK)  │────┘   │ device_id (UK)  │                        │
                    │   │ id_product (FK) │────────│ status          │                        │
                    │   │ id_enduser (FK) │────┐   │ id_jenis_device │────────────────────────┘
                    │   └─────────────────┘    │   │ id_client (FK)  │──────┐
                    │                          │   │ created_at      │      │
                    │                          │   │ id_enduser (FK) │────┐ │
                    │                          │   └─────────────────┘    │ │
                    │                          │                          │ │
                    │   ┌─────────────────────┐│   ┌─────────────────────┐│ │
                    │   │ event_transaksi     ││   │ refresh_tokens      ││ │
                    │   ├─────────────────────┤│   ├─────────────────────┤│ │
                    │   │ id (PK)             ││   │ id (PK)             ││ │
                    │   │ event (enum)        ││   │ token (UK)          ││ │
                    │   │ id_jenis_device (FK)│┘   │ clientId (FK)       │┘ │
                    │   └─────────────────────┘    │ role                │  │
                    │                              │ expiresAt           │  │
                    │                              │ revoked             │  │
                    │                              │ createdAt           │  │
                    │                              └─────────────────────┘  │
                    │                                                       │
┌───────────────────────────────────────────────────────────────────────────┼─────────────────┐
│                           Whitelist / Blacklist                           │                 │
├───────────────────────────────────────────────────────────────────────────┼─────────────────┤
│ ┌─────────────────────────────┐  ┌─────────────────────────────┐          │                 │
│ │ whitelist_role_send_event   │  │ whitelist_role_get_event    │          │                 │
│ ├─────────────────────────────┤  ├─────────────────────────────┤          │                 │
│ │ id (PK)                     │  │ id (PK)                     │          │                 │
│ │ id_role (FK) ───────────────┼──│ id_role (FK) ───────────────┼──┐       │                 │
│ │ id_event (FK) ──────────────┼──│ id_event (FK) ──────────────┼──┼─┐     │                 │
│ └─────────────────────────────┘  └─────────────────────────────┘  │ │     │                 │
│ ┌─────────────────────────────┐  ┌─────────────────────────────┐  │ │     │                 │
│ │ blacklist_device_send_event │  │ blacklist_device_get_event  │  │ │     │                 │
│ ├─────────────────────────────┤  ├─────────────────────────────┤  │ │     │                 │
│ │ id (PK)                     │  │ id (PK)                     │  │ │     │                 │
│ │ id_device_transaksi (FK) ───┼──│ id_device_transaksi (FK) ───┼──┼─┼─┐   │                 │
│ │ id_event (FK) ──────────────┼──│ id_event (FK) ──────────────┼──┼─┼─┼─┐ │                 │
│ └─────────────────────────────┘  └─────────────────────────────┘  │ │ │ │ │                 │
└───────────────────────────────────────────────────────────────────┼─┼─┼─┼─┼─────────────────┘
                                                                      │ │ │ │ │
                                                                      ▼ ▼ ▼ ▼ ▼
                                                              ┌─────────────────┐
                                                              │  event_transaksi│
                                                              │  (id referenced)│
                                                              └─────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                              Notification & Configuration                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────┐    ┌─────────────────────────┐    ┌─────────────────────────┐  │
│ │ notification_templates  │    │    template_contents    │    │       smtp_config       │  │
│ ├─────────────────────────┤    ├─────────────────────────┤    ├─────────────────────────┤  │
│ │ id (PK)                 │◄───│ template_id (FK)        │    │ id (PK)                 │  │
│ │ client_id (string, UK)  │    │ channel                 │    │ client_id (FK) ─────────┼──┐
│ │ event_name (UK)         │    │ key_name                │    │ smtp_host               │  │
│ │ created_at              │    │ content_value           │    │ smtp_port               │  │
│ │ updated_at              │    │ sort_order              │    │ smtp_username           │  │
│ └─────────────────────────┘    │ created_at              │    │ smtp_password           │  │
│                                └─────────────────────────┘    │ encryption              │  │
│ ┌─────────────────────────┐                                    │ created_at              │  │
│ │    firebase_config      │                                    │ updated_at              │  │
│ ├─────────────────────────┤                                    │ address                 │  │
│ │ id (PK)                 │                                    └─────────────────────────┘  │
│ │ client_id (FK) ─────────┼────────────────────────────────────────────────────────────────┘
│ │ project_id              │
│ │ private_key             │
│ │ client_email            │
│ │ created_at              │
│ │ updated_at              │
│ └─────────────────────────┘
└─────────────────────────────────────────────────────────────────────────────────────────────┘

## Keterangan Relasi

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

## Catatan Penting

- **Whitelist** berlaku untuk browser (role), **blacklist** untuk device.
- **enduser** menyimpan tipe pengguna (`browser`, `device`, `desktop`) dan dihubungkan ke `role_transaksi` atau `device_transaksi`.
- **refresh_tokens** menyimpan token refresh untuk JWT browser.
- **firebase_config** dan **smtp_config** adalah konfigurasi per tenant untuk autentikasi Firebase dan email.
- **`notification_templates.client_id`** adalah string yang mengacu ke `client.client_id` (bukan foreign key numerik ke `client.id`). Ini disengaja untuk kemudahan administrasi.