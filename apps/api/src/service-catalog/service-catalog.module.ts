import { Module } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { ServiceCatalogController } from './service-catalog.controller';
import { PrismaService } from '../common/prisma.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [ServiceCatalogController],
  providers: [ServiceCatalogService, PrismaService],
  exports: [ServiceCatalogService],
})
export class ServiceCatalogModule {}
