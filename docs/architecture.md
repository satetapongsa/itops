# OpsPilot Architecture Specification

## 1. System Overview
OpsPilot is an enterprise-grade IT Operations Management Platform designed to unify:
- IT Service Management (ITSM) / IT Service Desk
- Incident and Problem Management
- Change Management
- Service Catalog & Service Request Fulfillment
- SLA Engine with business calendar calculations
- IT Asset Management (ITAM) with hardware/software lifecycle tracking
- Infrastructure Monitoring with synthetic simulation & auto-incident triggers
- Knowledge Base with role-aware article publishing
- Executive Dashboard and operational reporting with real-time SSE updates

## 2. Monorepo Structure (pnpm workspaces)
```text
opspilot/
├── apps/
│   ├── web/                     # Next.js 16 (App Router, Tailwind CSS 4, shadcn/ui, TanStack Query)
│   ├── api/                     # NestJS 12 (REST API, Swagger, Passport, Argon2id, Prisma 7)
│   └── worker/                  # Background Worker (BullMQ, Redis, Cron/Simulations)
├── packages/
│   ├── shared/                  # Shared types, enums, constants, validation schemas (Zod)
│   ├── api-contracts/           # DTO interfaces and API request/response types
│   └── config/                  # Shared ESLint, TSConfig, Prettier configurations
├── prisma/
│   ├── schema.prisma            # PostgreSQL schema with Prisma ORM 7
│   ├── migrations/              # Prisma database migration scripts
│   └── seed.ts                  # Enterprise realistic demo dataset
├── docs/                        # Architecture, DB design, workflows, progress
├── docker-compose.yml           # Local dev & production container setup
├── pnpm-workspace.yaml
├── package.json
└── .env.example
```

## 3. Communication Architecture
- **Web -> API**: REST API (`/api/v1/*`) over HTTP/JSON with JWT authentication (access token + HttpOnly refresh token).
- **Web <- API**: Server-Sent Events (SSE) via `/api/v1/events/stream` for real-time alerts, SLA countdowns, and dashboard updates, with TanStack Query polling fallback.
- **API -> Redis / BullMQ**: Enqueues jobs for notifications, SLA breach evaluations, synthetic metric generation, and automated incident creation.
- **Worker -> Redis / DB**: Processes background queues, performs recurring health evaluations, updates SLA clocks, and records monitoring events.

## 4. Security & RBAC Architecture
- 6 Standard System Roles:
  1. `ADMIN` - Full administrative rights, user/SLA/system settings, audit logs.
  2. `IT_MANAGER` - Incident oversight, change approvals, service request approvals, reports.
  3. `SERVICE_DESK_AGENT` - Ticket triaging, user communications, service request handling.
  4. `IT_ENGINEER` - Technical incident resolution, infrastructure monitoring, change implementation.
  5. `ASSET_MANAGER` - Hardware/software asset registration, assignment, warranty tracking.
  6. `EMPLOYEE` - Self-service ticket logging, catalog requests, knowledge base lookup.
- Cryptography: Argon2id password hashing.
- Token Rotation: Short-lived JWT access tokens + cryptographically random refresh tokens stored in DB with revocation support.
- Role & Permission Guards on NestJS controllers to prevent unauthorized endpoint access.
