import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ChangesService } from './changes.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@opspilot/shared';
import { CreateChangeDto } from '@opspilot/api-contracts';

@Controller('changes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChangesController {
  constructor(private changesService: ChangesService) {}

  @Get()
  async findAll() {
    return this.changesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.changesService.findOne(id);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.changesService.create(body, req.user.id);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.changesService.submit(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.IT_MANAGER)
  async approve(@Param('id') id: string, @Body('notes') notes: string, @Req() req: any) {
    return this.changesService.approve(id, req.user.id, notes);
  }

  @Post(':id/complete')
  async complete(@Param('id') id: string, @Body('resultNotes') resultNotes: string) {
    return this.changesService.complete(id, resultNotes);
  }

  @Post(':id/rollback')
  async rollback(@Param('id') id: string, @Body('resultNotes') resultNotes: string) {
    return this.changesService.rollback(id, resultNotes);
  }
}
