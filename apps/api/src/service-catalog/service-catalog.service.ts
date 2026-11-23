import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { TicketType, TicketStatus, TicketPriority } from '@opspilot/shared';
import { EventsService } from '../events/events.service';

@Injectable()
export class ServiceCatalogService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async findAll() {
    return this.prisma.serviceCatalogItem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.serviceCatalogItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Catalog item ${id} not found`);
    return item;
  }

  async create(body: any) {
    return this.prisma.serviceCatalogItem.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category || 'General IT',
        formSchema: body.formSchema || [],
        requiresApproval: body.requiresApproval !== undefined ? body.requiresApproval : true,
        estimatedFulfillmentHours: body.estimatedFulfillmentHours || 24,
      },
    });
  }

  async submitRequest(catalogItemId: string, formData: any, requesterId: string) {
    const item = await this.findOne(catalogItemId);

    const count = await this.prisma.ticket.count();
    const year = new Date().getFullYear();
    const ticketNumber = `REQ-${year}-${String(count + 1).padStart(5, '0')}`;

    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        type: TicketType.SERVICE_REQUEST,
        title: `[Service Request] ${item.name}`,
        description: `Submitted Request: ${item.name}\nDetails: ${JSON.stringify(formData, null, 2)}`,
        category: item.category,
        priority: TicketPriority.P3,
        impact: 'LOW',
        urgency: 'LOW',
        status: item.requiresApproval ? TicketStatus.NEW : TicketStatus.IN_PROGRESS,
        requesterId,
        departmentId: requester?.departmentId || null,
      },
    });

    if (item.requiresApproval) {
      // Find manager
      const manager = await this.prisma.user.findFirst({ where: { role: 'IT_MANAGER' } });
      if (manager) {
        await this.prisma.serviceRequestApproval.create({
          data: {
            ticketId: ticket.id,
            approverId: manager.id,
            status: 'PENDING',
          },
        });

        await this.prisma.notification.create({
          data: {
            userId: manager.id,
            title: `Approval Needed: ${ticket.ticketNumber}`,
            message: `${requester?.firstName} requested ${item.name}`,
            type: 'APPROVAL',
            linkUrl: `/incidents/${ticket.id}`,
          },
        });
      }
    }

    this.eventsService.broadcast('ticket:created', ticket);
    return ticket;
  }

  async approveRequest(ticketId: string, approverId: string, notes?: string) {
    await this.prisma.serviceRequestApproval.updateMany({
      where: { ticketId, status: 'PENDING' },
      data: { status: 'APPROVED', decisionNotes: notes, decidedAt: new Date() },
    });

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.IN_PROGRESS },
    });

    this.eventsService.broadcast('ticket:updated', ticket);
    return ticket;
  }

  async rejectRequest(ticketId: string, approverId: string, notes?: string) {
    await this.prisma.serviceRequestApproval.updateMany({
      where: { ticketId, status: 'PENDING' },
      data: { status: 'REJECTED', decisionNotes: notes, decidedAt: new Date() },
    });

    const ticket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: TicketStatus.CANCELLED, resolutionNotes: notes || 'Rejected by approver' },
    });

    this.eventsService.broadcast('ticket:updated', ticket);
    return ticket;
  }
}
