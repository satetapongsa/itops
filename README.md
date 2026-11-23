# OpsPilot — IT Operations Command Center

Enterprise-grade IT Operations Management (ITOM) & IT Service Management (ITSM) Platform built with Next.js 15/16, NestJS 11/12, Prisma 7, PostgreSQL 18, and Redis 8.2.

---

## 🌟 Core Features

1. **Executive Operations Dashboard:** Real-time KPI metrics, active incident stream, SLA compliance tracking, and live Server-Sent Events (SSE) connectivity.
2. **Incident Management (ITIL):** Automated priority matrix calculation (Impact × Urgency), multi-stage status workflow (`NEW` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED` ➔ `CLOSED`), SLA tracking, and internal collaboration notes.
3. **Infrastructure Monitoring Center & Simulator:** Real-time monitoring of simulated enterprise targets (`WEB-SERVER-01`, `DB-SERVER-01`, `CORE-SWITCH-01`) with interactive failure simulation (**Server Down**, **CPU Spike**, **Recovery**) and **Automated Incident Creation Watchdog**.
4. **IT Asset Management (ITAM):** Comprehensive hardware/software asset lifecycle tracking, immutable assignment history, and CSV inventory export.
5. **Change Management (CAB):** Change Enablement workflows, risk level assessments, implementation and rollback planning, and manager approvals.
6. **Problem Management & RCA:** Root Cause Analysis tracking, incident linking, and known error records.
7. **IT Service Catalog:** Standard service requests (VPN, hardware, software access) with manager approval workflows.
8. **Knowledge Base:** Internal troubleshooting guides, categorization, and user helpfulness feedback.
9. **Reports & Analytics:** Automatic calculation of industry standard operational KPIs: Mean Time to Acknowledge (MTTA), Mean Time to Resolve (MTTR), SLA compliance rate, and Infrastructure availability percentage.

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
# Install all dependencies across pnpm workspace
pnpm install
```

### 2. Environment Configuration
Ensure `.env` exists (copied from `.env.example`):
```bash
cp .env.example .env
```

### 3. Database & Cache Infrastructure
```bash
# Start PostgreSQL 18, Redis 8.2, and Mailpit
docker compose up -d postgres redis mailpit

# Generate Prisma 7 Client & seed demo records
pnpm exec prisma generate --schema=prisma/schema.prisma
pnpm db:seed
```

### 4. Running the Application
```bash
# Start all applications in development mode
pnpm dev
```
- **Web App:** [http://localhost:3000](http://localhost:3000)
- **API Swagger Docs:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
- **API Health Check:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## 🧪 Testing

```bash
# Run TypeScript compilation checks across all workspaces
pnpm -r run typecheck

# Run unit tests
pnpm --filter @opspilot/api test

# Run comprehensive integration test suite
pnpm --filter @opspilot/api exec jest --config test/jest-e2e.json test/comprehensive-e2e.spec.ts

# Run production builds
pnpm run build
```

---

## 👥 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@opspilot.local` | `AdminPassword123!` |
| **IT Manager** | `manager@opspilot.local` | `AdminPassword123!` |
| **Service Desk Agent** | `agent@opspilot.local` | `AdminPassword123!` |
| **IT Engineer** | `engineer@opspilot.local` | `AdminPassword123!` |
| **Asset Manager** | `assets@opspilot.local` | `AdminPassword123!` |
| **Employee** | `employee@opspilot.local` | `AdminPassword123!` |

*(A Quick Role Switcher is also provided on the `/login` page for fast demonstration).*
