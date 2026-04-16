<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue" alt="Version" />
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
</p>

# 🚀 Realtime Multi-Tenant Gateway

## ⚡ Description

This project is a communication layer between different end-user types within the same tenant.  
Built using the [NestJS](https://github.com/nestjs/nest) framework.

## 🧠 Core Concept

This system acts as a **realtime multi-tenant gateway** that connects different types of end-users within the same tenant.

It provides a unified communication layer using WebSocket, enabling:
- realtime event delivery
- dynamic routing based on tenant, product, and user type
- integration with backend services via synchronous API calls

The gateway abstracts complexity by handling authentication, routing, reliability, and communication in a single layer.

## 📚 Documentation

Detailed documentation per module:

- 🔐 Security → [View Docs](./docs/security.md)
- 🌐 Communication → [View Docs](./docs/communication.md)
- 🔁 Reliability → [View Docs](./docs/reliability.md)
- 📢 Notification → [View Docs](./docs/notification.md)


## 🚀 Features

### 🔐 Security 
- Rate Limiter (HTTP & WebSocket)
- Multi Authentication:
  - JWT (browser)
  - HMAC (device)
  - Firebase Token (desktop)

### 🌐 Communication Layer 
- Pure WebSocket Gateway
- API Call (Synchronous Service-to-Service)
- Multi-tenant Routing (Tenant + Product + End-User Type)
- Whitelist & Blacklist Event Control

### 🔁 Reliability
- Event Retry Mechanism with Backoff Strategy
- QoS Support (0, 1, 2)
- Acknowledgement System (ACK/NACK)
- Timeout Handling

### 📢 Notification
- Notification Template per Tenant
- Multi-Channel Notifications  (Currently supports SMTP only)

## 🏗 Architecture

```text
End User
   │
   ▼
API Backend (Authentication & Token)
   │
   ▼
WebSocket Gateway (This System)
   │
   ▼
Routing Engine (Tenant + Product + User Type)
   │
   ▼
Internal / External Services (Optional)
```

## 🔁 How it works?

1. **Connection** – Client (browser/device) connects to the WebSocket Gateway.
2. **Auth** – Gateway verifies the token (JWT for web, HMAC for device, Firebase token for desktop app).
3. **Routing** – From token metadata, the gateway knows tenantId, product, and userType. Incoming events are matched against whitelist/blacklist rules.
4. **Delivery** – Events are sent to the target service (via internal API or published to a message broker).
5. **Reliability** – On failure, retry with exponential backoff until timeout. QoS 1/2 requires ACK.

## 📌 Use Case

- Realtime chat system (multi-tenant SaaS)
- Notification delivery system
- IoT / device communication gateway
- Event-driven backend orchestration
- Multi-platform communication (browser, device, desktop)

## ⚙️ Environment Variables

- [Example configuration](./.env.example) – Minimal example file.
- [Detailed field descriptions](./docs/env-detail.md) – Explanation of every variable.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## 📖 User Guide

- [Getting Started](./guides/getting-started.md) – Koneksi WebSocket, autentikasi, kirim event.
- [Available Events](./guides/available-events.md) – Daftar event yang tersedia dan formatnya.
- [Send Notifications](./guides/notification-send.md) - Cara menggunakan fitur notification gateway.

## 👨‍💼 Administrator Guide
- [Database-Schema](./docs/database-schema.md) - Penjelasan Relasi tiap tabel.
- [Multi-Tenant Setup](./guides/tenant-setup.md) – Cara menambah, mengedit, atau menghapus tenant.
- [Notification Template Setup](./guides/template-notification-setup.md) – Cara setup template notifikasi per tenant.
- [Whitelist & Blacklist Setup](./guides/event-security-setup.md) – Cara mengatur kontrol event (whitelist/blacklist) per tenant, product, dan user type.

## Maintainer
- Ilham – [@kyoomik](https://instagram.com/kyoomik)
- [@Techno Kreatif Solusindo](https://www.instagram.com/technokreatifsolusindo)

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.