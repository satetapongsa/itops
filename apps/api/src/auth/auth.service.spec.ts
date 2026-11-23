import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { UserRole, UserStatus } from '@opspilot/shared';

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: PrismaService;
  let jwt: JwtService;

  const mockUser = {
    id: 'user-123',
    email: 'admin@opspilot.local',
    passwordHash: '',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    departmentId: 'dept-1',
    department: { name: 'IT Infrastructure' },
  };

  beforeAll(async () => {
    mockUser.passwordHash = await argon2.hash('AdminPassword123!');
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock_token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  it('should authenticate user with valid credentials and return tokens', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
    jest.spyOn(prisma.user, 'update').mockResolvedValue(mockUser as any);
    jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);
    jest.spyOn(prisma.auditLog, 'create').mockResolvedValue({} as any);

    const result = await authService.login({
      email: 'admin@opspilot.local',
      password: 'AdminPassword123!',
    });

    expect(result.accessToken).toBe('mock_token');
    expect(result.user.email).toBe('admin@opspilot.local');
    expect(result.user.role).toBe(UserRole.ADMIN);
  });

  it('should throw UnauthorizedException for wrong password', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

    await expect(
      authService.login({
        email: 'admin@opspilot.local',
        password: 'WrongPassword!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'nonexistent@opspilot.local',
        password: 'Password123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
