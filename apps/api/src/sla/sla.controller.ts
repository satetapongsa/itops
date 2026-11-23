import { Controller, Get, UseGuards } from '@nestjs/common';
import { SlaService } from './sla.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('sla')
@UseGuards(JwtAuthGuard)
export class SlaController {
  constructor(private slaService: SlaService) {}

  @Get('policies')
  async getPolicies() {
    return this.slaService.getPolicies();
  }

  @Get('status')
  async getStatusOverview() {
    return this.slaService.getStatusOverview();
  }
}
