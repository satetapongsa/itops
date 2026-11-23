import { Test, TestingModule } from '@nestjs/testing';
import { MonitoringService } from './monitoring.service';
import { PrismaService } from '../common/prisma.service';
import { EventsService } from '../events/events.service';
import { MonitoringStatus, TicketPriority } from '@opspilot/shared';

describe('MonitoringService & Auto-Incident Trigger', () => {
  let monitoringService: MonitoringService;
  let prisma: PrismaService;
  let events: EventsService;

  const mockTarget = {
    id: 'target-1',
    hostname: 'WEB-SERVER-01',
    ipAddress: '10.0.1.10',
    deviceType: 'SERVER',
    location: 'Bangkok DC',
    status: MonitoringStatus.UP,
    cpuUsage: 25.0,
    memoryUsage: 45.0,
    diskUsage: 50.0,
    responseTimeMs: 15.0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonitoringService,
        {
          provide: PrismaService,
          useValue: {
            monitoringTarget: {
              findUnique: jest.fn().mockResolvedValue(mockTarget),
              findFirst: jest.fn().mockResolvedValue(mockTarget),
              update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockTarget, ...data })),
            },
            monitoringMetric: {
              create: jest.fn().mockResolvedValue({}),
            },
            monitoringEvent: {
              create: jest.fn().mockResolvedValue({ id: 'evt-1' }),
            },
            ticket: {
              findFirst: jest.fn().mockResolvedValue(null), // no active incident
              count: jest.fn().mockResolvedValue(5),
              create: jest.fn().mockResolvedValue({
                id: 'inc-auto-1',
                ticketNumber: 'INC-2026-00006',
                priority: TicketPriority.P1,
              }),
            },
            user: {
              findFirst: jest.fn().mockResolvedValue({ id: 'eng-1', role: 'IT_ENGINEER' }),
            },
            notification: {
              create: jest.fn().mockResolvedValue({}),
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

    monitoringService = module.get<MonitoringService>(MonitoringService);
    prisma = module.get<PrismaService>(PrismaService);
    events = module.get<EventsService>(EventsService);
  });

  it('should handle SERVER_DOWN simulation and automatically create an incident', async () => {
    const result = await monitoringService.simulate('SERVER_DOWN', 'target-1');

    expect(result.target.status).toBe(MonitoringStatus.DOWN);
    expect(result.autoIncidentCreated).toBe(true);
    expect(prisma.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          priority: TicketPriority.P1,
          relatedTargetId: 'target-1',
        }),
      }),
    );
    expect(events.broadcast).toHaveBeenCalledWith(
      'monitoring:update',
      expect.objectContaining({
        target: expect.objectContaining({ status: MonitoringStatus.DOWN }),
      }),
    );
  });

  it('should handle RECOVERY simulation and restore operational status', async () => {
    const result = await monitoringService.simulate('RECOVERY', 'target-1');

    expect(result.target.status).toBe(MonitoringStatus.UP);
    expect(result.target.cpuUsage).toBeLessThan(50);
  });
});
