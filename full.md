# MASTER PROMPT: OPSPILOT
## Enterprise IT Operations Management Platform
### Full-Stack Production-Quality Web Application

---

# 1. YOUR ROLE

Act as a Principal Software Architect, Senior Full-Stack Engineer, ITSM Consultant, DevOps Engineer, Infrastructure Engineer, and UI/UX Designer.

You are responsible for designing and implementing a complete enterprise-grade IT Operations Management Platform named:

**OpsPilot — IT Operations Command Center**

You must build a real, working, full-stack web application, not just a frontend prototype, static dashboard, or collection of mockup screens.

You are expected to:
- Design the complete software architecture.
- Create the frontend and backend.
- Design and implement the relational database.
- Build REST APIs.
- Implement authentication and authorization.
- Implement all business workflows.
- Integrate background jobs and notifications.
- Build realistic monitoring simulations.
- Create dashboards, reports, and analytics.
- Write automated tests.
- Configure Docker and deployment.
- Write technical documentation.

Do not stop after creating a project plan. Implement the actual application.

When something is unspecified, make reasonable enterprise software design decisions and document your assumptions. Do not repeatedly ask the user basic questions.

---

# 2. PRODUCT VISION

OpsPilot is an internal IT Operations Management Platform for a medium-sized enterprise.

The purpose is to centralize IT service management, infrastructure visibility, IT asset inventory, incident handling, and operational reporting in one application.

The system should simulate the real operational workflow of an enterprise IT department.

The application must support the following operational areas:

1. IT Service Desk
2. Incident Management
3. Service Request Management
4. SLA Management
5. IT Asset Management
6. Infrastructure Monitoring
7. Change Management
8. Problem Management
9. Knowledge Base
10. IT Operations Analytics
11. User and Permission Management
12. Audit and Activity Logging

This application is also intended to demonstrate practical knowledge of IT Operations, ITSM, IT Infrastructure, System Administration, and operational processes.

## Product principles

- Enterprise-quality user experience.
- Accurate business logic.
- Secure role-based access control.
- Maintainable and modular architecture.
- Responsive interface.
- Real database persistence.
- Functional APIs.
- Realistic demo data.
- Reliable error handling.
- Fully documented setup and deployment.

IMPORTANT: Do not build a visual-only demo. Every primary button, form, filter, table action, and dashboard interaction must work.

---

# 3. TECHNOLOGY STACK

Use a TypeScript-based full-stack architecture.

## Frontend

- Next.js 16.x
- React
- TypeScript
- App Router
- Tailwind CSS 4
- shadcn/ui
- Lucide Icons
- TanStack Query
- React Hook Form
- Zod
- Recharts
- date-fns

## Backend

- NestJS 12.x
- TypeScript
- REST API
- Prisma ORM 7.x
- Swagger / OpenAPI
- JWT Authentication
- Passport
- Argon2id password hashing
- Class Validator
- Class Transformer

## Database

- PostgreSQL 18.x

## Caching and Background Processing

- Redis 8.2.x
- BullMQ
- Scheduled background jobs

## Real-time communication

- Server-Sent Events (SSE) for dashboard and notification updates.
- TanStack Query polling as a fallback.

## Infrastructure

- Docker
- Docker Compose
- Nginx or Caddy reverse proxy
- GitHub Actions CI/CD
- Mailpit for local email testing

## Development Environment

- Node.js 24 LTS
- pnpm
- Git
- ESLint
- Prettier

Use compatible, stable releases within these major versions. Do not use alpha, beta, canary, or release-candidate packages in the main application.

Use Prisma ORM 7, not Prisma ORM 8 Release Candidate.

---

# 4. SYSTEM ARCHITECTURE

Implement a modular monolith with a separate background worker.

Do not introduce unnecessary microservices.

## High-level architecture

```text
                 USER / BROWSER
                       |
                       v
              NEXT.JS FRONTEND
                 Port 3000
                       |
                       v
                REST API GATEWAY
                 NESTJS API
                 Port 4000
                       |
          +------------+------------+
          |            |            |
          v            v            v
      PostgreSQL     Redis       SSE Events
       Database      Queue       Real-time
          |            |
          |            v
          |       BACKGROUND WORKER
          |            |
          |      Scheduled Jobs
          |      SLA Monitoring
          |      Infrastructure Simulator
          |      Notifications
          |      Incident Automation
          |            |
          +------------+
```

## Monorepo structure

Use pnpm workspaces.

```text
opspilot/
|
+-- apps/
|   |
|   +-- web/
|   |   +-- app/
|   |   +-- components/
|   |   +-- hooks/
|   |   +-- lib/
|   |   +-- services/
|   |   +-- types/
|   |
|   +-- api/
|   |   +-- src/
|   |       +-- auth/
|   |       +-- users/
|   |       +-- dashboard/
|   |       +-- tickets/
|   |       +-- incidents/
|   |       +-- service-catalog/
|   |       +-- sla/
|   |       +-- assets/
|   |       +-- monitoring/
|   |       +-- changes/
|   |       +-- problems/
|   |       +-- knowledge/
|   |       +-- reports/
|   |       +-- notifications/
|   |       +-- audit/
|   |       +-- common/
|   |
|   +-- worker/
|       +-- src/
|           +-- processors/
|           +-- schedulers/
|
+-- packages/
|   +-- shared/
|   +-- api-contracts/
|   +-- config/
|
+-- prisma/
|   +-- schema.prisma
|   +-- migrations/
|   +-- seed.ts
|
+-- docs/
|   +-- architecture.md
|   +-- database-design.md
|   +-- api-documentation.md
|   +-- workflows.md
|   +-- deployment.md
|   +-- security.md
|
+-- docker-compose.yml
+-- pnpm-workspace.yaml
+-- .env.example
+-- README.md
```

Adapt the exact structure where necessary while preserving module boundaries.

---

# 5. USER AUTHENTICATION AND RBAC

Implement real authentication and server-side authorization.

## User roles

Create these default roles:

### ADMIN
Full system administration permissions.

- Manage all users.
- Manage roles and permissions.
- Configure system settings.
- Manage SLA policies.
- Access every module.
- View audit logs.

### IT_MANAGER
IT department management.

- View operational dashboard.
- Manage incidents.
- Assign tasks.
- Approve changes.
- Approve service requests.
- View operational reports.
- Monitor SLA performance.

### SERVICE_DESK_AGENT
Service desk operations.

- Create and manage tickets.
- Respond to users.
- Assign and update tickets.
- Manage service requests.
- View knowledge base.
- Add internal notes.

### IT_ENGINEER
Infrastructure and technical operations.

- View assigned incidents.
- Update technical investigation details.
- Manage infrastructure assets.
- View monitoring alerts.
- Work on approved changes.
- Manage problem investigations.

### ASSET_MANAGER
IT inventory management.

- Register assets.
- Update asset information.
- Assign assets to employees.
- Track maintenance.
- Track warranties.
- View asset reports.

### EMPLOYEE
Regular system user.

- Create support tickets.
- Submit service requests.
- View personal tickets.
- Comment on tickets.
- Access published knowledge articles.

## Authentication requirements

Implement:
- Login.
- Logout.
- Access token.
- Refresh token rotation.
- Secure HttpOnly cookies.
- Password hashing using Argon2id.
- Password reset workflow.
- Session management.
- Account status management.
- Login rate limiting.
- Authentication guards.
- Role-based guards.
- Permission checks on the backend.

Never rely on frontend-only role checks.

Users must only access data authorized for their role.

---

# 6. CORE MODULES

## MODULE A: EXECUTIVE DASHBOARD

Create the main operational dashboard.

The dashboard should provide an overview of IT operations.

### KPI Cards

Display:
- Total open incidents.
- Critical incidents.
- Active service requests.
- SLA breaches.
- Online infrastructure devices.
- Offline infrastructure devices.
- Total IT assets.
- Pending approvals.

### Charts

Create:
1. Incident volume over time.
2. Incidents by priority.
3. Incidents by category.
4. SLA compliance percentage.
5. Infrastructure availability.
6. Ticket resolution trend.
7. IT asset distribution.
8. Change success rate.

### Operational widgets

- Recent incidents.
- Critical alerts.
- Pending approvals.
- SLA warnings.
- Infrastructure status.
- Latest IT activities.

### Dashboard behavior

- Load real data from backend APIs.
- Allow date range selection.
- Support automatic refresh.
- Support real-time updates through SSE.
- Support filtering by department and date.
- Show loading, empty, and error states.

All KPI values must be calculated from the database.

Do not hardcode dashboard numbers.

---

## MODULE B: INCIDENT MANAGEMENT

Build a complete IT incident management system.

An incident represents an interruption or degradation of an IT service.

### Incident categories

- Hardware
- Software
- Network
- Server
- Database
- Email
- Account and Access
- Security
- Application
- Other

### Priority levels

- P1: Critical
- P2: High
- P3: Medium
- P4: Low

Calculate recommended priority using Impact and Urgency.

Allow authorized IT personnel to override priority with a required reason.

### Incident status workflow

```text
NEW
 |
 v
ACKNOWLEDGED
 |
 v
IN_PROGRESS
 |
 +------------------+
 |                  |
 v                  v
PENDING_USER    PENDING_VENDOR
 |                  |
 +--------+---------+
          |
          v
       IN_PROGRESS
          |
          v
       RESOLVED
          |
          v
        CLOSED
```

Also support cancellation where appropriate.

### Incident features

- Automatically generate unique ticket numbers.
- Example: INC-2026-00001.
- Incident title.
- Detailed description.
- Requester.
- Assigned technician.
- Department.
- Category.
- Priority.
- Impact.
- Urgency.
- Related asset.
- Related infrastructure device.
- Creation timestamp.
- First response timestamp.
- Resolution timestamp.
- Resolution notes.
- Root cause.
- Attachments.
- Internal comments.
- User-facing comments.
- Activity timeline.

### Functional actions

- Create incident.
- Assign technician.
- Change priority.
- Change status.
- Add comment.
- Add internal note.
- Attach files.
- Link assets.
- Escalate incident.
- Resolve incident.
- Reopen incident when permitted.
- Close incident.
- View complete history.

Every status transition must be validated by backend business rules.

---

## MODULE C: SERVICE REQUEST MANAGEMENT

Build a Service Catalog.

Employees can submit standard IT requests.

### Example service catalog

1. New Employee Computer Request.
2. Software Installation Request.
3. Email Account Request.
4. VPN Access Request.
5. Network Access Request.
6. Printer Access Request.
7. Shared Folder Permission.
8. Hardware Replacement.
9. Account Unlock Request.
10. General IT Support.

Each catalog item must support:

- Name.
- Description.
- Category.
- Required form fields.
- Approval requirement.
- Assigned department.
- Estimated fulfillment time.
- Active/inactive status.

### Request workflow

```text
SUBMITTED
    |
    v
PENDING_APPROVAL
    |
    +----------+
    |          |
    v          v
 APPROVED   REJECTED
    |
    v
FULFILLMENT
    |
    v
COMPLETED
```

Some low-risk service catalog items may skip approval.

### Features

- Dynamic request form.
- Request tracking.
- Approval management.
- Fulfillment assignment.
- Comments.
- Request timeline.
- Notifications.

---

## MODULE D: SLA MANAGEMENT

Implement a real SLA engine.

SLA must be calculated by the backend and never trusted to frontend calculations.

### Default demonstration SLA policies

These values are configurable examples, not universal industry standards.

| Priority | First Response | Resolution Target |
|---|---:|---:|
| P1 | 15 minutes | 4 hours |
| P2 | 1 hour | 8 hours |
| P3 | 4 business hours | 3 business days |
| P4 | 1 business day | 5 business days |

### Requirements

- SLA policy management.
- Business calendar.
- Business hours configuration.
- Holidays.
- Timezone configuration.
- First response tracking.
- Resolution time tracking.
- Pause and resume functionality.
- SLA breach detection.
- SLA warning notifications.
- SLA escalation.

Use Asia/Bangkok as the initial display timezone.

Store timestamps in UTC.

Allow an administrator to configure whether the resolution clock pauses while a ticket is waiting for the requester.

### SLA automation

Use BullMQ scheduled jobs.

- Notify when 75% of the resolution budget is consumed.
- Notify when the SLA is breached.
- Escalate overdue critical incidents.
- Recalculate deadlines when policy changes affect future tickets.

The SLA engine must handle business hours, weekends, holidays, and time zones correctly.

---

## MODULE E: IT ASSET MANAGEMENT

Build an enterprise IT inventory system.

### Supported asset types

- Desktop PC.
- Laptop.
- Server.
- Network Switch.
- Router.
- Firewall.
- Printer.
- Monitor.
- Mobile Device.
- Storage Device.
- Software License.
- Other.

### Asset information

- Asset ID.
- Asset tag.
- Asset name.
- Asset type.
- Manufacturer.
- Model.
- Serial number.
- Hostname.
- Private IP address.
- MAC address.
- Operating system.
- Assigned employee.
- Department.
- Location.
- Purchase date.
- Warranty expiration.
- Vendor.
- Purchase cost.
- Lifecycle status.
- Notes.

### Asset status

- IN_STOCK
- ASSIGNED
- IN_REPAIR
- MAINTENANCE
- RETIRED
- LOST

### Asset functionality

- Create asset.
- Edit asset.
- Delete or archive asset.
- Assign to employee.
- Transfer between departments.
- Record maintenance.
- Track warranty expiration.
- View asset history.
- Link incident tickets.
- Search and filter assets.
- Export asset inventory to CSV.

Implement asset history as a separate database entity.

Never overwrite important assignment history.

---

## MODULE F: INFRASTRUCTURE MONITORING

Build an Infrastructure Monitoring Center.

This is an important feature of the project.

Create a monitoring dashboard for simulated infrastructure.

### Monitoring targets

Include demo targets such as:

- WEB-SERVER-01
- WEB-SERVER-02
- DB-SERVER-01
- FILE-SERVER-01
- DNS-SERVER-01
- CORE-SWITCH-01
- APP-SERVER-01

Each target contains:

- Hostname.
- IP address.
- Device type.
- Environment.
- Location.
- Operating system.
- Monitoring status.
- Last heartbeat.
- CPU usage.
- Memory usage.
- Disk usage.
- Response time.
- Uptime.

### Monitoring statuses

- UP
- DEGRADED
- DOWN
- UNKNOWN
- MAINTENANCE

### Monitoring metrics

Create charts for:

- CPU utilization.
- Memory utilization.
- Disk utilization.
- Network traffic.
- Response time.
- Availability.
- Historical performance.

### Monitoring simulator

Create a background simulation service.

It should generate believable synthetic monitoring samples at configurable intervals.

Example thresholds:

- CPU greater than 90% for five consecutive samples.
- Memory greater than 90% for five consecutive samples.
- Disk greater than 85% for three consecutive samples.
- Three consecutive heartbeat failures.

These thresholds must be configurable.

### Automatic incident integration

This is a mandatory feature.

When a monitoring condition becomes critical:

1. Create a monitoring event.
2. Determine the affected infrastructure target.
3. Check whether an active incident already exists.
4. Create an incident automatically when appropriate.
5. Assign the appropriate IT team.
6. Set incident priority according to the configured rules.
7. Create notifications.
8. Record the event in the audit history.

Prevent duplicate incidents for the same active alert.

When the infrastructure recovers:

- Update monitoring status.
- Record a recovery event.
- Notify IT personnel.
- Do not automatically close an incident without the configured resolution policy or authorized review.

Provide a manual simulation control for demonstrations.

Example buttons:

- Simulate CPU Spike.
- Simulate Server Down.
- Simulate Memory Warning.
- Simulate Disk Critical.
- Simulate Recovery.

IMPORTANT:

The initial monitoring engine must use synthetic data and explicit simulation controls.

Do not scan real networks, probe external IP addresses, access real devices, or collect real infrastructure credentials.

Design the monitoring provider interface so legitimate integrations can be added later through authorized configuration.

---

## MODULE G: CHANGE MANAGEMENT

Build a structured IT Change Management workflow.

A change represents a controlled modification to IT infrastructure or services.

### Change categories

- Infrastructure Change.
- Network Change.
- Server Change.
- Database Change.
- Application Deployment.
- Security Configuration.
- Hardware Replacement.
- Software Upgrade.

### Change information

- Change ID.
- Title.
- Description.
- Change type.
- Business justification.
- Risk level.
- Impact assessment.
- Affected services.
- Related assets.
- Proposed start time.
- Proposed end time.
- Implementation plan.
- Testing plan.
- Rollback plan.
- Assigned engineer.
- Approver.
- Approval timestamp.
- Implementation result.

### Change statuses

- DRAFT
- SUBMITTED
- PENDING_APPROVAL
- APPROVED
- REJECTED
- SCHEDULED
- IMPLEMENTING
- COMPLETED
- FAILED
- ROLLED_BACK

### Workflow

```text
DRAFT
  |
  v
SUBMITTED
  |
  v
RISK_ASSESSMENT
  |
  v
PENDING_APPROVAL
  |
  +----------+
  |          |
  v          v
APPROVED   REJECTED
  |
  v
SCHEDULED
  |
  v
IMPLEMENTING
  |
  +-----------+
  |           |
  v           v
COMPLETED   FAILED
                |
                v
            ROLLED_BACK
```

### Features

- Change submission.
- Risk assessment.
- Approval process.
- Implementation checklist.
- Rollback planning.
- Change calendar.
- Related incidents.
- Post-implementation review.
- Change success reporting.

High-risk changes must require appropriate approval.

---

## MODULE H: PROBLEM MANAGEMENT

Problem Management focuses on identifying and removing recurring root causes.

Features:

- Create problem records.
- Link multiple incidents.
- Record investigation findings.
- Perform Root Cause Analysis.
- Record workarounds.
- Define corrective actions.
- Create known error records.
- Track resolution.
- Report recurring problems.

Problem statuses:

- OPEN
- INVESTIGATING
- KNOWN_ERROR
- RESOLVED
- CLOSED

Include RCA fields:

- Problem statement.
- Root cause.
- Impact.
- Contributing factors.
- Workaround.
- Corrective action.
- Preventive action.

---

## MODULE I: KNOWLEDGE BASE

Create an internal IT knowledge library.

### Article categories

- Windows Troubleshooting.
- Network Troubleshooting.
- Hardware Support.
- Software Support.
- Account Management.
- Email Support.
- Server Administration.
- IT Security Awareness.
- VPN and Remote Access.

### Features

- Create article.
- Edit article.
- Save draft.
- Publish article.
- Archive article.
- Search articles.
- Category filtering.
- Related articles.
- Article view count.
- Helpful / not helpful feedback.

Article fields:

- Title.
- Slug.
- Summary.
- Content.
- Category.
- Tags.
- Author.
- Status.
- Created timestamp.
- Updated timestamp.
- Published timestamp.

Employees can only view published articles.

---

## MODULE J: REPORTS AND ANALYTICS

Create a reporting center.

Reports must come from real database queries.

### Required reports

1. Incident Summary.
2. Incident Trend.
3. Incident by Priority.
4. Incident by Category.
5. Average Resolution Time.
6. Mean Time to Acknowledge (MTTA).
7. Mean Time to Resolve (MTTR).
8. SLA Compliance.
9. Infrastructure Availability.
10. Asset Inventory.
11. Asset Lifecycle.
12. Change Success Rate.
13. Recurring Problems.
14. Technician Workload.

### Required calculations

MTTA:

Average time between incident creation and first valid response.

MTTR:

Average time between incident creation and incident resolution.

SLA Compliance:

Number of eligible tickets resolved within SLA divided by the total eligible resolved tickets.

Availability:

Measured uptime divided by total monitored time, based on monitoring records.

Change Success Rate:

Successfully completed changes divided by the total completed changes, including failed changes in the denominator according to the documented reporting policy.

### Report functionality

- Date range filter.
- Department filter.
- Priority filter.
- Export CSV.
- Print-friendly layout.
- Summary metrics.
- Historical comparisons.

Document each metric calculation in the documentation.

---

# 7. DATABASE DESIGN

Use PostgreSQL with Prisma ORM 7.

Design normalized relational tables.

Create the necessary entities, indexes, unique constraints, and foreign keys.

At minimum, implement:

## Identity and Organization

- User
- Department
- Location
- Session
- RefreshToken

## Asset Management

- Asset
- AssetAssignmentHistory
- AssetMaintenanceRecord
- AssetCategory

## ITSM

- Ticket
- TicketComment
- TicketHistory
- TicketAttachment
- TicketCategory
- ServiceCatalogItem
- ServiceRequestApproval

## SLA

- SlaPolicy
- SlaClock
- BusinessCalendar
- BusinessHoliday

## Infrastructure

- MonitoringTarget
- MonitoringMetric
- MonitoringEvent
- MonitoringRule

## Change and Problem

- ChangeRequest
- ChangeApproval
- ChangeTask
- Problem
- ProblemIncident
- ProblemAction

## Knowledge

- KnowledgeArticle
- KnowledgeCategory
- KnowledgeFeedback

## Platform

- Notification
- AuditLog
- SystemSetting

### Database requirements

- Use UUID primary keys.
- Use createdAt and updatedAt.
- Use appropriate foreign key constraints.
- Use indexes for frequently queried fields.
- Use database transactions for multi-step operations.
- Implement soft deletion where appropriate.
- Do not store derived dashboard values as arbitrary hardcoded data.
- Protect historical records.
- Use migrations for all schema changes.

Create seed data for demonstrations.

---

# 8. REST API DESIGN

Use API versioning:

`/api/v1`

Generate Swagger documentation.

Organize API endpoints by module.

### Authentication

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
GET    /api/v1/auth/me
```

### Dashboard

```text
GET /api/v1/dashboard/summary
GET /api/v1/dashboard/incidents
GET /api/v1/dashboard/sla
GET /api/v1/dashboard/infrastructure
GET /api/v1/dashboard/recent-activities
```

### Tickets

```text
GET    /api/v1/tickets
POST   /api/v1/tickets
GET    /api/v1/tickets/:id
PATCH  /api/v1/tickets/:id
POST   /api/v1/tickets/:id/assign
POST   /api/v1/tickets/:id/comments
POST   /api/v1/tickets/:id/resolve
POST   /api/v1/tickets/:id/close
POST   /api/v1/tickets/:id/reopen
GET    /api/v1/tickets/:id/history
```

### Assets

```text
GET    /api/v1/assets
POST   /api/v1/assets
GET    /api/v1/assets/:id
PATCH  /api/v1/assets/:id
POST   /api/v1/assets/:id/assign
GET    /api/v1/assets/:id/history
```

### Monitoring

```text
GET  /api/v1/monitoring/targets
GET  /api/v1/monitoring/targets/:id
GET  /api/v1/monitoring/metrics
GET  /api/v1/monitoring/events
POST /api/v1/monitoring/simulate
POST /api/v1/monitoring/targets/:id/maintenance
```

### Changes

```text
GET  /api/v1/changes
POST /api/v1/changes
GET  /api/v1/changes/:id
PATCH /api/v1/changes/:id
POST /api/v1/changes/:id/submit
POST /api/v1/changes/:id/approve
POST /api/v1/changes/:id/reject
POST /api/v1/changes/:id/complete
POST /api/v1/changes/:id/rollback
```

### Problems

```text
GET  /api/v1/problems
POST /api/v1/problems
GET  /api/v1/problems/:id
PATCH /api/v1/problems/:id
POST /api/v1/problems/:id/incidents
POST /api/v1/problems/:id/actions
```

### Knowledge

```text
GET    /api/v1/knowledge
POST   /api/v1/knowledge
GET    /api/v1/knowledge/:slug
PATCH  /api/v1/knowledge/:id
POST   /api/v1/knowledge/:id/publish
POST   /api/v1/knowledge/:id/feedback
```

### Reports

```text
GET /api/v1/reports/incidents
GET /api/v1/reports/sla
GET /api/v1/reports/assets
GET /api/v1/reports/changes
GET /api/v1/reports/availability
GET /api/v1/reports/export
```

### Other requirements

Implement consistent pagination, sorting, filtering, request validation, error responses, and proper HTTP status codes.

Use DTOs for API input validation.

Do not expose internal database errors to clients.

---

# 9. NOTIFICATIONS AND AUDIT LOGGING

## Notification System

Support:

- In-app notifications.
- SLA warnings.
- SLA breach notifications.
- Incident assignment notifications.
- Incident status notifications.
- Change approval requests.
- Change approval decisions.
- Monitoring alerts.
- Recovery notifications.
- Service request updates.

Create a notification center in the frontend.

Support:
- Unread count.
- Mark as read.
- Mark all as read.
- Notification history.

Use BullMQ for asynchronous processing.

Use Mailpit for development email testing.

## Audit Logging

Record important operations:

- Login.
- Logout.
- Failed login.
- User creation.
- User role changes.
- Asset assignment.
- Incident status changes.
- Incident priority changes.
- Change approval.
- Change rejection.
- SLA configuration changes.
- System settings changes.

Each audit record must contain:

- Actor.
- Action.
- Entity type.
- Entity ID.
- Timestamp.
- Relevant change metadata.

Do not allow normal users to modify or delete audit history.

---

# 10. FRONTEND DESIGN REQUIREMENTS

Build a professional enterprise SaaS interface.

## Design direction

Use a modern IT Operations Command Center aesthetic.

Visual references:

- Enterprise service management dashboards.
- Professional observability platforms.
- Modern IT administration software.
- Business intelligence dashboards.

### Layout

Desktop-first responsive application.

- Left navigation sidebar.
- Top navigation.
- Global search.
- Notification center.
- User profile menu.
- Main dashboard content.
- Responsive mobile navigation.

### Visual style

- Professional dark navy sidebar.
- Clean light content background.
- Neutral gray surfaces.
- Restrained blue accent.
- Red for critical status.
- Orange for warnings.
- Green for healthy status.
- Consistent typography.
- Consistent spacing.
- Clear data hierarchy.

Avoid excessive gradients, unnecessary animations, excessive rounded cards, and decorative elements that reduce readability.

### Sidebar navigation

```text
OVERVIEW
  Dashboard

SERVICE MANAGEMENT
  Incidents
  Service Requests
  Service Catalog
  SLA Management

INFRASTRUCTURE
  Infrastructure Monitoring
  IT Assets

IT OPERATIONS
  Change Management
  Problem Management
  Knowledge Base

ANALYTICS
  Reports

ADMINISTRATION
  Users & Roles
  System Settings
  Audit Logs
```

Only show modules permitted by the current user's role.

### Required UI states

Every page must implement:

- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Form validation.
- Confirmation dialogs for destructive actions.
- Responsive tables.
- Search.
- Sorting.
- Pagination.
- Filters.

Use accessible semantic HTML and keyboard navigation.

### Language

Default UI language: Thai.

Keep commonly used technical terminology in English.

Examples:

- Incident Management
- Service Request
- SLA
- Monitoring
- Change Management
- Root Cause Analysis
- MTTR
- MTTA
- Asset Inventory

Use Asia/Bangkok for displayed timestamps.

---

# 11. SECURITY REQUIREMENTS

Implement security as part of the architecture.

- Hash passwords using Argon2id.
- Use secure HttpOnly cookies.
- Implement refresh token rotation.
- Apply authorization guards to backend routes.
- Validate all API input.
- Apply rate limiting to sensitive endpoints.
- Use environment variables for secrets.
- Configure CORS explicitly.
- Prevent unauthorized data access.
- Sanitize user-generated content.
- Validate uploaded file types and size.
- Protect audit logs.
- Avoid SQL injection.
- Avoid exposing passwords and tokens in logs.
- Use least-privilege access.
- Handle authentication failures consistently.

Never commit real credentials or secrets.

Provide `.env.example` with placeholders only.

Do not use demo credentials in production.

---

# 12. BACKGROUND WORKERS

Create a separate worker application.

Use BullMQ and Redis.

Required jobs:

1. Monitoring simulation.
2. SLA deadline checking.
3. SLA warning generation.
4. SLA escalation.
5. Infrastructure alert processing.
6. Automatic incident creation.
7. Notification delivery.
8. Scheduled report aggregation where appropriate.

Requirements:

- Jobs must be idempotent.
- Implement retries.
- Implement failure logging.
- Avoid duplicate notifications.
- Avoid duplicate incidents.
- Make scheduled intervals configurable.
- Ensure safe shutdown.

---

# 13. DEMO DATA

Populate the application with realistic data.

Create:

- 1 IT department.
- Several business departments.
- Multiple office locations.
- At least 20 users across roles.
- At least 40 IT assets.
- At least 7 monitoring targets.
- At least 30 incidents with different priorities.
- At least 15 service requests.
- At least 10 changes.
- At least 5 problems.
- At least 15 knowledge articles.
- Monitoring history.
- Notifications.
- Audit events.

Include records from different dates so that charts and historical reports are meaningful.

Make all sample relationships consistent.

Do not generate random values directly inside dashboard components.

Use database seed scripts.

Seed demo accounts only in development/demo environments. Provide an environment-controlled demo password and document it clearly.

---

# 14. TESTING STRATEGY

Testing is mandatory.

## Backend

- Unit tests.
- Service tests.
- Controller tests.
- Authentication tests.
- RBAC tests.
- API integration tests.
- Database transaction tests.
- SLA calculation tests.
- Incident workflow tests.
- Monitoring automation tests.
- Change approval tests.

## Frontend

- Component tests.
- Form validation tests.
- Authentication navigation tests.
- Role-based UI tests.
- Dashboard rendering tests.

## End-to-end

Use Playwright.

Test these scenarios:

### Scenario 1: Employee submits an incident

1. Employee logs in.
2. Opens Incident Management.
3. Creates an incident.
4. Receives a ticket number.
5. Views ticket details.

### Scenario 2: Service desk handles an incident

1. Agent logs in.
2. Opens the new incident.
3. Assigns an engineer.
4. Changes status.
5. Adds a comment.
6. Resolves the incident.
7. Checks SLA status.

### Scenario 3: Monitoring creates an incident

1. IT engineer logs in.
2. Opens Infrastructure Monitoring.
3. Triggers Server Down simulation.
4. Monitoring event is generated.
5. Backend creates an incident.
6. Dashboard displays a critical alert.
7. Notification is generated.

### Scenario 4: Change approval

1. Engineer creates a change.
2. Submits it.
3. Manager receives approval notification.
4. Manager approves the change.
5. Engineer records implementation.
6. Change is marked completed.

### Scenario 5: Asset assignment

1. Asset manager opens inventory.
2. Registers a laptop.
3. Assigns it to an employee.
4. Views asset history.
5. Exports inventory.

All automated tests must be runnable through documented scripts.

---

# 15. DOCKER AND DEPLOYMENT

Create a working Docker Compose environment.

Required services:

- PostgreSQL.
- Redis.
- Next.js Web.
- NestJS API.
- Background Worker.
- Mailpit.

Configure:

- Persistent database volume.
- Redis persistence where needed.
- Health checks.
- Service dependencies.
- Environment variables.
- Restart policies.
- Internal service networking.
- Database migrations.
- Seed process.

Provide these commands:

```bash
pnpm install

docker compose up -d postgres redis

pnpm db:migrate

pnpm db:seed

pnpm dev
```

Also support a full Docker launch:

```bash
docker compose up --build
```

The full Docker launch must start the application correctly without requiring developers to manually configure each service.

Use a production-ready container configuration.

Add GitHub Actions for:

- Dependency installation.
- Lint.
- Type checking.
- Unit tests.
- Build.
- Docker image build.

Document deployment options.

Do not claim that deployment is live until an actual deployment has been completed and verified.

---

# 16. DEVELOPMENT EXECUTION PLAN

Build the application incrementally.

Do not attempt to output the entire codebase in one response.

Work directly in the project workspace.

## PHASE 0 — ARCHITECTURE AND PLANNING

- Inspect the existing workspace.
- Document the architecture.
- Define module boundaries.
- Design the database.
- Create an ER diagram.
- Define API conventions.
- Write implementation plan.
- Create development documentation.

Deliver:
- architecture.md
- database-design.md
- workflows.md
- implementation-plan.md

## PHASE 1 — PROJECT FOUNDATION

- Initialize pnpm monorepo.
- Configure Next.js.
- Configure NestJS.
- Configure PostgreSQL.
- Configure Prisma 7.
- Configure Redis.
- Configure Docker.
- Configure shared packages.
- Implement API health check.
- Implement frontend application shell.

Acceptance:
The application starts locally and both frontend and backend are reachable.

## PHASE 2 — AUTHENTICATION AND RBAC

- Implement login.
- Implement logout.
- Implement refresh tokens.
- Implement users.
- Implement roles.
- Implement permissions.
- Implement protected routes.
- Create demo users.

Acceptance:
Users can authenticate and cannot access unauthorized endpoints.

## PHASE 3 — INCIDENT AND SERVICE MANAGEMENT

- Incident CRUD.
- Ticket workflow.
- Ticket assignments.
- Comments.
- History.
- Service Catalog.
- Service Requests.
- Approvals.

Acceptance:
Complete employee-to-service-desk ticket workflow.

## PHASE 4 — SLA ENGINE

- SLA policies.
- Business calendars.
- SLA timers.
- Background processing.
- Warning notifications.
- Escalation.

Acceptance:
SLA calculations work correctly for different priorities and business calendars.

## PHASE 5 — IT ASSET MANAGEMENT

- Asset CRUD.
- Asset assignment.
- Asset history.
- Maintenance records.
- Inventory reports.
- CSV export.

Acceptance:
Full asset lifecycle can be demonstrated.

## PHASE 6 — INFRASTRUCTURE MONITORING

- Monitoring targets.
- Metric storage.
- Monitoring dashboard.
- Synthetic simulator.
- Alert detection.
- Incident automation.
- Real-time status updates.

Acceptance:
A simulated infrastructure failure produces an actual incident and notification.

## PHASE 7 — CHANGE AND PROBLEM MANAGEMENT

- Change workflows.
- Risk assessment.
- Approvals.
- Implementation tasks.
- Rollback.
- Problem records.
- Root Cause Analysis.

Acceptance:
Full change approval and problem investigation workflows work.

## PHASE 8 — KNOWLEDGE BASE AND ANALYTICS

- Knowledge articles.
- Search and filtering.
- Publishing workflow.
- Reporting APIs.
- KPI calculations.
- CSV exports.
- Analytics dashboard.

Acceptance:
Reports display real database-derived operational metrics.

## PHASE 9 — SYSTEM HARDENING

- Complete validation.
- Complete error handling.
- Improve performance.
- Security review.
- Accessibility review.
- Responsive design review.
- Automated tests.
- API documentation.
- Docker verification.

Acceptance:
No broken primary workflows, no obvious security bypasses, and all required tests pass.

## PHASE 10 — FINAL DELIVERY

Produce:

- Full source code.
- Database schema.
- Migration scripts.
- Seed scripts.
- API documentation.
- Frontend application.
- Backend application.
- Background worker.
- Docker configuration.
- CI workflow.
- README.
- Deployment guide.
- Test report.
- Architecture diagrams.
- Demo account instructions.

---

# 17. ACCEPTANCE CRITERIA

The project is NOT complete until all of the following are satisfied:

[ ] Frontend runs successfully.

[ ] Backend API runs successfully.

[ ] PostgreSQL connection works.

[ ] Redis connection works.

[ ] Prisma migrations work.

[ ] Authentication works.

[ ] RBAC is enforced on the backend.

[ ] Dashboard loads real API data.

[ ] Incident workflow works.

[ ] Service request workflow works.

[ ] SLA calculations work.

[ ] Asset management works.

[ ] Monitoring simulation works.

[ ] Monitoring automatically creates incidents.

[ ] Change approval works.

[ ] Problem management works.

[ ] Knowledge Base works.

[ ] Reports calculate real metrics.

[ ] Notifications work.

[ ] Audit logs are recorded.

[ ] CSV exports work.

[ ] Docker Compose works.

[ ] Automated tests pass.

[ ] README provides complete setup instructions.

[ ] No primary UI controls are non-functional.

[ ] No unimplemented module is presented as completed.

---

# 18. CODE QUALITY RULES

Follow these engineering standards:

1. Use TypeScript strict mode.
2. Avoid `any` unless justified and documented.
3. Follow separation of concerns.
4. Use dependency injection in NestJS.
5. Keep business logic in services.
6. Do not put database queries inside UI components.
7. Use shared API contracts.
8. Implement consistent API error responses.
9. Use database transactions where required.
10. Avoid duplicated business logic.
11. Use reusable UI components.
12. Use meaningful naming conventions.
13. Include comments for complex business logic.
14. Add tests for critical operations.
15. Keep all configurations environment-based.
16. Never use fake frontend data when the relevant backend endpoint exists.
17. Do not use placeholder buttons for core functionality.
18. Do not silently swallow errors.
19. Document major architecture decisions.
20. Never report an operation as completed unless it has actually been implemented and verified.

---

# 19. REQUIRED FINAL EXPERIENCE

The completed application must feel like a real enterprise IT Operations platform.

When the user logs in, they should see:

- A professional operational dashboard.
- Live infrastructure status from the simulation engine.
- Current IT incidents.
- SLA performance.
- Asset inventory.
- Pending changes.
- Operational notifications.
- Reports and analytics.

The user should be able to demonstrate the complete operational lifecycle:

Employee reports an IT issue
→ Service Desk receives the ticket
→ SLA clock starts
→ Engineer investigates
→ Monitoring identifies infrastructure symptoms
→ IT team handles and resolves the incident
→ Problem Management records the root cause
→ Change Management controls the corrective modification
→ Knowledge Base documents the resolution
→ Management reviews operational KPIs.

The application must connect these workflows through real database relationships and backend business logic.

**FINAL INSTRUCTION:**

Begin by inspecting the workspace and creating Phase 0 and Phase 1.

Then continue implementing each phase sequentially, verifying each completed phase before progressing.

Do not stop at UI generation.

Do not replace backend functionality with mock data.

Do not omit database migrations, authentication, validation, tests, or deployment configuration.

Maintain a `docs/PROGRESS.md` file to record completed work, remaining work, test results, and any known limitations.

If context or execution limits prevent completing everything in one session, save the current implementation state and provide exact next-step instructions so development can continue without losing architectural consistency.

Your objective is to deliver a complete, functional, maintainable, enterprise-quality full-stack OpsPilot IT Operations Management Platform.