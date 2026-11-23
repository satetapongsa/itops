import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TicketPriority, TicketStatus, MonitoringStatus } from '@opspilot/shared';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      openIncidents,
      criticalIncidents,
      activeServiceRequests,
      slaBreaches,
      onlineDevices,
      offlineDevices,
      totalAssets,
      pendingApprovals,
    ] = await Promise.all([
      this.prisma.ticket.count({
        where: {
          type: 'INCIDENT',
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      this.prisma.ticket.count({
        where: {
          type: 'INCIDENT',
          priority: TicketPriority.P1,
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      this.prisma.ticket.count({
        where: {
          type: 'SERVICE_REQUEST',
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      }),
      this.prisma.slaClock.count({
        where: {
          OR: [{ firstResponseBreached: true }, { resolutionBreached: true }],
        },
      }),
      this.prisma.monitoringTarget.count({
        where: { status: MonitoringStatus.UP },
      }),
      this.prisma.monitoringTarget.count({
        where: { status: MonitoringStatus.DOWN },
      }),
      this.prisma.asset.count(),
      this.prisma.serviceRequestApproval.count({
        where: { status: 'PENDING' },
      }),
    ]);

    return {
      openIncidents,
      criticalIncidents,
      activeServiceRequests,
      slaBreaches,
      onlineDevices,
      offlineDevices,
      totalAssets,
      pendingApprovals,
    };
  }

  async getRecentActivities() {
    const auditLogs = await this.prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    });
    return auditLogs;
  }
}
