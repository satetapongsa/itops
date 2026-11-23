import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { KnowledgeStatus } from '@opspilot/shared';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { category?: string; search?: string; status?: KnowledgeStatus }) {
    const where: any = {};
    if (query?.category) where.category = query.category;
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { summary: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.knowledgeArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    });
  }

  async findBySlug(slug: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { slug },
      include: { author: { select: { firstName: true, lastName: true, email: true } } },
    });

    if (!article) throw new NotFoundException(`Article ${slug} not found`);

    // Increment view count
    await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async create(body: any, authorId: string) {
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    return this.prisma.knowledgeArticle.create({
      data: {
        title: body.title,
        slug,
        summary: body.summary,
        content: body.content,
        category: body.category,
        tags: body.tags || [],
        authorId,
        status: KnowledgeStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }

  async feedback(id: string, isHelpful: boolean) {
    return this.prisma.knowledgeArticle.update({
      where: { id },
      data: isHelpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    });
  }
}
