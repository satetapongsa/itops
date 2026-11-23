import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateChangeDto } from '@opspilot/api-contracts';
import { ChangeStatus, ApprovalStatus } from '@opspilot/shared';

@Injectable()
export class ChangesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.changeRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedEngineer: { select: { id: true, firstName: true, lastName: true } },
        approvals: { include: { approver: { select: { firstName: true, lastName: true } } } },
      },
    });
  }

  async findOne(id: string) {
    const change = await this.prisma.changeRequest.findUnique({
      where: { id },
      include: {
        requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedEngineer: { select: { id: true, firstName: true, lastName: true, email: true } },
        approvals: { include: { approver: { select: { id: true, firstName: true, lastName: true } } } },
      },
    });

    if (!change) throw new NotFoundException(`Change ${id} not found`);
    return change;
  }

  async create(dto: CreateChangeDto, requestedById: string) {
    const count = await this.prisma.changeRequest.count();
    const year = new Date().getFullYear();
    const changeNumber = `CHG-${year}-${String(count + 1).padStart(5, '0')}`;

    return this.prisma.changeRequest.create({
      data: {
        changeNumber,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        riskLevel: dto.riskLevel,
        impactAssessment: dto.impactAssessment,
        businessJustification: dto.businessJustification,
        implementationPlan: dto.implementationPlan,
        rollbackPlan: dto.rollbackPlan,
        testPlan: dto.testPlan,
        plannedStart: new Date(dto.plannedStart),
        plannedEnd: new Date(dto.plannedEnd),
        requestedById,
        assignedEngineerId: dto.assignedEngineerId || null,
        status: ChangeStatus.DRAFT,
      },
    });
  }

  async submit(id: string) {
    return this.prisma.changeRequest.update({
      where: { id },
      data: { status: ChangeStatus.PENDING_APPROVAL },
    });
  }

  async approve(id: string, approverId: string, notes?: string) {
    await this.prisma.changeApproval.create({
      data: {
        changeId: id,
        approverId,
        status: ApprovalStatus.APPROVED,
        notes,
        decidedAt: new Date(),
      },
    });

    return this.prisma.changeRequest.update({
      where: { id },
      data: { status: ChangeStatus.SCHEDULED },
    });
  }

  async complete(id: string, resultNotes?: string) {
    return this.prisma.changeRequest.update({
      where: { id },
      data: {
        status: ChangeStatus.COMPLETED,
        actualEnd: new Date(),
        resultNotes,
      },
    });
  }

  async rollback(id: string, resultNotes?: string) {
    return this.prisma.changeRequest.update({
      where: { id },
      data: {
        status: ChangeStatus.ROLLED_BACK,
        actualEnd: new Date(),
        resultNotes,
      },
    });
  }
}
