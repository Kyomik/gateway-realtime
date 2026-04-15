# Available Events

## Absensi Product

| Event Name | Description | Sent By | Received By | Payload Example |
|------------|-------------|---------|-------------|-----------------|
| `rfid-scan` | Kirim scan RFID untuk login/register/update | Device | Browser | `{ "uid": "12345", "mode": "login" }` |
| `change-mode` | Ubah mode operasi device | Browser | Device | `{ "mode": "register" }` |
| `cancel-reservasi` | Batalkan reservasi | Device | Self | `{ "id": 123, "uid": "12345" }` |

## Monitoring Product

| Event Name | Description | Sent By | Received By | Notes |
|------------|-------------|---------|-------------|-------|
| `stream-image` | Kirim frame gambar (binary) | Device | Desktop | Binary event, tidak pakai JSON |

## Common Events

| Event Name | Description | Sent By | Received By |
|------------|-------------|---------|-------------|
| `event:ack` | Acknowledgment untuk QoS 2 | Any | Server |
| `event:delivered` | Notifikasi event telah terkirim | Server | Sender |