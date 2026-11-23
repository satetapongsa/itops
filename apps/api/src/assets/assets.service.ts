import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAssetDto } from '@opspilot/api-contracts';
import { AssetStatus, AssetType } from '@opspilot/shared';

@Injectable()
export class AssetsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { type?: AssetType; status?: AssetStatus; search?: string }) {
    const where: any = {};
    if (query?.type) where.type = query.type;
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { assetTag: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
        { hostname: { contains: query.search, mode: 'insensitive' } },
        { serialNumber: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        location: true,
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, firstName: true, lastName: true, email: true } },
        department: true,
        location: true,
        assignmentHistory: {
          include: {
            user: { select: { firstName: true, lastName: true } },
            assignedBy: { select: { firstName: true, lastName: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        maintenanceRecords: { orderBy: { performedAt: 'desc' } },
        tickets: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!asset) {
      throw new NotFoundException(`Asset ${id} not found`);
    }

    return asset;
  }

  async create(dto: CreateAssetDto, actorId: string) {
    const asset = await this.prisma.asset.create({
      data: {
        assetTag: dto.assetTag,
        name: dto.name,
        type: dto.type,
        manufacturer: dto.manufacturer,
        model: dto.model,
        serialNumber: dto.serialNumber,
        hostname: dto.hostname,
        ipAddress: dto.ipAddress,
        macAddress: dto.macAddress,
        os: dto.os,
        status: dto.status,
        assignedUserId: dto.assignedUserId || null,
        departmentId: dto.departmentId || null,
        locationId: dto.locationId || null,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : null,
        warrantyExpiry: dto.warrantyExpiry ? new Date(dto.warrantyExpiry) : null,
        purchaseCost: dto.purchaseCost ? Number(dto.purchaseCost) : null,
        vendor: dto.vendor,
        notes: dto.notes,
      },
    });

    if (dto.assignedUserId) {
      await this.prisma.assetAssignmentHistory.create({
        data: {
          assetId: asset.id,
          userId: dto.assignedUserId,
          departmentId: dto.departmentId || null,
          assignedById: actorId,
          notes: 'Initial assignment upon asset creation',
        },
      });
    }

    return asset;
  }

  async assign(id: string, userId: string, notes: string | undefined, actorId: string) {
    const asset = await this.findOne(id);

    // Close previous assignment if any
    const lastAssignment = await this.prisma.assetAssignmentHistory.findFirst({
      where: { assetId: id, returnedAt: null },
      orderBy: { assignedAt: 'desc' },
    });

    if (lastAssignment) {
      await this.prisma.assetAssignmentHistory.update({
        where: { id: lastAssignment.id },
        data: { returnedAt: new Date() },
      });
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    const updated = await this.prisma.asset.update({
      where: { id },
      data: {
        assignedUserId: userId,
        status: AssetStatus.ASSIGNED,
        departmentId: user?.departmentId || asset.departmentId,
      },
    });

    await this.prisma.assetAssignmentHistory.create({
      data: {
        assetId: id,
        userId,
        departmentId: user?.departmentId || null,
        assignedById: actorId,
        notes: notes || 'Assigned to employee',
      },
    });

    return updated;
  }

  async exportCsv(): Promise<string> {
    const assets = await this.prisma.asset.findMany({
      include: { assignedUser: true, department: true },
      orderBy: { assetTag: 'asc' },
    });

    const header = 'Asset Tag,Name,Type,Status,Manufacturer,Model,Serial,Assigned User,Department\n';
    const rows = assets
      .map((a) => {
        const user = a.assignedUser ? `"${a.assignedUser.firstName} ${a.assignedUser.lastName}"` : 'Unassigned';
        const dept = a.department ? `"${a.department.name}"` : 'None';
        return `"${a.assetTag}","${a.name}","${a.type}","${a.status}","${a.manufacturer || ''}","${a.model || ''}","${a.serialNumber || ''}",${user},${dept}`;
      })
      .join('\n');

    return header + rows;
  }
}
