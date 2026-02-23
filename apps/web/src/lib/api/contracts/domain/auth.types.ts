export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  tenantId: string;
  tenantSlug: string;
  roles: string[];
};
