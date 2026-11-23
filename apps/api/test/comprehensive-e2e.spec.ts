import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { RedisService } from '../src/common/redis.service';
import { UserRole, TicketPriority, TicketStatus, MonitoringStatus, ChangeStatus } from '@opspilot/shared';
import * as argon2 from 'argon2';

describe('OpsPilot Full Backend Integration Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const mockAdminUser = {
    id: 'test-admin-uuid',
    email: 'admin@opspilot.local',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    departmentId: 'dept-it-uuid',
    department: { id: 'dept-it-uuid', name: 'IT Infrastructure' },
  };

  const mockEngineerUser = {
    id: 'test-eng-uuid',
    email: 'engineer@opspilot.local',
    passwordHash: '',
    firstName: 'Nattapong',
    lastName: 'Siriwat',
    role: UserRole.IT_ENGINEER,
    status: 'ACTIVE',
    departmentId: 'dept-it-uuid',
  };

  let accessToken = '';

  beforeAll(async () => {
    mockAdminUser.passwordHash = await argon2.hash('AdminPassword123!');
    mockEngineerUser.passwordHash = await argon2.hash('AdminPassword123!');

    // Mock in-memory DB collections for integration verification
    const inMemoryTickets: any[] = [];
    const inMemoryAssets: any[] = [];
    const inMemoryChanges: any[] = [];
    const inMemoryProblems: any[] = [];
    const inMemoryArticles: any[] = [];
    const inMemoryTargets: any[] = [
      {
        id: 'target-mock-1',
        hostname: 'WEB-SERVER-01',
        ipAddress: '10.0.1.10',
        deviceType: 'Web Server',
        location: 'Bangkok DC',
        status: MonitoringStatus.UP,
        cpuUsage: 20.0,
        memoryUsage: 40.0,
        diskUsage: 50.0,
        responseTimeMs: 15.0,
        uptimeSeconds: BigInt(864000),
      },
    ];
    const inMemoryCatalog: any[] = [
      {
        id: 'cat-1',
        name: 'VPN Access Request',
        description: 'Remote access credentials',
        category: 'Network',
        requiresApproval: true,
        isActive: true,
      },
    ];

    const mockPrisma = {
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.email === 'admin@opspilot.local' || where.id === mockAdminUser.id) {
            return Promise.resolve(mockAdminUser);
          }
          if (where.email === 'engineer@opspilot.local' || where.id === mockEngineerUser.id) {
            return Promise.resolve(mockEngineerUser);
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockResolvedValue(mockAdminUser),
        update: jest.fn().mockResolvedValue(mockAdminUser),
      },
      refreshToken: {
        create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
        deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'aud-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      ticket: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(inMemoryTickets)),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(inMemoryTickets.find((t) => t.id === where.id) || null);
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const created = {
            id: `ticket-${inMemoryTickets.length + 1}`,
            createdAt: new Date(),
            ...data,
            requester: mockAdminUser,
            assignee: null,
          };
          inMemoryTickets.push(created);
          return Promise.resolve(created);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const item = inMemoryTickets.find((t) => t.id === where.id);
          if (item) Object.assign(item, data);
          return Promise.resolve(item || data);
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(inMemoryTickets.length)),
      },
      ticketComment: {
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'c-1', ...data })),
      },
      ticketHistory: {
        create: jest.fn().mockResolvedValue({ id: 'h-1' }),
      },
      slaPolicy: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'sla-p1',
          priority: TicketPriority.P1,
          firstResponseTargetMinutes: 15,
          resolutionTargetMinutes: 240,
        }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'sla-1', priority: TicketPriority.P1, firstResponseTargetMinutes: 15, resolutionTargetMinutes: 240 },
          { id: 'sla-2', priority: TicketPriority.P2, firstResponseTargetMinutes: 60, resolutionTargetMinutes: 480 },
        ]),
      },
      slaClock: {
        create: jest.fn().mockResolvedValue({ id: 'clock-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(10),
        findMany: jest.fn().mockResolvedValue([]),
      },
      serviceCatalogItem: {
        findMany: jest.fn().mockResolvedValue(inMemoryCatalog),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryCatalog.find((c) => c.id === where.id))),
        create: jest.fn().mockImplementation(({ data }) => {
          const item = { id: `cat-${inMemoryCatalog.length + 1}`, ...data };
          inMemoryCatalog.push(item);
          return Promise.resolve(item);
        }),
      },
      serviceRequestApproval: {
        create: jest.fn().mockResolvedValue({ id: 'appr-1' }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(0),
      },
      asset: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(inMemoryAssets)),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryAssets.find((a) => a.id === where.id))),
        create: jest.fn().mockImplementation(({ data }) => {
          const a = { id: `ast-${inMemoryAssets.length + 1}`, ...data, createdAt: new Date() };
          inMemoryAssets.push(a);
          return Promise.resolve(a);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const a = inMemoryAssets.find((item) => item.id === where.id);
          if (a) Object.assign(a, data);
          return Promise.resolve(a || data);
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(inMemoryAssets.length)),
      },
      assetAssignmentHistory: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'aah-1' }),
        update: jest.fn().mockResolvedValue({ id: 'aah-1' }),
      },
      monitoringTarget: {
        findMany: jest.fn().mockResolvedValue(inMemoryTargets),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryTargets.find((t) => t.id === where.id))),
        findFirst: jest.fn().mockResolvedValue(inMemoryTargets[0]),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const t = inMemoryTargets.find((item) => item.id === where.id);
          if (t) Object.assign(t, data);
          return Promise.resolve(t || data);
        }),
        count: jest.fn().mockResolvedValue(1),
      },
      monitoringMetric: {
        create: jest.fn().mockResolvedValue({ id: 'm-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      monitoringEvent: {
        create: jest.fn().mockResolvedValue({ id: 'e-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      changeRequest: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(inMemoryChanges)),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryChanges.find((c) => c.id === where.id))),
        create: jest.fn().mockImplementation(({ data }) => {
          const c = { id: `chg-${inMemoryChanges.length + 1}`, ...data, createdAt: new Date() };
          inMemoryChanges.push(c);
          return Promise.resolve(c);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const c = inMemoryChanges.find((item) => item.id === where.id);
          if (c) Object.assign(c, data);
          return Promise.resolve(c || data);
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(inMemoryChanges.length)),
      },
      changeApproval: {
        create: jest.fn().mockResolvedValue({ id: 'ca-1' }),
      },
      problem: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(inMemoryProblems)),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryProblems.find((p) => p.id === where.id))),
        count: jest.fn().mockImplementation(() => Promise.resolve(inMemoryProblems.length)),
        create: jest.fn().mockImplementation(({ data }) => {
          const p = { id: `prb-${inMemoryProblems.length + 1}`, ...data, createdAt: new Date() };
          inMemoryProblems.push(p);
          return Promise.resolve(p);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const p = inMemoryProblems.find((item) => item.id === where.id);
          if (p) Object.assign(p, data);
          return Promise.resolve(p || data);
        }),
      },
      problemIncident: {
        create: jest.fn().mockResolvedValue({ id: 'pi-1' }),
      },
      knowledgeArticle: {
        findMany: jest.fn().mockImplementation(() => Promise.resolve(inMemoryArticles)),
        findUnique: jest.fn().mockImplementation(({ where }) => Promise.resolve(inMemoryArticles.find((a) => a.slug === where.slug || a.id === where.id))),
        create: jest.fn().mockImplementation(({ data }) => {
          const a = { id: `kb-${inMemoryArticles.length + 1}`, ...data, createdAt: new Date(), helpfulCount: 0 };
          inMemoryArticles.push(a);
          return Promise.resolve(a);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const a = inMemoryArticles.find((item) => item.id === where.id);
          if (a) {
            const copy = { ...a };
            if (data.viewCount?.increment) copy.viewCount = (copy.viewCount || 0) + 1;
            if (data.helpfulCount?.increment) copy.helpfulCount = (copy.helpfulCount || 0) + 1;
            Object.assign(a, copy);
            return Promise.resolve(copy);
          }
          return Promise.resolve(data);
        }),
      },
      notification: {
        create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  // 1. Health Check
  it('GET /api/v1/health should respond with service status', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBeDefined();
    expect(res.body.services.database).toBe('healthy');
  });

  // 2. Authentication Flow
  it('POST /api/v1/auth/login should authenticate admin and issue JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@opspilot.local', password: 'AdminPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe(UserRole.ADMIN);
    accessToken = res.body.accessToken;
  });

  it('POST /api/v1/auth/login should reject invalid credentials with 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@opspilot.local', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me should return authenticated user profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe('admin@opspilot.local');
  });

  // 3. Incident Management Workflow
  let createdTicketId = '';
  it('POST /api/v1/tickets should create an incident with auto-calculated priority', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/tickets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        type: 'INCIDENT',
        title: 'Core Switch Port 1 Failure',
        description: 'VLAN 10 traffic dropped',
        category: 'Network',
        impact: 'HIGH',
        urgency: 'HIGH',
      });

    expect(res.status).toBe(201);
    expect(res.body.ticketNumber).toBeDefined();
    expect(res.body.priority).toBe(TicketPriority.P1);
    createdTicketId = res.body.id;
  });

  it('POST /api/v1/tickets/:id/assign should assign technician and update status', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/tickets/${createdTicketId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ assigneeId: mockEngineerUser.id });

    expect(res.status).toBe(201);
    expect(res.body.assigneeId).toBe(mockEngineerUser.id);
  });

  it('POST /api/v1/tickets/:id/comments should add an internal note', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/tickets/${createdTicketId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Investigating SFP module optical levels', isInternal: true });

    expect(res.status).toBe(201);
    expect(res.body.isInternal).toBe(true);
  });

  it('PATCH /api/v1/tickets/:id/status should resolve the incident', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/tickets/${createdTicketId}/status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        status: TicketStatus.RESOLVED,
        resolutionNotes: 'Replaced faulty 10G SFP+ module',
        rootCause: 'Hardware optical transponder degradation',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe(TicketStatus.RESOLVED);
    expect(res.body.resolutionNotes).toBe('Replaced faulty 10G SFP+ module');
  });

  // 4. Service Catalog & Request Approval Workflow
  it('GET /api/v1/service-catalog should list active catalog items', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/service-catalog')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('POST /api/v1/service-catalog/:id/request should submit request and initiate approval', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/service-catalog/cat-1/request')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ reason: 'Work From Home Access' });

    expect(res.status).toBe(201);
    expect(res.body.ticketNumber).toMatch(/^REQ-/);
  });

  // 5. Monitoring Simulation & Auto-Incident Trigger
  it('POST /api/v1/monitoring/simulate should execute SERVER_DOWN and trigger auto incident', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/monitoring/simulate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ scenario: 'SERVER_DOWN' });

    expect(res.status).toBe(201);
    expect(res.body.target.status).toBe(MonitoringStatus.DOWN);
    expect(res.body.autoIncidentCreated).toBe(true);
  });

  it('POST /api/v1/monitoring/simulate should execute RECOVERY and restore target health', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/monitoring/simulate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ scenario: 'RECOVERY' });

    expect(res.status).toBe(201);
    expect(res.body.target.status).toBe(MonitoringStatus.UP);
  });

  // 6. IT Asset Management (ITAM)
  let createdAssetId = '';
  it('POST /api/v1/assets should register a new enterprise asset', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/assets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        assetTag: 'AST-2026-9999',
        name: 'MacBook Pro 16 M3 Max',
        type: 'LAPTOP',
        manufacturer: 'Apple',
        model: 'MacBook Pro 16',
        serialNumber: 'C02G1234MD6R',
        status: 'IN_STOCK',
      });

    expect(res.status).toBe(201);
    expect(res.body.assetTag).toBe('AST-2026-9999');
    createdAssetId = res.body.id;
  });

  it('POST /api/v1/assets/:id/assign should record employee assignment', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/assets/${createdAssetId}/assign`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ userId: mockEngineerUser.id, notes: 'Handed over for mobile dev' });

    expect(res.status).toBe(201);
    expect(res.body.assignedUserId).toBe(mockEngineerUser.id);
  });

  // 7. Change Management & CAB Approval
  let createdChangeId = '';
  it('POST /api/v1/changes should draft an infrastructure change', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/changes')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Database Index Optimization for Tickets',
        description: 'Add composite indexes on ticketNumber & createdAt',
        category: 'DATABASE',
        riskLevel: 'MEDIUM',
        impactAssessment: 'Read lock for 30 seconds',
        businessJustification: 'Query latency reduction by 40%',
        implementationPlan: 'Run CREATE INDEX CONCURRENTLY',
        rollbackPlan: 'DROP INDEX if memory exceeds 80%',
        testPlan: 'Run query benchmarks on staging',
        plannedStart: new Date().toISOString(),
        plannedEnd: new Date(Date.now() + 3600000).toISOString(),
      });

    expect(res.status).toBe(201);
    expect(res.body.changeNumber).toMatch(/^CHG-/);
    expect(res.body.status).toBe(ChangeStatus.DRAFT);
    createdChangeId = res.body.id;
  });

  it('POST /api/v1/changes/:id/approve should approve change by manager', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/changes/${createdChangeId}/approve`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ notes: 'Approved for maintenance window' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe(ChangeStatus.SCHEDULED);
  });

  // 8. Problem Management & RCA
  let createdProblemId = '';
  it('POST /api/v1/problems should create problem record and link incident', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/problems')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Recurring SFP Module Drop on Core Switch',
        description: 'Multiple fiber ports flapping during high temperature',
      });

    expect(res.status).toBe(201);
    expect(res.body.problemNumber).toMatch(/^PRB-/);
    createdProblemId = res.body.id;

    // Link incident
    const linkRes = await request(app.getHttpServer())
      .post(`/api/v1/problems/${createdProblemId}/incidents`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ ticketId: createdTicketId });

    expect(linkRes.status).toBe(201);
  });

  it('PATCH /api/v1/problems/:id should record Root Cause Analysis', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/api/v1/problems/${createdProblemId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        rootCause: 'Rack air duct blockage caused ambient temp to reach 38C',
        correctiveAction: 'Cleaned intake fan filters and rerouted cooling airflow',
        preventiveAction: 'Install environmental temperature sensor alert at 28C',
        status: 'RESOLVED',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('RESOLVED');
  });

  // 9. Knowledge Base
  it('POST /api/v1/knowledge should publish a troubleshooting article', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/knowledge')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Fiber SFP Transponder Troubleshooting Guide',
        summary: 'How to diagnose optical power levels with CLI commands',
        content: 'Run `show interfaces transceiver details` to inspect Rx/Tx dBm.',
        category: 'Network',
      });

    expect(res.status).toBe(201);
    expect(res.body.slug).toBeDefined();

    // Feedback
    const fbRes = await request(app.getHttpServer())
      .post(`/api/v1/knowledge/${res.body.id}/feedback`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ isHelpful: true });

    expect(fbRes.status).toBe(201);
    expect(fbRes.body.helpfulCount).toBe(1);
  });

  // 10. Reports & Operational KPIs
  it('GET /api/v1/reports/incidents should calculate MTTA and MTTR', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/reports/incidents')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.totalIncidents).toBeDefined();
    expect(typeof res.body.mttaMinutes).toBe('number');
    expect(typeof res.body.mttrMinutes).toBe('number');
  });

  it('GET /api/v1/reports/export/csv should return CSV content', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/reports/export/csv')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/csv');
    expect(res.text).toContain('Metric,Value');
  });
});
