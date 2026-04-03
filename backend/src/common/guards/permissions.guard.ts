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

    // Usually, you would hit the Materialized View through a service here,
    // but assuming JWT contains permissions or we inject a service.
    // Let's assume user.permissions is populated by the JwtStrategy reading from the Materialized View
    const userPermissions = user.permissions || [];

    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
