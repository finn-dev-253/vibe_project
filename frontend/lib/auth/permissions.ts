export interface UserInfo {
  id: string;
  email: string;
  permissions: string[];
}

export const hasPermission = (user: UserInfo | null, permission: string): boolean => {
  if (!user) return false;
  return user.permissions.includes(permission);
};
