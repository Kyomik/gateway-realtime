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