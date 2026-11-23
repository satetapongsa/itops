import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from '../events/events.service';
import { MonitoringStatus, TicketPriority, TicketType, TicketStatus } from '@opspilot/shared';

(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

@Injectable()
export class MonitoringService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async getTargets() {
    return this.prisma.monitoringTarget.findMany({
      orderBy: { hostname: 'asc' },
    });
  }

  async getTarget(id: string) {
    const target = await this.prisma.monitoringTarget.findUnique({
      where: { id },
      include: {
        metrics: { take: 20, orderBy: { timestamp: 'desc' } },
        events: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!target) {
      throw new NotFoundException(`Monitoring target ${id} not found`);
    }

    return target;
  }

  async getMetrics(targetId?: string) {
    return this.prisma.monitoringMetric.findMany({
      where: targetId ? { targetId } : {},
      take: 50,
      orderBy: { timestamp: 'desc' },
      include: { target: { select: { hostname: true } } },
    });
  }

  async getEvents() {
    return this.prisma.monitoringEvent.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { target: true, incident: true },
    });
  }

  async simulate(scenario: 'CPU_SPIKE' | 'SERVER_DOWN' | 'MEMORY_WARNING' | 'DISK_CRITICAL' | 'RECOVERY', targetId?: string) {
    let target = targetId
      ? await this.prisma.monitoringTarget.findUnique({ where: { id: targetId } })
      : await this.prisma.monitoringTarget.findFirst({ where: { hostname: 'WEB-SERVER-01' } });

    if (!target) {
      target = await this.prisma.monitoringTarget.findFirst();
    }

    if (!target) {
      throw new NotFoundException('No monitoring target available for simulation');
    }

    const now = new Date();
    let status = MonitoringStatus.UP;
    let cpu = target.cpuUsage;
    let memory = target.memoryUsage;
    let disk = target.diskUsage;
    let responseTime = target.responseTimeMs;
    let eventSeverity = 'INFO';
    let eventMessage = '';

    switch (scenario) {
      case 'CPU_SPIKE':
        cpu = 95.8;
        status = MonitoringStatus.DEGRADED;
        eventSeverity = 'WARNING';
        eventMessage = `High CPU utilization on ${target.hostname} exceeded 95% threshold`;
        break;
      case 'SERVER_DOWN':
        cpu = 0;
        memory = 0;
        responseTime = 0;
        status = MonitoringStatus.DOWN;
        eventSeverity = 'CRITICAL';
        eventMessage = `Host ${target.hostname} is completely DOWN. Failed 3 consecutive heartbeats.`;
        break;
      case 'MEMORY_WARNING':
        memory = 92.4;
        status = MonitoringStatus.DEGRADED;
        eventSeverity = 'WARNING';
        eventMessage = `Memory usage on ${target.hostname} reached 92.4%`;
        break;
      case 'DISK_CRITICAL':
        disk = 91.2;
        status = MonitoringStatus.DEGRADED;
        eventSeverity = 'CRITICAL';
        eventMessage = `Disk storage volume on ${target.hostname} is at 91.2% capacity`;
        break;
      case 'RECOVERY':
        cpu = 18.5;
        memory = 34.2;
        disk = 46.0;
        responseTime = 14.5;
        status = MonitoringStatus.UP;
        eventSeverity = 'INFO';
        eventMessage = `${target.hostname} has recovered to normal operational parameters`;
        break;
    }

    // Update target
    const updatedTarget = await this.prisma.monitoringTarget.update({
      where: { id: target.id },
      data: {
        status,
        cpuUsage: cpu,
        memoryUsage: memory,
        diskUsage: disk,
        responseTimeMs: responseTime,
        lastHeartbeat: now,
      },
    });

    // Record metric snapshot
    await this.prisma.monitoringMetric.create({
      data: {
        targetId: target.id,
        cpuUsage: cpu,
        memoryUsage: memory,
        diskUsage: disk,
        responseTimeMs: responseTime,
        timestamp: now,
      },
    });

    let autoIncidentId: string | null = null;

    // Auto-create incident if CRITICAL (e.g. SERVER_DOWN or DISK_CRITICAL) and no open incident exists
    if (eventSeverity === 'CRITICAL' && status === MonitoringStatus.DOWN) {
      const existingIncident = await this.prisma.ticket.findFirst({
        where: {
          relatedTargetId: target.id,
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED, TicketStatus.CANCELLED] },
        },
      });

      if (!existingIncident) {
        // Find default admin or system engineer for requester
        const systemAdmin = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
        const engineer = await this.prisma.user.findFirst({ where: { role: 'IT_ENGINEER' } });

        const count = await this.prisma.ticket.count();
        const year = now.getFullYear();
        const ticketNumber = `INC-${year}-${String(count + 1).padStart(5, '0')}`;

        const newIncident = await this.prisma.ticket.create({
          data: {
            ticketNumber,
            type: TicketType.INCIDENT,
            title: `[AUTOMATED ALERT] ${target.hostname} is DOWN`,
            description: `Automated incident triggered by monitoring watchdog. Host: ${target.hostname} (${target.ipAddress}). Location: ${target.location}. Heartbeat check failed.`,
            category: 'Server',
            priority: TicketPriority.P1,
            impact: 'HIGH',
            urgency: 'HIGH',
            status: TicketStatus.NEW,
            requesterId: systemAdmin?.id || target.id,
            assigneeId: engineer?.id || null,
            relatedTargetId: target.id,
          },
        });

        autoIncidentId = newIncident.id;

        // Create incident notification
        if (engineer) {
          await this.prisma.notification.create({
            data: {
              userId: engineer.id,
              title: `CRITICAL ALERT: ${target.hostname} DOWN`,
              message: `Automated ticket ${ticketNumber} created for server outage`,
              type: 'CRITICAL',
              linkUrl: `/incidents/${newIncident.id}`,
            },
          });
        }

        this.eventsService.broadcast('ticket:created', newIncident);
      } else {
        autoIncidentId = existingIncident.id;
      }
    }

    // Create monitoring event
    const monitoringEvent = await this.prisma.monitoringEvent.create({
      data: {
        targetId: target.id,
        eventType: scenario,
        severity: eventSeverity,
        message: eventMessage,
        incidentId: autoIncidentId,
      },
    });

    this.eventsService.broadcast('monitoring:update', {
      target: updatedTarget,
      event: monitoringEvent,
    });

    return {
      target: updatedTarget,
      event: monitoringEvent,
      autoIncidentCreated: Boolean(autoIncidentId),
    };
  }
}
