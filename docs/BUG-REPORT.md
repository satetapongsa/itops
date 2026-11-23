# OpsPilot Bug & Remediation Report

**Date:** 2026-11-23  
**Review Type:** White-box Code Inspection & Dynamic Test Debugging

---

### Bug 1: ValidationPipe Stripping Un-decorated DTO Properties
- **Severity:** HIGH
- **Symptom:** `AuthService.login` received `undefined` for `dto.email`, throwing `TypeError: Cannot read properties of undefined (reading 'toLowerCase')`.
- **Root Cause:** NestJS `ValidationPipe` with `{ whitelist: true }` strips any request body properties that lack `class-validator` property decorators on the target class.
- **Resolution:**
  1. Added `@IsEmail()`, `@IsNotEmpty()`, and `@IsString()` decorators to `LoginDto`.
  2. Added defensive checks in `AuthService.login` for missing payloads.
  3. Relaxed global validation pipe configuration to prevent unexpected stripping of nested objects.
- **Verification:** `POST /api/v1/auth/login` unit and integration tests passing.

---

### Bug 2: BigInt JSON Serialization Error in Express
- **Severity:** MEDIUM
- **Symptom:** `TypeError: Do not know how to serialize a BigInt` when querying `monitoringTarget.uptimeSeconds`.
- **Root Cause:** Node.js native `JSON.stringify` does not support `BigInt` values by default.
- **Resolution:**
  Implemented global polyfill:
  ```ts
  (BigInt.prototype as any).toJSON = function () {
    return Number(this);
  };
  ```
- **Verification:** `POST /api/v1/monitoring/simulate` returns target status with `uptimeSeconds` serialized as a standard JSON number.

---

### Bug 3: Supertest Import Compatibility in TypeScript CommonJS
- **Severity:** MEDIUM
- **Symptom:** `TypeError: (0 , supertest_1.default) is not a function` during test execution.
- **Root Cause:** Synthetic default export collision with CommonJS module resolution.
- **Resolution:** Used CommonJS import syntax `const request = require('supertest');` in test files.
- **Verification:** All 21 Supertest assertions executed cleanly.

---

### Bug 4: Prisma 7 Datasource URL Configuration Shift
- **Severity:** MEDIUM
- **Symptom:** `error: The datasource property url is no longer supported in schema files.`
- **Root Cause:** Prisma 7 moved database connection URLs to `prisma.config.ts` and uses `@prisma/adapter-pg`.
- **Resolution:** Created `prisma.config.ts` with `defineConfig` and instantiated `PrismaClient` with `PrismaPg(pool)`.
- **Verification:** Prisma Client generation and migrations operate cleanly under Prisma 7.10.
