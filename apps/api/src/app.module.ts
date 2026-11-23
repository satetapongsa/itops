import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './common/prisma.service';
import { RedisService } from './common/redis.service';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TicketsModule } from './tickets/tickets.module';
import { ServiceCatalogModule } from './service-catalog/service-catalog.module';
import { SlaModule } from './sla/sla.module';
import { AssetsModule } from './assets/assets.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ChangesModule } from './changes/changes.module';
import { ProblemsModule } from './problems/problems.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    HealthModule,
    DashboardModule,
    TicketsModule,
    ServiceCatalogModule,
    SlaModule,
    AssetsModule,
    MonitoringModule,
    ChangesModule,
    ProblemsModule,
    KnowledgeModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    EventsModule,
  ],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [PrismaService, RedisService],
})
export class AppModule {}
