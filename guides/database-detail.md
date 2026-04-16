erDiagram
    client {
        bigint id PK
        varchar client_id UK
        enum status
        timestamp created_at
        timestamp updated_at
    }
    secret {
        bigint id PK
        varchar key_service
        varchar key_device
        bigint id_client FK
        timestamp created_at
    }
    product {
        bigint id PK
        varchar nama_product
    }
    host_client {
        bigint id PK
        varchar domain
        varchar api_secret
        bigint id_client FK
        bigint id_product FK
        timestamp created_at
    }
    enduser {
        bigint id PK
        enum type
    }
    jenis_device {
        bigint id PK
        enum type
        bigint id_product FK
    }
    role_transaksi {
        bigint id PK
        varchar label_role
        bigint id_client FK
        bigint id_product FK
        bigint id_enduser FK
    }
    device_transaksi {
        bigint id PK
        varchar device_id UK
        enum status
        bigint id_jenis_device FK
        bigint id_client FK
        timestamp created_at
        bigint id_enduser FK
    }
    event_transaksi {
        bigint id PK
        enum event
        bigint id_jenis_device FK
    }
    refresh_tokens {
        int id PK
        varchar token UK
        bigint clientId FK
        varchar role
        datetime expiresAt
        tinyint revoked
        datetime createdAt
    }
    whitelist_role_send_event {
        bigint id PK
        bigint id_role FK
        bigint id_event FK
    }
    whitelist_role_get_event {
        bigint id PK
        bigint id_role FK
        bigint id_event FK
    }
    blacklist_device_send_event {
        bigint id PK
        bigint id_device_transaksi FK
        bigint id_event FK
    }
    blacklist_device_get_event {
        bigint id PK
        bigint id_device_transaksi FK
        bigint id_event FK
    }
    notification_templates {
        int id PK
        varchar client_id UK
        varchar event_name UK
        timestamp created_at
        timestamp updated_at
    }
    template_contents {
        int id PK
        int template_id FK
        varchar channel
        varchar key_name
        text content_value
        int sort_order
        timestamp created_at
    }
    smtp_config {
        bigint id PK
        bigint client_id FK
        varchar smtp_host
        int smtp_port
        varchar smtp_username
        varchar smtp_password
        enum encryption
        timestamp created_at
        timestamp updated_at
        varchar address
    }
    firebase_config {
        int id PK
        bigint client_id FK
        varchar project_id
        text private_key
        varchar client_email
        datetime created_at
        datetime updated_at
    }

    %% Relationships
    client ||--o{ secret : "has"
    client ||--o{ host_client : "has"
    client ||--o{ role_transaksi : "has"
    client ||--o{ device_transaksi : "has"
    client ||--o{ refresh_tokens : "has"
    product ||--o{ host_client : "used by"
    product ||--o{ jenis_device : "has"
    product ||--o{ role_transaksi : "accessible by"
    jenis_device ||--o{ device_transaksi : "has"
    jenis_device ||--o{ event_transaksi : "has"
    enduser ||--o{ role_transaksi : "has"
    enduser ||--o{ device_transaksi : "has"
    role_transaksi ||--o{ whitelist_role_send_event : "has"
    role_transaksi ||--o{ whitelist_role_get_event : "has"
    device_transaksi ||--o{ blacklist_device_send_event : "has"
    device_transaksi ||--o{ blacklist_device_get_event : "has"
    event_transaksi ||--o{ whitelist_role_send_event : "referenced"
    event_transaksi ||--o{ whitelist_role_get_event : "referenced"
    event_transaksi ||--o{ blacklist_device_send_event : "referenced"
    event_transaksi ||--o{ blacklist_device_get_event : "referenced"
    notification_templates ||--o{ template_contents : "contains"
    client ||--o{ smtp_config : "has"
    client ||--o{ firebase_config : "has"

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