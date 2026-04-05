import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../infrastructure/database/entities/user.entity';
import { UserPermissionsMVEntity } from '../infrastructure/database/entities/user-permission-mv.entity';
import { RedisService } from '../infrastructure/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserPermissionsMVEntity)
    private mvRepository: Repository<UserPermissionsMVEntity>,
    private redisService: RedisService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });

    console.log('roles:', user);

    // Demo: plain-text password comparison (use bcrypt in production)
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Warm the Redis permission cache on login for fast subsequent checks
    await this.warmPermissionCache(user.id);

    const payload = {
      email: user.email,
      sub: user.id,
      roles: user.roles ? user.roles.map((r) => r.name) : [],
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Fetches permissions from the materialized view and stores them in Redis.
   * Called after login and whenever permissions need to be refreshed.
   */
  async warmPermissionCache(userId: string): Promise<string[]> {
    const perms = await this.mvRepository.find({ where: { user_id: userId } });
    const permissionNames = perms.map((p) => p.permission_name);
    console.log('Permissionname:', permissionNames);
    await this.redisService.set(
      `user_permissions:${userId}`,
      JSON.stringify(permissionNames),
      3600, // TTL: 1 hour
    );

    return permissionNames;
  }

  /**
   * Invalidates the Redis cache for a user — call this after role/permission changes.
   */
  async invalidatePermissionCache(userId: string): Promise<void> {
    await this.redisService.del(`user_permissions:${userId}`);
  }
}
