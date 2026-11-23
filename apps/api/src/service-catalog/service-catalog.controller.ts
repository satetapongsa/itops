import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ServiceCatalogService } from './service-catalog.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@opspilot/shared';

@Controller('service-catalog')
@UseGuards(JwtAuthGuard)
export class ServiceCatalogController {
  constructor(private serviceCatalogService: ServiceCatalogService) {}

  @Get()
  async findAll() {
    return this.serviceCatalogService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.serviceCatalogService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.IT_MANAGER)
  async create(@Body() body: any) {
    return this.serviceCatalogService.create(body);
  }

  @Post(':id/request')
  async submitRequest(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.serviceCatalogService.submitRequest(id, body, req.user.id);
  }

  @Post('requests/:ticketId/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.IT_MANAGER)
  async approveRequest(
    @Param('ticketId') ticketId: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.serviceCatalogService.approveRequest(ticketId, req.user.id, notes);
  }

  @Post('requests/:ticketId/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.IT_MANAGER)
  async rejectRequest(
    @Param('ticketId') ticketId: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.serviceCatalogService.rejectRequest(ticketId, req.user.id, notes);
  }
}
