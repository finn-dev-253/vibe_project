import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'mv_user_permissions',
  expression: `
    SELECT 
      u.id AS user_id, 
      p.name AS permission_name
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN roles r ON ur.role_id = r.id
    JOIN role_permissions rp ON r.id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    GROUP BY u.id, p.name
  `,
  materialized: true,
})
export class UserPermissionsMVEntity {
  @ViewColumn()
  user_id: string;

  @ViewColumn()
  permission_name: string;
}
