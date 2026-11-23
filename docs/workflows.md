# OpsPilot Operational Workflows

## 1. Incident Management Lifecycle
```text
[Employee / Alert] -> Incident Created (Status: NEW)
       │
       ▼ (SLA Clock Starts)
Service Desk Agent Acknowledges (Status: ACKNOWLEDGED)
       │
       ▼ (First Response Timestamp Recorded)
Assigned to Engineer (Status: IN_PROGRESS)
       │
       ├─► Waiting on User Info (Status: PENDING_USER - SLA Clock Paused if configured)
       ├─► Waiting on Vendor (Status: PENDING_VENDOR)
       │
       ▼
Engineer Applies Fix & Adds Notes (Status: RESOLVED)
       │
       ▼ (Resolution SLA Clock Stops)
Requester Verifies / Auto-Close after 48h (Status: CLOSED)
```

## 2. Infrastructure Failure & Auto-Incident Workflow
```text
Synthetic Monitoring Worker / Heartbeat Check
       │
       ▼ (Metric thresholds breached e.g. CPU > 90% x5 or Target Unreachable)
Monitoring Event Generated (Severity: CRITICAL)
       │
       ▼
System checks for existing ACTIVE Incident for Target
       ├─► If Active Incident exists: append monitoring event to timeline
       └─► If None exists:
             1. Auto-create Ticket (Type: INCIDENT, Priority: P1/P2)
             2. Assign to On-Call IT Engineer Group
             3. Link MonitoringTarget to Ticket
             4. Post Critical Alert to SSE Stream & Dashboard
             5. Dispatch Notifications
```

## 3. Service Request & Approval Workflow
```text
Employee browses Service Catalog & submits Request Form (e.g. VPN Access)
       │
       ▼
Check Catalog Item `requiresApproval`:
       ├─► FALSE: Auto-transition to FULFILLMENT -> Assign to IT Queue
       └─► TRUE: Transition to PENDING_APPROVAL
                 │
                 ▼
          IT Manager reviews request & business justification
                 ├─► REJECTED: Status updated, requester notified with reason
                 └─► APPROVED: Transition to FULFILLMENT -> Engineer completes setup -> COMPLETED
```

## 4. Change Management Workflow
```text
IT Engineer creates Change Request (Status: DRAFT)
       │
       ▼
Fill Risk Assessment, Implementation Plan, Testing Plan, Rollback Plan
       │
       ▼
Submit for CAB / Manager Review (Status: PENDING_APPROVAL)
       ├─► REJECTED: Return to requester with feedback
       └─► APPROVED: Status SCHEDULED with maintenance window
                 │
                 ▼
Window starts: Status IMPLEMENTING
       ├─► Successful: Status COMPLETED (Post-Implementation Review)
       └─► Failure: Trigger Rollback Plan -> Status ROLLED_BACK / FAILED
```
