# OpsPilot Deployment Verification & Operations Guide

## 1. Architecture Deployment Topology

```text
                  Reverse Proxy / Browser
                            │
               ┌────────────┴────────────┐
               ▼ (Port 3000)             ▼ (Port 4000)
       [Next.js Web App]          [NestJS REST API]
               │                         │
               │ (API Calls)             ├───────────────┐
               └────────────────────────►│               │
                                         ▼               ▼
                                   [PostgreSQL 18] [Redis 8.2]
                                         ▲               ▲
                                         │               │
                                  [BullMQ Background Worker]
```

## 2. Prerequisites
- Node.js 24 LTS or higher (tested on Node.js v26.13)
- pnpm 12+ (`npm install -g pnpm`)
- Docker & Docker Compose (optional for local full-stack run)

## 3. Local Development Startup

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL & Redis via Docker
docker compose up -d postgres redis mailpit

# 3. Generate Prisma client & apply database schema
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 4. Start all applications concurrently
pnpm dev
```

The services will be available at:
- **Frontend Web Dashboard:** `http://localhost:3000`
- **Backend REST API:** `http://localhost:4000/api/v1`
- **API Swagger Documentation:** `http://localhost:4000/api/docs`
- **Health Check Endpoint:** `http://localhost:4000/api/v1/health`
- **Mailpit Local Email UI:** `http://localhost:8025`

## 4. Full Containerized Deployment (Docker Compose)

```bash
docker compose up --build
```
This builds production images for `opspilot-api`, `opspilot-web`, and `opspilot-worker` with multi-stage Alpine containers.
