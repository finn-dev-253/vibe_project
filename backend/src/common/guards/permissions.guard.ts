import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No specific permissions required
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      return false; // Not authenticated
    }

    // User permissions are populated by the JwtStrategy which fetches them rapidly from Redis.
    const userPermissions = user.permissions || [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
