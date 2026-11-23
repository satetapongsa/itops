import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, AssetStatus, AssetType } from '@opspilot/shared';
import { CreateAssetDto } from '@opspilot/api-contracts';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private assetsService: AssetsService) {}

  @Get()
  async findAll(
    @Query('type') type?: AssetType,
    @Query('status') status?: AssetStatus,
    @Query('search') search?: string,
  ) {
    return this.assetsService.findAll({ type, status, search });
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.assetsService.exportCsv();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assets-inventory.csv"');
    res.send(csv);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.assetsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.IT_MANAGER)
  async create(@Body() body: any, @Req() req: any) {
    return this.assetsService.create(body, req.user.id);
  }

  @Post(':id/assign')
  @Roles(UserRole.ADMIN, UserRole.ASSET_MANAGER, UserRole.IT_MANAGER)
  async assign(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.assetsService.assign(id, userId, notes, req.user.id);
  }
}
