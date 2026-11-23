export enum UserRole {
  ADMIN = 'ADMIN',
  IT_MANAGER = 'IT_MANAGER',
  SERVICE_DESK_AGENT = 'SERVICE_DESK_AGENT',
  IT_ENGINEER = 'IT_ENGINEER',
  ASSET_MANAGER = 'ASSET_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE',
}

export enum TicketType {
  INCIDENT = 'INCIDENT',
  SERVICE_REQUEST = 'SERVICE_REQUEST',
}

export enum TicketPriority {
  P1 = 'P1', // Critical
  P2 = 'P2', // High
  P3 = 'P3', // Medium
  P4 = 'P4', // Low
}

export enum PriorityLevel {
  CRITICAL = 'P1',
  HIGH = 'P2',
  MEDIUM = 'P3',
  LOW = 'P4',
}

export enum ImpactLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum UrgencyLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum TicketStatus {
  NEW = 'NEW',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_USER = 'PENDING_USER',
  PENDING_VENDOR = 'PENDING_VENDOR',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum ServiceRequestApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum AssetType {
  DESKTOP = 'DESKTOP',
  LAPTOP = 'LAPTOP',
  SERVER = 'SERVER',
  SWITCH = 'SWITCH',
  ROUTER = 'ROUTER',
  FIREWALL = 'FIREWALL',
  PRINTER = 'PRINTER',
  MONITOR = 'MONITOR',
  MOBILE = 'MOBILE',
  STORAGE = 'STORAGE',
  LICENSE = 'LICENSE',
  OTHER = 'OTHER',
}

export enum AssetStatus {
  IN_STOCK = 'IN_STOCK',
  ASSIGNED = 'ASSIGNED',
  IN_REPAIR = 'IN_REPAIR',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  LOST = 'LOST',
}

export enum MonitoringStatus {
  UP = 'UP',
  DEGRADED = 'DEGRADED',
  DOWN = 'DOWN',
  UNKNOWN = 'UNKNOWN',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ChangeCategory {
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  DATABASE = 'DATABASE',
  APPLICATION_DEPLOYMENT = 'APPLICATION_DEPLOYMENT',
  SECURITY = 'SECURITY',
  HARDWARE = 'HARDWARE',
  SOFTWARE_UPGRADE = 'SOFTWARE_UPGRADE',
}

export enum ChangeRiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum ChangeStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SCHEDULED = 'SCHEDULED',
  IMPLEMENTING = 'IMPLEMENTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum ProblemStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  KNOWN_ERROR = 'KNOWN_ERROR',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum KnowledgeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  SLA = 'SLA',
  APPROVAL = 'APPROVAL',
}

/**
 * Calculates priority matrix based on Impact and Urgency
 */
export function calculatePriority(impact: ImpactLevel, urgency: UrgencyLevel): TicketPriority {
  if (impact === ImpactLevel.HIGH && urgency === UrgencyLevel.HIGH) {
    return TicketPriority.P1;
  }
  if (
    (impact === ImpactLevel.HIGH && urgency === UrgencyLevel.MEDIUM) ||
    (impact === ImpactLevel.MEDIUM && urgency === UrgencyLevel.HIGH)
  ) {
    return TicketPriority.P2;
  }
  if (
    (impact === ImpactLevel.HIGH && urgency === UrgencyLevel.LOW) ||
    (impact === ImpactLevel.MEDIUM && urgency === UrgencyLevel.MEDIUM) ||
    (impact === ImpactLevel.LOW && urgency === UrgencyLevel.HIGH)
  ) {
    return TicketPriority.P3;
  }
  return TicketPriority.P4;
}
