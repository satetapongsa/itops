import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TicketPriority } from '@opspilot/shared';

@Injectable()
export class SlaService {
  constructor(private prisma: PrismaService) {}

  async getPolicies() {
    return this.prisma.slaPolicy.findMany({
      orderBy: { priority: 'asc' },
    });
  }

  async getStatusOverview() {
    const clocks = await this.prisma.slaClock.findMany({
      include: {
        slaPolicy: true,
        ticket: { select: { ticketNumber: true, title: true, priority: true, status: true } },
      },
      orderBy: { resolutionDeadline: 'asc' },
      take: 20,
    });

    return clocks.map((c) => {
      const now = Date.now();
      const totalBudget = c.resolutionDeadline.getTime() - c.createdAt.getTime();
      const elapsed = Math.max(0, now - c.createdAt.getTime() - c.totalPausedMinutes * 60000);
      const percentConsumed = totalBudget > 0 ? Math.min(100, Math.round((elapsed / totalBudget) * 100)) : 100;
      const isWarning = percentConsumed >= 75 && !c.resolutionBreached;

      return {
        ...c,
        percentConsumed,
        isWarning,
      };
    });
  }
}
