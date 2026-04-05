import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserPermissionsMVEntity } from '../../../infrastructure/database/entities/user-permission-mv.entity';
import { RedisService } from '../../../infrastructure/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserPermissionsMVEntity)
    private mvRepository: Repository<UserPermissionsMVEntity>,
    private redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super-secret-key-for-now',
    });
  }

  async validate(payload: any) {
    const redisKey = `user_permissions:${payload.sub}`;
    const cachedPerms = await this.redisService.get(redisKey);

    let permissionNames: string[] = [];

    if (cachedPerms) {
      permissionNames = JSON.parse(cachedPerms);
    } else {
      // Fallback: Querying the Materialized View for permissions if not in cache (or expired)
      const perms = await this.mvRepository.find({
        where: { user_id: payload.sub },
      });
      permissionNames = perms.map((p) => p.permission_name);

      // Update cache
      await this.redisService.set(
        redisKey,
        JSON.stringify(permissionNames),
        3600,
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      permissions: permissionNames,
    };
  }
}
