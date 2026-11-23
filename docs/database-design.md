# OpsPilot Database Design

## Database Engine
- PostgreSQL 18 with Prisma ORM 7.
- Primary keys: UUID (`gen_random_uuid()` / `cuid`).
- Strict audit timestamps: `createdAt`, `updatedAt`, and soft delete `deletedAt` where applicable.

## Entity Relationship Overview

### 1. Identity & Access Control
- `User`: id, email, passwordHash, firstName, lastName, role (Admin, ItManager, ServiceDeskAgent, ItEngineer, AssetManager, Employee), departmentId, locationId, status (ACTIVE, SUSPENDED, INACTIVE), lastLoginAt, createdAt, updatedAt.
- `Department`: id, name, code, managerId, createdAt, updatedAt.
- `Location`: id, name, building, floor, address, timezone, createdAt, updatedAt.
- `RefreshToken`: id, userId, tokenHash, expiresAt, revokedAt, createdAt.
- `Session`: id, userId, ipAddress, userAgent, expiresAt, createdAt.

### 2. Service Desk & Incidents
- `Ticket`: id, ticketNumber (e.g. INC-2026-00001, REQ-2026-00001), type (INCIDENT, SERVICE_REQUEST), title, description, priority (P1, P2, P3, P4), impact (HIGH, MEDIUM, LOW), urgency (HIGH, MEDIUM, LOW), status (NEW, ACKNOWLEDGED, IN_PROGRESS, PENDING_USER, PENDING_VENDOR, RESOLVED, CLOSED, CANCELLED), requesterId, assigneeId, departmentId, relatedAssetId, relatedTargetId, resolvedAt, closedAt, firstResponseAt, resolutionNotes, rootCause, createdAt, updatedAt.
- `TicketComment`: id, ticketId, authorId, content, isInternal, createdAt, updatedAt.
- `TicketHistory`: id, ticketId, actorId, action, fieldChanged, oldValue, newValue, createdAt.
- `TicketAttachment`: id, ticketId, fileName, fileUrl, fileSize, mimeType, uploadedById, createdAt.

### 3. Service Catalog & Requests
- `ServiceCatalogItem`: id, name, description, category, formSchema (JSON), requiresApproval, defaultAssigneeId, estimatedFulfillmentHours, isActive, createdAt, updatedAt.
- `ServiceRequestApproval`: id, ticketId, approverId, status (PENDING, APPROVED, REJECTED), decisionNotes, decidedAt, createdAt.

### 4. SLA Engine
- `SlaPolicy`: id, name, priority, firstResponseTargetMinutes, resolutionTargetMinutes, businessCalendarId, isActive, createdAt, updatedAt.
- `SlaClock`: id, ticketId, slaPolicyId, isPaused, pausedAt, totalPausedMinutes, firstResponseDeadline, resolutionDeadline, firstResponseBreached, resolutionBreached, warningTriggered, createdAt, updatedAt.
- `BusinessCalendar`: id, name, timezone, workDays (JSON array [1..5]), startHour (e.g. 09:00), endHour (e.g. 18:00), isDefault, createdAt.
- `BusinessHoliday`: id, calendarId, holidayDate, name, createdAt.

### 5. IT Asset Management (ITAM)
- `Asset`: id, assetTag, name, type (DESKTOP, LAPTOP, SERVER, SWITCH, ROUTER, FIREWALL, PRINTER, MONITOR, MOBILE, STORAGE, LICENSE, OTHER), manufacturer, model, serialNumber, hostname, ipAddress, macAddress, os, status (IN_STOCK, ASSIGNED, IN_REPAIR, MAINTENANCE, RETIRED, LOST), assignedUserId, departmentId, locationId, purchaseDate, warrantyExpiry, purchaseCost, vendor, notes, createdAt, updatedAt.
- `AssetAssignmentHistory`: id, assetId, userId, departmentId, assignedAt, returnedAt, notes, assignedById.
- `AssetMaintenanceRecord`: id, assetId, title, description, cost, performedBy, performedAt, createdAt.

### 6. Infrastructure Monitoring
- `MonitoringTarget`: id, hostname, ipAddress, deviceType (SERVER, SWITCH, ROUTER, DATABASE, APPLICATION), environment (PRODUCTION, STAGING, DEVELOPMENT), location, status (UP, DEGRADED, DOWN, MAINTENANCE, UNKNOWN), lastHeartbeat, cpuUsage, memoryUsage, diskUsage, responseTimeMs, uptimeSeconds, isSimulated, createdAt, updatedAt.
- `MonitoringMetric`: id, targetId, cpuUsage, memoryUsage, diskUsage, responseTimeMs, timestamp.
- `MonitoringEvent`: id, targetId, eventType (CPU_SPIKE, MEMORY_HIGH, DISK_FULL, HOST_DOWN, RECOVERY), severity (INFO, WARNING, CRITICAL), message, acknowledged, incidentId, createdAt.

### 7. Change & Problem Management
- `ChangeRequest`: id, changeNumber (CHG-2026-00001), title, description, category, riskLevel (LOW, MEDIUM, HIGH, CRITICAL), impactAssessment, businessJustification, implementationPlan, rollbackPlan, testPlan, status (DRAFT, SUBMITTED, PENDING_APPROVAL, APPROVED, REJECTED, SCHEDULED, IMPLEMENTING, COMPLETED, FAILED, ROLLED_BACK), requestedById, assignedEngineerId, plannedStart, plannedEnd, actualStart, actualEnd, resultNotes, createdAt, updatedAt.
- `ChangeApproval`: id, changeId, approverId, status (PENDING, APPROVED, REJECTED), notes, decidedAt, createdAt.
- `Problem`: id, problemNumber (PRB-2026-00001), title, description, status (OPEN, INVESTIGATING, KNOWN_ERROR, RESOLVED, CLOSED), rootCause, workaround, correctiveAction, preventiveAction, ownerId, createdAt, updatedAt.
- `ProblemIncident`: id, problemId, ticketId, linkedAt.

### 8. Knowledge Base & Operational Records
- `KnowledgeArticle`: id, title, slug, summary, content, category, tags (array), authorId, status (DRAFT, PUBLISHED, ARCHIVED), viewCount, helpfulCount, notHelpfulCount, publishedAt, createdAt, updatedAt.
- `Notification`: id, userId, title, message, type (INFO, WARNING, CRITICAL, SLA, APPROVAL), isRead, linkUrl, createdAt.
- `AuditLog`: id, actorId, action, entityType, entityId, metadata (JSON), ipAddress, createdAt.
- `SystemSetting`: id, key, value (JSON), description, updatedAt.
