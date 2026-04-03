import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { UserPermissionsMVEntity } from '../../../infrastructure/database/entities/user-permission-mv.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserPermissionsMVEntity)
    private mvRepository: Repository<UserPermissionsMVEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'super-secret-key-for-now',
    });
  }

  async validate(payload: any) {
    // In a real app, verify user exists.
    // Querying the Materialized View for permissions.
    const perms = await this.mvRepository.find({
      where: { user_id: payload.sub },
    });

    return {
      id: payload.sub,
      email: payload.email,
      permissions: perms.map((p) => p.permission_name),
    };
  }
}
