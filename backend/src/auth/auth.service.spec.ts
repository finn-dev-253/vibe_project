import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserPermissionsMVEntity } from '../infrastructure/database/entities/user-permission-mv.entity';
import { RedisService } from '../infrastructure/redis/redis.service';
import { RoleEntity } from '../infrastructure/database/entities/role.entity';

const makeUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  ({
    id: 'user-id-1',
    email: 'admin@test.com',
    password: 'password123',
    roles: [{ id: 'role-1', name: 'admin' } as RoleEntity],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as UserEntity;

const makeMvRows = (names: string[]): UserPermissionsMVEntity[] =>
  names.map((permission_name) => ({ user_id: 'user-id-1', permission_name }) as UserPermissionsMVEntity);

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepo = {
    findOne: jest.fn(),
  };
  const mockMvRepo = {
    find: jest.fn(),
  };
  const mockRedisService = {
    set: jest.fn().mockResolvedValue('OK'),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
  };
  const mockJwtService = {
    sign: jest.fn().mockReturnValue('signed.jwt.token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUserRepo },
        { provide: getRepositoryToken(UserPermissionsMVEntity), useValue: mockMvRepo },
        { provide: RedisService, useValue: mockRedisService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('returns an access_token when credentials are valid', async () => {
      const user = makeUser();
      mockUserRepo.findOne.mockResolvedValue(user);
      mockMvRepo.find.mockResolvedValue(makeMvRows(['system:admin', 'warehouse:read']));

      const result = await service.login('admin@test.com', 'password123');

      expect(result).toEqual({ access_token: 'signed.jwt.token' });
    });

    it('caches permissions in Redis on successful login', async () => {
      const user = makeUser();
      const perms = ['system:admin', 'warehouse:read'];
      mockUserRepo.findOne.mockResolvedValue(user);
      mockMvRepo.find.mockResolvedValue(makeMvRows(perms));

      await service.login('admin@test.com', 'password123');

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `user_permissions:${user.id}`,
        JSON.stringify(perms),
        3600,
      );
    });

    it('signs JWT with correct payload (sub, email, roles)', async () => {
      const user = makeUser();
      mockUserRepo.findOne.mockResolvedValue(user);
      mockMvRepo.find.mockResolvedValue([]);

      await service.login('admin@test.com', 'password123');

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        sub: user.id,
        roles: ['admin'],
      });
    });

    it('throws UnauthorizedException when user is not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login('unknown@test.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when password is incorrect', async () => {
      const user = makeUser({ password: 'correct-password' });
      mockUserRepo.findOne.mockResolvedValue(user);

      await expect(service.login('admin@test.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('warmPermissionCache', () => {
    it('fetches permissions from MV and stores them in Redis', async () => {
      const perms = ['finance:read', 'finance:create'];
      mockMvRepo.find.mockResolvedValue(makeMvRows(perms));

      const result = await service.warmPermissionCache('user-id-1');

      expect(result).toEqual(perms);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        'user_permissions:user-id-1',
        JSON.stringify(perms),
        3600,
      );
    });

    it('returns an empty array when user has no permissions', async () => {
      mockMvRepo.find.mockResolvedValue([]);

      const result = await service.warmPermissionCache('user-no-perms');
      expect(result).toEqual([]);
    });
  });

  describe('invalidatePermissionCache', () => {
    it('deletes the Redis key for the given user', async () => {
      await service.invalidatePermissionCache('user-id-1');

      expect(mockRedisService.del).toHaveBeenCalledWith('user_permissions:user-id-1');
    });
  });
});
