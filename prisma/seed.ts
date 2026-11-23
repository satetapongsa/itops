import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://opspilot:opspilot_secret@localhost:5432/opspilot_db?schema=public';

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log('Seeding OpsPilot database...');

  // Default password hash
  const defaultPassword = await argon2.hash('AdminPassword123!');

  // 1. Departments
  const itDept = await prisma.department.upsert({
    where: { code: 'IT' },
    update: {},
    create: { name: 'IT Infrastructure & Operations', code: 'IT' },
  });

  const financeDept = await prisma.department.upsert({
    where: { code: 'FIN' },
    update: {},
    create: { name: 'Finance & Accounting', code: 'FIN' },
  });

  const hrDept = await prisma.department.upsert({
    where: { code: 'HR' },
    update: {},
    create: { name: 'Human Resources', code: 'HR' },
  });

  // 2. Locations
  const bkkLoc = await prisma.location.create({
    data: {
      name: 'Bangkok Head Office',
      building: 'Empire Tower',
      floor: '24th Floor',
      address: '1 South Sathorn Rd, Yannawa, Sathorn, Bangkok 10120',
      timezone: 'Asia/Bangkok',
    },
  });

  // 3. Demo Users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@opspilot.local' },
    update: {},
    create: {
      email: 'admin@opspilot.local',
      passwordHash: defaultPassword,
      firstName: 'Somsak',
      lastName: 'Prasert',
      role: 'ADMIN',
      departmentId: itDept.id,
      locationId: bkkLoc.id,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@opspilot.local' },
    update: {},
    create: {
      email: 'manager@opspilot.local',
      passwordHash: defaultPassword,
      firstName: 'Wichai',
      lastName: 'Thongdee',
      role: 'IT_MANAGER',
      departmentId: itDept.id,
      locationId: bkkLoc.id,
    },
  });

  const engineerUser = await prisma.user.upsert({
    where: { email: 'engineer@opspilot.local' },
    update: {},
    create: {
      email: 'engineer@opspilot.local',
      passwordHash: defaultPassword,
      firstName: 'Nattapong',
      lastName: 'Siriwat',
      role: 'IT_ENGINEER',
      departmentId: itDept.id,
      locationId: bkkLoc.id,
    },
  });

  // 4. SLA Policies
  await prisma.slaPolicy.upsert({
    where: { priority: 'P1' },
    update: {},
    create: {
      name: 'Critical Infrastructure Outage (P1)',
      priority: 'P1',
      firstResponseTargetMinutes: 15,
      resolutionTargetMinutes: 240, // 4 hours
    },
  });

  await prisma.slaPolicy.upsert({
    where: { priority: 'P2' },
    update: {},
    create: {
      name: 'High Impact Service Degradation (P2)',
      priority: 'P2',
      firstResponseTargetMinutes: 60,
      resolutionTargetMinutes: 480, // 8 hours
    },
  });

  await prisma.slaPolicy.upsert({
    where: { priority: 'P3' },
    update: {},
    create: {
      name: 'Medium Standard Ticket (P3)',
      priority: 'P3',
      firstResponseTargetMinutes: 240,
      resolutionTargetMinutes: 1440,
    },
  });

  // 5. Monitoring Targets
  await prisma.monitoringTarget.upsert({
    where: { hostname: 'WEB-SERVER-01' },
    update: {},
    create: {
      hostname: 'WEB-SERVER-01',
      ipAddress: '10.0.1.10',
      deviceType: 'Web Application Server',
      location: 'Bangkok DC Rack 1',
      status: 'UP',
      cpuUsage: 18.2,
      memoryUsage: 42.0,
      diskUsage: 55.4,
      responseTimeMs: 14.2,
    },
  });

  await prisma.monitoringTarget.upsert({
    where: { hostname: 'DB-SERVER-01' },
    update: {},
    create: {
      hostname: 'DB-SERVER-01',
      ipAddress: '10.0.2.20',
      deviceType: 'PostgreSQL Database Server',
      location: 'Bangkok DC Rack 2',
      status: 'UP',
      cpuUsage: 32.5,
      memoryUsage: 64.0,
      diskUsage: 72.1,
      responseTimeMs: 8.4,
    },
  });

  // 6. IT Assets
  await prisma.asset.upsert({
    where: { assetTag: 'AST-2026-0001' },
    update: {},
    create: {
      assetTag: 'AST-2026-0001',
      name: 'Dell Latitude 5540 Laptop',
      type: 'LAPTOP',
      manufacturer: 'Dell',
      model: 'Latitude 5540',
      serialNumber: 'DL5540-99881',
      hostname: 'NB-IT-01',
      status: 'ASSIGNED',
      assignedUserId: adminUser.id,
      departmentId: itDept.id,
      locationId: bkkLoc.id,
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed execution note:', e.message);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
