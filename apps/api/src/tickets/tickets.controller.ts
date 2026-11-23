import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CreateTicketDto,
  UpdateTicketStatusDto,
  AddTicketCommentDto,
} from '@opspilot/api-contracts';
import { TicketPriority, TicketStatus, TicketType } from '@opspilot/shared';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Get()
  async findAll(
    @Query('type') type?: TicketType,
    @Query('status') status?: TicketStatus,
    @Query('priority') priority?: TicketPriority,
  ) {
    return this.ticketsService.findAll({ type, status, priority });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.ticketsService.create(body, req.user.id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTicketStatusDto,
    @Req() req: any,
  ) {
    return this.ticketsService.updateStatus(id, body, req.user.id);
  }

  @Post(':id/assign')
  async assign(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
    @Req() req: any,
  ) {
    return this.ticketsService.assign(id, assigneeId, req.user.id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body() body: AddTicketCommentDto,
    @Req() req: any,
  ) {
    return this.ticketsService.addComment(id, body, req.user.id);
  }
}
