import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import {
  CreateTicketDto,
  UpdateTicketStatusDto,
  AddTicketCommentDto,
} from '@opspilot/api-contracts';
import {
  TicketPriority,
  TicketStatus,
  TicketType,
  calculatePriority,
} from '@opspilot/shared';
import { EventsService } from '../events/events.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async findAll(query?: { type?: TicketType; status?: TicketStatus; priority?: TicketPriority }) {
    const where: any = {};
    if (query?.type) where.type = query.type;
    if (query?.status) where.status = query.status;
    if (query?.priority) where.priority = query.priority;

    return this.prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        slaClock: true,
        department: true,
      },
    });
  }

  async findOne(id: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        comments: {
          include: { author: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'asc' },
        },
        history: {
          include: { actor: { select: { id: true, firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        slaClock: { include: { slaPolicy: true } },
        relatedAsset: true,
        relatedTarget: true,
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async create(dto: CreateTicketDto, requesterId: string) {
    const calculatedPriority = calculatePriority(dto.impact, dto.urgency);
    const finalPriority = dto.priorityOverride || calculatedPriority;

    const count = await this.prisma.ticket.count();
    const year = new Date().getFullYear();
    const prefix = dto.type === TicketType.INCIDENT ? 'INC' : 'REQ';
    const ticketNumber = `${prefix}-${year}-${String(count + 1).padStart(5, '0')}`;

    const requester = await this.prisma.user.findUnique({ where: { id: requesterId } });

    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        type: dto.type,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: finalPriority,
        impact: dto.impact,
        urgency: dto.urgency,
        priorityOverride: dto.priorityOverride || null,
        priorityOverrideReason: dto.priorityOverrideReason || null,
        status: TicketStatus.NEW,
        requesterId,
        departmentId: requester?.departmentId || null,
        relatedAssetId: dto.relatedAssetId || null,
        relatedTargetId: dto.relatedTargetId || null,
      },
    });

    // Initialize SLA clock if policy exists
    const slaPolicy = await this.prisma.slaPolicy.findFirst({
      where: { priority: finalPriority, isActive: true },
    });

    if (slaPolicy) {
      const now = new Date();
      const firstResponseDeadline = new Date(now.getTime() + slaPolicy.firstResponseTargetMinutes * 60000);
      const resolutionDeadline = new Date(now.getTime() + slaPolicy.resolutionTargetMinutes * 60000);

      await this.prisma.slaClock.create({
        data: {
          ticketId: ticket.id,
          slaPolicyId: slaPolicy.id,
          firstResponseDeadline,
          resolutionDeadline,
        },
      });
    }

    // Record history
    await this.prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        actorId: requesterId,
        action: 'TICKET_CREATED',
        newValue: ticket.status,
      },
    });

    // Emit real-time SSE event
    this.eventsService.broadcast('ticket:created', ticket);

    return ticket;
  }

  async updateStatus(id: string, dto: UpdateTicketStatusDto, actorId: string) {
    const ticket = await this.findOne(id);
    const oldStatus = ticket.status;

    const updateData: any = {
      status: dto.status,
    };

    const now = new Date();

    if (oldStatus === TicketStatus.NEW && dto.status !== TicketStatus.NEW && !ticket.firstResponseAt) {
      updateData.firstResponseAt = now;
    }

    if (dto.status === TicketStatus.RESOLVED) {
      updateData.resolvedAt = now;
      if (dto.resolutionNotes) updateData.resolutionNotes = dto.resolutionNotes;
      if (dto.rootCause) updateData.rootCause = dto.rootCause;
    } else if (dto.status === TicketStatus.CLOSED) {
      updateData.closedAt = now;
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    // Pause / resume SLA clock if status is PENDING_USER
    if (dto.status === TicketStatus.PENDING_USER) {
      await this.prisma.slaClock.updateMany({
        where: { ticketId: id },
        data: { isPaused: true, pausedAt: now },
      });
    } else if (oldStatus === TicketStatus.PENDING_USER) {
      await this.prisma.slaClock.updateMany({
        where: { ticketId: id },
        data: { isPaused: false, pausedAt: null },
      });
    }

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        actorId,
        action: 'STATUS_CHANGED',
        fieldChanged: 'status',
        oldValue: oldStatus,
        newValue: dto.status,
      },
    });

    this.eventsService.broadcast('ticket:updated', updated);

    return updated;
  }

  async assign(id: string, assigneeId: string, actorId: string) {
    const ticket = await this.findOne(id);
    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        assigneeId,
        status: ticket.status === TicketStatus.NEW ? TicketStatus.ACKNOWLEDGED : ticket.status,
        firstResponseAt: ticket.firstResponseAt || new Date(),
      },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        actorId,
        action: 'TICKET_ASSIGNED',
        fieldChanged: 'assigneeId',
        oldValue: ticket.assigneeId || 'Unassigned',
        newValue: assigneeId,
      },
    });

    // Create in-app notification for the assignee
    await this.prisma.notification.create({
      data: {
        userId: assigneeId,
        title: `Assigned: ${ticket.ticketNumber}`,
        message: `You have been assigned to ${ticket.title}`,
        type: 'INFO',
        linkUrl: `/incidents/${ticket.id}`,
      },
    });

    this.eventsService.broadcast('ticket:updated', updated);
    return updated;
  }

  async addComment(id: string, dto: AddTicketCommentDto, authorId: string) {
    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId: id,
        authorId,
        content: dto.content,
        isInternal: dto.isInternal || false,
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
    });

    await this.prisma.ticketHistory.create({
      data: {
        ticketId: id,
        actorId: authorId,
        action: dto.isInternal ? 'INTERNAL_NOTE_ADDED' : 'COMMENT_ADDED',
      },
    });

    this.eventsService.broadcast('ticket:comment_added', comment);
    return comment;
  }
}
