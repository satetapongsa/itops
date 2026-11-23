import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TicketStatus, ChangeStatus, MonitoringStatus } from '@opspilot/shared';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getIncidentsReport() {
    const total = await this.prisma.ticket.count({ where: { type: 'INCIDENT' } });
    const resolved = await this.prisma.ticket.findMany({
      where: {
        type: 'INCIDENT',
        status: { in: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
        resolvedAt: { not: null },
      },
    });

    // Calculate MTTA (Mean Time to Acknowledge in minutes)
    const acknowledged = await this.prisma.ticket.findMany({
      where: { type: 'INCIDENT', firstResponseAt: { not: null } },
    });

    let totalAckMinutes = 0;
    for (const t of acknowledged) {
      if (t.firstResponseAt) {
        totalAckMinutes += (t.firstResponseAt.getTime() - t.createdAt.getTime()) / 60000;
      }
    }
    const mtta = acknowledged.length > 0 ? Math.round(totalAckMinutes / acknowledged.length) : 0;

    // Calculate MTTR (Mean Time to Resolve in minutes)
    let totalResolveMinutes = 0;
    for (const t of resolved) {
      if (t.resolvedAt) {
        totalResolveMinutes += (t.resolvedAt.getTime() - t.createdAt.getTime()) / 60000;
      }
    }
    const mttr = resolved.length > 0 ? Math.round(totalResolveMinutes / resolved.length) : 0;

    return {
      totalIncidents: total,
      resolvedIncidents: resolved.length,
      mttaMinutes: mtta,
      mttrMinutes: mttr,
    };
  }

  async getSlaReport() {
    const totalClocks = await this.prisma.slaClock.count();
    const breachedClocks = await this.prisma.slaClock.count({
      where: { OR: [{ firstResponseBreached: true }, { resolutionBreached: true }] },
    });

    const compliantClocks = totalClocks - breachedClocks;
    const complianceRate = totalClocks > 0 ? Math.round((compliantClocks / totalClocks) * 100) : 100;

    return {
      totalTracked: totalClocks,
      breached: breachedClocks,
      compliant: compliantClocks,
      complianceRate,
    };
  }

  async getChangesReport() {
    const total = await this.prisma.changeRequest.count({
      where: { status: { in: [ChangeStatus.COMPLETED, ChangeStatus.FAILED, ChangeStatus.ROLLED_BACK] } },
    });
    const successful = await this.prisma.changeRequest.count({
      where: { status: ChangeStatus.COMPLETED },
    });

    const successRate = total > 0 ? Math.round((successful / total) * 100) : 100;

    return {
      totalCompletedChanges: total,
      successfulChanges: successful,
      changeSuccessRate: successRate,
    };
  }

  async getAvailabilityReport() {
    const totalTargets = await this.prisma.monitoringTarget.count();
    const onlineTargets = await this.prisma.monitoringTarget.count({
      where: { status: MonitoringStatus.UP },
    });

    const availability = totalTargets > 0 ? Math.round((onlineTargets / totalTargets) * 1000) / 10 : 100;

    return {
      totalTargets,
      onlineTargets,
      availabilityPercent: availability,
    };
  }

  async exportCsv(): Promise<string> {
    const [incidents, sla, changes, availability] = await Promise.all([
      this.getIncidentsReport(),
      this.getSlaReport(),
      this.getChangesReport(),
      this.getAvailabilityReport(),
    ]);

    let csv = 'Metric,Value\n';
    csv += `Total Incidents,${incidents.totalIncidents}\n`;
    csv += `Resolved Incidents,${incidents.resolvedIncidents}\n`;
    csv += `Mean Time to Acknowledge (MTTA Minutes),${incidents.mttaMinutes}\n`;
    csv += `Mean Time to Resolve (MTTR Minutes),${incidents.mttrMinutes}\n`;
    csv += `SLA Compliance Rate (%),${sla.complianceRate}%\n`;
    csv += `Change Success Rate (%),${changes.changeSuccessRate}%\n`;
    csv += `Infrastructure Availability (%),${availability.availabilityPercent}%\n`;

    return csv;
  }
}
