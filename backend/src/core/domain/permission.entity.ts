export class Permission {
  id: string;
  name: string;
  description?: string;

  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }
}

export class Role {
  id: string;
  name: string;
  permissions?: string[];

  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }
}
