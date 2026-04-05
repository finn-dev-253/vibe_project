import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { UserEntity } from './infrastructure/database/entities/user.entity';
import { RoleEntity } from './infrastructure/database/entities/role.entity';
import { PermissionEntity } from './infrastructure/database/entities/permission.entity';

/**
 * RBAC seed — run with: npm run seed
 *
 * Roles & permissions:
 *
 *   admin             → all permissions
 *   warehouse_manager → warehouse:read/create/update/delete
 *   finance_manager   → finance:read/create/update/delete
 *   customer          → customer:assets:read, customer:assets:update
 *
 * Test accounts (password: password123):
 *   admin@test.com
 *   warehouse@test.com
 *   finance@test.com
 *   customer@test.com
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(UserEntity);
  const roleRepository = dataSource.getRepository(RoleEntity);
  const permissionRepository = dataSource.getRepository(PermissionEntity);

  // ── 1. Permissions ────────────────────────────────────────────────────────
  const permissionsData: { name: string; description: string }[] = [
    // Admin / system
    { name: 'system:admin', description: 'Super-admin access — grants everything' },
    { name: 'admin:roles:view', description: 'View roles and user-permission mappings' },
    { name: 'users:manage', description: 'Create / update / delete users' },
    { name: 'roles:manage', description: 'Create / update / delete roles' },

    // Warehouse manager
    { name: 'warehouse:manage', description: 'Full warehouse access shorthand (admin)' },
    { name: 'warehouse:read', description: 'Read warehouse records' },
    { name: 'warehouse:create', description: 'Create warehouse records' },
    { name: 'warehouse:update', description: 'Update warehouse records' },
    { name: 'warehouse:delete', description: 'Delete warehouse records' },

    // Finance manager
    { name: 'finance:manage', description: 'Full finance access shorthand (admin)' },
    { name: 'finance:read', description: 'Read finance records' },
    { name: 'finance:create', description: 'Create finance records' },
    { name: 'finance:update', description: 'Update finance records' },
    { name: 'finance:delete', description: 'Delete finance records' },

    // Customer
    { name: 'customer:assets:read', description: "Read the customer's own assets" },
    { name: 'customer:assets:update', description: "Update the customer's own assets" },
  ];

  console.log('▶ Seeding permissions...');
  const savedPermissions: PermissionEntity[] = [];
  for (const p of permissionsData) {
    let perm = await permissionRepository.findOne({ where: { name: p.name } });
    if (!perm) {
      perm = permissionRepository.create(p);
      perm = await permissionRepository.save(perm);
      console.log(`  ✔ Created permission: ${p.name}`);
    } else {
      console.log(`  – Exists permission: ${p.name}`);
    }
    savedPermissions.push(perm);
  }

  // Helper: filter saved permissions by name
  const permsFor = (...names: string[]) =>
    savedPermissions.filter((p) => names.includes(p.name));

  // ── 2. Roles ──────────────────────────────────────────────────────────────
  const createOrUpdateRole = async (
    name: string,
    permissions: PermissionEntity[],
  ): Promise<RoleEntity> => {
    let role = await roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
    if (!role) {
      role = roleRepository.create({ name, permissions });
      console.log(`  ✔ Created role: ${name}`);
    } else {
      role.permissions = permissions;
      console.log(`  – Updated role: ${name}`);
    }
    return roleRepository.save(role);
  };

  console.log('▶ Seeding roles...');

  const adminRole = await createOrUpdateRole(
    'admin',
    permsFor(
      'system:admin',
      'admin:roles:view',
      'users:manage',
      'roles:manage',
      'warehouse:manage',
      'warehouse:read',
      'warehouse:create',
      'warehouse:update',
      'warehouse:delete',
      'finance:manage',
      'finance:read',
      'finance:create',
      'finance:update',
      'finance:delete',
      'customer:assets:read',
      'customer:assets:update',
    ),
  );

  const warehouseManagerRole = await createOrUpdateRole(
    'warehouse_manager',
    permsFor('warehouse:read', 'warehouse:create', 'warehouse:update', 'warehouse:delete'),
  );

  const financeManagerRole = await createOrUpdateRole(
    'finance_manager',
    permsFor('finance:read', 'finance:create', 'finance:update', 'finance:delete'),
  );

  const customerRole = await createOrUpdateRole(
    'customer',
    permsFor('customer:assets:read', 'customer:assets:update'),
  );

  // ── 3. Users ──────────────────────────────────────────────────────────────
  const createOrUpdateUser = async (
    email: string,
    roles: RoleEntity[],
  ): Promise<void> => {
    let user = await userRepository.findOne({
      where: { email },
      relations: ['roles'],
    });
    if (!user) {
      user = userRepository.create({ email, password: 'password123', roles });
      await userRepository.save(user);
      console.log(`  ✔ Created user: ${email}`);
    } else {
      user.password = 'password123';
      user.roles = roles;
      await userRepository.save(user);
      console.log(`  – Updated user: ${email}`);
    }
  };

  console.log('▶ Seeding users...');
  await createOrUpdateUser('admin@test.com', [adminRole]);
  await createOrUpdateUser('warehouse@test.com', [warehouseManagerRole]);
  await createOrUpdateUser('finance@test.com', [financeManagerRole]);
  await createOrUpdateUser('customer@test.com', [customerRole]);

  // ── 4. Refresh materialized view ──────────────────────────────────────────
  // The MV (mv_user_permissions) caches user→permission joins. Refresh it after
  // any role/permission change so the JWT strategy fallback query stays accurate.
  console.log('▶ Refreshing materialized view mv_user_permissions...');
  try {
    await dataSource.query('REFRESH MATERIALIZED VIEW mv_user_permissions');
    console.log('  ✔ Materialized view refreshed');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`  ⚠ Could not refresh MV (may not exist yet): ${msg}`);
  }

  console.log('\n✅ Seed complete.\n');
  console.log('Test accounts (password: password123):');
  console.log('  admin@test.com        → admin role (all permissions)');
  console.log('  warehouse@test.com    → warehouse_manager role');
  console.log('  finance@test.com      → finance_manager role');
  console.log('  customer@test.com     → customer role');

  await app.close();
}

void bootstrap();
