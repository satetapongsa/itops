import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ProblemStatus } from '@opspilot/shared';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.problem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        incidents: { include: { ticket: { select: { id: true, ticketNumber: true, title: true } } } },
      },
    });
  }

  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        incidents: { include: { ticket: true } },
      },
    });

    if (!problem) throw new NotFoundException(`Problem ${id} not found`);
    return problem;
  }

  async create(body: any, ownerId: string) {
    const count = await this.prisma.problem.count();
    const year = new Date().getFullYear();
    const problemNumber = `PRB-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.problem.create({
      data: {
        problemNumber,
        title: body.title,
        description: body.description,
        status: ProblemStatus.OPEN,
        rootCause: body.rootCause || null,
        workaround: body.workaround || null,
        correctiveAction: body.correctiveAction || null,
        preventiveAction: body.preventiveAction || null,
        ownerId,
      },
    });
  }

  async linkIncident(id: string, ticketId: string) {
    return this.prisma.problemIncident.create({
      data: {
        problemId: id,
        ticketId,
      },
    });
  }

  async updateRca(id: string, body: any) {
    return this.prisma.problem.update({
      where: { id },
      data: {
        status: body.status || undefined,
        rootCause: body.rootCause || undefined,
        workaround: body.workaround || undefined,
        correctiveAction: body.correctiveAction || undefined,
        preventiveAction: body.preventiveAction || undefined,
      },
    });
  }
}
