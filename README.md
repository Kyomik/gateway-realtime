<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>

<p align="center">
A scalable realtime gateway for multi-tenant communication, event routing, and service orchestration.
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
- Event Retry Mechanism With Backoff Strategy
- QoS Support (0, 1, 2)
- Acknowledgement System (ACK/NACK)
- Timeout Handling
-> [View Docs](./docs/reliability.md)

### 📢 Notification
- Notification Template Tenant
- Notification Multi Channel  (Only SMTP now)
-> [View Docs](./docs/notification.md)


## 🏗 Architecture

```text
End User
   ↓
API Backend (Authentication & Token)
   ↓
WebSocket Gateway (This System)
   ↓
Routing Engine (Tenant + Product + User Type)
   ↓
Internal / External Services


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

## Stay in touch

Info Developer Framework :
- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

Info Developer Project :
- Author - Ilham
- Instagram - https://www.instagram.com/kyoomik/

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for details.