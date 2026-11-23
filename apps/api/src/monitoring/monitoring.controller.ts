import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SimulateMonitoringDto } from '@opspilot/api-contracts';

@Controller('monitoring')
@UseGuards(JwtAuthGuard)
export class MonitoringController {
  constructor(private monitoringService: MonitoringService) {}

  @Get('targets')
  async getTargets() {
    return this.monitoringService.getTargets();
  }

  @Get('targets/:id')
  async getTarget(@Param('id') id: string) {
    return this.monitoringService.getTarget(id);
  }

  @Get('metrics')
  async getMetrics(@Query('targetId') targetId?: string) {
    return this.monitoringService.getMetrics(targetId);
  }

  @Get('events')
  async getEvents() {
    return this.monitoringService.getEvents();
  }

  @Post('simulate')
  async simulate(@Body() body: SimulateMonitoringDto) {
    return this.monitoringService.simulate(body.scenario, body.targetId);
  }
}
