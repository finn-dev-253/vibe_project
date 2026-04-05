import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';

const makeContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('allows access when no permissions are required', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined);

    const result = await guard.canActivate(makeContext(null));
    expect(result).toBe(true);
  });

  it('denies access when there is no authenticated user', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['warehouse:read']);

    const result = await guard.canActivate(makeContext(null));
    expect(result).toBe(false);
  });

  it('allows access when user has all required permissions', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['warehouse:read', 'warehouse:create']);

    const user = { id: '1', permissions: ['warehouse:read', 'warehouse:create', 'warehouse:delete'] };
    const result = await guard.canActivate(makeContext(user));
    expect(result).toBe(true);
  });

  it('denies access when user is missing at least one required permission', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['warehouse:read', 'warehouse:delete']);

    const user = { id: '1', permissions: ['warehouse:read'] }; // missing warehouse:delete
    const result = await guard.canActivate(makeContext(user));
    expect(result).toBe(false);
  });

  it('allows access when user has an empty permissions array and no permissions are required', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(undefined);

    const user = { id: '1', permissions: [] };
    const result = await guard.canActivate(makeContext(user));
    expect(result).toBe(true);
  });

  it('denies access when user has no permissions and a permission is required', async () => {
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['finance:read']);

    const user = { id: '1', permissions: [] };
    const result = await guard.canActivate(makeContext(user));
    expect(result).toBe(false);
  });

  it('uses PERMISSIONS_KEY when reading metadata', async () => {
    const spy = jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['system:admin']);

    const ctx = makeContext({ id: '1', permissions: ['system:admin'] });
    await guard.canActivate(ctx);

    expect(spy).toHaveBeenCalledWith(PERMISSIONS_KEY, expect.any(Array));
  });

  it('allows admin with all permissions to access any guarded endpoint', async () => {
    const allPermissions = [
      'system:admin',
      'admin:roles:view',
      'warehouse:read',
      'warehouse:create',
      'warehouse:update',
      'warehouse:delete',
      'finance:read',
      'finance:create',
      'finance:update',
      'finance:delete',
      'customer:assets:read',
      'customer:assets:update',
    ];

    for (const perm of allPermissions) {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([perm]);
      const user = { id: 'admin', permissions: allPermissions };
      const result = await guard.canActivate(makeContext(user));
      expect(result).toBe(true);
    }
  });
});
