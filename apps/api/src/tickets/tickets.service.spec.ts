import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from '../events/events.service';
import { ImpactLevel, TicketPriority, TicketStatus, TicketType, UrgencyLevel, calculatePriority } from '@opspilot/shared';

describe('TicketsService & Priority Matrix', () => {
  let ticketsService: TicketsService;
  let prisma: PrismaService;
  let events: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: {
            ticket: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn().mockResolvedValue(0),
            },
            user: {
              findUnique: jest.fn().mockResolvedValue({ id: 'u1', departmentId: 'd1' }),
            },
            slaPolicy: {
              findFirst: jest.fn().mockResolvedValue({
                id: 'sla-1',
                firstResponseTargetMinutes: 15,
                resolutionTargetMinutes: 240,
              }),
            },
            slaClock: {
              create: jest.fn(),
              updateMany: jest.fn(),
            },
            ticketHistory: {
              create: jest.fn(),
            },
            notification: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: EventsService,
          useValue: {
            broadcast: jest.fn(),
          },
        },
      ],
    }).compile();

    ticketsService = module.get<TicketsService>(TicketsService);
    prisma = module.get<PrismaService>(PrismaService);
    events = module.get<EventsService>(EventsService);
  });

  it('should correctly calculate priority from impact and urgency matrix', () => {
    expect(calculatePriority(ImpactLevel.HIGH, UrgencyLevel.HIGH)).toBe(TicketPriority.P1);
    expect(calculatePriority(ImpactLevel.HIGH, UrgencyLevel.MEDIUM)).toBe(TicketPriority.P2);
    expect(calculatePriority(ImpactLevel.MEDIUM, UrgencyLevel.HIGH)).toBe(TicketPriority.P2);
    expect(calculatePriority(ImpactLevel.MEDIUM, UrgencyLevel.MEDIUM)).toBe(TicketPriority.P3);
    expect(calculatePriority(ImpactLevel.LOW, UrgencyLevel.LOW)).toBe(TicketPriority.P4);
  });

  it('should create an incident with auto-generated ticketNumber and initialize SLA clock', async () => {
    const mockCreatedTicket = {
      id: 'ticket-1',
      ticketNumber: 'INC-2026-00001',
      type: TicketType.INCIDENT,
      title: 'Database latency spike',
      priority: TicketPriority.P1,
      status: TicketStatus.NEW,
    };

    jest.spyOn(prisma.ticket, 'create').mockResolvedValue(mockCreatedTicket as any);

    const result = await ticketsService.create(
      {
        type: TicketType.INCIDENT,
        title: 'Database latency spike',
        description: 'Queries taking > 5 seconds',
        category: 'Database',
        impact: ImpactLevel.HIGH,
        urgency: UrgencyLevel.HIGH,
      },
      'u1',
    );

    expect(result.ticketNumber).toBe('INC-2026-00001');
    expect(prisma.slaClock.create).toHaveBeenCalled();
    expect(events.broadcast).toHaveBeenCalledWith('ticket:created', mockCreatedTicket);
  });
});
