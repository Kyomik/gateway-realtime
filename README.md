<p align="center">
Realtime Multi-Tenant Gateway – satu pintu komunikasi WebSocket yang menghubungkan berbagai tipe pengguna (browser, device, desktop) dalam satu tenant, lengkap dengan routing dinamis, retry mechanism, dan kontrol event.
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


# 🚀 Realtime Multi-Tenant Gateway

## ⚡ Description

This project is a communication layer between different end-user types within the same tenant.  
Built using the [NestJS](https://github.com/nestjs/nest) framework.

## 🧠 Core Concept

This system acts as a **realtime multi-tenant gateway** that connects different types of end-users within the same tenant.

It provides a unified communication layer using WebSocket, enabling:
- realtime event delivery
- dynamic routing based on tenant, product, and user type
- seamless integration with backend services via API calls

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
-> [View Docs](./docs/security.md)

### 🌐 Communication Layer 
- Pure WebSocket Gateway
- API Call (Synchronous Service-to-Service)
- Multi-tenant Routing (Tenant + Product + End-User Type)
- Whitelist & Blacklist Event Control
-> [View Docs](./docs/communication.md)

### 🔁 Reliability
- Event Retry Mechanism with Backoff Strategy
- QoS Support (0, 1, 2)
- Acknowledgement System (ACK/NACK)
- Timeout Handling
-> [View Docs](./docs/reliability.md)

### 📢 Notification
- Notification Template per Tenant
- Multi-Channel Notifications  (Currently supports SMTP only)
-> [View Docs](./docs/notification.md)


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
Internal / External Services
```

## 🔁 Bagaimana cara kerjanya?

1. **Koneksi** – Client (browser/device) connect ke WebSocket Gateway.
2. **Auth** – Gateway verifikasi token (JWT untuk web, HMAC untuk device, Firebase untuk desktop app).
3. **Routing** – Dari metadata token, gateway tahu tenantId, product, userType. Event masuk akan dicocokkan ke whitelist/blacklist.
4. **Delivery** – Event dikirim ke service tujuan (via internal API atau publish ke message broker).
5. **Reliability** – Jika gagal, retry dengan exponential backoff hingga timeout. QoS 1/2 membutuhkan ACK.

## 📌 Use Case

- Realtime chat system (multi-tenant SaaS)
- Notification delivery system
- IoT / device communication gateway
- Event-driven backend orchestration
- Multi-platform communication (browser, device, desktop)

## ⚙️ Environment Variables

See full configuration example here:  
-> [View Docs](./.env.example)

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

## Maintainer
Ilham – [@kyoomik](https://instagram.com/kyoomik)

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.