import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('incidents')
  async getIncidents() {
    return this.reportsService.getIncidentsReport();
  }

  @Get('sla')
  async getSla() {
    return this.reportsService.getSlaReport();
  }

  @Get('changes')
  async getChanges() {
    return this.reportsService.getChangesReport();
  }

  @Get('availability')
  async getAvailability() {
    return this.reportsService.getAvailabilityReport();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.reportsService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="operational-kpi-report.csv"');
    res.send(csv);
  }
}
