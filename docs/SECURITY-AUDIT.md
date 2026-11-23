# OpsPilot Security Audit & Hardening Report

**Audit Date:** 2026-11-23  
**Standards:** OWASP Top 10, ITIL v4 Security Governance, NIST 800-63B

---

## 1. Security Controls Verification

### 1.1 Password Storage & Cryptography
- **Algorithm:** Argon2id (`argon2` npm package with default high-memory/iteration parameters).
- **Status:** **PASS**. No plaintext passwords stored. Seed script generates Argon2id hashes.

### 1.2 Authentication & Session Management
- **Access Tokens:** Short-lived JWTs (15 minutes expiration).
- **Refresh Tokens:** Cryptographically random tokens stored hashed in the `RefreshToken` database table with revocation timestamp on logout (`revokeMany`).
- **Cookie Flags:** `HttpOnly`, `SameSite=lax`, and `secure` in production.
- **Status:** **PASS**.

### 1.3 Role-Based Access Control (RBAC)
- **Roles:** `ADMIN`, `IT_MANAGER`, `SERVICE_DESK_AGENT`, `IT_ENGINEER`, `ASSET_MANAGER`, `EMPLOYEE`.
- **Enforcement:** Enforced at the controller level using `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles(...)`. Forbidden exceptions (403) returned if the user lacks the necessary permission.
- **Status:** **PASS**.

### 1.4 Rate Limiting & Denial of Service Protection
- **Module:** `@nestjs/throttler` configured with global application guard.
- **Thresholds:** 100 requests per 60 seconds per IP, protecting `/auth/login` from credential-stuffing attacks.
- **Status:** **PASS**.

### 1.5 Database Injection Protection
- **Mechanism:** Parameterized queries via Prisma ORM 7 with `@prisma/adapter-pg`.
- **Status:** **PASS**. No raw dynamic SQL concatenation present in application services.

### 1.6 Audit Trails
- **Tamper Evidence:** Audit records are stored in `AuditLog` table with actor ID, action, entity type, target ID, metadata, and IP address. No user API exists to delete or alter audit logs.
- **Status:** **PASS**.
