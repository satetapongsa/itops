import {
  UserRole,
  UserStatus,
  TicketPriority,
  TicketStatus,
  TicketType,
  ImpactLevel,
  UrgencyLevel,
  AssetType,
  AssetStatus,
  MonitoringStatus,
  ChangeCategory,
  ChangeRiskLevel,
  ChangeStatus,
  ProblemStatus,
  KnowledgeStatus,
  NotificationType,
} from '@opspilot/shared';

// Auth DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthUserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface LoginResponseDto {
  accessToken: string;
  user: AuthUserResponseDto;
}

export interface RefreshTokenResponseDto {
  accessToken: string;
}

// User DTOs
export interface UserListItemDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  department?: { id: string; name: string } | null;
  createdAt: string;
  lastLoginAt?: string | null;
}

// Ticket DTOs
export interface CreateTicketDto {
  type: TicketType;
  title: string;
  description: string;
  category: string;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  priorityOverride?: TicketPriority;
  priorityOverrideReason?: string;
  relatedAssetId?: string;
  relatedTargetId?: string;
}

export interface TicketListItemDto {
  id: string;
  ticketNumber: string;
  type: TicketType;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  impact: ImpactLevel;
  urgency: UrgencyLevel;
  status: TicketStatus;
  requester: { id: string; name: string; email: string };
  assignee?: { id: string; name: string; email: string } | null;
  createdAt: string;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  slaBreached?: boolean;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
  resolutionNotes?: string;
  rootCause?: string;
}

export interface AddTicketCommentDto {
  content: string;
  isInternal?: boolean;
}

// Asset DTOs
export interface CreateAssetDto {
  assetTag: string;
  name: string;
  type: AssetType;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  hostname?: string;
  ipAddress?: string;
  macAddress?: string;
  os?: string;
  status: AssetStatus;
  assignedUserId?: string;
  departmentId?: string;
  locationId?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  purchaseCost?: number;
  vendor?: string;
  notes?: string;
}

export interface AssetListItemDto {
  id: string;
  assetTag: string;
  name: string;
  type: AssetType;
  manufacturer?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  hostname?: string | null;
  ipAddress?: string | null;
  status: AssetStatus;
  assignedUser?: { id: string; name: string; email: string } | null;
  department?: { id: string; name: string } | null;
  warrantyExpiry?: string | null;
  createdAt: string;
}

// Monitoring DTOs
export interface MonitoringTargetDto {
  id: string;
  hostname: string;
  ipAddress: string;
  deviceType: string;
  environment: string;
  location: string;
  status: MonitoringStatus;
  lastHeartbeat: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  responseTimeMs: number;
  uptimeSeconds: number;
  isSimulated: boolean;
}

export interface SimulateMonitoringDto {
  scenario: 'CPU_SPIKE' | 'SERVER_DOWN' | 'MEMORY_WARNING' | 'DISK_CRITICAL' | 'RECOVERY';
  targetId?: string;
}

// Change DTOs
export interface CreateChangeDto {
  title: string;
  description: string;
  category: ChangeCategory;
  riskLevel: ChangeRiskLevel;
  impactAssessment: string;
  businessJustification: string;
  implementationPlan: string;
  rollbackPlan: string;
  testPlan: string;
  plannedStart: string;
  plannedEnd: string;
  assignedEngineerId?: string;
}

export interface ChangeListItemDto {
  id: string;
  changeNumber: string;
  title: string;
  category: ChangeCategory;
  riskLevel: ChangeRiskLevel;
  status: ChangeStatus;
  requestedBy: { id: string; name: string };
  assignedEngineer?: { id: string; name: string } | null;
  plannedStart: string;
  plannedEnd: string;
  createdAt: string;
}

// Dashboard DTOs
export interface DashboardSummaryDto {
  openIncidents: number;
  criticalIncidents: number;
  activeServiceRequests: number;
  slaBreaches: number;
  onlineDevices: number;
  offlineDevices: number;
  totalAssets: number;
  pendingApprovals: number;
}
