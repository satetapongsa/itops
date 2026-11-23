import { Controller, Get, Post, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { KnowledgeStatus } from '@opspilot/shared';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('status') status?: KnowledgeStatus,
  ) {
    return this.knowledgeService.findAll({ category, search, status });
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.knowledgeService.findBySlug(slug);
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    return this.knowledgeService.create(body, req.user.id);
  }

  @Post(':id/feedback')
  async feedback(@Param('id') id: string, @Body('isHelpful') isHelpful: boolean) {
    return this.knowledgeService.feedback(id, isHelpful);
  }
}
