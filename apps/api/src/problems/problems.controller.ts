import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('problems')
@UseGuards(JwtAuthGuard)
export class ProblemsController {
  constructor(private problemsService: ProblemsService) {}

  @Get()
  async findAll() {
    return this.problemsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.problemsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.problemsService.create(body, req.user.id);
  }

  @Post(':id/incidents')
  async linkIncident(@Param('id') id: string, @Body('ticketId') ticketId: string) {
    return this.problemsService.linkIncident(id, ticketId);
  }

  @Patch(':id')
  async updateRca(@Param('id') id: string, @Body() body: any) {
    return this.problemsService.updateRca(id, body);
  }
}
